from draft_labels import fillers, first_mentions, pauses, write_new

WORDS = [("Jadi", 0.0, 0.3), ("eee", 0.5, 0.9), ("chain", 1.0, 1.3), ("rule-nya", 1.4, 1.9),
         ("itu", 4.0, 4.2), ("kayak,", 4.3, 4.6), ("turunan.", 4.7, 5.1)]


def test_pauses_and_filler_candidates():
    assert pauses(WORDS) == [(1.9, 4.0, "jeda")]
    assert fillers(WORDS) == [(0.5, 0.9, "eee"), (4.3, 4.6, "kayak")]


def test_first_mention_is_where_the_name_or_alias_ends():
    concepts = [{"id": "chain-rule", "name": "Chain rule", "aliases": ["aturan rantai"]},
                {"id": "loss", "name": "Loss function", "aliases": []}]
    assert first_mentions(WORDS, concepts) == {"chain-rule": 1.9, "loss": None}


def test_existing_files_are_not_overwritten(tmp_path):
    path = tmp_path / "x.draft.ref.txt"
    path.write_text("sudah dikoreksi", encoding="utf-8")
    write_new(path, "draf baru")
    assert path.read_text(encoding="utf-8") == "sudah dikoreksi"
