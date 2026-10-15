"""Putar ulang rekaman ke pipeline streaming dengan kecepatan 1x, lalu hitung metriknya (PLAN 8.2).

Skrip ini menyalakan backend sendiri. Parameter config.py bisa ditimpa per run dengan --set. Setiap
rekaman dikirim seperti dari mic, dalam potongan 100 ms. Semua pesan server dicatat di
eval/runs/<run>/<file_id>.json, lalu eval/metrics.py menulis hasilnya ke eval/results/results.csv.

Setiap rekaman harus terdaftar di eval/data/metadata.csv (minimal kolom file_id, set, speaker_id,
topik, mic). Ukur hanya saat laptop di mode Performance, karena GPU yang ditahan membuat latency salah.

Dengan --terms, daftar istilah eval/naskah/<topik>.terms.txt dikirim sebagai daftar konsep saat sesi mulai,
seperti layar setup, jadi backend memakainya sebagai hotwords (PLAN 8.5 E2).

Pakai dari root repo dengan Python dari backend/.venv:
    python eval/replay.py --run turbo-base eval/data/A_*.m4a
    python eval/replay.py --run interval-2s --set STREAM_INTERVAL_S=2.0 eval/data/A_*.m4a
    python eval/replay.py --run turbo-terms --terms eval/data/A_*.m4a
"""
import argparse
import ast
import json
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path

import numpy as np
from faster_whisper import decode_audio
from websockets.sync.client import connect

import metrics

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "backend"))
import config  # noqa: E402

CHUNK_S = 0.1  # sama dengan AudioWorklet di frontend

# Server berjalan di proses terpisah supaya timing klien tidak terganggu inference.
SERVER = """
import json, sys
sys.path.insert(0, sys.argv[3])
import config
for name, value in json.loads(sys.argv[1]).items():
    setattr(config, name, value)
import uvicorn
uvicorn.run("app:app", port=int(sys.argv[2]), log_level="warning")
"""


def parse_overrides(items: list[str]) -> dict:
    overrides = {}
    for item in items:
        name, _, raw = item.partition("=")
        if not name.isupper() or not hasattr(config, name):
            raise SystemExit(f"parameter tidak ada di config.py: {name}")
        try:
            overrides[name] = ast.literal_eval(raw)
        except (ValueError, SyntaxError):
            overrides[name] = raw  # teks biasa, misalnya ASR_MODEL=medium
    return overrides


def start_server(overrides: dict, port: int) -> subprocess.Popen:
    proc = subprocess.Popen([sys.executable, "-c", SERVER, json.dumps(overrides), str(port), str(REPO / "backend")])
    deadline = time.time() + 600  # run pertama bisa mengunduh model
    while time.time() < deadline:
        if proc.poll() is not None:
            raise SystemExit("server gagal jalan, lihat error di atas")
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", port)) == 0:  # uvicorn baru menerima koneksi setelah model dimuat
                return proc
        time.sleep(1)
    proc.terminate()
    raise SystemExit("server belum siap setelah 10 menit")


def sample_gpu_clock(stop: threading.Event, out: list[int]) -> None:
    while not stop.wait(1.0):
        try:
            r = subprocess.run(["nvidia-smi", "--query-gpu=clocks.sm", "--format=csv,noheader,nounits"],
                               capture_output=True, text=True, timeout=5)
            out.append(int(r.stdout.split()[0]))
        except (OSError, ValueError, IndexError, subprocess.TimeoutExpired):
            return


def replay(path: Path, port: int, terms: list[str]) -> dict:
    sr = config.SAMPLE_RATE
    audio = decode_audio(str(path), sampling_rate=sr)
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    step = int(CHUNK_S * sr)
    messages, clocks, stop = [], [], threading.Event()
    threading.Thread(target=sample_gpu_clock, args=(stop, clocks), daemon=True).start()

    with connect(f"ws://127.0.0.1:{port}/ws/transcribe", max_size=None) as ws:
        if terms:
            concepts = [{"id": t, "name": t, "aliases": [], "description": ""} for t in terms]
            ws.send(json.dumps({"type": "start", "concepts": concepts}))
        t0 = time.perf_counter()

        def receive() -> None:
            for msg in ws:  # berhenti saat server menutup koneksi setelah status idle
                messages.append([round(time.perf_counter() - t0, 3), json.loads(msg)])

        receiver = threading.Thread(target=receive, daemon=True)
        receiver.start()
        for i in range(0, len(pcm), step):
            # Potongan dikirim setelah durasinya lewat, seperti mic yang harus merekam dulu.
            time.sleep(max(0.0, t0 + (i + step) / sr - time.perf_counter()))
            ws.send(pcm[i:i + step].tobytes())
        stop_at = time.perf_counter() - t0
        ws.send(json.dumps({"type": "stop"}))
        receiver.join(timeout=120)
    stop.set()
    return {"file": path.name, "audio_s": len(audio) / sr, "stop_at": round(stop_at, 3),
            "terms": terms, "messages": messages, "gpu_mhz": clocks}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("files", nargs="+", type=Path)
    parser.add_argument("--run", required=True, help="nama run, dipakai untuk folder log dan kolom run di results.csv")
    parser.add_argument("--set", action="append", default=[], metavar="PARAM=NILAI", help="timpa parameter config.py")
    parser.add_argument("--terms", action="store_true",
                        help="kirim eval/naskah/<topik>.terms.txt sebagai daftar konsep, jadi hotwords (E2)")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    overrides = parse_overrides(args.set)
    meta = metrics.load_metadata()
    terms = {}
    for f in args.files:  # cek semua rekaman dulu, supaya run tidak gagal di tengah
        if not f.is_file():
            raise SystemExit(f"file tidak ada: {f}")
        if f.stem not in meta:
            raise SystemExit(f"{f.stem} belum terdaftar di eval/data/metadata.csv")
        terms[f.stem] = metrics.reference(f.stem, meta[f.stem])[1] if args.terms else []
        if args.terms and not terms[f.stem]:
            raise SystemExit(f"daftar istilah kosong: eval/naskah/{meta[f.stem]['topik']}.terms.txt")

    run_dir = metrics.RUNS / args.run
    run_dir.mkdir(parents=True, exist_ok=True)
    server = start_server(overrides, args.port)
    try:
        for f in args.files:
            print(f"memutar {f.name}", flush=True)
            log = replay(f, args.port, terms[f.stem]) | {"overrides": overrides}
            (run_dir / f"{f.stem}.json").write_text(json.dumps(log, ensure_ascii=False), encoding="utf-8")
    finally:
        server.terminate()
        server.wait()
    metrics.evaluate_run(args.run)


if __name__ == "__main__":
    main()
