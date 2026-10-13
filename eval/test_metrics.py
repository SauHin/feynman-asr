import pytest

from metrics import accuracy, latency


def test_accuracy_splits_errors_by_token_type():
    ref = "jadi weight-nya kita update pakai gradient descent"
    hyp = "jadi widthnya kita update pakai gradient descent ya"
    acc = accuracy(ref, hyp, ["gradient descent", "weight"])
    assert (acc["ref_words"], acc["word_errors"]) == (7, 2)  # satu substitusi, satu insertion
    # "weight-nya" tetap kemunculan istilah "weight", dan salah dengarnya masuk error token istilah.
    assert (acc["term_words"], acc["term_errors"]) == (3, 1)
    assert (acc["other_words"], acc["other_errors"]) == (4, 0)
    assert (acc["term_hits"], acc["term_total"]) == (1, 2)


def test_empty_hypothesis_counts_every_word_as_error():
    assert accuracy("satu dua tiga", "", [])["wer"] == 1.0


def test_latency_per_word():
    log = {
        "audio_s": 4.0,
        "stop_at": 4.0,
        "messages": [
            [1.5, {"type": "transcript", "confirmed": "", "partial": "halo",
                   "words": {"confirmed": [], "partial": [[0.2, 1.0, "halo"]]}, "compute_s": 0.4}],
            [2.5, {"type": "transcript", "confirmed": "Halo,", "partial": "dunia",
                   "words": {"confirmed": [[0.2, 1.0, "Halo,"]], "partial": [[1.2, 2.0, "dunia"]]}, "compute_s": 0.8}],
            # Setelah Stop: "dunia" confirmed karena sesi selesai, jadi confirmation latency-nya tidak dihitung.
            [4.5, {"type": "transcript", "confirmed": "dunia", "partial": "",
                   "words": {"confirmed": [[1.2, 2.0, "dunia"]], "partial": []}, "compute_s": 1.2}],
            [4.6, {"type": "status", "state": "idle"}],
        ],
    }
    lat = latency(log)
    assert lat["partial"] == pytest.approx([0.5, 0.5])
    assert lat["confirm"] == pytest.approx([1.5])
    assert lat["rtf"] == pytest.approx(0.3)
    assert lat["end_delay_s"] == pytest.approx(0.6)
