import pytest
from huggingface_hub import try_to_load_from_cache

import config
from analysis.concepts import ConceptTracker, load_embedder
from analysis.gemini import Concept
from asr.streaming import Word
from tests.conftest import keyword_embed

CHAIN = Concept(id="chain-rule", name="Chain rule", aliases=["aturan rantai"],
                description="Turunan fungsi komposisi adalah hasil kali turunan tiap bagiannya.")
LR = Concept(id="learning-rate", name="Learning rate", aliases=[], description="Besar langkah setiap update.")
LOSS = Concept(id="loss", name="Loss function", aliases=["loss"], description="")
BIAS = Concept(id="bias", name="Bias", aliases=[], description="")


def words(text: str, start: float = 0.0) -> list[Word]:
    return [Word(start + i * 0.5, start + i * 0.5 + 0.4, w) for i, w in enumerate(text.split())]


def events(tracker: ConceptTracker, text: str, start: float = 0.0) -> list[tuple[str, str]]:
    return [(c, s) for c, s, _ in tracker.add(words(text, start))]


@pytest.mark.parametrize("text, cid", [
    ("kita pakai chain rul di sini", "chain-rule"),  # salah eja ASR
    ("pakai Chain-Rule,", "chain-rule"),  # tanda baca dan huruf besar
    ("terus lossnya turun", "loss"),  # akhiran -nya
    ("loss function itu", "loss"),
    ("learningrate-nya kecil", "learning-rate"),  # dua kata digabung ASR
    ("learning rate", "learning-rate"),
])
def test_terms_are_found_despite_asr_spelling(text, cid):
    assert (cid, "mentioned") in events(ConceptTracker([CHAIN, LR, LOSS, BIAS], keyword_embed), text)


def test_short_terms_do_not_match_other_words():
    assert events(ConceptTracker([BIAS, LOSS], keyword_embed), "modelnya bisa salah dan lose control") == []


def test_term_split_across_two_batches_is_found():
    tracker = ConceptTracker([LR], keyword_embed)
    assert events(tracker, "ini learning") == []
    assert events(tracker, "rate", 1.0) == [("learning-rate", "mentioned")]


def test_explained_needs_an_explanation_after_the_mention():
    tracker = ConceptTracker([CHAIN, LR], keyword_embed)
    # Mirip deskripsi chain rule, tapi namanya baru disebut sesudahnya: hanya disebut.
    assert events(tracker, "turunan fungsi gabungan dikali turunan bagiannya") == []
    assert events(tracker, "itulah chain rule", 3) == [("chain-rule", "mentioned")]
    assert events(tracker, "itu turunan fungsi gabungan", 5) == [("chain-rule", "explained")]
    # Disebut lalu pindah topik: hanya disebut. Status yang sudah naik tidak dikirim lagi.
    assert events(tracker, "learning rate juga penting", 7) == [("learning-rate", "mentioned")]
    assert events(tracker, "chain rule lagi", 9) == []


def test_mention_and_explanation_in_one_batch_send_only_the_higher_status():
    assert events(ConceptTracker([CHAIN], keyword_embed), "chain rule itu turunan fungsi") == [("chain-rule", "explained")]


def test_window_starts_after_the_first_mention_and_keeps_the_last_words(monkeypatch):
    monkeypatch.setattr(config, "CONCEPT_WINDOW_WORDS", 3)
    tracker = ConceptTracker([LR], keyword_embed)
    tracker.add(words("satu learning rate dua"))
    assert tracker.windows() == {"learning-rate": "dua"}
    tracker.add(words("tiga empat lima", 2))
    assert tracker.windows() == {"learning-rate": "tiga empat lima"}


def test_event_time_is_the_end_of_the_last_word():
    tracker = ConceptTracker([LR], keyword_embed)
    assert tracker.add(words("learning rate", 10))[0][2] == pytest.approx(10.9)


@pytest.mark.skipif(not try_to_load_from_cache(config.CONCEPT_EMBED_MODEL, config.CONCEPT_EMBED_FILE),
                    reason="model embedding belum diunduh")
def test_real_model_separates_an_explanation_from_a_bare_mention():
    tracker = ConceptTracker([CHAIN, LR], load_embedder())
    tracker.add(words("chain rule itu intinya turunan fungsi gabungan sama dengan hasil kali turunan tiap bagiannya"))
    tracker.add(words("terus ada juga learning rate tapi nanti aja dijelasinnya", 8))
    assert tracker.status == {"chain-rule": "explained", "learning-rate": "mentioned"}
