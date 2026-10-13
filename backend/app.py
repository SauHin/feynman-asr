"""Server lokal: WebSocket /ws/transcribe untuk transkripsi real-time (PLAN 5-6).

Klien mengirim potongan PCM int16 16 kHz mono sebagai pesan biner, lalu {"type": "stop"} saat selesai.
Server membalas pesan JSON sesuai frontend/src/types/server-message.ts.

Jalankan dari root repo:
    backend/.venv/Scripts/python.exe -m uvicorn app:app --app-dir backend --port 8000
"""
import asyncio
import json
import time
from collections.abc import Callable
from contextlib import asynccontextmanager

import numpy as np
from fastapi import FastAPI, WebSocket

import config
from analysis.fluency import Fluency
from asr.streaming import StreamingTranscriber, Word, load_whisper


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.transcribe = load_whisper()  # dimuat sekali, dipakai semua sesi
    yield


app = FastAPI(lifespan=lifespan)


def rows(words: list[Word]) -> list[list]:
    return [[round(w.start, 2), round(w.end, 2), w.text] for w in words]


@app.websocket("/ws/transcribe")
async def transcribe(ws: WebSocket) -> None:
    await ws.accept()
    st = StreamingTranscriber(ws.app.state.transcribe)
    chunks: list[tuple[np.ndarray, float]] = []  # (audio, waktu diterima)
    shown = ""
    compute_s = 0.0  # total waktu inference sesi ini, untuk RTF di eval/replay.py
    fluency = Fluency()
    next_fluency = config.FLUENCY_EVERY_S  # waktu audio untuk pesan fluency berkala berikutnya

    # Audio diterima terus di task terpisah. Kalau inference lebih lama dari interval, inference
    # berikutnya langsung memproses semua audio yang terkumpul, jadi sistem tidak makin tertinggal.
    async def receive() -> str:
        while True:
            msg = await ws.receive()
            if msg["type"] == "websocket.disconnect":
                return "disconnect"
            if msg.get("bytes"):
                audio = np.frombuffer(msg["bytes"], dtype=np.int16).astype(np.float32) / 32768
                chunks.append((audio, time.perf_counter()))
            elif json.loads(msg.get("text") or "{}").get("type") == "stop":
                return "stop"

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
        await ws.send_json(
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
            await ws.send_json(fluency.message(st.audio_end, pause))
            start = i
        await send(new[start:], heard_at, final)
        if final or st.audio_end >= next_fluency:
            await ws.send_json(fluency.message(st.audio_end))
            next_fluency = st.audio_end + config.FLUENCY_EVERY_S

    await ws.send_json({"type": "status", "state": "listening"})
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

    await ws.send_json({"type": "status", "state": "processing"})
    heard_at = take_audio(whole=False)
    # Selalu dikirim, supaya total compute_s sesi sampai ke klien walau teksnya tidak berubah.
    await publish(await run(st.finish), heard_at, final=True)
    await ws.send_json({"type": "status", "state": "idle"})
    await ws.close()
