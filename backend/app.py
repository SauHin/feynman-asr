"""Server lokal: WebSocket /ws/transcribe untuk transkripsi real-time (PLAN 5-6).

Klien mengirim potongan PCM int16 16 kHz mono sebagai pesan biner, lalu {"type": "stop"} saat selesai.
Server membalas pesan JSON sesuai frontend/src/types/server-message.ts.

Jalankan dari root repo:
    backend/.venv/Scripts/python.exe -m uvicorn app:app --app-dir backend --port 8000
"""
import asyncio
import json
import time
from contextlib import asynccontextmanager

import numpy as np
from fastapi import FastAPI, WebSocket

import config
from asr.streaming import StreamingTranscriber, Word, load_whisper


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.transcribe = load_whisper()  # dimuat sekali, dipakai semua sesi
    yield


app = FastAPI(lifespan=lifespan)


@app.websocket("/ws/transcribe")
async def transcribe(ws: WebSocket) -> None:
    await ws.accept()
    st = StreamingTranscriber(ws.app.state.transcribe)
    chunks: list[np.ndarray] = []
    arrived = time.perf_counter()  # saat potongan audio terakhir diterima
    shown = ""

    # Audio diterima terus di task terpisah. Kalau inference lebih lama dari interval, inference
    # berikutnya langsung memproses semua audio yang terkumpul, jadi sistem tidak makin tertinggal.
    async def receive() -> str:
        nonlocal arrived
        while True:
            msg = await ws.receive()
            if msg["type"] == "websocket.disconnect":
                return "disconnect"
            if msg.get("bytes"):
                chunks.append(np.frombuffer(msg["bytes"], dtype=np.int16).astype(np.float32) / 32768)
                arrived = time.perf_counter()
            elif json.loads(msg.get("text") or "{}").get("type") == "stop":
                return "stop"

    def take_audio() -> float:
        if chunks:
            st.insert(np.concatenate(chunks))
            chunks.clear()
        return arrived

    async def send(new: list[Word], heard_at: float) -> None:
        nonlocal shown
        partial = " ".join(w.text for w in st.partial)
        if not new and partial == shown:
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
            }
        )

    await ws.send_json({"type": "status", "state": "listening"})
    receiver = asyncio.create_task(receive())
    while not receiver.done():
        if sum(len(c) for c in chunks) < config.STREAM_INTERVAL_S * config.SAMPLE_RATE:
            await asyncio.wait({receiver}, timeout=0.05)
            continue
        heard_at = take_audio()
        new = await asyncio.to_thread(st.process)
        if not (receiver.done() and receiver.result() == "disconnect"):
            await send(new, heard_at)
    if receiver.result() == "disconnect":
        return

    await ws.send_json({"type": "status", "state": "processing"})
    heard_at = take_audio()
    await send(await asyncio.to_thread(st.finish), heard_at)
    await ws.send_json({"type": "status", "state": "idle"})
    await ws.close()
