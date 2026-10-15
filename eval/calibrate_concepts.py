"""Kalibrasi ambang checklist "dijelaskan" (PLAN 7.2, 8.3) dari log replay rekaman pilot s01.

Kata confirmed di log diputar ulang ke ConceptTracker yang sama dengan server, batch demi batch seperti saat sesi.
Untuk tiap ambang, skrip mencatat kapan tiap konsep pertama kali dianggap dijelaskan, lalu membandingkannya dengan
label rentang waktu penjelasan di eval/kalibrasi/<file_id>.concepts.csv. Konsep tanpa label (misalnya daftar konsep
topik lain) tidak dijelaskan di rekaman, jadi setiap centang "jelas" untuknya salah.

Hanya rekaman pilot suara s01 yang boleh dipakai di sini. Set B untuk evaluasi, bukan kalibrasi (PLAN 8.3).

Pakai dari root repo dengan Python dari backend/.venv:
    python eval/calibrate_concepts.py --file A_s01_backprop_iphone_lkc --runs e2-off e2-on \\
        --concepts eval/naskah/backpropagation.concepts.json eval/naskah/mencegah-overfitting.concepts.json
"""
import argparse
import csv
import json
import sys
from pathlib import Path

import numpy as np

EVAL = Path(__file__).resolve().parent
sys.path.insert(0, str(EVAL.parent / "backend"))
import config  # noqa: E402
from analysis.concepts import ConceptTracker, load_embedder  # noqa: E402
from analysis.gemini import Concept  # noqa: E402
from asr.streaming import Word  # noqa: E402
from replay import parse_overrides  # noqa: E402

# Centang yang datang sampai 5 detik setelah penjelasan selesai masih dihitung tepat: kata baru confirmed sekitar
# 2 detik setelah diucapkan, dan jendela butuh beberapa kata untuk bergeser.
LATE_S = 5.0
THRESHOLDS = np.round(np.arange(0.30, 0.701, 0.025), 3)


def batches(run: str, file_id: str) -> list[list[Word]]:
    log = json.loads((EVAL / "runs" / run / f"{file_id}.json").read_text(encoding="utf-8"))
    return [[Word(s, e, t) for s, e, t in m["words"]["confirmed"]]
            for _, m in log["messages"] if m.get("type") == "transcript" and m["words"]["confirmed"]]


def trace(concepts: list[Concept], embed, run: str, file_id: str) -> list[tuple[float, dict, set]]:
    """Per batch: akhir kata terakhir, similarity konsep yang sudah disebut, dan konsep yang sudah disebut."""
    tracker = ConceptTracker(concepts, embed)
    out = []
    for batch in batches(run, file_id):
        tracker.add(batch)
        out.append((tracker.words[-1].end, tracker.similarity(), set(tracker.said_at)))
    return out


def first(rows, cid: str, theta: float) -> float | None:
    return next((t for t, sims, _ in rows if sims.get(cid, -1) >= theta), None)


def outcome(t: float | None, label: tuple[float, float] | None) -> str:
    if label is None:
        return "salah" if t is not None else "benar"
    if t is None:
        return "terlewat"
    return "terlalu awal" if t < label[0] else "tepat" if t <= label[1] + LATE_S else "telat"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--file", required=True, help="file_id rekaman, misalnya A_s01_backprop_iphone_lkc")
    parser.add_argument("--runs", nargs="+", required=True, help="run replay di eval/runs yang dipakai")
    parser.add_argument("--concepts", nargs="+", type=Path, required=True, help="file JSON daftar konsep")
    parser.add_argument("--set", action="append", default=[], metavar="PARAM=NILAI", help="timpa parameter config.py")
    args = parser.parse_args()

    for name, value in parse_overrides(args.set).items():
        setattr(config, name, value)
    args.theta = config.CONCEPT_EXPLAIN_SIM
    config.CONCEPT_EXPLAIN_SIM = 2.0  # status "dijelaskan" dihitung di sini per ambang, bukan oleh tracker
    concepts = [Concept(**c) for f in args.concepts for c in json.loads(f.read_text(encoding="utf-8"))]
    with open(EVAL / "kalibrasi" / f"{args.file}.concepts.csv", encoding="utf-8", newline="") as f:
        labels = {r["concept_id"]: (float(r["start"]), float(r["end"])) for r in csv.DictReader(f)}
    embed = load_embedder()
    traces = {run: trace(concepts, embed, run, args.file) for run in args.runs}

    print(f"model {config.CONCEPT_EMBED_MODEL} ({config.CONCEPT_EMBED_FILE}), jendela {config.CONCEPT_WINDOW_WORDS} kata")
    print("\nSimilarity tertinggi per konsep. Sebelum: jendela yang berakhir sebelum penjelasan mulai (atau seluruh sesi")
    print("untuk konsep tanpa label). Saat: jendela yang berakhir di rentang penjelasan sampai 5 detik sesudahnya.")
    print("Similarity baru ada setelah konsep disebut.")
    for run, rows in traces.items():
        print(f"\n  {run}")
        for c in concepts:
            label = labels.get(c.id)
            before = [s[c.id] for t, s, _ in rows if c.id in s and (label is None or t < label[0])]
            during = [s[c.id] for t, s, _ in rows if c.id in s and label and label[0] <= t <= label[1] + LATE_S]
            said = next((t for t, _, s in rows if c.id in s), None)
            print(f"    {c.id:18s} sebelum {max(before, default=0):.3f}   saat {max(during, default=0):.3f}"
                  f"   disebut {'-' if said is None else f'{said:.1f} s'}")

    print(f"\nHasil per ambang ({len(args.runs)} run x {len(concepts)} konsep)")
    print("  ambang  tepat  terlalu awal  telat  terlewat  salah (tanpa label)  delay median")
    for theta in THRESHOLDS:
        counts, delays = {}, []
        for rows in traces.values():
            for c in concepts:
                t = first(rows, c.id, theta)
                o = outcome(t, labels.get(c.id))
                counts[o] = counts.get(o, 0) + 1
                if o == "tepat":
                    delays.append(t - labels[c.id][0])
        delay = f"{np.median(delays):.1f} s" if delays else "-"
        print(f"  {theta:.3f}  {counts.get('tepat', 0):5d}  {counts.get('terlalu awal', 0):12d}  "
              f"{counts.get('telat', 0):5d}  {counts.get('terlewat', 0):8d}  {counts.get('salah', 0):19d}  {delay:>12s}")

    print(f"\nRincian di ambang config.py ({args.theta}): waktu audio saat konsep pertama kali dianggap dijelaskan")
    for run, rows in traces.items():
        for c in concepts:
            t, label = first(rows, c.id, args.theta), labels.get(c.id)
            if label or t is not None:
                print(f"  {run:10s} {c.id:18s} {'-' if t is None else f'{t:.1f} s':>8s}  label {label}  "
                      f"{outcome(t, label)}")


if __name__ == "__main__":
    main()
