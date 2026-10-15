from calibrate_concepts import first, outcome

ROWS = [(10.0, {}, set()), (12.0, {"a": 0.40}, {"a"}), (14.0, {"a": 0.60}, {"a"}), (20.0, {"a": 0.70}, {"a"})]


def test_first_crossing_needs_a_similarity_at_or_above_the_threshold():
    assert first(ROWS, "a", 0.6) == 14.0
    assert first(ROWS, "a", 0.8) is None
    assert first(ROWS, "b", 0.1) is None  # belum disebut, jadi belum punya similarity


def test_outcome_against_the_label():
    label = (13.0, 15.0)
    assert outcome(12.0, label) == "terlalu awal"
    assert outcome(19.9, label) == "tepat"  # sampai 5 detik sesudah penjelasan selesai
    assert outcome(20.1, label) == "telat"
    assert outcome(None, label) == "terlewat"
    assert outcome(12.0, None) == "salah"  # konsep yang tidak dibahas
    assert outcome(None, None) == "benar"
