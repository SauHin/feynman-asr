import pytest

from analysis.concepts import ConceptTracker
from analysis.gemini import Concept
from asr.streaming import Word

CHAIN = Concept(id="chain-rule", name="Chain rule", aliases=["aturan rantai"])
LR = Concept(id="learning-rate", name="Learning rate")
LOSS = Concept(id="loss", name="Loss function", aliases=["loss"])
BIAS = Concept(id="bias", name="Bias")


def words(text: str, start: float = 0.0) -> list[Word]:
    return [Word(start + i * 0.5, start + i * 0.5 + 0.4, w) for i, w in enumerate(text.split())]


def found(tracker: ConceptTracker, text: str, start: float = 0.0) -> list[str]:
    return [cid for cid, _ in tracker.add(words(text, start))]


@pytest.mark.parametrize("text, cid", [
    ("kita pakai chain rul di sini", "chain-rule"),  # salah eja ASR
    ("pakai Chain-Rule,", "chain-rule"),  # tanda baca dan huruf besar
    ("pakai aturan rantai", "chain-rule"),  # alias
    ("terus lossnya turun", "loss"),  # akhiran -nya
    ("learningrate-nya kecil", "learning-rate"),  # dua kata digabung ASR
    ("learning rate", "learning-rate"),
])
def test_terms_are_found_despite_asr_spelling(text, cid):
    assert cid in found(ConceptTracker([CHAIN, LR, LOSS, BIAS]), text)


def test_short_terms_do_not_match_other_words():
    assert found(ConceptTracker([BIAS, LOSS]), "modelnya bisa salah dan lose control") == []


def test_term_split_across_two_batches_is_found_once():
    tracker = ConceptTracker([LR])
    assert found(tracker, "ini learning") == []
    assert tracker.add(words("rate", 1.0)) == [("learning-rate", pytest.approx(1.4))]
    assert found(tracker, "learning rate lagi", 2.0) == []
