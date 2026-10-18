import json
import wave

import numpy as np
import pytest
from fastapi.testclient import TestClient

import app as app_module
import config
from analysis import gemini
from asr.streaming import Word


@pytest.fixture(autouse=True)
def session_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "SESSION_DIR", tmp_path / "sesi")
    return tmp_path / "sesi"


def session(audio_s: float, start: dict | None = None) -> list[dict]:
    """Kirim pesan start (opsional), audio hening, lalu stop. Mengembalikan pesan dari status listening sampai
    sebelum idle."""
    with TestClient(app_module.app) as client, client.websocket_connect("/ws/transcribe") as ws:
        assert ws.receive_json() | {"session_id": None} == {"type": "status", "state": "listening", "session_id": None}
        if start:
            ws.send_json(start)
        ws.send_bytes(np.zeros(int(audio_s * config.SAMPLE_RATE), dtype=np.int16).tobytes())
        ws.send_json({"type": "stop"})
        messages = []
        while (msg := ws.receive_json()) != {"type": "status", "state": "idle"}:
            messages.append(msg)
    return messages


def confirmed(messages: list[dict]) -> str:
    return " ".join(m["confirmed"] for m in messages if m["type"] == "transcript" and m["confirmed"])


def test_websocket_session_ends_with_idle(monkeypatch):
    # Model tiny di CPU supaya tes jalan cepat tanpa GPU.
    monkeypatch.setattr(config, "ASR_MODEL", "tiny")
    monkeypatch.setattr(config, "ASR_DEVICE", "cpu")
    monkeypatch.setattr(config, "ASR_COMPUTE_TYPE", "int8")
    messages = session(2)

    assert messages[0] == {"type": "status", "state": "processing"}
    # VAD membuang hening, jadi tidak ada teks halusinasi.
    assert all(m.get("confirmed", "") == "" and m.get("partial", "") == "" for m in messages)
    # Transkrip terakhir selalu dikirim dan membawa data untuk evaluasi.
    last = [m for m in messages if m["type"] == "transcript"][-1]
    assert last["words"] == {"confirmed": [], "partial": []}
    assert last["compute_s"] > 0
    assert messages[-1] == {"type": "fluency", "wpm": 0, "filler_count": 0, "t": 2.0}


def test_inference_gets_whole_intervals_until_stop(monkeypatch):
    seen = []

    def transcribe(audio, prompt, hotwords):
        seen.append(len(audio))
        return []

    monkeypatch.setattr(app_module, "load_whisper", lambda: transcribe)
    session(2.5)
    step = int(config.STREAM_INTERVAL_S * config.SAMPLE_RATE)
    assert all(n % step == 0 for n in seen[:-1])  # isi buffer tidak bergantung pada kecepatan GPU
    assert seen[-1] == int(2.5 * config.SAMPLE_RATE)  # sisa audio ikut diproses saat Stop


def test_long_pause_arrives_between_the_words_around_it(monkeypatch):
    script = [(0.5, 1.0, "satu"), (1.0, 1.5, "dua"), (5.0, 5.5, "tiga"), (5.5, 5.8, "eee"), (6.0, 6.5, "empat")]

    def transcribe(audio, prompt, hotwords):
        end = len(audio) / config.SAMPLE_RATE
        return [Word(s, e, t) for s, e, t in script if e <= end]

    monkeypatch.setattr(app_module, "load_whisper", lambda: transcribe)
    messages = session(8)

    at = next(i for i, m in enumerate(messages) if "long_pause" in m)
    assert messages[at]["long_pause"] == {"start": 1.5, "duration": 3.5}
    # UI menaruh tanda jeda di akhir teks confirmed saat pesan jeda tiba.
    assert confirmed(messages[:at]) == "satu dua"
    assert confirmed(messages[at:]) == "tiga eee empat"
    assert [m for m in messages if m["type"] == "fluency"][-1]["filler_count"] == 1


START = {"type": "start", "concepts": [
    {"id": "chain-rule", "name": "Chain rule", "aliases": ["aturan rantai", "chain rule"], "description": "..."},
    {"id": "loss", "name": "Loss function", "aliases": [], "description": ""},
]}


@pytest.mark.parametrize("enabled, expected", [(True, "Chain rule, aturan rantai, Loss function"), (False, "")])
def test_start_message_sets_hotwords_before_the_first_inference(monkeypatch, enabled, expected):
    seen = []

    def transcribe(audio, prompt, hotwords):
        seen.append(hotwords)
        return []

    monkeypatch.setattr(app_module, "load_whisper", lambda: transcribe)
    monkeypatch.setattr(config, "ASR_HOTWORDS", enabled)
    session(2.5, START)
    assert seen and all(h == expected for h in seen)


def test_concept_messages_follow_the_transcript_that_triggers_them(monkeypatch):
    script = [(0.5, 0.9, "jadi"), (1.0, 1.3, "chain"), (1.4, 1.8, "rule"), (2.0, 2.3, "itu"),
              (4.5, 4.9, "turunan"), (5.0, 5.4, "fungsi")]

    def transcribe(audio, prompt, hotwords):
        end = len(audio) / config.SAMPLE_RATE
        return [Word(s, e, t) for s, e, t in script if e <= end]

    monkeypatch.setattr(app_module, "load_whisper", lambda: transcribe)
    chain = {"id": "chain-rule", "name": "Chain rule", "aliases": [], "description": "Turunan fungsi komposisi."}
    messages = session(8, {"type": "start", "concepts": [chain]})

    # Satu pesan per konsep, sesudah transkrip yang memuat namanya. Klien tes mengirim semua audio lalu langsung
    # stop, jadi batch tempat "rule" confirmed tidak tetap, dan waktu pesannya tidak dicek di sini.
    concepts = [i for i, m in enumerate(messages) if m["type"] == "concept"]
    assert len(concepts) == 1
    msg = messages[concepts[0]]
    assert (msg["concept_id"], msg["status"]) == ("chain-rule", "mentioned")
    said = next(i for i, m in enumerate(messages) if m["type"] == "transcript" and "rule" in m["confirmed"])
    assert said < concepts[0]


