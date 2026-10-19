"""Draf anotasi Set B untuk satu rekaman, supaya anotator tinggal mengecek sambil mendengarkan
(docs/user-testing/anotasi-set-b.md).

Draf dibuat dengan config.ANNOT_DRAFT_MODEL tanpa hotwords, bukan dengan model aplikasi, supaya kesalahan sistem
yang dievaluasi tidak ikut masuk ke kunci jawaban. Semua keluaran berakhiran .draft, jadi eval/metrics.py tidak
membacanya sebagai label sebelum dicek dan di-rename. File yang sudah ada tidak ditimpa.

    <file_id>.draft.ref.txt       transkrip, satu segmen Whisper per baris
    <file_id>.draft.words.txt     label Audacity per kata, untuk mencari waktu dan mengecek teks
    <file_id>.draft.labels.txt    label Audacity: jeda minimal ANNOT_PAUSE_S dan kandidat filler
    <file_id>.draft.concepts.csv  satu baris per konsep sesi, waktu sebutan pertama dari teks draf
    <file_id>.draft.terms.txt     nama dan alias konsep, sebagai awal daftar istilah

Rekaman harus terdaftar di eval/data/metadata.csv. Daftar konsep diambil dari log sesi di kolom sesi.

Pakai dari root repo dengan Python dari backend/.venv:
    python eval/draft_labels.py eval/data/B_p01_regularisasi_laptop_lab_1.wav
"""
import argparse
import csv
import io
import json
import re
import sys
from pathlib import Path

import metrics
from normalize import VOCAL_FILLER, normalize

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "backend"))
import config  # noqa: E402
from asr.transcribe_file import transcribe_file  # noqa: E402

Word = tuple[str, float, float]  # teks, mulai, akhir dalam detik


def pauses(words: list[Word]) -> list[tuple[float, float, str]]:
    return [(a[2], b[1], "jeda") for a, b in zip(words, words[1:]) if b[1] - a[2] >= config.ANNOT_PAUSE_S]


def fillers(words: list[Word]) -> list[tuple[float, float, str]]:
    # Filler leksikal hanya kandidat: anotator membuang yang dipakai dengan arti, misalnya "kayak" = "seperti".
    out = []
    for text, start, end in words:
        w = re.sub(r"[^\w]", "", text.lower())
        if VOCAL_FILLER.match(w) or w in config.FLUENCY_LEXICAL_FILLERS:
            out.append((start, end, w))
    return out


def first_mentions(words: list[Word], concepts: list[dict]) -> dict[str, float | None]:
    """Akhir sebutan pertama nama atau alias tiap konsep. Dicocokkan persis setelah normalisasi, bukan dengan
    pencocokan fuzzy checklist, supaya draf tidak meniru cara kerja sistem yang dievaluasi."""
    tokens, ends = [], []
    for text, _, end in words:
        for tok in normalize(text):
            tokens.append(tok)
            ends.append(end)
    found = {}
    for c in concepts:
        terms = [term for t in [c["name"], *c.get("aliases", [])] if (term := normalize(t))]
        hits = [ends[i + len(term) - 1] for term in terms for i in range(len(tokens)) if metrics.at(tokens, i, term)]
        found[c["id"]] = min(hits, default=None)
    return found


def audacity(labels) -> str:
    return "".join(f"{start:.3f}\t{end:.3f}\t{text}\n" for start, end, text in labels)


def write_new(path: Path, text: str) -> None:
    if path.exists():  # bisa jadi sudah dikoreksi anotator
        print(f"dilewati, sudah ada: {path.name}")
        return
    path.write_text(text, encoding="utf-8")
    print(f"ditulis: {path.name}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("file", type=Path)
    f = parser.parse_args().file
    meta = metrics.load_metadata()
    if not f.is_file():
        raise SystemExit(f"file tidak ada: {f}")
    if f.stem not in meta:
        raise SystemExit(f"{f.stem} belum terdaftar di eval/data/metadata.csv")
    concepts = []
    if sid := (meta[f.stem].get("sesi") or "").strip():
        log = config.SESSION_DIR / f"{sid}.json"
        if not log.is_file():
            raise SystemExit(f"log sesi tidak ada: {log}")
        concepts = json.loads(log.read_text(encoding="utf-8"))["concepts"]
    else:
        print("kolom sesi kosong, jadi draf konsep dan istilah tidak dibuat")

    # VAD dan tanpa konteks teks sebelumnya, sama dengan aplikasi, supaya draf tidak berisi halusinasi saat hening.
    r = transcribe_file(str(f), model_name=config.ANNOT_DRAFT_MODEL, vad_filter=config.ASR_VAD_FILTER,
                        condition_on_previous_text=False)
    words = r["words"]

    def draft(kind: str) -> Path:
        return f.with_name(f"{f.stem}.draft.{kind}")

    write_new(draft("ref.txt"), "\n".join(r["segments"]) + "\n")
    write_new(draft("words.txt"), audacity((start, end, text) for text, start, end in words))
    write_new(draft("labels.txt"), audacity(sorted(pauses(words) + fillers(words))))
    if concepts:
        mentions = first_mentions(words, concepts)
        table = io.StringIO()
        rows = csv.writer(table, lineterminator="\n")
        rows.writerow(["concept_id", "name", "first_mention_s", "status", "catatan"])
        for c in concepts:
            t = mentions[c["id"]]
            rows.writerow([c["id"], c["name"], "" if t is None else f"{t:.2f}", "", ""])
        write_new(draft("concepts.csv"), table.getvalue())
        terms = dict.fromkeys(t.strip().lower() for c in concepts for t in [c["name"], *c.get("aliases", [])])
        write_new(draft("terms.txt"), "".join(f"{t}\n" for t in terms if t))


if __name__ == "__main__":
    main()
