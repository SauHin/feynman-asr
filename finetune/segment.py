"""Potong rekaman naskah latih jadi potongan pendek berlabel untuk fine-tuning.

Rekaman finetune/data/T_<id>_<topik>_<mic>_<lokasi>.<ext> dipasangkan dengan naskah hasil edit
pembacanya, finetune/naskah/<topik>.<id>.txt. Rekaman ditranskrip faster-whisper dengan word
timestamps, transkripnya disejajarkan dengan naskah, lalu audio dipotong di batas kalimat.
Hasilnya ada di finetune/data/segments/<nama rekaman>/: satu WAV 16 kHz mono per potongan dan
segments.csv untuk dicek manual. Panduan lengkap: finetune/README.md.

Pakai dari root repo dengan Python dari backend/.venv:
    python finetune/segment.py                    # potong semua rekaman yang belum dipotong
    python finetune/segment.py --device cpu       # laptop tanpa GPU NVIDIA
    python finetune/segment.py --force T_s02_cnn_laptop_kos.wav   # potong ulang, hasil cek lama hilang
    python finetune/segment.py --check            # periksa semua segments.csv sebelum diunggah
"""
import argparse
import csv
import re
import shutil
import sys
import wave
from difflib import SequenceMatcher
from pathlib import Path

import numpy as np

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "backend"))
sys.path.insert(0, str(REPO / "eval"))
import config  # noqa: E402
from asr.transcribe_file import transcribe_file  # noqa: E402
from faster_whisper import decode_audio  # noqa: E402
from pilot_compare import edit_distance, norm  # noqa: E402

DATA = REPO / "finetune" / "data"
SEGMENTS = DATA / "segments"
NASKAH = REPO / "finetune" / "naskah"
COLUMNS = ["file", "status", "note", "wer", "text", "asr_text", "start", "end"]
WHISPER_MAX_S = 30.0  # Whisper hanya menerima input sampai 30 detik


def tokens(text: str) -> list[str]:
    """norm() ditambah penyatuan imbuhan bertanda hubung. ASR kadang menulis "network-nya", kadang
    "networknya" (juga "di-update"/"diupdate"), dan beda ejaan ini bukan salah ucap."""
    text = re.sub(r"(?<=\w)\s*-\s*(nya|in|an|kan)\b", r"\1", text, flags=re.I)
    text = re.sub(r"\b(di|ke|ter|nge|se)\s*-\s*(?=\w)", r"\1", text, flags=re.I)
    return norm(text)


def split_sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.?!])\s+|\n\s*\n", text.strip()) if s.strip()]


