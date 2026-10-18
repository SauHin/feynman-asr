"""Server lokal: WebSocket /ws/transcribe untuk transkripsi real-time (PLAN 5-6), POST /api/concepts untuk
ekstraksi konsep saat setup, dan POST /api/feedback untuk analisis isi setelah Stop (keduanya Gemini, PLAN 7.3).

Klien boleh membuka sesi dengan {"type": "start", "concepts": [...]}, lalu mengirim potongan PCM int16 16 kHz
mono sebagai pesan biner, dan {"type": "stop"} saat selesai (frontend/src/types/client-message.ts). Server membalas
pesan JSON sesuai frontend/src/types/server-message.ts. Kalau config.SESSION_SAVE menyala, audio dan log tiap sesi
disimpan (sessions.py), dan feedback yang membawa session_id dicatat ke sesi yang sama.

Jalankan dari root repo:
    backend/.venv/Scripts/python.exe -m uvicorn app:app --app-dir backend --port 8000
"""
import asyncio
import json
import time
from collections.abc import Callable
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Annotated

import numpy as np
from fastapi import FastAPI, Form, HTTPException, UploadFile, WebSocket

import config
import materials
import sessions
from analysis import gemini
from analysis.concepts import ConceptTracker
from analysis.fluency import Fluency
from asr.streaming import StreamingTranscriber, Word, hotwords, load_whisper


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.transcribe = load_whisper()  # dimuat sekali, dipakai semua sesi
    yield


app = FastAPI(lifespan=lifespan)


def rows(words: list[Word]) -> list[list]:
    return [[round(w.start, 2), round(w.end, 2), w.text] for w in words]


# Fungsi biasa (bukan async), jadi FastAPI menjalankannya di thread lain selama menunggu Gemini.
@app.post("/api/concepts")
def concepts(
    topic: Annotated[str, Form(min_length=1, max_length=200)],
    text: Annotated[str, Form()] = "",
    pages: Annotated[str, Form()] = "",  # nomor halaman atau slide dipisah koma, kosong berarti semua
    file: UploadFile | None = None,
) -> list[gemini.Concept]:
    """Ekstraksi konsep saat setup. Materi opsional: file, atau teks yang ditempel. 422 berarti materinya bermasalah,
    dan pesannya ditampilkan ke user."""
    try:
        picked = [int(p) for p in pages.split(",") if p.strip()]
    except ValueError:
        raise HTTPException(422, "Nomor halamannya nggak kebaca. Contohnya 1-5, 8.") from None
    if any(p < 1 for p in picked):
        raise HTTPException(422, "Nomor halaman mulai dari 1, ya.")
    material = text.strip()
    if file is not None:
        if (file.size or 0) > config.MATERIAL_MAX_MB * 1024 * 1024:
            raise HTTPException(422, f"File-nya kebesaran. Maksimal {config.MATERIAL_MAX_MB} MB.")
        try:
            material = materials.extract_text(file.filename or "", file.file.read(), picked)
        except materials.MaterialError as e:
            raise HTTPException(422, str(e)) from e
    if len(material) > config.MATERIAL_MAX_CHARS:
        raise HTTPException(422, "Materinya kepanjangan. Pilih halaman yang paling relevan aja, ya.")
    try:
        return gemini.extract_concepts(topic.strip(), material)
    except gemini.GeminiError as e:
        print(f"Gemini gagal: {e}", flush=True)
        raise HTTPException(502, "Ekstraksi konsep gagal. Konsepnya bisa ditulis sendiri.") from e


class FeedbackRequest(gemini.Session):
    session_id: str | None = None  # dari pesan status listening, untuk mencatat feedback ke sesi yang sama


def keep_feedback(session_id: str | None, record: dict) -> None:
    """Catat feedback ke file sesinya. Gagal mencatat tidak boleh menggagalkan feedback ke user."""
    if not session_id:
        return
    try:
        if not sessions.add_feedback(session_id, record):
            print(f"Sesi {session_id!r} tidak tersimpan, feedback-nya tidak dicatat", flush=True)
    except OSError as e:
        print(f"Feedback sesi {session_id} gagal dicatat: {e}", flush=True)


