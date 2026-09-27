# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Pengguna utama.** Mahasiswa Computer Science BINUS yang belajar mandiri menjelang UTS/UAS, di kos atau perpustakaan. Satu sesi membahas satu subtopik, dengan 2–5 menit bicara. Tugas mereka adalah menguji pemahaman dengan menjelaskan konsep secara lisan (metode Feynman). Mereka butuh tahu konsep mana yang terlewat, istilah mana yang dipakai tanpa dijelaskan, dan bagian mana yang tidak lancar.

**Peserta user testing.** Mahasiswa yang membuka aplikasi untuk pertama kali, dan mungkin tidak tahu aplikasi ini untuk apa. Peneliti hanya menyampaikan tugas, jadi panduan singkat di dalam aplikasi harus menjelaskan apa aplikasi ini dan cara memakainya dari setup sampai feedback. Kuesioner mengukur apakah panduan itu cukup (PLAN.md bagian 9).

**Dosen dan penguji saat demo.** Mereka menilai apakah aplikasi benar-benar real-time dan berjalan lokal: transkrip partial yang terus diperbarui, latency, dan status. Rubrik Real-Time Application berbobot 30%.

**Pembaca technical report.** Screenshot setiap tahap UI adalah bukti wajib di laporan. Setiap layar harus bisa dipahami dari satu screenshot statis.

## Product Purpose

Feynman Speech Coach adalah web app lokal untuk berlatih menjelaskan satu konsep secara lisan. Whisper lokal mentranskrip secara real-time, dan checklist konsep berubah saat konsep disebut dan dijelaskan. Setelah sesi, user menerima feedback tentang kelancaran, cakupan konsep, kebenaran isi, dan kesederhanaan penjelasan.

Masalah yang diselesaikan: mahasiswa merasa sudah paham setelah membaca slide, tetapi gagal saat harus menjelaskan. Belajar sendiri dengan metode Feynman tidak memberi feedback.

Sukses berarti user menemukan gap pemahamannya, menjelaskan ulang, dan sesi berikutnya mencakup lebih banyak konsep dengan lebih lancar. Untuk mata kuliah, aplikasi harus memenuhi definisi real-time di guideline dan lulus user testing dengan minimal 5 peserta.

## Positioning

Speech adalah inti, LLM hanya pendukung. Semua yang bisa dihitung dari sinyal suara dikerjakan lokal di laptop: transkripsi, jeda, speech rate, filler, dan deteksi konsep live. Audio tidak pernah keluar dari laptop. Daftar konsep diambil dari materi kuliah user sendiri (PDF/PPTX), lalu dipakai untuk checklist live dan hotwords Whisper. Aplikasi transkripsi umum atau chatbot suara tidak bisa mengklaim kombinasi ini dengan jujur.

## Operating Context

- Laptop dengan mic bawaan atau earphone, di ruangan dengan noise ringan (kos, perpustakaan kampus). Demo berjalan di laptop dengan RTX 3050 6 GB.
- Satu sesi punya empat tahap: setup topik, menjelaskan secara lisan, membaca feedback, lalu "Jelaskan ulang" dengan daftar konsep yang sama. Di setup, user mengetik topik, meng-upload materi (opsional), dan meninjau daftar konsep.
- Saat menjelaskan, fokus utama user adalah bicara. Layar live hanya dilirik sesekali untuk mengecek konsep yang belum tercakup. Setelah Stop, user membaca feedback dengan teliti.
- Bahasa bicara adalah bahasa Indonesia dengan istilah CS dalam bahasa Inggris (code-switching alami).

## Capabilities and Constraints

- ASR wajib lokal (faster-whisper). Tidak boleh ada API speech recognition eksternal.
- Gemini Flash (free tier) hanya menerima teks setelah sesi: materi, daftar konsep, transkrip, dan metrik. Peserta harus diberi tahu bahwa input free tier dapat dipakai Google. Izin dosen untuk Gemini masih menunggu konfirmasi.
- Transkrip live membedakan teks confirmed (sudah pasti) dari teks partial (masih bisa berubah).
- Checklist konsep punya tiga status: belum, disebut, dijelaskan. Checklist live hanya indikasi, lalu diverifikasi ulang oleh Gemini setelah sesi.
- Indikator live: speech rate, jumlah filler, peringatan jeda panjang, status (listening/processing), dan latency.
- Feedback pasca-sesi berisi:
  - metrik kelancaran lokal.
  - cakupan konsep, dengan kutipan transkrip sebagai bukti.
  - kesalahan faktual dan koreksinya, serta istilah yang tidak dijelaskan.
  - 2–3 kekuatan, 2–3 prioritas perbaikan, dan catatan kesederhanaan.
  - transkrip lengkap dengan jeda dan filler ditandai.
- Bila Gemini gagal (parse error atau rate limit), aplikasi tetap menampilkan feedback lokal.
- Filler leksikal ("jadi", "gitu") ambigu dengan kata biasa. Tampilkan sebagai indikasi, bukan skor.
- Teks UI dalam bahasa Indonesia. UI mengambil data transkrip hanya lewat interface `TranscriptSource`.
- Belum diputuskan: judul final project, dan fitur nice-to-have (riwayat sesi, pertanyaan lanjutan "murid penasaran").

## Brand Commitments

- Nama kerja: Feynman Speech Coach. Judul final project belum ditetapkan (PLAN.md bagian 10).
- Nada: santai tetapi tegas, menyapa user dengan "kamu". Jujur dan lugas soal kesalahan dan gap. Tetap memuji hal yang sudah bagus, tetapi tidak berlebihan.
- Belum ada logo atau aset brand.

## Evidence on Hand

- Rencana lengkap: `docs/PLAN.md`. Guideline mata kuliah: `docs/project-guideline.md`.
- Sesi mock Backpropagation (`frontend/src/mocks/backprop.ts`) adalah naskah buatan untuk pengembangan UI. Sesi ini bukan data user dan tidak boleh ditampilkan sebagai hasil nyata.
- Belum ada data user testing, kutipan peserta, angka WER, atau pengukuran latency. Semua angka dan data user harus berasal dari pengukuran dan peserta nyata. AI tidak boleh menghasilkannya (PLAN.md bagian 13).

## Product Principles

1. **Bicara dulu, layar kedua.** Layar live membantu lewat lirikan singkat dan tidak pernah menuntut user membaca sambil bicara.
2. **Memandu tanpa penjelasan panjang.** Aplikasi memberi panduan singkat tentang apa aplikasi ini dan cara memakai tiap tahap. Dengan panduan itu, orang yang belum pernah melihat aplikasi ini bisa menyelesaikan satu sesi penuh tanpa dijelaskan orang lain.
3. **Bisa diverifikasi.** Setiap penilaian disertai kutipan transkrip. Checklist live ditandai sebagai indikasi. Kesalahan ASR tidak boleh dianggap kesalahan pemahaman user.
4. **Lokal dan transparan.** User bisa melihat apa yang diproses lokal dan apa yang dikirim ke Gemini.
5. **Feedback mengarah ke percobaan berikutnya.** Setiap sesi berakhir dengan langkah konkret untuk menjelaskan ulang.

## Accessibility & Inclusion

- Status checklist tidak boleh hanya dibedakan lewat warna. Setiap status punya label teks atau bentuk yang berbeda.
