"""Semua parameter backend. API key hanya dari .env, tidak pernah di sini."""

# ASR (faster-whisper). Nama model bisa alias bawaan faster-whisper atau repo
# Hugging Face berformat CTranslate2. Kandidat E1:
#   "small", "medium", "large-v3-turbo"           -> Whisper pretrained OpenAI
#   "cahya/faster-whisper-medium-id"              -> medium yang di-fine-tune ke bahasa Indonesia
ASR_MODEL = "small"
ASR_DEVICE = "cuda"
ASR_COMPUTE_TYPE = "int8_float16"
ASR_LANGUAGE = "id"
ASR_BEAM_SIZE = 5

SAMPLE_RATE = 16_000