def plan_segments(
    sentences: list[str],
    words: list[tuple[str, float, float]],
    audio_s: float,
    max_s: float = config.FT_MAX_SEGMENT_S,
    min_gap_s: float = config.FT_MIN_GAP_S,
    flag_wer: float = config.FT_FLAG_WER,
    pad_s: float = config.FT_EDGE_PAD_S,
) -> list[dict]:
    """Kelompokkan kalimat naskah jadi potongan audio memakai waktu kata dari ASR.

    Kata naskah yang cocok dengan kata ASR mendapat waktu kata itu. Audio hanya dipotong di jeda
    antara dua kalimat. Potongan ditandai "cek" kalau titik potongnya tidak pasti (kata di tepi
    kalimat tidak cocok, atau jedanya terlalu pendek) atau transkripnya terlalu beda dari naskah.
    """
    merged = []
    for w, start, end in words:
        if merged and w.startswith("-"):  # Whisper kadang memisah "-nya" jadi kata sendiri
            merged[-1] = (merged[-1][0] + w, merged[-1][1], end)
        else:
            merged.append((w, start, end))
    words = merged

    ref, ref_sent = [], []
    for i, s in enumerate(sentences):
        toks = tokens(s)
        ref += toks
        ref_sent += [i] * len(toks)
    hyp, hyp_time = [], []
    for w, start, end in words:
        for t in tokens(w):
            hyp.append(t)
            hyp_time.append((start, end))
    times = [None] * len(ref)
    for a, b, n in SequenceMatcher(None, ref, hyp, autojunk=False).get_matching_blocks():
        for k in range(n):
            times[a + k] = hyp_time[b + k]

    sent = []
    for i in range(len(sentences)):
        idx = [j for j, s in enumerate(ref_sent) if s == i]
        timed = [times[j] for j in idx if times[j]]
        sent.append({
            "start": timed[0][0] if timed else None,
            "end": timed[-1][1] if timed else None,
            "sure_start": bool(idx) and times[idx[0]] is not None,
            "sure_end": bool(idx) and times[idx[-1]] is not None,
        })
    if not any(s["start"] is not None for s in sent):
        return []

    # Titik potong yang mungkin: (indeks kalimat sebelum potong, waktu, pasti?)
    cuts = []
    for i in range(len(sentences) - 1):
        a, b = sent[i], sent[i + 1]
        if a["end"] is not None and b["start"] is not None and b["start"] >= a["end"]:
            sure = a["sure_end"] and b["sure_start"] and b["start"] - a["end"] >= min_gap_s
            cuts.append((i, (a["end"] + b["start"]) / 2, sure))

    # Kalau kata pertama/terakhir naskah tidak cocok, pakai tepi transkrip supaya audionya tidak terpotong.
    first_s = sent[0]["start"] if sent[0]["sure_start"] else words[0][1]
    last_e = sent[-1]["end"] if sent[-1]["sure_end"] else words[-1][2]
    final_end = min(audio_s, last_e + pad_s)

    segs = []
    first, start, start_sure = 0, max(0.0, first_s - pad_s), sent[0]["sure_start"]
    while True:
        later = [c for c in cuts if c[0] >= first]
        cut = None
        if later and final_end - start > max_s:
            fits = [c for c in later if c[1] - start <= max_s]
            cut = ([c for c in fits if c[2]] or fits or later[:1])[-1]
        last = cut[0] if cut else len(sentences) - 1
        end = cut[1] if cut else final_end
        sure = start_sure and (cut[2] if cut else sent[-1]["sure_end"])

        text = " ".join(sentences[first:last + 1])
        asr_text = " ".join(w for w, s, e in words if start <= (s + e) / 2 < end)
        ref_tokens = tokens(text)
        wer = edit_distance(ref_tokens, tokens(asr_text)) / max(1, len(ref_tokens))
        notes = []
        if end - start > WHISPER_MAX_S:
            status, notes = "buang", ["lebih dari 30 detik"]
        else:
            if not sure:
                notes.append("batas potong tidak pasti")
            if wer > flag_wer:
                notes.append("beda dengan transkrip ASR")
            status = "cek" if notes else "ok"
        segs.append({
            "file": "", "status": status, "note": ", ".join(notes), "wer": round(wer, 3),
            "text": text, "asr_text": asr_text, "start": round(start, 2), "end": round(end, 2),
        })
        if not cut:
            return segs
        first, start, start_sure = cut[0] + 1, cut[1], cut[2]


