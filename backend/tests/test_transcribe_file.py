import wave

from asr.transcribe_file import transcribe_file


def test_transcribe_file_reports_timing(tmp_path):
    path = tmp_path / "silence.wav"
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(16_000)
        f.writeframes(b"\x00\x00" * 16_000)

    # Model tiny di CPU supaya tes jalan cepat tanpa GPU.
    r = transcribe_file(str(path), model_name="tiny", device="cpu", compute_type="int8")

    assert abs(r["audio_s"] - 1.0) < 0.01
    assert r["transcribe_s"] > 0
    assert r["rtf"] == r["transcribe_s"] / r["audio_s"]
