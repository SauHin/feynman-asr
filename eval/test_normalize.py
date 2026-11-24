from normalize import normalize


def test_spelling_variants_become_equal():
    assert normalize("Loss-nya di sini, network-nya!") == normalize("lossnya disini networknya")
    assert normalize("loss nya turun") == ["lossnya", "turun"]
    assert normalize("Back propagation pakai data set") == ["backpropagation", "pakai", "dataset"]


def test_vocal_fillers_are_dropped_but_lexical_fillers_stay():
    assert normalize("Eee jadi, emm, kayak gitu") == ["jadi", "kayak", "gitu"]
    assert normalize("e-learning") == ["e", "learning"]


def test_capital_acronyms_are_not_vocal_fillers():
    assert normalize("Hmm, model HMM-GMM dilatih pakai EM, hmm.") == ["model", "hmm", "gmm", "dilatih", "pakai", "em"]
    assert normalize("<eee> HMM") == ["hmm"]
