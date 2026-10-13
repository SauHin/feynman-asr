import numpy as np
from fastapi.testclient import TestClient

import config


def test_websocket_session_ends_with_idle(monkeypatch):
    # Model tiny di CPU supaya tes jalan cepat tanpa GPU.
    monkeypatch.setattr(config, "ASR_MODEL", "tiny")
    monkeypatch.setattr(config, "ASR_DEVICE", "cpu")
    monkeypatch.setattr(config, "ASR_COMPUTE_TYPE", "int8")
    from app import app

    with TestClient(app) as client, client.websocket_connect("/ws/transcribe") as ws:
        assert ws.receive_json() == {"type": "status", "state": "listening"}
        ws.send_bytes(np.zeros(2 * config.SAMPLE_RATE, dtype=np.int16).tobytes())
        ws.send_json({"type": "stop"})
        messages = []
        while (msg := ws.receive_json()) != {"type": "status", "state": "idle"}:
            messages.append(msg)

    assert messages[0] == {"type": "status", "state": "processing"}
    # VAD membuang hening, jadi tidak ada teks halusinasi.
    assert all(m.get("confirmed", "") == "" and m.get("partial", "") == "" for m in messages)
    # Pesan terakhir selalu dikirim dan membawa data untuk evaluasi.
    assert messages[-1]["words"] == {"confirmed": [], "partial": []}
    assert messages[-1]["compute_s"] > 0
