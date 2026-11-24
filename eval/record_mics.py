"""Rekam Set A dari beberapa mic sekaligus, untuk perbandingan mic di E3 (PLAN 8.3).

Setiap mic disimpan sebagai eval/data/A_<speaker>_<topik>_<mic>_<lokasi>.wav (WAV 16 kHz mono). Semua mic mulai
bersamaan, dan rekaman berhenti saat Enter ditekan. Rekaman yang sudah ada tidak pernah ditimpa. Sebelum merekam,
matikan Audio enhancements Windows untuk setiap mic (Settings > System > Sound > pilih mic).

Pakai dari root repo dengan Python dari backend/.venv:
    python eval/record_mics.py --list
    python eval/record_mics.py --speaker p01 --topik gan --lokasi lab --mic laptop=1 --mic earphone=3
"""
import argparse
import re
import sys
import wave
from pathlib import Path

import numpy as np
import sounddevice as sd

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "backend"))
import config  # noqa: E402

DATA = REPO / "eval" / "data"
NASKAH = REPO / "eval" / "naskah"
PART = re.compile(r"^[a-z0-9-]+$")  # "_" memisahkan bagian file_id, jadi tidak boleh ada di dalam satu bagian


def plan_files(speaker: str, topik: str, lokasi: str, mics: dict[str, int], data: Path = DATA) -> dict[str, Path]:
    for value in [speaker, topik, lokasi, *mics]:
        if not PART.match(value):
            raise SystemExit(f"{value!r}: pakai huruf kecil, angka, dan tanda hubung saja")
    if not (NASKAH / f"{topik}.txt").exists():
        raise SystemExit(f"naskah eval/naskah/{topik}.txt tidak ada")
    if len(set(mics.values())) < len(mics):
        raise SystemExit("dua mic memakai nomor perangkat yang sama, jadi rekamannya akan identik")
    files = {mic: data / f"A_{speaker}_{topik}_{mic}_{lokasi}.wav" for mic in mics}
    taken = [p.name for p in files.values() if p.exists()]
    if taken:
        raise SystemExit(f"sudah ada, tidak ditimpa: {', '.join(taken)}")
    return files


def record(devices: dict[str, int], stop) -> tuple[dict[str, np.ndarray], dict[str, int]]:
    """Rekam dari semua perangkat sampai stop() selesai. Mengembalikan audio int16 dan jumlah gangguan per mic."""
    chunks = {mic: [] for mic in devices}
    problems = dict.fromkeys(devices, 0)

    def callback(mic):
        def on_audio(data, frames, time, status):
            chunks[mic].append(data[:, 0].copy())
            problems[mic] += bool(status)  # misalnya input overflow: ada potongan audio yang hilang
        return on_audio

    streams = [sd.InputStream(device=dev, samplerate=config.SAMPLE_RATE, channels=1, dtype="int16",
                              callback=callback(mic)) for mic, dev in devices.items()]
    for s in streams:
        s.start()
    try:
        stop()
    finally:
        for s in streams:
            s.stop()
            s.close()
    audio = {mic: np.concatenate(c) if c else np.zeros(0, np.int16) for mic, c in chunks.items()}
    return audio, problems


def check(audio: np.ndarray) -> list[str]:
    peak = int(np.abs(audio.astype(np.int32)).max(initial=0)) / 32767
    warnings = []
    if peak < 0.01:
        warnings.append("hampir hening, mungkin mic salah atau mute")
    if peak >= 0.99:
        warnings.append("clipping, turunkan volume input mic")
    return warnings


def save(path: Path, audio: np.ndarray) -> None:
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(config.SAMPLE_RATE)
        w.writeframes(audio.tobytes())


def list_devices() -> None:
    # Satu mic muncul sekali per host API. Yang ditampilkan hanya host API mic bawaan (MME di Windows),
    # karena MME bisa langsung merekam 16 kHz. Sound Mapper disembunyikan, karena ia ikut berpindah ke mic
    # bawaan Windows, misalnya ke earphone begitu earphone dicolok.
    default = sd.default.device[0]
    hostapi = sd.query_devices(default)["hostapi"]
    for i, d in enumerate(sd.query_devices()):
        if d["hostapi"] == hostapi and d["max_input_channels"] > 0 and "Sound Mapper" not in d["name"]:
            print(f"{i:3}  {d['name']}{'  (bawaan)' if i == default else ''}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--list", action="store_true", help="tampilkan nomor perangkat mic")
    parser.add_argument("--speaker", help="kode pembicara, misalnya p01")
    parser.add_argument("--topik", help="nama naskah di eval/naskah/, misalnya gan")
    parser.add_argument("--lokasi", help="tempat rekaman, misalnya lab")
    parser.add_argument("--mic", action="append", default=[], metavar="NAMA=NOMOR",
                        help="jenis mic dan nomor perangkatnya dari --list, misalnya laptop=1")
    args = parser.parse_args()
    if args.list:
        list_devices()
        return
    if not (args.speaker and args.topik and args.lokasi and args.mic):
        parser.error("--speaker, --topik, --lokasi, dan minimal satu --mic wajib diisi")
    try:
        mics = {name: int(dev) for name, dev in (m.split("=", 1) for m in args.mic)}
    except ValueError:
        parser.error("--mic harus berbentuk NAMA=NOMOR, misalnya laptop=1")
    files = plan_files(args.speaker, args.topik, args.lokasi, mics)
    DATA.mkdir(parents=True, exist_ok=True)  # dibuat sebelum merekam, supaya rekaman tidak hilang saat disimpan

    audio, problems = record(mics, lambda: input("Merekam. Tekan Enter untuk berhenti..."))
    rows = []
    for mic, path in files.items():
        save(path, audio[mic])
        seconds = len(audio[mic]) / config.SAMPLE_RATE
        notes = check(audio[mic]) + ([f"{problems[mic]} gangguan input"] if problems[mic] else [])
        print(f"{path.name}: {seconds:.1f} detik{'  PERIKSA: ' + ', '.join(notes) if notes else ''}")
        rows.append(f"{path.stem},A,{args.speaker},{args.topik},{mic},{args.lokasi},,{round(seconds)},")
    print("\nBaris untuk eval/data/metadata.csv (isi kolom kondisi dan consent):")
    print("\n".join(rows))


if __name__ == "__main__":
    main()
