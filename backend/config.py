"""Semua parameter backend. API key hanya dari .env, tidak pernah di sini."""
from pathlib import Path

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
# Hotwords (PLAN 8.5 E2): nama dan alias dari daftar konsep sesi ini dikirim ke Whisper. E2 mematikannya dengan
# --set ASR_HOTWORDS=False di eval/replay.py, supaya daftar konsep tetap sama dan hanya hotwords yang berubah.
ASR_HOTWORDS = True
# Temperature decoding. Kalau hasil gagal ambang kompresi atau log-probability, faster-whisper mendecode ulang di
# temperature berikutnya dengan sampling acak. Hotwords memicu ulangan ini lebih sering. Uji 2026-10-17 di 5 rekaman s01
# (docs/eksperimen/2026-10-17-uji-temperature.md): bawaan faster-whisper (0,0 sampai 1,0) membuat latency confirmed p90
# 5,1 detik, temperature 0 saja 2,8 detik tapi halusinasi seperti "thank you" lolos, dan satu ulangan (0,0 lalu 0,2)
# 3,2 detik dengan term recall sama (90,1%). Nilai ini sementara sampai E2 di Set A.
ASR_TEMPERATURE = (0.0, 0.2)
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

# Checklist konsep live (PLAN 7.2), dihitung dari kata confirmed (analysis/concepts.py). Konsep dianggap dibahas kalau
# skor rapidfuzz 0–100 antara nama atau aliasnya dan potongan transkrip sepanjang istilah itu minimal segini.
CONCEPT_MENTION_SCORE = 85

# Analisis isi dengan Gemini setelah Stop (PLAN 7.3). API key hanya dibaca dari GEMINI_API_KEY di .env.
# Model stabil supaya hasil bisa diulang; alias seperti "gemini-flash-latest" bisa berganti model diam-diam.
# Uji 2026-10-14 dengan key proyek dan transkrip pilot: gemini-2.5-flash tidak lagi tersedia untuk akun baru (404).
# gemini-3.8-flash lebih teliti, tapi sekali butuh 52 detik dan sekali gagal 504 tiga kali karena server sibuk.
# gemini-3.1-flash-lite berhasil 4 dari 4 kali dalam 10–15 detik, jadi dipakai sebagai model utama.
GEMINI_MODEL = "gemini-3.1-flash-lite"
GEMINI_TEMPERATURE = 0.2
# Batas waktu satu panggilan. Model yang sedang kelebihan beban kadang tidak menjawab sama sekali.
GEMINI_TIMEOUT_S = 60.0
# Percobaan ulang saat kena rate limit (HTTP 429), server Gemini error, atau JSON tidak valid.
# Jeda sebelum percobaan berikutnya naik dua kali lipat: 2 detik, lalu 4 detik.
GEMINI_ATTEMPTS = 3
GEMINI_BACKOFF_S = 2.0

# Ekstraksi konsep saat setup (PLAN 4 Tahap 1, PLAN 7.3 panggilan 1).
# Sama dengan batas daftar konsep di layar setup.
CONCEPTS_MAX = 8
MATERIAL_MAX_MB = 20
# Teks materi yang lebih panjang ditolak, dan user diminta memilih halaman yang relevan. 100 ribu karakter
# kira-kira 25 ribu token (sekitar 4 karakter per token), cukup untuk satu bab slide kuliah.
MATERIAL_MAX_CHARS = 100_000

SAMPLE_RATE = 16_000

# Penyimpanan sesi live (backend/sessions.py): audio yang diterima, log pesan server, dan feedback Gemini. Dipakai
# sebagai audio Set B dan data analisis user testing (PLAN 8.3, PLAN 9). Folder ini di dalam eval/data/, yang tidak
# di-commit karena berisi suara peserta. eval/replay.py mematikannya, supaya replay tidak menggandakan rekaman.
SESSION_SAVE = True
SESSION_DIR = Path(__file__).resolve().parents[1] / "eval" / "data" / "sesi"

# Draf anotasi Set B (eval/draft_labels.py). Draf memakai model yang berbeda dari aplikasi dan tanpa hotwords, supaya
# kesalahan sistem yang dievaluasi tidak ikut masuk ke kunci jawaban.
ANNOT_DRAFT_MODEL = "large-v3"
# Jeda mulai dari segini dilabeli (PLAN 8.3). Lebih rendah dari FLUENCY_PAUSE_S, supaya E7 bisa menguji ambang lain.
ANNOT_PAUSE_S = 1.5

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