@app.post("/api/feedback")
def feedback(session: FeedbackRequest) -> gemini.Feedback:
    if not session.transcript.strip():
        raise HTTPException(422, "Transkripnya masih kosong, jadi belum ada yang bisa dianalisis.")
    t = time.perf_counter()
    record = {"at": datetime.now().isoformat(timespec="seconds"), "model": config.GEMINI_MODEL,
              "request": session.model_dump(exclude={"session_id"})}
    try:
        fb = gemini.analyze(session)
    except gemini.GeminiError as e:
        print(f"Gemini gagal: {e}", flush=True)
        keep_feedback(session.session_id, record | {"duration_s": round(time.perf_counter() - t, 1), "error": str(e)})
        raise HTTPException(502, "Analisis Gemini gagal. Feedback lokal tetap bisa dipakai.") from e
    keep_feedback(session.session_id, record | {"duration_s": round(time.perf_counter() - t, 1),
                                                "feedback": fb.model_dump()})
    return fb


@app.websocket("/ws/transcribe")
async def transcribe(ws: WebSocket) -> None:
    await ws.accept()
    st = StreamingTranscriber(ws.app.state.transcribe)
    chunks: list[tuple[np.ndarray, float]] = []  # (audio, waktu diterima)
    shown = ""
    compute_s = 0.0  # total waktu inference sesi ini, untuk RTF di eval/replay.py
    fluency = Fluency()
    next_fluency = config.FLUENCY_EVERY_S  # waktu audio untuk pesan fluency berkala berikutnya
    tracker: ConceptTracker | None = None  # checklist konsep, ada setelah pesan start
    # Untuk sessions.save: audio mentah, konsep dari pesan start, dan pesan server beserta waktu kirimnya.
    session_id = sessions.new_id() if config.SESSION_SAVE else None
    pcm = bytearray()
    concepts: list[gemini.Concept] = []
    sent: list[tuple[float, dict]] = []
    t0: float | None = None  # detik 0 audio menurut jam server: waktu potongan pertama tiba dikurangi durasinya
    end, stop_at = "error", None

    # Audio diterima terus di task terpisah. Kalau inference lebih lama dari interval, inference
    # berikutnya langsung memproses semua audio yang terkumpul, jadi sistem tidak makin tertinggal.
    async def receive() -> str:
        nonlocal tracker, concepts, t0, end, stop_at
        while True:
            msg = await ws.receive()
            if msg["type"] == "websocket.disconnect":
                end, stop_at = "disconnect", time.perf_counter()
                return end
            if msg.get("bytes"):
                audio = np.frombuffer(msg["bytes"], dtype=np.int16).astype(np.float32) / 32768
                chunks.append((audio, time.perf_counter()))
                if t0 is None:
                    t0 = chunks[-1][1] - len(audio) / config.SAMPLE_RATE
                pcm.extend(msg["bytes"])
            elif msg.get("text"):
                data = json.loads(msg["text"])
                if data.get("type") == "stop":
                    end, stop_at = "stop", time.perf_counter()
                    return end
                # Pesan start datang sebelum audio, jadi hotwords dan checklist sudah siap sejak inference pertama.
                if data.get("type") == "start":
                    concepts = [gemini.Concept.model_validate(c) for c in data.get("concepts", [])]
                    if config.ASR_HOTWORDS:
                        st.hotwords = hotwords(t for c in concepts for t in [c.name, *c.aliases])
                    tracker = ConceptTracker(concepts)

    def take_audio(whole: bool = True) -> float:
        """Pindahkan audio ke transcriber. Mengembalikan waktu diterimanya potongan terakhir yang dipindah.

        whole: hanya kelipatan utuh interval. Selama GPU tidak tertinggal, isi buffer tiap inference jadi
        sama di setiap replay, sehingga hasil eval/replay.py bisa diulang (PLAN 8.4).
        """
        step = int(config.STREAM_INTERVAL_S * config.SAMPLE_RATE)
        total = sum(len(c) for c, _ in chunks)
        n = total // step * step if whole else total
        taken, heard_at = [], time.perf_counter()
        while n > 0:
            c, heard_at = chunks.pop(0)
            if len(c) > n:
                chunks.insert(0, (c[n:], heard_at))
                c = c[:n]
            taken.append(c)
            n -= len(c)
        if taken:
            st.insert(np.concatenate(taken))
        return heard_at

    async def out(msg: dict) -> None:
        sent.append((time.perf_counter(), msg))
        await ws.send_json(msg)

    async def run(step: Callable[[], list[Word]]) -> list[Word]:
        nonlocal compute_s
        t = time.perf_counter()
        new = await asyncio.to_thread(step)
        compute_s += time.perf_counter() - t
        return new

    async def send(new: list[Word], heard_at: float, final: bool = False) -> None:
        nonlocal shown
        partial = " ".join(w.text for w in st.partial)
        if not final and not new and partial == shown:
            return
        shown = partial
        # PLAN 6: dari akhir kata terbaru diucapkan sampai teksnya terkirim. Buffer browser (~100 ms) belum ikut.
        words = st.partial or new
        lag = st.audio_end - words[-1].end if words else 0.0
        latency = time.perf_counter() - heard_at + lag
        await out(
            {
                "type": "transcript",
                "confirmed": " ".join(w.text for w in new),
                "partial": partial,
                "t": round(st.audio_end, 2),
                "latency_ms": round(latency * 1000),
                # Untuk eval/replay.py: waktu audio tiap kata, supaya latency per kata bisa dihitung (PLAN 6).
                "words": {"confirmed": rows(new), "partial": rows(st.partial)},
                "compute_s": round(compute_s, 3),
            }
        )

    async def publish(new: list[Word], heard_at: float, final: bool = False) -> None:
        # Jeda panjang dilaporkan tepat sebelum kata sesudah jeda. UI menaruh tanda jeda di akhir teks
        # confirmed saat pesan fluency tiba, jadi urutan ini menentukan posisinya di transkrip.
        nonlocal next_fluency
        start = 0
        for i, pause in fluency.add(new):
            if i > start:
                await send(new[start:i], heard_at)
            await out(fluency.message(st.audio_end, pause))
            start = i
        await send(new[start:], heard_at, final)
        # Checklist sesudah transkrip, supaya kata yang mencentang konsep sudah tampil di UI.
        if tracker:
            for cid, t in tracker.add(new):
                await out({"type": "concept", "concept_id": cid, "status": "mentioned", "t": round(t, 2)})
        if final or st.audio_end >= next_fluency:
            await out(fluency.message(st.audio_end))
            next_fluency = st.audio_end + config.FLUENCY_EVERY_S

    try:
        await out({"type": "status", "state": "listening"} | ({"session_id": session_id} if session_id else {}))
        receiver = asyncio.create_task(receive())
        while not receiver.done():
            if sum(len(c) for c, _ in chunks) < config.STREAM_INTERVAL_S * config.SAMPLE_RATE:
                await asyncio.wait({receiver}, timeout=0.05)
                continue
            heard_at = take_audio()
            new = await run(st.process)
            if not (receiver.done() and receiver.result() == "disconnect"):
                await publish(new, heard_at)
        if receiver.result() == "disconnect":
            return

        await out({"type": "status", "state": "processing"})
        heard_at = take_audio(whole=False)
        # Selalu dikirim, supaya total compute_s sesi sampai ke klien walau teksnya tidak berubah.
        await publish(await run(st.finish), heard_at, final=True)
        await out({"type": "status", "state": "idle"})
        await ws.close()
    finally:
        # Juga saat koneksi putus atau error di tengah sesi, supaya audio peserta tidak hilang. Sesi tanpa audio
        # (misalnya izin mic ditolak) tidak disimpan.
        if session_id and t0 is not None:
            sessions.save(session_id, bytes(pcm), {
                "session_id": session_id, "end": end, "audio_s": round(len(pcm) / 2 / config.SAMPLE_RATE, 3),
                "stop_at": round((stop_at or time.perf_counter()) - t0, 3),
                "concepts": [c.model_dump() for c in concepts],
                "messages": [[round(t - t0, 3), m] for t, m in sent],
            })
