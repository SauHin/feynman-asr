import json
import wave

import numpy as np
import pytest

import config
import sessions


@pytest.fixture(autouse=True)
def session_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "SESSION_DIR", tmp_path / "sesi")
    return tmp_path / "sesi"


def test_saved_audio_is_the_received_pcm(session_dir):
    pcm = np.array([0, 1, -1, 32767, -32768], dtype=np.int16).tobytes()
    sid = sessions.new_id()
    sessions.save(sid, pcm, {"session_id": sid, "messages": []})

    with wave.open(str(session_dir / f"{sid}.wav")) as w:
        assert (w.getnchannels(), w.getsampwidth(), w.getframerate()) == (1, 2, config.SAMPLE_RATE)
        assert w.readframes(w.getnframes()) == pcm
    log = json.loads((session_dir / f"{sid}.json").read_text(encoding="utf-8"))
    assert log["session_id"] == sid
    assert log["config"]["ASR_MODEL"] == config.ASR_MODEL


def test_feedback_lines_append_to_a_saved_session(session_dir):
    sid = sessions.new_id()
    sessions.save(sid, b"", {})
    assert sessions.add_feedback(sid, {"error": "504"})
    assert sessions.add_feedback(sid, {"feedback": {"strengths": ["jelas"]}})
    lines = (session_dir / f"{sid}.feedback.jsonl").read_text(encoding="utf-8").splitlines()
    assert [json.loads(line) for line in lines] == [{"error": "504"}, {"feedback": {"strengths": ["jelas"]}}]


@pytest.mark.parametrize("sid", ["20261018-140322-a3f9", "../20261018-140322-a3f9", "..\\..\\config", ""])
def test_feedback_for_unknown_or_unsafe_ids_is_not_written(session_dir, sid):
    assert not sessions.add_feedback(sid, {"feedback": {}})
    assert not session_dir.exists() or not any(session_dir.iterdir())
