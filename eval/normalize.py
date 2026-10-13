"""Normalisasi teks sebelum WER (PLAN 8.4). Reference dan hasil ASR melewati aturan yang sama."""
import re

# Ejaan berbeda untuk ucapan yang sama. Kiri diubah ke bentuk kanan (bentuk baku) sebelum dibandingkan.
VARIANTS = {
    "disini": "di sini",
    "disana": "di sana",
    "dimana": "di mana",
    "back propagation": "backpropagation",
    "data set": "dataset",
}
# Suara ragu tidak dihitung dalam WER. Filler leksikal seperti "jadi" atau "kayak" tetap dihitung.
VOCAL_FILLER = re.compile(r"^(e{2,}|eh+|em+|ehm+|hm+|uh+|um+)$")


def normalize(text: str) -> list[str]:
    text = text.lower()
    # ASR kadang menulis "network-nya", kadang "networknya". Imbuhan bertanda hubung disatukan.
    text = re.sub(r"(?<=\w)\s*-\s*(nya|in|an|kan)\b", r"\1", text)
    text = re.sub(r"(?<=\w)\s+nya\b", "nya", text)  # "nya" tidak pernah berdiri sendiri
    text = re.sub(r"\b(di|ke|ter|nge|se)\s*-\s*(?=\w)", r"\1", text)
    text = " ".join(re.sub(r"[^\w\s]", " ", text.replace("-", " ")).split())
    for variant, standard in VARIANTS.items():
        text = re.sub(rf"\b{variant}\b", standard, text)
    return [w for w in text.split() if not VOCAL_FILLER.match(w)]
