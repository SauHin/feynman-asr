"""Checklist konsep live (PLAN 7.2), dihitung hanya dari kata confirmed supaya checklist tidak berkedip.

Disebut: nama atau alias konsep muncul di transkrip. Pencocokan memakai rapidfuzz, jadi salah eja ASR seperti
"chain rul" tetap terhitung. Dijelaskan: kata-kata sesudah konsep disebut mirip dengan nama dan deskripsinya,
diukur dengan embedding. Ambang dan alasan tiap aturan ada di docs/eksperimen/2026-10-15-kalibrasi-checklist.md.

Model embedding jalan di CPU lewat onnxruntime dan tokenizers, yang sudah terpasang sebagai dependensi
faster-whisper. sentence-transformers tidak dipakai: paketnya menarik torch, transformers, scipy, dan scikit-learn
(sekitar 180 MB unduhan), dan butuh huggingface-hub di bawah 2.0, padahal faster-whisper memasang 2.2.
"""
import re
from collections.abc import Callable

import numpy as np
import onnxruntime as ort
from huggingface_hub import hf_hub_download
from rapidfuzz import fuzz
from tokenizers import Tokenizer

import config
from analysis.gemini import Concept
from asr.streaming import Word

# Daftar teks -> embedding ternormalisasi, satu baris per teks. Hasil kali titik dua baris = cosine similarity.
Embed = Callable[[list[str]], np.ndarray]


def load_embedder() -> Embed:
    """Model diunduh sekali ke cache Hugging Face, lalu dipakai semua sesi."""
    tok = Tokenizer.from_file(hf_hub_download(config.CONCEPT_EMBED_MODEL, "tokenizer.json"))
    tok.enable_truncation(config.CONCEPT_EMBED_MAX_TOKENS)
    tok.enable_padding()
    path = hf_hub_download(config.CONCEPT_EMBED_MODEL, config.CONCEPT_EMBED_FILE)
    session = ort.InferenceSession(path, providers=["CPUExecutionProvider"])
    inputs = {i.name for i in session.get_inputs()}

    def embed(texts: list[str]) -> np.ndarray:
        enc = tok.encode_batch(texts)
        ids = np.array([e.ids for e in enc], dtype=np.int64)
        mask = np.array([e.attention_mask for e in enc], dtype=np.int64)
        feed = {"input_ids": ids, "attention_mask": mask, "token_type_ids": np.zeros_like(ids)}
        out = session.run(None, {k: v for k, v in feed.items() if k in inputs})[0]
        # Mean pooling seperti sentence-transformers untuk model ini.
        e = (out * mask[..., None]).sum(1) / mask.sum(1, keepdims=True)
        return e / np.linalg.norm(e, axis=1, keepdims=True)

    return embed


def _norm(text: str) -> str:
    # Huruf kecil tanpa tanda baca, jadi "Chain-rule," dan "chainrule" sama.
    return re.sub(r"[^\w]", "", text.lower())


def _tokens(text: str) -> list[str]:
    return [n for n in map(_norm, text.split()) if n]


class ConceptTracker:
    """Status konsep satu sesi. Status hanya naik: belum, disebut, lalu dijelaskan."""

    def __init__(self, concepts: list[Concept], embed: Embed):
        self.embed = embed
        self.terms = {c.id: [t for t in map(_tokens, [c.name, *c.aliases]) if t] for c in concepts}
        described = [c for c in concepts if c.description.strip()]
        self.index = {c.id: i for i, c in enumerate(described)}
        # Nama ikut di-embed. Tanpa nama, deskripsi yang umum ("bobot diubah agar prediksi akurat") paling mirip
        # dengan hampir semua jendela: di kalibrasi, konsep yang benar jadi yang paling mirip di 20 dari 57 jendela
        # berlabel, dan dengan nama di 45.
        self.descriptions = embed([f"{c.name}: {c.description}" for c in described]) if described else None
        self.status: dict[str, str] = {}
        self.said_at: dict[str, int] = {}  # indeks kata terakhir penyebutan pertama tiap konsep
        self.words: list[Word] = []
        self.norms: list[str] = []

    def add(self, new: list[Word]) -> list[tuple[str, str, float]]:
        """Kata yang baru confirmed -> konsep yang statusnya naik, sebagai (concept_id, status, waktu audio).
        Waktunya akhir kata terakhir yang sudah diterima. Dalam satu batch, hanya status tertinggi yang dikirim."""
        if not new:
            return []
        first = len(self.words)
        self.words += new
        self.norms += [_norm(w.text) for w in new]
        before = dict(self.status)
        for cid, terms in self.terms.items():
            if cid in self.said_at:
                continue
            ends = [e for e in (self._said(t, first) for t in terms) if e is not None]
            if ends:
                self.said_at[cid] = min(ends)
                self.status[cid] = "mentioned"
        for cid, sim in self.similarity().items():
            if sim >= config.CONCEPT_EXPLAIN_SIM:
                self.status[cid] = "explained"
        t = self.words[-1].end
        return [(cid, s, t) for cid, s in self.status.items() if before.get(cid) != s]

    def windows(self) -> dict[str, str]:
        """Jendela tiap konsep yang sudah disebut tapi belum dijelaskan: kata sesudah penyebutan pertamanya,
        paling banyak CONCEPT_WINDOW_WORDS kata terakhir. Nama yang baru disebut belum punya jendela, jadi menyebut
        nama lalu pindah topik tidak membuat konsep dianggap dijelaskan."""
        n = len(self.words)
        out = {}
        for cid, at in self.said_at.items():
            start = max(n - config.CONCEPT_WINDOW_WORDS, at + 1)
            if self.status.get(cid) != "explained" and cid in self.index and start < n:
                out[cid] = " ".join(w.text for w in self.words[start:])
        return out

    def similarity(self) -> dict[str, float]:
        """Cosine similarity jendela tiap konsep dengan nama dan deskripsinya."""
        windows = self.windows()
        if not windows:
            return {}
        vectors = self.embed(list(windows.values()))
        return {cid: float(self.descriptions[self.index[cid]] @ v) for cid, v in zip(windows, vectors)}

    def _said(self, term: list[str], first: int) -> int | None:
        """Indeks kata terakhir penyebutan istilah yang paling awal di antara kata baru, atau None.

        Potongan transkripnya sepanjang istilah plus-minus satu kata, supaya istilah yang dipecah ASR
        ("back propagation") atau digabung ("learningrate") tetap cocok. Akhiran -nya dilepas."""
        target = "".join(term)
        for end in range(first, len(self.words)):
            for size in {max(1, len(term) - 1), len(term), len(term) + 1}:
                if end - size + 1 < 0:
                    continue
                piece = "".join(self.norms[end - size + 1:end + 1])
                score = max(fuzz.ratio(piece, target), fuzz.ratio(piece.removesuffix("nya"), target))
                if score >= config.CONCEPT_MENTION_SCORE:
                    return end
        return None
