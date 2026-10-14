"""Metrik kelancaran lokal (PLAN 7.1): kecepatan bicara, jeda panjang, dan filler dari kata confirmed."""
import re

import config
from asr.streaming import Word

# Filler vokal hanya terhitung bila Whisper menuliskannya. Biasanya Whisper membuangnya (PLAN 7.1).
VOCAL_FILLER = re.compile(r"^(e{2,}|eh+|em+|ehm+|hm+|uh+|um+)$")

Pause = tuple[float, float]  # (mulai, durasi) dalam detik sejak sesi mulai


def is_filler(text: str) -> bool:
    word = re.sub(r"[^\w]", "", text.lower())
    return bool(VOCAL_FILLER.match(word)) or word in config.FLUENCY_LEXICAL_FILLERS


class Fluency:
    def __init__(self) -> None:
        self.words: list[Word] = []
        self.pauses: list[Pause] = []
        self.fillers = 0

    def add(self, new: list[Word]) -> list[tuple[int, Pause]]:
        """Tambah kata yang baru confirmed. Mengembalikan (indeks di `new`, jeda) untuk setiap jeda panjang
        yang terjadi tepat sebelum kata itu."""
        found = []
        for i, w in enumerate(new):
            if self.words and w.start - self.words[-1].end >= config.FLUENCY_PAUSE_S:
                pause = (self.words[-1].end, w.start - self.words[-1].end)
                self.pauses.append(pause)
                found.append((i, pause))
            self.words.append(w)
            self.fillers += is_filler(w.text)
        return found

    @property
    def wpm(self) -> int:
        # Jeda panjang tidak dihitung sebagai waktu bicara, supaya diam lama tidak menurunkan angkanya.
        if not self.words:
            return 0
        spoken = self.words[-1].end - self.words[0].start - sum(d for _, d in self.pauses)
        return round(len(self.words) / spoken * 60) if spoken > 0 else 0

    def message(self, t: float, pause: Pause | None = None) -> dict:
        msg = {"type": "fluency", "wpm": self.wpm, "filler_count": self.fillers, "t": round(t, 2)}
        if pause:
            msg["long_pause"] = {"start": round(pause[0], 2), "duration": round(pause[1], 2)}
        return msg
