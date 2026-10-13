from types import SimpleNamespace

import numpy as np
import pytest

import config
from asr.streaming import StreamingTranscriber, Word, to_words

SECOND = np.zeros(config.SAMPLE_RATE, dtype=np.float32)


def scripted(*hyps):
    """Transcribe palsu: tiap panggilan mengembalikan hipotesis berikutnya, timestamp relatif terhadap buffer."""
    calls = iter(hyps)
    prompts = []

    def transcribe(audio, prompt):
        prompts.append(prompt)
        return [Word(s, e, t) for s, e, t in next(calls)]

    return transcribe, prompts


def texts(words):
    return [w.text for w in words]


def test_words_confirm_when_two_hypotheses_agree():
    st = StreamingTranscriber(
        scripted(
            [(0.0, 0.4, "Halo"), (0.5, 0.9, "dunia")],
            [(0.0, 0.4, "halo,"), (0.5, 0.9, "dunia"), (1.0, 1.4, "ini")],
            [(0.0, 0.4, "halo"), (0.5, 0.9, "dunia"), (1.0, 1.4, "ini"), (1.5, 1.9, "tes")],
            [(0.0, 0.4, "halo"), (0.5, 0.9, "dunia"), (1.0, 1.4, "ini"), (1.5, 1.9, "tes"), (2.0, 2.4, "lagi")],
        )[0]
    )
    st.insert(SECOND)
    assert st.process() == [] and texts(st.partial) == ["Halo", "dunia"]
    st.insert(SECOND)
    assert texts(st.process()) == ["halo,", "dunia"]  # beda tanda baca dan huruf besar tetap sepakat
    assert texts(st.partial) == ["ini"]
    st.insert(SECOND)
    assert texts(st.process()) == ["ini"]  # kata yang sudah confirmed tidak dihitung dua kali
    assert texts(st.finish()) == ["tes", "lagi"]
    assert texts(st.confirmed) == ["halo,", "dunia", "ini", "tes", "lagi"]


def test_hyphen_suffix_joins_previous_word():
    raw = [SimpleNamespace(start=s, end=e, word=t) for s, e, t in
           [(0.0, 0.4, " learning"), (0.5, 0.8, " rate"), (0.8, 1.0, "-nya"), (1.1, 1.5, " itu")]]
    words = to_words(raw)
    assert texts(words) == ["learning", "rate-nya", "itu"]
    assert (words[1].start, words[1].end) == (0.5, 1.0)


def test_buffer_trims_at_last_confirmed_word(monkeypatch):
    monkeypatch.setattr(config, "STREAM_TRIM_S", 1.5)
    transcribe, prompts = scripted(
        [(0.2, 0.6, "satu"), (1.0, 1.4, "dua")],
        [(0.2, 0.6, "satu"), (1.0, 1.4, "dua"), (1.6, 1.8, "tiga")],
        [(0.2, 0.4, "tiga")],  # relatif terhadap buffer baru yang mulai di 1,4 detik
    )
    st = StreamingTranscriber(transcribe)
    st.insert(np.concatenate([SECOND, SECOND]))
    st.process()
    st.process()
    assert st.offset == pytest.approx(1.4)
    assert st.audio_end == pytest.approx(2.0)
    assert texts(st.process()) == ["tiga"]
    assert prompts[-1] == "satu dua"  # teks yang sudah keluar dari buffer menjadi konteks
