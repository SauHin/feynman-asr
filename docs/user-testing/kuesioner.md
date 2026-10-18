# Kuesioner pre dan post

Draf isi untuk Google Forms. Buat dua form terpisah. Peserta mengisi pre sebelum Task 1, dan post setelah Task 3.

Aturan form:

- Pertanyaan pertama di kedua form adalah kode peserta (P01, P02, dan seterusnya). Peneliti yang memberi kode. Form tidak menanyakan nama atau email.
- Semua pertanyaan skala memakai *linear scale* 1–5 dan wajib diisi.
- Setelah semua sesi selesai, ekspor respons ke CSV dan simpan di `eval/data/`, yang tidak di-commit.

## Pre-questionnaire (sekitar 3 menit)

1. **Kode peserta.** Jawaban singkat, diisi peneliti.
2. **Semester saat ini.** Pilihan: 1, 2, 3, 4, 5, 6, 7, 8 ke atas.
3. **Program studi.** Pilihan: Computer Science, lainnya.
4. **Mata kuliah dan topik yang akan kamu jelaskan nanti.** Jawaban singkat. Contoh: Machine Learning, regularisasi.
5. **Seberapa yakin kamu bisa menjelaskan topik itu ke teman tanpa melihat catatan?** Skala 1–5: 1 = sama sekali tidak yakin, 5 = sangat yakin.
6. **Metode Feynman adalah cara belajar dengan menjelaskan materi memakai bahasa sederhana, seolah ke orang awam. Seberapa sering kamu memakainya?** Pilih satu:
   - Belum pernah dengar
   - Pernah dengar, tapi belum pernah pakai
   - Pernah pakai sesekali
   - Sering pakai
7. **Cara belajar apa yang paling sering kamu pakai menjelang ujian?** Kotak centang, boleh lebih dari satu:
   - Membaca ulang materi atau catatan
   - Mengerjakan latihan soal
   - Merangkum materi
   - Belajar kelompok atau diskusi
   - Menjelaskan materi ke orang lain
   - Menonton video penjelasan
   - Lainnya
8. **Seberapa sering kamu menjelaskan materi kuliah secara lisan ke orang lain?** Pilih satu:
   - Tidak pernah
   - Jarang
   - Kadang-kadang
   - Sering

Pertanyaan 5 diulang di post-questionnaire, supaya perubahan keyakinan setelah sesi bisa dibandingkan.

## Post-questionnaire (sekitar 5 menit)

1. **Kode peserta.** Jawaban singkat, diisi peneliti.

### Bagian A: penilaian aplikasi

Skala 1–5: 1 = sangat tidak setuju, 5 = sangat setuju. Kolom kode menjadi nama kolom di tabel hasil laporan (format tabel di bagian 8 panduan mata kuliah).

| No | Kode | Pernyataan |
| --- | --- | --- |
| A1 | Ease of use | Panduan di aplikasi cukup untuk membuat saya paham apa aplikasi ini dan cara memakainya. |
| A2 | Responsiveness | Transkrip muncul cukup cepat saat saya bicara. |
| A3 | Transcription quality | Transkrip, termasuk istilah teknis, cukup akurat. |
| A4 | Checklist usefulness | Checklist konsep membantu saya tahu apa yang belum dibahas. |
| A5 | Distraction | Tampilan live tidak mengganggu konsentrasi saat menjelaskan. |
| A6 | Feedback usefulness | Feedback membantu saya menemukan bagian yang belum saya pahami. |
| A7 | Feedback accuracy | Feedback sesuai dengan apa yang sebenarnya saya jelaskan. |
| A8 | Overall satisfaction | Saya akan memakai aplikasi ini untuk belajar. |

A5 ditulis sebagai pernyataan positif, jadi semua butir dibaca searah: skor tinggi berarti baik.

### Bagian B: keyakinan setelah sesi

B1. **Seberapa yakin kamu bisa menjelaskan topik tadi ke teman tanpa melihat catatan?** Skala 1–5, sama dengan pre nomor 5.

### Bagian C: System Usability Scale (SUS)

SUS adalah kuesioner kegunaan standar berisi 10 butir. Skornya bisa dibandingkan dengan benchmark umum. Skala 1–5: 1 = sangat tidak setuju, 5 = sangat setuju.

| No | Pernyataan |
| --- | --- |
| C1 | Saya rasa saya akan sering memakai aplikasi ini. |
| C2 | Saya merasa aplikasi ini rumit tanpa alasan yang jelas. |
| C3 | Saya merasa aplikasi ini mudah dipakai. |
| C4 | Saya rasa saya butuh bantuan orang yang paham teknis untuk bisa memakai aplikasi ini. |
| C5 | Saya merasa fitur-fitur di aplikasi ini menyatu dengan baik. |
| C6 | Saya merasa ada terlalu banyak hal yang tidak konsisten di aplikasi ini. |
| C7 | Saya rasa kebanyakan orang bisa cepat belajar memakai aplikasi ini. |
| C8 | Saya merasa aplikasi ini merepotkan untuk dipakai. |
| C9 | Saya merasa yakin saat memakai aplikasi ini. |
| C10 | Saya perlu mempelajari banyak hal sebelum bisa memakai aplikasi ini. |

Terjemahan di atas masih draf. Untuk laporan, lebih aman memakai adaptasi bahasa Indonesia yang sudah divalidasi, yaitu Sharfina dan Santoso (2016), lalu menyebut sumbernya.

**Cara menghitung skor SUS per peserta:**

1. Butir ganjil (C1, C3, C5, C7, C9): skor dikurangi 1.
2. Butir genap (C2, C4, C6, C8, C10): 5 dikurangi skor.
3. Jumlahkan kesepuluh hasil, lalu kalikan 2,5. Hasilnya 0–100.

Skor SUS bukan persentase. Rata-rata yang sering dipakai sebagai pembanding adalah sekitar 68.

### Bagian D: komentar

D1. **Ada hal lain yang ingin kamu sampaikan tentang aplikasi ini?** Paragraf, tidak wajib.
