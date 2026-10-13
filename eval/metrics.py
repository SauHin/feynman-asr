"""Hitung metrik dari log replay (PLAN 8.4), lalu tulis ke eval/results/results.csv.

eval/replay.py memanggil skrip ini setelah memutar rekaman. Jalankan sendiri dari root repo untuk
menghitung ulang tanpa memutar audio, misalnya setelah aturan normalisasi berubah:
    python eval/metrics.py <nama run>
"""
import csv
import json
import re
import sys
from datetime import datetime
from pathlib import Path

import jiwer
import numpy as np

from normalize import normalize

EVAL = Path(__file__).resolve().parent
DATA = EVAL / "data"
NASKAH = EVAL / "naskah"
RUNS = EVAL / "runs"
RESULTS = EVAL / "results" / "results.csv"
# GPU laptop di bawah clock ini sedang ditahan mode termal, jadi angka latency-nya tidak sah.
MIN_GPU_MHZ = 1500

COLUMNS = [
    "run", "file_id", "set", "speaker_id", "topik", "mic", "overrides", "audio_s",
    "ref_words", "word_errors", "wer", "ref_chars", "char_errors", "cer",
    "term_hits", "term_total", "term_recall", "term_words", "term_errors", "other_words", "other_errors",
    "partial_p50", "partial_p90", "confirm_p50", "confirm_p90",
    "compute_s", "rtf", "end_delay_s", "gpu_mhz_p50", "evaluated_at",
]


def load_metadata() -> dict[str, dict]:
    path = DATA / "metadata.csv"
    if not path.exists():
        return {}
    with open(path, encoding="utf-8-sig", newline="") as f:
        return {r["file_id"]: r for r in csv.DictReader(f)}


def reference(file_id: str, meta: dict) -> tuple[str, list[str]]:
    """Reference dan daftar istilah. Set A memakai naskah, kecuali ada eval/data/<file_id>.ref.txt
    (naskah yang dikoreksi karena pembaca menyimpang, atau transkrip manual Set B)."""
    own = DATA / f"{file_id}.ref.txt"
    src = own if own.exists() else NASKAH / f"{meta['topik']}.txt"
    if not src.exists():
        raise FileNotFoundError(f"reference {file_id} tidak ada: {own.name} atau naskah/{meta['topik']}.txt")
    terms = NASKAH / f"{meta['topik']}.terms.txt"
    term_list = [t for t in terms.read_text(encoding="utf-8").splitlines() if t.strip()] if terms.exists() else []
    return src.read_text(encoding="utf-8"), term_list


def at(words: list[str], i: int, term: list[str]) -> bool:
    # "lossnya" tetap kemunculan istilah "loss".
    return all(w in (t, t + "nya") for w, t in zip(words[i:i + len(term)], term)) and i + len(term) <= len(words)


def count(term: list[str], words: list[str]) -> int:
    return sum(at(words, i, term) for i in range(len(words)))


def accuracy(ref: str, hyp: str, terms: list[str]) -> dict:
    r, h = normalize(ref), normalize(hyp)
    words = jiwer.process_words(" ".join(r), " ".join(h))
    chars = jiwer.process_characters(" ".join(r), " ".join(h))

    # Error per jenis token: substitusi dan deletion dihitung pada token reference. Insertion tidak punya
    # token reference, jadi hanya masuk WER total.
    wrong = [False] * len(r)
    for chunk in words.alignments[0]:
        if chunk.type in ("substitute", "delete"):
            wrong[chunk.ref_start_idx:chunk.ref_end_idx] = [True] * (chunk.ref_end_idx - chunk.ref_start_idx)
    is_term = [False] * len(r)
    norm_terms = [t for t in (normalize(t) for t in terms) if t]
    for t in norm_terms:
        for i in range(len(r)):
            if at(r, i, t):
                is_term[i:i + len(t)] = [True] * len(t)

    word_errors = words.substitutions + words.deletions + words.insertions
    char_errors = chars.substitutions + chars.deletions + chars.insertions
    ref_chars = chars.hits + chars.substitutions + chars.deletions
    term_total = sum(count(t, r) for t in norm_terms)
    term_hits = sum(min(count(t, r), count(t, h)) for t in norm_terms)
    return {
        "ref_words": len(r), "word_errors": word_errors, "wer": word_errors / len(r),
        "ref_chars": ref_chars, "char_errors": char_errors, "cer": char_errors / ref_chars,
        "term_hits": term_hits, "term_total": term_total,
        "term_recall": term_hits / term_total if term_total else None,
        "term_words": sum(is_term), "term_errors": sum(w and t for w, t in zip(wrong, is_term)),
        "other_words": len(r) - sum(is_term), "other_errors": sum(w and not t for w, t in zip(wrong, is_term)),
    }


def key(text: str) -> str:
    return re.sub(r"[^\w]", "", text.lower())


