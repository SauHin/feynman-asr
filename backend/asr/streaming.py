"""Streaming ASR dengan kebijakan LocalAgreement-2 (PLAN 6, pola dari repo whisper_streaming).

Whisper bukan model streaming. Tiap interval, seluruh buffer audio ditranskrip ulang. Kata yang sama
di dua hipotesis berturut-turut menjadi confirmed, sisanya partial yang masih bisa berubah.
"""
import re
from collections.abc import Callable, Iterable
from dataclasses import dataclass

import numpy as np
from faster_whisper import WhisperModel

import config


@dataclass
class Word:
    start: float  # detik sejak sesi mulai; di dalam Transcribe, detik sejak awal audio yang diberikan
    end: float
    text: str


# (audio 16 kHz, prompt, hotwords) -> kata dengan timestamp relatif terhadap awal audio.
Transcribe = Callable[[np.ndarray, str, str], list[Word]]


def load_whisper() -> Transcribe:
    model = WhisperModel(config.ASR_MODEL, device=config.ASR_DEVICE, compute_type=config.ASR_COMPUTE_TYPE)

    def transcribe(audio: np.ndarray, prompt: str, hotwords: str) -> list[Word]:
        segments, _ = model.transcribe(
            audio,
            language=config.ASR_LANGUAGE,
            beam_size=config.ASR_BEAM_SIZE,
            initial_prompt=prompt or None,
            # faster-whisper menaruh hotwords sebelum initial_prompt, masing-masing paling banyak 223 token.
            hotwords=hotwords or None,
            condition_on_previous_text=False,
            word_timestamps=True,
            vad_filter=config.ASR_VAD_FILTER,
        )
        return to_words(w for s in segments for w in s.words)

    return transcribe


def hotwords(terms: Iterable[str]) -> str:
    """Istilah untuk parameter hotwords Whisper: tanpa duplikat (huruf besar diabaikan), dipisah koma."""
    unique: dict[str, str] = {}
    for t in (t.strip() for t in terms):
        if t:
            unique.setdefault(t.lower(), t)
    return ", ".join(unique.values())


def to_words(raw) -> list[Word]:
    # Whisper kadang memecah "rate-nya" jadi " rate" + "-nya", atau " rate" + " nya". Akhiran itu menempel
    # ke kata sebelumnya, supaya teksnya "rate-nya" atau "ratenya" dan sama di setiap hipotesis.
    words: list[Word] = []
    for w in raw:
        if words and (w.word.startswith("-") or w.word.strip().lower() == "nya"):
            words[-1] = Word(words[-1].start, w.end, words[-1].text + w.word.strip())
        else:
            words.append(Word(w.start, w.end, w.word.strip()))
    return words


def _key(w: Word) -> str:
    # Tanda baca dan huruf besar bisa berubah antar-inference walau katanya sama.
    return re.sub(r"[^\w]", "", w.text.lower())


class StreamingTranscriber:
    def __init__(self, transcribe: Transcribe):
        self.transcribe = transcribe
        self.buffer = np.zeros(0, dtype=np.float32)
        self.offset = 0.0  # waktu sesi di awal buffer
        self.confirmed: list[Word] = []
        self.partial: list[Word] = []
        self.hotwords = ""  # nama dan alias konsep sesi ini (PLAN 8.5 E2), diisi dari pesan start klien

    @property
    def audio_end(self) -> float:
        return self.offset + len(self.buffer) / config.SAMPLE_RATE

    def insert(self, audio: np.ndarray) -> None:
        self.buffer = np.concatenate([self.buffer, audio])

    def process(self) -> list[Word]:
        """Transkrip ulang buffer. Mengembalikan kata yang baru confirmed; sisanya ada di self.partial."""
        prompt = " ".join(w.text for w in self.confirmed if w.end <= self.offset)[-config.STREAM_PROMPT_CHARS :]
        raw = self.transcribe(self.buffer, prompt, self.hotwords)
        hyp = [Word(w.start + self.offset, w.end + self.offset, w.text) for w in raw]

        # Buang kata yang sudah confirmed. Timestamp bisa bergeser sedikit antar-inference, jadi awal
        # hipotesis yang mengulang ekor teks confirmed (sampai 5 kata) juga dibuang.
        last = self.confirmed[-1].end if self.confirmed else 0.0
        hyp = [w for w in hyp if w.start > last - 0.1]
        if hyp and abs(hyp[0].start - last) < 1:
            for n in range(min(5, len(hyp), len(self.confirmed)), 0, -1):
                if [_key(w) for w in self.confirmed[-n:]] == [_key(w) for w in hyp[:n]]:
                    hyp = hyp[n:]
                    break

        # Awalan yang sama dengan hipotesis sebelumnya menjadi confirmed.
        n = 0
        while n < min(len(hyp), len(self.partial)) and _key(hyp[n]) == _key(self.partial[n]):
            n += 1
        new = hyp[:n]
        self.confirmed += new
        self.partial = hyp[n:]
        self._trim()
        return new

    def finish(self) -> list[Word]:
        """Akhir sesi: transkrip sisa buffer, lalu semua partial menjadi confirmed."""
        new = self.process() + self.partial
        self.confirmed += self.partial
        self.partial = []
        return new

    def _trim(self) -> None:
        # Buffer dipotong supaya waktu inference tidak terus membesar.
        if len(self.buffer) / config.SAMPLE_RATE <= config.STREAM_TRIM_S:
            return
        if self.confirmed and self.confirmed[-1].end > self.offset:
            cut = self.confirmed[-1].end
        elif not self.partial:
            cut = self.audio_end - 1.0  # hening panjang: sisakan 1 detik, siapa tahu user mulai bicara
        else:
            return
        i = int((cut - self.offset) * config.SAMPLE_RATE)
        self.buffer = self.buffer[i:]
        self.offset += i / config.SAMPLE_RATE
