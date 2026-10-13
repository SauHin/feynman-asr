from analysis.fluency import Fluency, is_filler
from asr.streaming import Word


def words(*items):
    return [Word(s, e, t) for s, e, t in items]


def test_long_pause_is_reported_before_the_word_after_it():
    f = Fluency()
    assert f.add(words((0.0, 0.5, "satu"), (0.6, 1.0, "dua"))) == []
    assert f.add(words((1.1, 1.5, "tiga"), (4.0, 4.4, "empat"))) == [(1, (1.5, 2.5))]
    assert f.message(4.4, f.pauses[-1])["long_pause"] == {"start": 1.5, "duration": 2.5}


def test_speech_rate_ignores_long_pauses():
    f = Fluency()
    f.add(words((0.0, 1.0, "a"), (1.0, 2.0, "b"), (12.0, 13.0, "c")))  # jeda 10 detik
    assert f.wpm == 60  # 3 kata dalam 3 detik bicara


def test_fillers():
    assert is_filler("Eee,") and is_filler("gitu.") and is_filler("Emm")
    assert not is_filler("jadi") and not is_filler("e")
    f = Fluency()
    f.add(words((0.0, 0.3, "emm"), (0.4, 0.8, "kayak"), (0.9, 1.2, "jadi")))
    assert f.message(1.2) == {"type": "fluency", "wpm": 150, "filler_count": 2, "t": 1.2}
