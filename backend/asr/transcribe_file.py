"""Uji cepat Fase 0: transkripsi satu file audio, catat waktu proses, RTF, dan VRAM.

Pakai (dari folder backend):
    python -m asr.transcribe_file rekaman.wav
    python -m asr.transcribe_file rekaman.wav --model cahya/faster-whisper-medium-id
"""
import argparse
import subprocess
import time

from faster_whisper import WhisperModel, decode_audio

import config


def gpu_memory_used_mb() -> int | None:
    # Windows (WDDM) tidak melaporkan VRAM per proses, jadi yang diukur VRAM total GPU.
    try:
        out = subprocess.run(
            ["nvidia-smi", "--query-gpu=memory.used", "--format=csv,noheader,nounits"],
            capture_output=True, text=True, check=True,
        ).stdout
        return int(out.split()[0])
    except (OSError, subprocess.CalledProcessError, ValueError, IndexError):
        return None


def transcribe_file(
    path: str,
    model_name: str = config.ASR_MODEL,
    device: str = config.ASR_DEVICE,
    compute_type: str = config.ASR_COMPUTE_TYPE,
    language: str | None = config.ASR_LANGUAGE,
    **options,  # opsi lain untuk WhisperModel.transcribe, misalnya vad_filter
) -> dict:
    vram_before = gpu_memory_used_mb()
    t0 = time.perf_counter()
    model = WhisperModel(model_name, device=device, compute_type=compute_type)
    load_s = time.perf_counter() - t0  # termasuk unduhan pada run pertama

    audio = decode_audio(path, sampling_rate=config.SAMPLE_RATE)
    audio_s = len(audio) / config.SAMPLE_RATE

    t0 = time.perf_counter()
    segments, _ = model.transcribe(
        audio, language=language, beam_size=config.ASR_BEAM_SIZE, word_timestamps=True, **options
    )
    segments = list(segments)  # transcribe() mengembalikan generator; inference jalan di sini
    transcribe_s = time.perf_counter() - t0
    vram_after = gpu_memory_used_mb()

    return {
        "text": " ".join(s.text.strip() for s in segments),
        "segments": [s.text.strip() for s in segments],
        "words": [(w.word.strip(), w.start, w.end) for s in segments for w in s.words],
        "audio_s": audio_s,
        "load_s": load_s,
        "transcribe_s": transcribe_s,
        "rtf": transcribe_s / audio_s if audio_s else None,
        "vram_mb": None if None in (vram_before, vram_after) else vram_after - vram_before,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("path")
    parser.add_argument("--model", default=config.ASR_MODEL)
    parser.add_argument("--compute-type", default=config.ASR_COMPUTE_TYPE)
    parser.add_argument("--language", default=config.ASR_LANGUAGE, help='"auto" untuk deteksi otomatis')
    args = parser.parse_args()

    r = transcribe_file(
        args.path,
        model_name=args.model,
        compute_type=args.compute_type,
        language=None if args.language == "auto" else args.language,
    )
    print(f"model        : {args.model} ({args.compute_type})")
    print(f"durasi audio : {r['audio_s']:.1f} s")
    print(f"load model   : {r['load_s']:.1f} s")
    print(f"transkripsi  : {r['transcribe_s']:.2f} s (RTF {r['rtf']:.3f})")
    print(f"VRAM terpakai: {r['vram_mb']} MB")
    print(f"\n{r['text']}\n")
    for word, start, end in r["words"][:15]:
        print(f"  {start:6.2f}-{end:6.2f}  {word}")


if __name__ == "__main__":
    main()
