# AI Usage Log — Feynman Speech Coach (COMP6822001)

Log ini memenuhi Project Guideline §21.1–21.2. Tabel di bawah akan disalin ke Technical Report.

## Aturan Penulisan

### Apa yang dicatat
- Catat setiap penggunaan AI yang **material**, yaitu yang memengaruhi kode, arsitektur, desain eksperimen, analisis, atau isi laporan. Koreksi typo atau pertanyaan umum yang tidak dipakai tidak perlu dicatat.
- Satu baris = satu tujuan penggunaan, bukan satu prompt. Satu sesi bisa menghasilkan 1–3 baris jika tujuannya berbeda (misalnya desain arsitektur dan debugging).
- Jangan salin percakapan. Cukup ringkasan yang menunjukkan bagaimana AI dipakai (§21.2).
- Komponen AI **di dalam aplikasi** (faster-whisper, Gemini untuk analisis pasca-sesi) bukan bagian log ini. Itu didokumentasikan di bab System Design.

### Isi tiap kolom
| Kolom | Isi | Contoh |
| :--- | :--- | :--- |
| **No.** | Nomor urut, tidak pernah dipakai ulang atau diurutkan ulang. | 4 |
| **Tanggal** | Tanggal sesi, format `YYYY-MM-DD`. | 2026-09-27 |
| **AI Tool** | Nama tool + model, bukan sekadar "LLM". | Claude Opus 5.5 (claude.ai) |
| **Purpose** | Kategori: brainstorming, problem definition, system design, coding, debugging, experimental design, data analysis, documentation, writing/editing, UI development. | Debugging |
| **Prompt/Instruction Summary** | Satu kalimat tentang apa yang diminta. | Asked why partial transcripts repeat words at chunk boundaries |
| **Output Used** | `Used` / `Partially used` / `Not used`, plus bagian mana yang dipakai. | Partially used — overlap-trimming logic only |
| **Student Verification** | Tindakan konkret yang dilakukan, hasilnya, dan keputusan akhir. Lihat aturan di bawah. | Tested 10 live-mic runs; duplicates dropped from 7/10 to 0/10; kept fix, rejected suggested buffer size (latency rose to 2.1 s) |

### Aturan kolom Student Verification
- Tulis **apa yang dilakukan + hasil/bukti + keputusan**. "Checked", "reviewed", atau "looks correct" tidak cukup.
- Jika menemukan kesalahan atau keterbatasan output AI, tulis di sini. Ini yang dinilai pada rubrik *Critical Use of AI* (§21.5).
- Hanya tulis verifikasi yang **sudah benar-benar dilakukan**. Jika belum, tulis `PENDING: <rencana verifikasi>` dan perbarui setelah dilakukan. Sebelum laporan dikumpulkan, tidak boleh ada `PENDING` yang tersisa.
- Pernyataan AI tidak pernah menjadi bukti verifikasi. Data user testing, feedback, dan angka WER/latency tidak boleh berasal dari AI (§21.6–21.7).

### Instruksi untuk AI saat diminta membuat entry dari suatu sesi
1. Baca sesi yang dimaksud, lalu tulis entry secara ringkas dan padat: satu kalimat per sel, dalam bahasa Inggris.
2. Isi hanya yang terlihat jelas dari sesi. Jangan menebak tanggal, nomor urut, bagian output yang dipakai, atau verifikasi.
3. Jika ada detail yang hilang, **tanyakan langsung ke user dalam satu pesan**, biasanya:
   - nomor entry terakhir di log;
   - output mana yang dipakai, diubah, atau dibuang;
   - verifikasi apa yang sudah dilakukan beserta hasilnya (atau apakah ditandai `PENDING`).
4. Jangan pernah mengarang verifikasi, hasil tes, atau angka.

## AI Usage Log

| No. | Tanggal | AI Tool | Purpose | Prompt/Instruction Summary | Output Used | Student Verification |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | 2026-09-14 | Claude Opus 5 (claude.ai), sebagian dengan web search bawaan | Brainstorming & problem definition | Brainstorming ide project, lalu memeriksa apakah tiap ide sesuai requirement guideline (terutama partial transcription real-time) dan realistis untuk dikerjakan. | Partially used: dari delapan ide usulan AI, dipilih aplikasi pendamping belajar metode Feynman karena pengguna berbicara panjang dan kontinu sehingga dapat menggunakan partial transcription. | Menolak dua rekomendasi teratas AI (transkripsi pembelajaran kelas dan notulen rapat) karena terlalu generik dan mempersempit sendiri target user ke mahasiswa agar realistis untuk didapat serta menyelesaikan masalah nyata yang dialami diri sendiri sebagai seorang mahasiswa. <pending>Konsep dan target user dikonfirmasi langsung ke dosen.</pending> |