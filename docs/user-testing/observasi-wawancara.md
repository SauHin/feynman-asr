# Panduan sesi, lembar observasi, dan wawancara

Draf untuk peneliti. Dasarnya PLAN 9. Satu sesi per peserta, sekitar 40 menit.

## Syarat peserta

- Mahasiswa Computer Science BINUS yang sedang mengambil mata kuliah dengan topik yang bisa dijelaskan.
- Bukan anggota tim (s01, s02, s03). Mereka sudah tahu cara pakai aplikasi, jadi tidak bisa menguji panduan di dalamnya. Suara mereka juga ikut dilatih di `turbo-ft`, sehingga hasil ASR mereka harus dilaporkan terpisah (PLAN 8.8).

## Persiapan sebelum setiap peserta

- [ ] Laptop tersambung ke charger dan memakai mode Performance. Di mode lain, daya GPU dibatasi sekitar 15 W, sehingga latency yang dialami peserta tidak sesuai dengan sistem sebenarnya.
- [ ] Backend dan frontend menyala, dan `SESSION_SAVE = True` di `backend/config.py`.
- [ ] Chrome membuka http://localhost:5173 di tab baru. Tab peserta sebelumnya sudah ditutup.
- [ ] Mic laptop dipakai, dan pemrosesan suara Windows (*noise suppression*, *echo cancellation*) mati (PLAN 8.3).
- [ ] Sisa kuota harian Gemini cukup. Satu peserta memakai sekitar 3 panggilan: 1 ekstraksi konsep dan 2 feedback. Tombol coba lagi menambah panggilan. Batas harian: [perlu data].
- [ ] Naskah Task 1 sudah dicetak dari `eval/naskah/<topik>.txt`.
- [ ] Audacity siap merekam Task 1: mono, 16 kHz, WAV.
- [ ] Formulir consent tercetak, dan link Google Forms pre dan post siap.

## Alur sesi

| Langkah | Waktu | Yang dilakukan |
| --- | --- | --- |
| Consent | 5 menit | Peserta membaca dan menandatangani formulir. Peneliti memberi kode peserta |
| Pre-questionnaire | 3 menit | Google Forms |
| Task 1 | 3 menit | Peserta membaca naskah dengan suara keras. Peneliti merekam dengan Audacity, di luar aplikasi |
| Task 2 | 10–12 menit | Setup topik, menjelaskan 2–4 menit, membaca feedback |
| Task 3 | 6–8 menit | Menjelaskan topik yang sama sekali lagi |
| Post-questionnaire | 5 menit | Google Forms |
| Wawancara | 5–10 menit | Pertanyaan di bagian akhir dokumen ini |

Task 1 direkam di luar aplikasi, supaya Task 2 menjadi kontak pertama peserta dengan aplikasi. Dengan begitu, observasi panduan dalam aplikasi tidak terganggu.

## Aturan peneliti

Sampaikan tugas dengan kalimat yang sama untuk semua peserta:

- Task 1: "Tolong bacakan naskah ini dengan suara keras, dengan kecepatan biasa."
- Task 2: "Pilih satu topik dari mata kuliah yang sedang kamu ambil. Pakai aplikasi ini untuk latihan menjelaskannya selama 2–4 menit. Kalau punya materinya, boleh diunggah."
- Task 3: "Baca feedback-nya, lalu jelaskan topik yang sama sekali lagi."

Selama task:

- Jangan menjelaskan cara pakai aplikasi. Kalau peserta bertanya, jawab: "Coba ikuti petunjuk di aplikasinya dulu, ya."
- Kalau peserta macet lebih dari 60 detik di langkah yang sama, peneliti boleh membantu. Catat setiap bantuan, karena bantuan berarti panduan gagal di titik itu.
- Saat setup dan saat membaca feedback, minta peserta menyuarakan apa yang dipikirkannya. Jangan minta ini saat menjelaskan, karena ucapannya ikut masuk ke rekaman.
- Catat jam saat peserta menekan Mulai, sampai detik, dari jam laptop. Nama file sesi di `eval/data/sesi/` diawali tanggal dan jam yang sama, misalnya `20261018-140322-a3f9`.

## Lembar observasi

Satu lembar per peserta. Cetak, atau isi langsung di laptop kedua.

| Data | Isi |
| --- | --- |
| Kode peserta | |
| Tanggal | |
| Lokasi dan kondisi ruang | |
| Perangkat dan mic | |
| Mode Performance | ya / tidak |
| Topik dan mata kuliah | |
| Materi | PDF / PPTX / teks / tanpa materi |

