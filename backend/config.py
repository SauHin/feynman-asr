"""Semua parameter backend. API key hanya dari .env, tidak pernah di sini."""

# ASR (faster-whisper). Nama model bisa alias bawaan faster-whisper atau repo
# Hugging Face berformat CTranslate2. Kandidat E1:
#   "small", "medium", "large-v3-turbo"           -> Whisper pretrained OpenAI
#   "cahya/faster-whisper-medium-id"              -> medium yang di-fine-tune ke bahasa Indonesia
# Default dipilih dari pilot 2026-10-13 (docs/eksperimen/2026-10-13-pilot-model.md); E1 yang memastikan.
ASR_MODEL = "large-v3-turbo"
ASR_DEVICE = "cuda"
ASR_COMPUTE_TYPE = "int8_float16"
ASR_LANGUAGE = "id"
ASR_BEAM_SIZE = 5
# Silero VAD bawaan faster-whisper: bagian hening dibuang sebelum decoding, supaya Whisper tidak
# berhalusinasi ("Terima kasih.") saat user diam.
ASR_VAD_FILTER = True

# Streaming (PLAN 6). Buffer audio yang belum confirmed ditranskrip ulang tiap interval.
STREAM_INTERVAL_S = 1.0
# Setelah buffer lebih panjang dari ini, buffer dipotong di akhir kata confirmed terakhir.
STREAM_TRIM_S = 15.0
# Teks confirmed yang sudah keluar dari buffer dikirim sebagai initial_prompt (konteks antar-potongan).
STREAM_PROMPT_CHARS = 200

SAMPLE_RATE = 16_000
