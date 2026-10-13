"""Pilot model ASR: transkripsi satu rekaman, lalu WER, CER, dan term recall terhadap naskah.

Hasilnya dicatat di docs/eksperimen/2026-10-13-pilot-model.md. Jalankan dengan Python dari backend/.venv:
    python eval/pilot_compare.py eval/data/A_s01_backprop_iphone_lkc.m4a backpropagation large-v3-turbo
"""
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "backend"))
from asr.transcribe_file import transcribe_file  # noqa: E402


# shortcut: normalisasi minimal (huruf kecil, tanda baca dan tanda hubung jadi spasi),
# ganti dengan eval/normalize.py + jiwer di Fase 2.
def norm(text: str) -> list[str]:
    text = text.lower().replace("-", " ")
    return re.sub(r"[^\w\s]", " ", text).split()


def edit_distance(a, b) -> int:
    prev = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        cur = [i]
        for j, y in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x != y)))
        prev = cur
    return prev[-1]


def count(term: str, words: list[str]) -> int:
    return len(re.findall(rf"\b{re.escape(term)}\b", " ".join(words)))


assert norm("Loss-nya, turun.") == ["loss", "nya", "turun"]
assert edit_distance("a b c".split(), "a x c d".split()) == 2


def main() -> None:
    audio, naskah, model = sys.argv[1:4]
    ref = norm((REPO / f"eval/naskah/{naskah}.txt").read_text(encoding="utf-8"))
    terms = [t for t in (REPO / f"eval/naskah/{naskah}.terms.txt").read_text(encoding="utf-8").splitlines() if t]

    r = transcribe_file(audio, model_name=model)
    hyp = norm(r["text"])
    wer = edit_distance(ref, hyp) / len(ref)
    cer = edit_distance(" ".join(ref), " ".join(hyp)) / len(" ".join(ref))
    hits = sum(min(count(t, ref), count(t, hyp)) for t in terms)
    total = sum(count(t, ref) for t in terms)
    missed = [f"{t} ({count(t, hyp)}/{count(t, ref)})" for t in terms if count(t, hyp) < count(t, ref)]

    print(f"=== {model}")
    print(f"WER {wer:.1%}  CER {cer:.1%}  term recall {hits}/{total} = {hits / total:.1%}")
    print(f"transkripsi {r['transcribe_s']:.1f} s untuk {r['audio_s']:.0f} s audio (RTF {r['rtf']:.3f}), VRAM {r['vram_mb']} MB")
    print("istilah kurang:", ", ".join(missed) or "-")
    print(r["text"])


if __name__ == "__main__":
    main()
