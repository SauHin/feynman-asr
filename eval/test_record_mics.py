import wave

import numpy as np
import pytest

from record_mics import check, plan_files, save


def test_file_names_follow_the_metadata_format(tmp_path):
    files = plan_files("p01", "gan", "lab", {"laptop": 1, "earphone": 3}, data=tmp_path)
    assert files == {"laptop": tmp_path / "A_p01_gan_laptop_lab.wav", "earphone": tmp_path / "A_p01_gan_earphone_lab.wav"}


@pytest.mark.parametrize("speaker, topik, mics", [
    ("p_01", "gan", {"laptop": 1}),                 # "_" memecah file_id
    ("p01", "tidak-ada", {"laptop": 1}),            # tidak ada naskahnya
    ("p01", "gan", {"laptop": 1, "earphone": 1}),   # dua mic dari perangkat yang sama
])
def test_bad_input_is_refused(tmp_path, speaker, topik, mics):
    with pytest.raises(SystemExit):
        plan_files(speaker, topik, "lab", mics, data=tmp_path)


def test_existing_recording_is_never_overwritten(tmp_path):
    (tmp_path / "A_p01_gan_laptop_lab.wav").write_bytes(b"rekaman lama")
    with pytest.raises(SystemExit):
        plan_files("p01", "gan", "lab", {"laptop": 1, "earphone": 3}, data=tmp_path)


def test_silence_and_clipping_are_flagged():
    assert check(np.zeros(16000, np.int16)) == ["hampir hening, mungkin mic salah atau mute"]
    assert check(np.full(16000, -32768, np.int16)) == ["clipping, turunkan volume input mic"]
    assert check((np.sin(np.arange(16000) / 5) * 8000).astype(np.int16)) == []


def test_saved_file_is_16khz_mono_wav(tmp_path):
    audio = (np.sin(np.arange(8000) / 5) * 8000).astype(np.int16)
    save(tmp_path / "x.wav", audio)
    with wave.open(str(tmp_path / "x.wav")) as w:
        assert (w.getframerate(), w.getnchannels(), w.getsampwidth()) == (16000, 1, 2)
        assert np.array_equal(np.frombuffer(w.readframes(w.getnframes()), np.int16), audio)