### Task 1: membaca naskah

| Titik amatan | Hasil |
| --- | --- |
| Jam mulai rekam | |
| Nama file rekaman | |
| Bagian yang dibaca berbeda dari naskah | |

Bagian yang berbeda dipakai untuk mengoreksi teks referensi, karena referensi harus sama dengan yang benar-benar diucapkan.

### Task 2: sesi pertama

| Titik amatan | Hasil | Catatan |
| --- | --- | --- |
| Panduan empat tahap di beranda | dibaca / sekilas / dilewati | |
| Waktu dari beranda sampai daftar konsep muncul | menit:detik | |
| Unggah materi | berhasil / gagal / tidak mengunggah | Pesan error bila gagal |
| Memilih halaman atau slide | ya / tidak | |
| Perubahan daftar konsep | diubah __, dihapus __, ditambah __ | |
| Menemukan tombol Mulai tanpa bantuan | ya / tidak | |
| Izin mic | lancar / bingung / ditolak | |
| Jam menekan Mulai | jam:menit:detik | Id sesi: |
| Durasi bicara | menit:detik | |
| Arah pandangan saat bicara | sebagian besar ke layar / bergantian / jarang ke layar | |
| Reaksi terhadap centang checklist | | Kutip komentar spontan |
| Masalah transkrip yang terlihat | istilah salah / teks tertinggal / macet / tidak ada | Contoh istilahnya |
| Waktu tunggu feedback | detik | Gemini gagal: ya / tidak |
| Cara membaca feedback | semua / sebagian / dilewati | Membuka transkrip lengkap: ya / tidak |
| Bantuan dari peneliti | jumlah __ | Di langkah mana |

### Task 3: sesi ulang

| Titik amatan | Hasil | Catatan |
| --- | --- | --- |
| Menemukan tombol "Jelasin lagi" tanpa bantuan | ya / tidak | |
| Jam menekan Mulai | jam:menit:detik | Id sesi: |
| Durasi bicara | menit:detik | |
| Perubahan dibanding Task 2 | | Misalnya membahas konsep yang tadi terlewat |
| Bantuan dari peneliti | jumlah __ | Di langkah mana |

### Catatan kejadian

Catat setiap kejadian atau kutipan yang menarik. Kolom kategori memakai daftar di panduan mata kuliah bagian 7: usability, recognition, latency, interaksi membingungkan, fitur berguna, fitur kurang, kepuasan.

| Jam | Layar | Kejadian atau kutipan | Kategori |
| --- | --- | --- | --- |
| | | | |
| | | | |
| | | | |

## Wawancara (5–10 menit)

Ajukan pertanyaan terbuka. Jangan menyarankan jawaban, dan catat kutipan apa adanya. Kalau ada kejadian di lembar observasi, tanyakan juga. Contoh: "Tadi kamu berhenti cukup lama di layar setup. Apa yang kamu cari?"

1. Bagian mana dari aplikasi ini yang paling membantu? Kenapa?
2. Apakah ada feedback yang terasa salah atau tidak adil? Bagian mana?
3. Apakah checklist konsep membantu atau mengganggu saat kamu menjelaskan? Ceritakan momennya.
4. Apakah ada istilah yang salah ditulis di transkrip? Istilah apa?
5. Apakah transkripnya terasa terlambat? Di bagian mana?
6. Menurutmu, data apa yang dikirim ke Gemini, dan data apa yang tetap di laptop?
7. Fitur apa yang menurutmu kurang?
8. Apakah kamu akan memakai aplikasi ini sebelum ujian? Kenapa?

Setiap pertanyaan punya pasangan data teknis untuk analisis (PLAN 9):

| Pertanyaan | Dicek dengan |
| --- | --- |
| 2 | Transkrip dan log sesi: apakah feedback yang dianggap salah berasal dari salah dengar ASR |
| 3 | Pesan concept di log sesi dan anotasi konsep: centang tepat waktu, terlambat, atau salah |
| 4 | Term recall dan WER token istilah rekaman peserta itu |
| 5 | Latency per kata dari log sesi (`eval/metrics.py`) |
| 6 | Apakah panduan dalam aplikasi menjelaskan data yang dikirim ke Gemini (PLAN 4) |

## Setelah setiap sesi

1. Cocokkan jam mulai Task 2 dan Task 3 dengan nama file di `eval/data/sesi/`, lalu tulis id sesinya di lembar observasi.
2. Lengkapi catatan observasi pada hari yang sama, selagi masih ingat.
3. Lanjutkan ke pelabelan Set B (`anotasi-set-b.md`).
