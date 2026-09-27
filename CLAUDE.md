# Feynman Speech Coach
Rencana lengkap: docs/PLAN.md. Baca bagian yang relevan sebelum mengerjakan fitur.

## Aturan tetap
- ASR wajib lokal (faster-whisper). Tidak boleh ada API speech recognition eksternal.
- Semua parameter di backend/config.py; API key hanya dari .env, jangan pernah di-commit.
- Setiap modul punya tes minimal.

## Konvensi frontend
- UI tidak mengakses WebSocket langsung; semua data transkrip lewat interface
  TranscriptSource (src/lib/transcript-source.ts).
- Tipe pesan server dan tipe feedback di src/types/, mengikuti skema PLAN.md 7.3.
- Teks UI bahasa Indonesia. Status checklist tidak boleh hanya dibedakan lewat warna.