def silent():
    def transcribe(audio, prompt, hotwords):
        return []
    return lambda: transcribe


def test_session_is_saved_with_the_received_audio_and_every_server_message(monkeypatch, session_dir):
    monkeypatch.setattr(app_module, "load_whisper", silent())
    pcm = (np.arange(int(2.5 * config.SAMPLE_RATE)) % 200 - 100).astype(np.int16).tobytes()
    with TestClient(app_module.app) as client, client.websocket_connect("/ws/transcribe") as ws:
        sid = ws.receive_json()["session_id"]
        ws.send_json(START)
        ws.send_bytes(pcm)
        ws.send_json({"type": "stop"})
        while ws.receive_json() != {"type": "status", "state": "idle"}:
            pass

    with wave.open(str(session_dir / f"{sid}.wav")) as w:
        assert w.getframerate() == config.SAMPLE_RATE and w.readframes(w.getnframes()) == pcm
    log = json.loads((session_dir / f"{sid}.json").read_text(encoding="utf-8"))
    assert (log["session_id"], log["end"], log["audio_s"]) == (sid, "stop", 2.5)
    assert [c["id"] for c in log["concepts"]] == ["chain-rule", "loss"]
    assert log["config"]["ASR_HOTWORDS"] == config.ASR_HOTWORDS
    assert log["messages"][0][1] == {"type": "status", "state": "listening", "session_id": sid}
    assert log["messages"][-1][1] == {"type": "status", "state": "idle"}
    assert log["stop_at"] <= log["messages"][-1][0]


def test_dropped_connection_is_saved_and_empty_sessions_are_not(monkeypatch, session_dir):
    monkeypatch.setattr(app_module, "load_whisper", silent())
    with TestClient(app_module.app) as client:
        with client.websocket_connect("/ws/transcribe") as ws:  # izin mic ditolak: tidak ada audio
            ws.receive_json()
            ws.send_json({"type": "stop"})
            while ws.receive_json() != {"type": "status", "state": "idle"}:
                pass
        with client.websocket_connect("/ws/transcribe") as ws:  # tab ditutup di tengah sesi
            sid = ws.receive_json()["session_id"]
            ws.send_bytes(np.zeros(config.SAMPLE_RATE, dtype=np.int16).tobytes())
    assert sorted(p.name for p in session_dir.iterdir()) == [f"{sid}.json", f"{sid}.wav"]
    assert json.loads((session_dir / f"{sid}.json").read_text(encoding="utf-8"))["end"] == "disconnect"


def test_nothing_is_saved_when_saving_is_off(monkeypatch, session_dir):
    monkeypatch.setattr(app_module, "load_whisper", silent())
    monkeypatch.setattr(config, "SESSION_SAVE", False)
    with TestClient(app_module.app) as client, client.websocket_connect("/ws/transcribe") as ws:
        assert ws.receive_json() == {"type": "status", "state": "listening"}
        ws.send_bytes(np.zeros(config.SAMPLE_RATE, dtype=np.int16).tobytes())
        ws.send_json({"type": "stop"})
        while ws.receive_json() != {"type": "status", "state": "idle"}:
            pass
    assert not session_dir.exists()


def test_every_feedback_attempt_is_recorded_to_its_session(monkeypatch, session_dir):
    sid = "20261018-140322-a3f9"
    session_dir.mkdir()
    (session_dir / f"{sid}.json").write_text("{}", encoding="utf-8")
    fb = gemini.Feedback(concept_coverage=[], factual_errors=[], unexplained_jargon=[], strengths=["jelas"],
                         improvements=[], simplicity_note="")
    replies = iter([gemini.GeminiError("504"), fb])

    def analyze(s):
        r = next(replies)
        if isinstance(r, Exception):
            raise r
        return r

    monkeypatch.setattr(gemini, "analyze", analyze)
    monkeypatch.setattr(app_module, "load_whisper", lambda: None)
    body = {"topic": "Backprop", "concepts": [], "transcript": "jadi chain rule itu", "session_id": sid,
            "fluency": {"duration": 10, "wpm": 120, "filler_count": 0}}
    with TestClient(app_module.app) as client:
        assert client.post("/api/feedback", json=body).status_code == 502  # tombol coba lagi
        assert client.post("/api/feedback", json=body).json()["strengths"] == ["jelas"]
        # Sesi yang tidak tersimpan tidak menggagalkan feedback.
        monkeypatch.setattr(gemini, "analyze", lambda s: fb)
        assert client.post("/api/feedback", json=body | {"session_id": "../config"}).status_code == 200

    lines = [json.loads(x) for x in (session_dir / f"{sid}.feedback.jsonl").read_text(encoding="utf-8").splitlines()]
    assert [("error" in x, "feedback" in x) for x in lines] == [(True, False), (False, True)]
    assert lines[0]["request"]["transcript"] == "jadi chain rule itu" and "session_id" not in lines[0]["request"]
