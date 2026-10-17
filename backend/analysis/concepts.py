"""Checklist konsep live (PLAN 7.2): konsep dianggap dibahas saat nama atau aliasnya muncul di kata confirmed.

Pencocokan memakai rapidfuzz, jadi salah eja ASR seperti "chain rul" tetap terhitung. Apakah konsep dijelaskan
dengan benar tidak dinilai live, karena deteksi berbasis embedding tidak bisa diandalkan
(docs/eksperimen/2026-10-15-kalibrasi-checklist.md). Penilaian itu dikerjakan Gemini setelah sesi.
"""
import re

from rapidfuzz import fuzz

import config
from analysis.gemini import Concept
from asr.streaming import Word


def _norm(text: str) -> str:
    # Huruf kecil tanpa tanda baca, jadi "Chain-rule," dan "chainrule" sama.
    return re.sub(r"[^\w]", "", text.lower())


def _tokens(text: str) -> list[str]:
    return [n for n in map(_norm, text.split()) if n]


class ConceptTracker:
    """Konsep yang sudah dibahas di satu sesi."""

    def __init__(self, concepts: list[Concept]):
        self.terms = {c.id: [t for t in map(_tokens, [c.name, *c.aliases]) if t] for c in concepts}
        self.covered: set[str] = set()
        self.norms: list[str] = []

    def add(self, new: list[Word]) -> list[tuple[str, float]]:
        """Kata yang baru confirmed -> konsep yang baru dibahas, sebagai (concept_id, akhir kata terakhir)."""
        if not new:
            return []
        first = len(self.norms)
        self.norms += [_norm(w.text) for w in new]
        found = [cid for cid, terms in self.terms.items()
                 if cid not in self.covered and any(self._said(t, first) for t in terms)]
        self.covered.update(found)
        return [(cid, new[-1].end) for cid in found]

    def _said(self, term: list[str], first: int) -> bool:
        # Potongan transkrip yang berakhir di kata baru, sepanjang istilah plus-minus satu kata, supaya istilah yang
        # dipecah ASR ("back propagation") atau digabung ("learningrate") tetap cocok. Akhiran -nya dilepas.
        target = "".join(term)
        for size in {max(1, len(term) - 1), len(term), len(term) + 1}:
            for end in range(max(first, size - 1), len(self.norms)):
                piece = "".join(self.norms[end - size + 1:end + 1])
                score = max(fuzz.ratio(piece, target), fuzz.ratio(piece.removesuffix("nya"), target))
                if score >= config.CONCEPT_MENTION_SCORE:
                    return True
        return False
