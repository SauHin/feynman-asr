import json
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from google.genai import errors

import app as app_module
import config
from analysis import gemini

CONCEPTS = [gemini.Concept(id="chain-rule", name="Chain rule"), gemini.Concept(id="loss", name="Loss function")]
REPLY = json.dumps({
    "concept_coverage": [
        {"concept_id": "chain-rule", "status": "explained_correct", "evidence": ["chain rule itu turunan"]},
        {"concept_id": "konsep-asing", "status": "mentioned", "evidence": []},
    ],
    "factual_errors": [], "unexplained_jargon": [],
    "strengths": ["a"], "improvements": ["b"], "simplicity_note": "c",
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
