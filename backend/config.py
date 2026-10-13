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

# Kelancaran (PLAN 7.1), dihitung dari kata confirmed.
# Celah antarkata minimal segini dihitung jeda panjang. Nilai awal dari PLAN (1,5–2 detik), dikalibrasi dari data pilot.
FLUENCY_PAUSE_S = 2.0
# Pesan fluency dikirim tiap selang waktu audio ini, dan juga saat ada jeda panjang.
FLUENCY_EVERY_S = 5.0
# Filler leksikal yang dihitung. "jadi" tidak ikut karena lebih sering dipakai sebagai kata sambung biasa.
FLUENCY_LEXICAL_FILLERS = ("kayak", "gitu", "anu")

SAMPLE_RATE = 16_000

# Fine-tuning: pemotong rekaman naskah latih (finetune/segment.py).
# Potongan dibatasi 20 detik, dekat dengan panjang buffer audio yang ditranskrip ulang saat streaming.
FT_MAX_SEGMENT_S = 20.0
# Jeda antarkalimat lebih pendek dari ini membuat titik potong tidak pasti, jadi potongannya ditandai "cek".
FT_MIN_GAP_S = 0.15
# WER transkrip ASR terhadap naskah di atas ini membuat potongan ditandai "cek". Pada pilot backprop,
# 0,15 menandai 2 dari 7 potongan, yaitu yang menyimpang beberapa kata dari naskah. Penyimpangan satu
# kata tidak bisa dibedakan dari salah dengar ASR, jadi semua potongan tetap didengar saat cek.
FT_FLAG_WER = 0.15
# Audio yang disisakan sebelum kata pertama dan sesudah kata terakhir rekaman.
FT_EDGE_PAD_S = 0.3
