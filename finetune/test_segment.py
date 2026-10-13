from segment import plan_segments, split_sentences, tokens


def fake_words(text: str, t0: float, step: float = 0.4) -> tuple[list, float]:
    """Kata ASR palsu: tiap kata 0,4 detik, berurutan mulai t0."""
    words = []
    for w in text.split():
        words.append((w, t0, t0 + step))
        t0 += step
    return words, t0


def test_split_sentences():
    text = "Oke, jadi gitu. Nah, ini apa?\n\nBaris tanpa titik\n\nTerakhir."
    assert split_sentences(text) == ["Oke, jadi gitu.", "Nah, ini apa?", "Baris tanpa titik", "Terakhir."]


def test_affix_spelling_is_not_an_error():
    assert tokens("Loss-nya di-update, loncat-loncat.") == ["lossnya", "diupdate", "loncat", "loncat"]
    s = ["Loss-nya turun terus."]
    for words in ([("Lossnya", 0.0, 0.4), ("turun", 0.4, 0.8), ("terus.", 0.8, 1.2)],
                  [("Loss", 0.0, 0.3), ("-nya", 0.3, 0.4), ("turun", 0.4, 0.8), ("terus.", 0.8, 1.2)]):
        seg = plan_segments(s, words, audio_s=2.0)[0]
        assert (seg["wer"], seg["status"]) == (0, "ok")


def test_cut_at_sentence_gaps():
    s = ["satu dua tiga empat lima.", "enam tujuh delapan.", "sembilan sepuluh."]
    w1, t = fake_words(s[0], 1.0)  # 1,0-3,0
    w2, t = fake_words(s[1], t + 1.0)  # 4,0-5,2
    w3, _ = fake_words(s[2], t + 1.0)  # 6,2-7,0
    segs = plan_segments(s, w1 + w2 + w3, audio_s=8.0, max_s=4.5)
    assert [x["text"] for x in segs] == [s[0], f"{s[1]} {s[2]}"]
    assert [(x["start"], x["end"]) for x in segs] == [(0.7, 3.5), (3.5, 7.3)]
    assert [x["status"] for x in segs] == ["ok", "ok"]


def test_misread_sentence_is_flagged_and_not_cut_short():
    s = ["satu dua tiga empat lima.", "enam tujuh delapan."]
    w1, t = fake_words(s[0], 0.5)
    w2, _ = fake_words("enam salah salah.", t + 1.0)  # 3,5-4,7
    segs = plan_segments(s, w1 + w2, audio_s=10.0, max_s=3.0)
    assert [x["status"] for x in segs] == ["ok", "cek"]
    assert segs[1]["end"] == 5.0  # sampai kata ASR terakhir, bukan kata naskah terakhir yang cocok
    assert "beda dengan transkrip ASR" in segs[1]["note"]


def test_segment_over_30_seconds_is_dropped():
    s = [" ".join(["kata"] * 35) + "."]
    words, _ = fake_words(s[0], 0.0, step=1.0)
    assert plan_segments(s, words, audio_s=40.0)[0]["status"] == "buang"


def test_no_matching_words():
    assert plan_segments(["satu dua."], [("lain", 0.0, 1.0)], audio_s=2.0) == []
