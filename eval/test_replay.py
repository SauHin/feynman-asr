import wave

import numpy as np

from replay import load_pcm


def test_session_wav_replays_the_exact_samples(tmp_path):
    pcm = np.random.default_rng(0).integers(-32768, 32768, 16_000, dtype=np.int16)
    pcm[:2] = [-32768, 32767]
    path = tmp_path / "sesi.wav"
    with wave.open(str(path), "wb") as w:  # format yang sama dengan backend/sessions.py
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(16_000)
        w.writeframes(pcm.tobytes())
    assert np.array_equal(load_pcm(path), pcm)
