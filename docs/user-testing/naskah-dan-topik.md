# Naskah Set A dan topik user testing

Semua topik diambil dari kisi-kisi UTS Speech Recognition dan Deep Learning di repo mentoring, dan dari latihan UTS Sistem Operasi. Tidak ada topik yang sama dengan 14 topik Set T (PLAN 8.8). Dengan begitu, peserta sekaligus berlatih untuk UTS.

## Naskah Set A

Naskah ini dibaca di sesi rekaman Set A dan di Task 1 user testing. Isinya ada di `eval/naskah/<topik>.txt`, dan daftar istilahnya di `eval/naskah/<topik>.terms.txt`.

| Topik | Mata kuliah | Kata | Istilah |
| --- | --- | --- | --- |
| `asr-pipeline` | Speech Recognition, kisi soal 1 | 210 | 26 |
| `word-error-rate` | Speech Recognition, kisi soal 5 | 201 | 12 |
| `gan` | Deep Learning | 199 | 17 |
| `cpu-scheduling` | Sistem Operasi | 215 | 20 |
| `backpropagation` | Deep Learning, naskah pilot | 201 | 21 |

Empat naskah pertama disusun dengan bantuan AI dari catatan kisi-kisi. Sebelum dicetak, satu anggota tim membaca setiap naskah dengan suara keras. Isi yang salah dan kata yang sulit diucapkan diperbaiki saat itu juga.

Di sesi rekaman, setiap pembicara membaca dua naskah:

| Pembicara | Naskah |
| --- | --- |
| 1 | `asr-pipeline`, `gan` |
| 2 | `word-error-rate`, `cpu-scheduling` |
| 3 | `backpropagation`, `asr-pipeline` |
| 4 | `gan`, `word-error-rate` |
| 5 | `cpu-scheduling`, `backpropagation` |
| 6–8 | Ulangi urutan pembicara 1–3 |

Di Task 1 user testing, peserta P1 sampai P5 membaca satu naskah sesuai urutan tabel pertama. P1 membaca `asr-pipeline`, P2 membaca `word-error-rate`, dan seterusnya.

## Cara merekam

Semua naskah direkam dengan `eval/record_mics.py`. Skrip ini merekam beberapa mic sekaligus, lalu menyimpan satu file WAV 16 kHz mono per mic di `eval/data/`. Rekaman yang sudah ada tidak pernah ditimpa.

1. Colok earphone, lalu matikan Audio enhancements untuk kedua mic (Settings > System > Sound > pilih mic).
2. Lihat nomor setiap mic:

   ```powershell
   .\backend\.venv\Scripts\python.exe eval\record_mics.py --list
   ```

3. Rekam dengan nomor dari langkah 2:

   ```powershell
   .\backend\.venv\Scripts\python.exe eval\record_mics.py --speaker p01 --topik gan --lokasi lab --mic laptop=1 --mic earphone=3
   ```

4. Pembicara diam sekitar 1 detik, lalu membaca naskah. Tekan Enter setelah selesai.
5. Kalau output menulis `PERIKSA`, dengarkan file itu. Kalau rekamannya rusak, hapus file-nya, lalu rekam ulang.
6. Salin baris yang dicetak ke `eval/data/metadata.csv`, lalu isi kolom kondisi dan consent.

Pakai earphone yang sama untuk semua pembicara, dan catat apakah earphone itu berkabel atau Bluetooth. Mic Bluetooth merekam dengan kualitas lebih rendah, dan hal itu memengaruhi hasil E3.

Di Task 1 user testing, pakai mic laptop saja (`--mic laptop=1`). Kalau earphone tidak dicolok, Chrome tetap memakai mic laptop di Task 2.

## Topik Task 2

Peserta memilih satu topik dari daftar ini, lalu menjelaskannya tanpa naskah. Pertanyaannya diambil dari kisi-kisi UTS. Slide dosen disalin ke laptop tim sebelum sesi.

| No | Topik | Mata kuliah | Pertanyaan | Materi untuk diunggah |
| --- | --- | --- | --- | --- |
| 1 | HMM dan Viterbi | Speech Recognition | Jelaskan cara kerja HMM, dan cara algoritma Viterbi mencari path terbaik. | `Automatic Speech Recognition.pptx`, slide 14–43 |
| 2 | Phonetics dan spectrogram | Speech Recognition | Jelaskan cara suara manusia dihasilkan, dan cara membaca spectrogram. | `Phonetics.pptx`, slide 20–57 |
| 3 | Autoencoder dan deteksi anomali | Deep Learning | Jelaskan cara kerja autoencoder, dan cara memakainya untuk deteksi anomali. | `Autoencoders and Representation Learning.pptx`, slide 5–28 |
| 4 | MLP untuk regression dan classification | Deep Learning | Jelaskan perbedaan output dan loss MLP untuk regression dan classification, termasuk MSE dan MAE. | `Regression and Classification with MLP.pptx`, slide 5–24 |
| 5 | Process, PCB, dan context switch | Sistem Operasi | Jelaskan apa yang terjadi saat CPU berpindah dari satu process ke process lain. | Tidak ada slide. Pakai mode tanpa materi, atau tempel catatan OS |

Cadangan untuk peserta keenam dan seterusnya:

- wav2vec 2.0 dan eksperimen ASR (Speech Recognition, kisi soal 3), dengan materi `Fondation Model and SpeechBrain Training.pptx`.
- System bus dan siklus instruksi (Sistem Operasi), tanpa slide.

## Aturan

- Topik Task 2 harus berbeda dari naskah Task 1 peserta yang sama. Kalau sama, penjelasan spontannya ikut meniru naskah. Kedua daftar di atas tidak punya topik yang sama, jadi aturan ini otomatis terpenuhi.
- Untuk topik 4, slide 25–29 tidak diunggah. Slide itu membahas precision dan recall, yang termasuk topik Set T.
- Topik 5 tidak punya slide dosen, jadi daftar konsepnya dibuat Gemini tanpa materi. Layar setup menandai hal ini.
