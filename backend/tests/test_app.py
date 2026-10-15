import numpy as np
import pytest
from fastapi.testclient import TestClient

import app as app_module
import config
from asr.streaming import Word


def session(audio_s: float, start: dict | None = None) -> list[dict]:
    """Kirim pesan start (opsional), audio hening, lalu stop. Mengembalikan pesan dari status listening sampai
    sebelum idle."""
    with TestClient(app_module.app) as client, client.websocket_connect("/ws/transcribe") as ws:
        assert ws.receive_json() == {"type": "status", "state": "listening"}
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