def write_segments(out: Path, audio: np.ndarray, segs: list[dict]) -> None:
    sr = config.SAMPLE_RATE
    out.mkdir(parents=True)
    for k, s in enumerate(segs, 1):
        s["file"] = f"{k:03d}.wav"
        clip = audio[int(s["start"] * sr):int(s["end"] * sr)]
        with wave.open(str(out / s["file"]), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes((np.clip(clip, -1, 1) * 32767).astype(np.int16).tobytes())
    with open(out / "segments.csv", "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(segs)


def segment_recording(path: Path, device: str, force: bool) -> str:
    if not path.is_file():
        raise ValueError("file tidak ada")
    parts = path.stem.split("_")
    if len(parts) != 5 or parts[0] != "T":
        raise ValueError("nama file harus T_<id>_<topik>_<mic>_<lokasi>, tanpa _ di dalam tiap bagian")
    speaker, topic = parts[1], parts[2]
    if not (NASKAH / f"{topic}.txt").exists():
        raise ValueError(f"topik tidak dikenal: {topic} (lihat nama naskah di finetune/naskah/)")
    naskah = NASKAH / f"{topic}.{speaker}.txt"
    if not naskah.exists():
        raise ValueError(f"naskah hasil edit belum ada: finetune/naskah/{naskah.name}")
    out = SEGMENTS / path.stem
    if out.exists():
        if not force:
            return f"lewati {path.name}: sudah dipotong (pakai --force untuk memotong ulang)"
        shutil.rmtree(out)

    compute_type = config.ASR_COMPUTE_TYPE if device == "cuda" else "int8"
    r = transcribe_file(str(path), device=device, compute_type=compute_type)
    audio = decode_audio(str(path), sampling_rate=config.SAMPLE_RATE)
    segs = plan_segments(
        split_sentences(naskah.read_text(encoding="utf-8")), r["words"], len(audio) / config.SAMPLE_RATE
    )
    if not segs:
        raise ValueError(f"tidak ada kata yang cocok dengan {naskah.name}. Rekaman dan naskahnya berpasangan?")
    write_segments(out, audio, segs)
    n_cek = sum(s["status"] == "cek" for s in segs)
    n_buang = sum(s["status"] == "buang" for s in segs)
    return f"{path.name}: {len(segs)} potongan, {n_cek} perlu dicek, {n_buang} dibuang otomatis"


def check() -> int:
    files = sorted(SEGMENTS.glob("*/segments.csv"))
    if not files:
        print("belum ada hasil potongan di finetune/data/segments/")
        return 1
    total_s, n_bad = 0.0, 0
    for f in files:
        with open(f, encoding="utf-8-sig", newline="") as fh:
            reader = csv.DictReader(fh)
            rows = list(reader)
            missing = set(COLUMNS) - set(reader.fieldnames or [])
        bad = [f"kolom hilang: {', '.join(sorted(missing))}"] if missing else []
        for r in [] if missing else rows:
            if r["status"] not in ("ok", "buang"):
                bad.append(f"{r['file']}: status {r['status']!r}, harus ok atau buang")
            elif r["status"] == "ok" and not r["text"].strip():
                bad.append(f"{r['file']}: text kosong")
            if not (f.parent / r["file"]).is_file():
                bad.append(f"{r['file']}: file audio tidak ada")
        ok_s = 0.0 if missing else sum(float(r["end"]) - float(r["start"]) for r in rows if r["status"] == "ok")
        total_s += ok_s
        n_ok = 0 if missing else sum(r["status"] == "ok" for r in rows)
        print(f"{'belum' if bad else 'siap '}  {f.parent.name}: {n_ok}/{len(rows)} potongan ok, {ok_s / 60:.1f} menit")
        for b in bad:
            print(f"       {b}")
        n_bad += len(bad)
    print(f"total siap dilatih: {total_s / 60:.1f} menit")
    return 1 if n_bad else 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("recordings", nargs="*", help="nama rekaman di finetune/data/ (default: semua T_*)")
    parser.add_argument("--device", choices=["cuda", "cpu"], default=config.ASR_DEVICE)
    parser.add_argument("--force", action="store_true", help="hapus hasil potong dan hasil cek lama, lalu potong ulang")
    parser.add_argument("--check", action="store_true", help="periksa semua segments.csv sebelum diunggah")
    args = parser.parse_args()
    if args.check:
        return check()

    paths = [DATA / Path(n).name for n in args.recordings] or sorted(p for p in DATA.glob("T_*") if p.is_file())
    if not paths:
        print("tidak ada rekaman T_* di finetune/data/")
        return 1
    failed = 0
    for path in paths:
        try:
            print(segment_recording(path, args.device, args.force))
        except ValueError as e:
            print(f"gagal {path.name}: {e}")
            failed += 1
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
