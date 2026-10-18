"""Penyimpanan tiap sesi live (PLAN 8.3 Set B, PLAN 9). Satu sesi menjadi tiga file di config.SESSION_DIR:

    <id>.wav             PCM int16 16 kHz mono, persis byte yang diterima server dari browser
    <id>.json            konsep dari pesan start, config, dan semua pesan server beserta waktunya
    <id>.feedback.jsonl  satu baris per permintaan feedback, berhasil atau gagal

Field log sama dengan log eval/replay.py, jadi eval/metrics.latency() bisa langsung dipakai. WAV-nya bisa diputar
ulang dengan replay.py, dan --concepts menerima <id>.json untuk memakai daftar konsep yang sama.
"""
import json
import re
import secrets
import wave
from datetime import datetime

import config

# Id dipakai sebagai nama file, jadi id dari klien wajib cocok dengan pola ini.
ID = re.compile(r"[0-9]{8}-[0-9]{6}-[0-9a-f]{4}")


def new_id() -> str:
    # Bagian acak mencegah dua sesi di detik yang sama saling timpa.
    return f"{datetime.now():%Y%m%d-%H%M%S}-{secrets.token_hex(2)}"


def save(session_id: str, pcm: bytes, log: dict) -> None:
    d = config.SESSION_DIR
    d.mkdir(parents=True, exist_ok=True)
    with wave.open(str(d / f"{session_id}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(config.SAMPLE_RATE)
        w.writeframes(pcm)
    settings = {k: v for k, v in vars(config).items() if k.isupper()}
    text = json.dumps(log | {"config": settings}, ensure_ascii=False, default=str)  # default: SESSION_DIR berupa Path
    (d / f"{session_id}.json").write_text(text, encoding="utf-8")


def add_feedback(session_id: str, record: dict) -> bool:
    """Tambah satu baris ke file feedback sesi. False kalau id tidak valid atau sesinya tidak tersimpan."""
    d = config.SESSION_DIR
    if not ID.fullmatch(session_id) or not (d / f"{session_id}.json").is_file():
        return False
    with open(d / f"{session_id}.feedback.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
    return True
