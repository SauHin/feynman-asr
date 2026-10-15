import numpy as np
import pytest

import app as app_module

KEYWORDS = ("turunan", "langkah", "prediksi")


def keyword_embed(texts: list[str]) -> np.ndarray:
    """Embedder palsu: satu dimensi per kata kunci, jadi teks dengan kata kunci yang sama punya similarity sekitar 1."""
    v = np.array([[t.lower().count(k) for k in KEYWORDS] + [0.01] for t in texts], dtype=float)
    return v / np.linalg.norm(v, axis=1, keepdims=True)


@pytest.fixture(autouse=True)
def no_embedding_model(monkeypatch):
    # Server di tes tidak mengunduh atau memuat model embedding asli.
    monkeypatch.setattr(app_module, "load_embedder", lambda: keyword_embed)
