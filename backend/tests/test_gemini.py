import json
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from google.genai import errors

import app as app_module
import config
from analysis import gemini
from tests.test_materials import pdf

CONCEPTS = [gemini.Concept(id="chain-rule", name="Chain rule"), gemini.Concept(id="loss", name="Loss function")]
REPLY = json.dumps({
    "concept_coverage": [
        {"concept_id": "chain-rule", "status": "explained_correct", "evidence": ["chain rule itu turunan"]},
        {"concept_id": "konsep-asing", "status": "mentioned", "evidence": []},
    ],
    "factual_errors": [
        {"statement": "kalau lossnya benar, modelnya masih salah", "correction": "-", "could_be_asr_mishearing": True},
        {"statement": "weight digeser searah gradient", "correction": "berlawanan arah", "could_be_asr_mishearing": False},
    ],
    "unexplained_jargon": [],
    "strengths": ["a"],
    "improvements": [
        {"text": "jelaskan epoch", "about_speech_or_transcript": False},
        {"text": "perjelas bahwa width maksudnya weight", "about_speech_or_transcript": True},
    ],
    "simplicity_note": "c",
})


def session(transcript: str = "jadi chain rule itu turunan fungsi gabungan") -> gemini.Session:
    return gemini.Session(topic="Backpropagation", concepts=CONCEPTS, transcript=transcript,
                          fluency=gemini.Fluency(duration=10, wpm=120, filler_count=0))


def fake_gemini(monkeypatch, *replies) -> SimpleNamespace:
    """Klien Gemini palsu: tiap panggilan mengembalikan atau melempar balasan berikutnya."""
    queue = list(replies)
    calls = SimpleNamespace(n=0)

    def generate_content(**kwargs):
        calls.n += 1
        calls.contents = kwargs["contents"]
        reply = queue.pop(0)
        if isinstance(reply, Exception):
            raise reply
        return SimpleNamespace(text=reply)

    monkeypatch.setenv("GEMINI_API_KEY", "tes")
    monkeypatch.setattr(config, "GEMINI_BACKOFF_S", 0)
    monkeypatch.setattr(gemini.genai, "Client",
                        lambda **kwargs: SimpleNamespace(models=SimpleNamespace(generate_content=generate_content)))
    return calls


def test_every_concept_gets_exactly_one_status(monkeypatch):
    fake_gemini(monkeypatch, REPLY)
    coverage = gemini.analyze(session()).concept_coverage
    assert [(c.concept_id, c.status) for c in coverage] == [("chain-rule", "explained_correct"), ("loss", "not_covered")]


def test_findings_flagged_as_asr_mishearing_are_dropped(monkeypatch):
    fake_gemini(monkeypatch, REPLY)
    fb = gemini.analyze(session())
    assert [e.statement for e in fb.factual_errors] == ["weight digeser searah gradient"]
    assert fb.improvements == ["jelaskan epoch"]


def test_rate_limit_and_invalid_json_are_retried(monkeypatch):
    calls = fake_gemini(monkeypatch, errors.ClientError(429, {"error": {"message": "kuota"}}), "bukan json", REPLY)
    assert gemini.analyze(session()).strengths == ["a"]
    assert calls.n == 3


def test_rejected_request_is_not_retried(monkeypatch):
    calls = fake_gemini(monkeypatch, errors.ClientError(400, {"error": {"message": "API key not valid"}}))
    with pytest.raises(gemini.GeminiError):
        gemini.analyze(session())
    assert calls.n == 1


def test_endpoint_reports_failure_so_the_ui_can_fall_back(monkeypatch):
    def fail(s):
        raise gemini.GeminiError("x")

    monkeypatch.setattr(gemini, "analyze", fail)
    monkeypatch.setattr(app_module, "load_whisper", lambda: None)
    with TestClient(app_module.app) as client:
        assert client.post("/api/feedback", json=session().model_dump()).status_code == 502
        assert client.post("/api/feedback", json=session(" ").model_dump()).status_code == 422


def concepts_reply(*names: str, aliases=("aturan rantai", "Chain Rule", " ")) -> str:
    return json.dumps({"concepts": [{"name": n, "aliases": list(aliases), "description": f" {n} itu "} for n in names]})


def test_extracted_concepts_get_unique_ids_and_clean_aliases(monkeypatch):
    fake_gemini(monkeypatch, concepts_reply(" Chain rule", "Chain rule", *[f"Konsep {i}" for i in range(9)]))
    concepts = gemini.extract_concepts("Backpropagation")
    assert len(concepts) == config.CONCEPTS_MAX
    assert [c.id for c in concepts[:3]] == ["chain-rule", "chain-rule-2", "konsep-0"]
    assert concepts[0] == gemini.Concept(id="chain-rule", name="Chain rule", aliases=["aturan rantai"],
                                         description="Chain rule itu")


def test_material_is_sent_only_when_given(monkeypatch):
    calls = fake_gemini(monkeypatch, concepts_reply("Loss"), concepts_reply("Loss"))
    gemini.extract_concepts("Backpropagation", "Slide 3: loss function {mse}")
    assert "Slide 3: loss function {mse}" in calls.contents
    gemini.extract_concepts("Backpropagation")
    assert "tidak memberi materi" in calls.contents


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(app_module, "load_whisper", lambda: None)
    with TestClient(app_module.app) as c:
        yield c


def test_concepts_endpoint_reads_the_chosen_pages(client, monkeypatch):
    seen = {}
    monkeypatch.setattr(gemini, "extract_concepts", lambda topic, material: seen.update(t=topic, m=material) or [])
    files = {"file": ("kuliah.pdf", pdf("Forward pass", "Loss function"), "application/pdf")}
    r = client.post("/api/concepts", data={"topic": " Backprop ", "pages": "2"}, files=files)
    assert r.status_code == 200 and r.json() == []
    assert seen == {"t": "Backprop", "m": "Loss function"}
    client.post("/api/concepts", data={"topic": "Backprop", "text": "  catatan  "})
    assert seen["m"] == "catatan"


@pytest.mark.parametrize("data, files, status, message", [
    ({"pages": "1,a"}, None, 422, "nggak kebaca"),
    ({"pages": "0"}, None, 422, "mulai dari 1"),
    ({"pages": "3"}, {"file": ("kuliah.pdf", pdf("a"), "application/pdf")}, 422, "cuma punya 1 halaman"),
    ({"text": "x" * (config.MATERIAL_MAX_CHARS + 1)}, None, 422, "kepanjangan"),
    ({}, None, 502, "ditulis sendiri"),
])
def test_concepts_endpoint_explains_failures(client, monkeypatch, data, files, status, message):
    def fail(topic, material):
        raise gemini.GeminiError("x")

    monkeypatch.setattr(gemini, "extract_concepts", fail)
    r = client.post("/api/concepts", data={"topic": "Backprop", **data}, files=files)
    assert r.status_code == status and message in r.json()["detail"]
