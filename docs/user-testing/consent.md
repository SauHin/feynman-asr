# Formulir persetujuan peserta user testing

Draf. Isian bertanda [ ] dilengkapi sebelum dicetak. Cetak dua salinan: satu untuk peserta, satu untuk peneliti.

**Kode peserta:** P__

## Tentang penelitian ini

Penelitian ini adalah bagian dari final project mata kuliah COMP6822001 [nama mata kuliah] di BINUS University. Peneliti: [nama peneliti]. Kontak: [email atau nomor].

Aplikasi yang diuji bernama Empur. Empur adalah aplikasi latihan menjelaskan materi kuliah secara lisan dengan metode Feynman. Aplikasi mendengarkan penjelasan Anda, menuliskannya menjadi transkrip, menandai konsep yang sudah Anda bahas, lalu memberi feedback.

Tujuan pengujian ini adalah menilai aplikasinya, bukan menilai Anda. Tidak ada jawaban atau penjelasan yang salah.

## Yang akan Anda lakukan

Sesi berlangsung sekitar 40 menit:

1. Mengisi kuesioner singkat tentang kebiasaan belajar Anda.
2. Membaca naskah pendek dengan suara keras selama 1–2 menit.
3. Memilih satu topik dari mata kuliah yang sedang Anda ambil, lalu menjelaskannya selama 2–4 menit di aplikasi. Materi kuliahnya boleh diunggah.
4. Membaca feedback, lalu menjelaskan topik yang sama sekali lagi.
5. Mengisi kuesioner penilaian aplikasi dan menjawab wawancara singkat 5–10 menit.

Selama sesi, peneliti mencatat cara Anda memakai aplikasi. Peneliti tidak menjelaskan cara pakai aplikasi. Tujuannya untuk menguji apakah panduan di dalam aplikasi sudah cukup.

## Data yang dikumpulkan

| Data | Disimpan di | Keterangan |
| --- | --- | --- |
| Rekaman suara | Laptop peneliti | Diproses di laptop. Audio tidak dikirim ke layanan luar |
| Transkrip otomatis dan log aplikasi | Laptop peneliti | Teks hasil pengenalan suara, waktu, dan hasil checklist |
| Topik, daftar konsep, teks transkrip, dan teks materi yang Anda unggah | Dikirim ke Google Gemini API | Lihat bagian berikut |
| Jawaban kuesioner | Google Forms milik peneliti | Memakai kode peserta, bukan nama |
| Catatan observasi dan wawancara | Peneliti | Memakai kode peserta |

**Data yang dikirim ke Google.** Aplikasi mengirim topik, daftar konsep, teks transkrip, dan teks materi ke Google Gemini API. Gemini memakainya untuk mencari konsep dan menyusun feedback. Proyek ini memakai layanan gratis (*free tier*). Pada layanan gratis, Google dapat memakai data yang dikirim untuk meningkatkan produknya. Karena itu, jangan mengunggah materi yang rahasia, dan jangan menyebut data pribadi saat menjelaskan.

## Cara data dipakai dan disimpan

- Data hanya dipakai untuk final project ini: laporan teknis, presentasi, dan evaluasi akurasi sistem.
- Nama Anda hanya ada di formulir ini. Semua data lain memakai kode peserta.
- Rekaman suara tidak dipublikasikan dan tidak diunggah ke repositori kode.
- Laporan dapat memuat kutipan pendek dari transkrip atau wawancara tanpa nama.
- Semua rekaman dihapus paling lambat [tanggal, misalnya akhir semester].

## Hak Anda

- Keikutsertaan Anda sukarela.
- Anda boleh berhenti kapan saja tanpa memberi alasan.
- Anda boleh meminta data Anda dihapus sampai [tanggal laporan dikumpulkan]. Hubungi peneliti dan sebutkan kode peserta Anda.

## Persetujuan

Beri tanda pada setiap pernyataan yang Anda setujui.

- [ ] Saya bersedia suara saya direkam selama sesi.
- [ ] Saya paham bahwa topik, daftar konsep, teks transkrip, dan teks materi saya dikirim ke Google Gemini API. Google dapat memakainya untuk meningkatkan produknya.
- [ ] Saya bersedia rekaman dan transkrip saya dipakai untuk mengukur akurasi sistem. Untuk itu, peneliti mendengarkan ulang dan menuliskan transkripnya secara manual.
- [ ] Saya bersedia kutipan pendek tanpa nama dari penjelasan atau wawancara saya dimuat di laporan.
- [ ] (Opsional) Saya bersedia wawancara direkam suaranya untuk membantu pencatatan.

| | Peserta | Peneliti |
| --- | --- | --- |
| Nama | | |
| Tanda tangan | | |
| Tanggal | | |