def latency(log: dict) -> dict:
    """Latency per kata (PLAN 6), dari waktu terima pesan dikurangi waktu akhir kata di audio.

    Replay mengirim audio dengan kecepatan 1x mulai t=0, jadi akhir kata di detik e diucapkan pada t=e.
    Partial latency: kata dengan teks sama (dan akhir kata dalam 0,5 detik) pertama kali tampil.
    Confirmation latency: kata itu confirmed. Kata yang baru tampil atau confirmed setelah Stop tidak
    dihitung, karena latency-nya bergantung pada kapan user menekan Stop.
    """
    msgs = [(t, m) for t, m in log["messages"] if m.get("type") == "transcript" and "words" in m]
    seen: dict[str, list[tuple[float, float]]] = {}  # teks kata -> (waktu terima, akhir kata)
    for t, m in msgs:
        for _, e, w in m["words"]["confirmed"] + m["words"]["partial"]:
            seen.setdefault(key(w), []).append((t, e))
    partial, confirm = [], []
    for t_c, m in msgs:
        for _, e, w in m["words"]["confirmed"]:
            first = min((t for t, e2 in seen[key(w)] if abs(e2 - e) <= 0.5 and t <= t_c), default=t_c)
            if first <= log["stop_at"]:
                partial.append(first - e)
            if t_c <= log["stop_at"]:
                confirm.append(t_c - e)
    idle = [t for t, m in log["messages"] if m == {"type": "status", "state": "idle"}]
    compute_s = msgs[-1][1]["compute_s"] if msgs else 0.0
    return {
        "partial": partial, "confirm": confirm, "compute_s": compute_s,
        "rtf": compute_s / log["audio_s"],
        "end_delay_s": idle[0] - log["stop_at"] if idle else None,
    }


def pct(values: list[float], q: float) -> float | None:
    return round(float(np.percentile(values, q)), 3) if values else None


def evaluate_run(run: str) -> None:
    meta = load_metadata()
    logs = sorted((RUNS / run).glob("*.json"))
    if not logs:
        raise SystemExit(f"tidak ada log di {RUNS / run}")
    rows, partial, confirm, clocks = [], [], [], []
    for path in logs:
        log = json.loads(path.read_text(encoding="utf-8"))
        file_id, m = path.stem, meta[path.stem]
        ref, terms = reference(file_id, m)
        hyp = " ".join(msg["confirmed"] for _, msg in log["messages"] if msg.get("type") == "transcript" and msg["confirmed"])
        acc, lat = accuracy(ref, hyp, terms), latency(log)
        partial += lat["partial"]
        confirm += lat["confirm"]
        clocks += log["gpu_mhz"]
        rows.append({
            "run": run, "file_id": file_id, "set": m.get("set"), "speaker_id": m.get("speaker_id"),
            "topik": m.get("topik"), "mic": m.get("mic"), "overrides": json.dumps(log["overrides"]),
            "audio_s": round(log["audio_s"], 2), **acc,
            "partial_p50": pct(lat["partial"], 50), "partial_p90": pct(lat["partial"], 90),
            "confirm_p50": pct(lat["confirm"], 50), "confirm_p90": pct(lat["confirm"], 90),
            "compute_s": lat["compute_s"], "rtf": lat["rtf"], "end_delay_s": lat["end_delay_s"],
            "gpu_mhz_p50": pct(log["gpu_mhz"], 50), "evaluated_at": datetime.now().isoformat(timespec="seconds"),
        })
    write_rows(run, rows)

    # Ringkasan level korpus (PLAN 8.4): total error dibagi total kata, latency median dan P90 semua kata.
    s = {k: sum(r[k] or 0 for r in rows) for k in COLUMNS if k in rows[0] and isinstance(rows[0][k], (int, float))}
    print(f"\nrun {run}: {len(rows)} rekaman, {s['audio_s'] / 60:.1f} menit audio")
    print(f"  WER {s['word_errors'] / s['ref_words']:.1%}   CER {s['char_errors'] / s['ref_chars']:.1%}")
    if s["term_total"]:
        print(f"  term recall {s['term_hits'] / s['term_total']:.1%}   error token istilah "
              f"{s['term_errors'] / s['term_words']:.1%}   error token lain {s['other_errors'] / s['other_words']:.1%}")
    print(f"  partial latency p50 {pct(partial, 50)} s, p90 {pct(partial, 90)} s")
    print(f"  confirmation latency p50 {pct(confirm, 50)} s, p90 {pct(confirm, 90)} s")
    print(f"  RTF {s['compute_s'] / s['audio_s']:.3f}   Stop sampai idle p50 {pct([r['end_delay_s'] for r in rows if r['end_delay_s'] is not None], 50)} s")
    if clocks:
        print(f"  clock GPU p50 {pct(clocks, 50):.0f} MHz")
        if pct(clocks, 50) < MIN_GPU_MHZ:
            print(f"  Peringatan: clock GPU di bawah {MIN_GPU_MHZ} MHz. Laptop mungkin tidak di mode Performance,"
                  " jadi angka latency run ini tidak sah.")


def write_rows(run: str, rows: list[dict]) -> None:
    """Baris lama dengan run dan file yang sama diganti, supaya results.csv tetap satu baris per file x run."""
    RESULTS.parent.mkdir(parents=True, exist_ok=True)
    old = []
    if RESULTS.exists():
        with open(RESULTS, encoding="utf-8", newline="") as f:
            done = {(r["run"], r["file_id"]) for r in rows}
            old = [r for r in csv.DictReader(f) if (r["run"], r["file_id"]) not in done]
    with open(RESULTS, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(old + rows)


if __name__ == "__main__":
    evaluate_run(sys.argv[1])
