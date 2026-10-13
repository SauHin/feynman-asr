# Fine-tuning ASR: panduan tim

Panduan ini menjelaskan cara menyiapkan data, melatih, dan memasang model ASR hasil fine-tuning untuk Feynman Speech Coach.

Panduan ini juga ditulis supaya bisa dipahami asisten AI. Kalau mau dibimbing AI, salin prompt di bagian [Mulai dengan AI](#mulai-dengan-ai) ke AI-mu.

## Konteks

Feynman Speech Coach adalah aplikasi latihan menjelaskan materi secara lisan. Ucapan user ditranskrip di laptop oleh faster-whisper dengan model `large-v3-turbo`. Aturan proyek: ASR wajib jalan lokal dan tidak boleh memakai layanan speech recognition online.

Masalahnya, model sering salah mendengar istilah Inggris di tengah kalimat bahasa Indonesia. Contoh dari rekaman pilot: "output layer" jadi "octave layer", "weight" jadi "width", dan "label" jadi "lambe".

Fine-tuning diwajibkan untuk tugas ini. Tujuannya membuat model lebih akurat untuk penjelasan CS yang santai dan bercampur istilah Inggris. Kita memakai LoRA: bobot asli model dibekukan, dan yang dilatih hanya adapter kecil. Datanya juga kecil, sekitar 22 menit audio dari 14 naskah. Setiap naskah dibaca satu orang, supaya model mendapat kalimat dan istilah sebanyak mungkin. Karena itu, setiap label harus benar, dan data uji harus terpisah dari data latih.

Hasil akhirnya adalah model `turbo-ft`. Model ini bisa menggantikan `large-v3-turbo` di aplikasi cukup dengan mengubah `ASR_MODEL` di `backend/config.py`. Setelah itu, model ini dibandingkan dengan model asli di tahap evaluasi.

## Istilah

| Istilah | Arti |
| --- | --- |
| Pembaca | Orang yang membaca dan merekam naskah. Ada tiga pembaca (`s01`, `s02`, `s03`). Setiap naskah dibaca satu orang, sesuai tabel pembagian naskah di langkah 0 |
| Koordinator | Orang yang menjalankan training dan memasang model. Koordinator juga pembaca, dengan ID `s01` |
| Naskah | Teks penjelasan satu topik CS, sekitar 190 kata, di `finetune/naskah/<topik>.txt` |
| Naskah hasil edit | Salinan naskah yang sudah disesuaikan dengan gaya bicara satu pembaca, `finetune/naskah/<topik>.<id>.txt` |
| Rekaman | Satu file audio berisi satu pembaca yang membaca satu naskah hasil edit |
| Potongan | Bagian pendek dari rekaman, berisi 1–3 kalimat dan paling lama 20 detik |
| Label | Teks yang benar-benar diucapkan di satu potongan, yaitu kolom `text` di `segments.csv`. Model belajar menghasilkan teks ini dari audionya |
| WER | Word error rate: jumlah kata yang salah dibagi jumlah kata di label. Makin kecil makin baik |
| LoRA, adapter | Cara fine-tuning yang hemat: bobot asli model tidak diubah, yang dilatih hanya matriks kecil tambahan yang disebut adapter |
| Data validasi | Potongan yang tidak ikut dilatih, dipakai untuk menilai model selama training |

## Isi folder

| Path | Isi |
| --- | --- |
| `finetune/naskah/<topik>.txt` | 14 naskah asli, sebagian besar dari mata kuliah Machine Learning dan Basis Data. Jangan diubah |
| `finetune/naskah/<topik>.terms.txt` | Istilah di naskah itu yang tidak boleh diganti |
| `finetune/naskah/<topik>.<id>.txt` | Naskah hasil edit tiap pembaca, dibuat di langkah 1 |
| `finetune/data/` | Rekaman, dibuat di langkah 2. Tidak di-commit |
| `finetune/data/segments/<rekaman>/` | Potongan WAV dan `segments.csv`, dibuat di langkah 3 |
| `finetune/segment.py` | Skrip pemotong, sekaligus pemeriksa (`--check`) |
| `finetune/test_segment.py` | Tes untuk skrip pemotong |
| `finetune/finetune_colab.ipynb` | Notebook training untuk Google Colab |
| `finetune/models/turbo-ft/` | Model hasil training, dibuat di langkah 7. Tidak di-commit |
| `backend/config.py` | `ASR_MODEL`, dan parameter pemotong yang namanya diawali `FT_` |

## Prinsip

Semua aturan di panduan ini berasal dari lima prinsip berikut. Kalau ada situasi yang tidak dibahas di panduan, putuskan berdasarkan prinsip ini.

1. Label harus sama persis dengan audionya. Model belajar dari pasangan audio dan teks, jadi label yang salah mengajarkan kesalahan. Kalau ragu, buang potongannya.
2. Kalimat yang dipakai untuk menguji model tidak boleh pernah dilatih. Model bisa menghafal kalimat, sehingga WER-nya terlihat lebih bagus dari kenyataan. Karena itu:
   - keempat belas topik naskah latih tidak boleh dipakai untuk naskah evaluasi,
   - naskah di `eval/naskah/` tidak boleh direkam untuk training,
   - topik `decision-tree` dan `sql-join` hanya dipakai untuk validasi.
3. Rekaman harus mirip pemakaian aplikasi: mic laptop, ruang biasa, dan gaya bicara seperti menjelaskan ke teman.
4. Istilah Inggris dipertahankan, karena istilah inilah yang mau diperbaiki pengenalannya.
5. Rekaman suara dan model tidak masuk git. Rekaman adalah data pribadi, dan model terlalu besar untuk git. Keduanya disimpan di Google Drive.

## Alur

| Langkah | Siapa | Hasil |
| --- | --- | --- |
| 0. Persiapan | Semua | Repo dan Python siap, ID pembicara sudah dibagi |
| 1. Sesuaikan naskah | Pembaca | Naskah hasil edit untuk setiap naskah bagianmu |
| 2. Rekam | Pembaca | Satu rekaman untuk setiap naskah bagianmu |
| 3. Potong | Pembaca | Folder potongan di `finetune/data/segments/` |
| 4. Cek potongan | Pembaca | `--check` menulis `siap` untuk semua rekaman |
| 5. Unggah | Pembaca | Folder potongan dan rekaman di Google Drive |
| 6. Training | Koordinator | Model `turbo-ft-<waktu>.zip` di Drive |
| 7. Pasang dan uji | Koordinator | Model jalan di laptop, siap dievaluasi |

Untuk 5 naskah, langkah 1–5 memakan waktu kira-kira 1–1,25 jam.

## 0. Persiapan

Tujuan: semua pembaca punya repo dan environment Python yang sama dengan backend. Dengan begitu, pemotong memakai model dan versi library yang sama di semua laptop.

### Pembagian naskah

| ID | Peran | Naskah |
| --- | --- | --- |
| `s01` | Koordinator dan pembaca | `k-means`, `transformer`, `precision-recall`, `transaction` |
| `s02` | Pembaca | `overfitting`, `linear-regression`, `database-index`, `sql-join`, `deadlock` |
| `s03` | Pembaca | `cnn`, `decision-tree`, `er-diagram`, `git-branch`, `hash-table` |

Nama pemilik setiap ID dikirim lewat chat tim, tidak ditulis di sini, karena repo ini publik.

### Koordinator

1. Kirim ID setiap pembaca dan link folder Drive lewat chat tim.
2. Buat folder `feynman-finetune` di Google Drive, dengan tiga subfolder: `raw`, `segments`, dan `models`.
3. Bagikan folder `feynman-finetune` ke dua pembaca lain sebagai Editor.

### Pembaca

Semua perintah dijalankan di PowerShell, dari folder root repo. Di macOS atau Linux, ganti `.\backend\.venv\Scripts\python.exe` dengan `backend/.venv/bin/python`.

1. Ambil repo, lalu pindah ke branch `feat/finetune`. Semua file fine-tuning ada di branch itu.

   Kalau belum punya repo:

   ```powershell
   git clone https://github.com/SauHin/feynman-asr.git
   cd feynman-asr
   git switch feat/finetune
   ```

   Kalau sudah punya repo:

   ```powershell
   git fetch origin
   git switch feat/finetune
   git pull
   ```

2. Buat environment Python 3.12, lalu pasang library backend.

   ```powershell
   py -3.12 -m venv backend\.venv
   .\backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
   ```

3. Jalankan tes.

   ```powershell
   .\backend\.venv\Scripts\python.exe -m pytest finetune -q
   ```

Selesai kalau: perintah tes menulis `passed` dan tidak ada `failed`.

## 1. Sesuaikan naskah (±30 menit)

Tujuan: naskah sesuai dengan cara bicara pembaca. Rekaman jadi lebih natural, dan pembaca lebih jarang salah ucap. Naskah hasil edit juga menjadi sumber label. Makin mirip dengan ucapan, makin sedikit yang perlu dikoreksi di langkah 4.

Ada 14 naskah di `finetune/naskah/`. Kerjakan hanya naskah bagianmu, sesuai tabel pembagian naskah di langkah 0.

1. Salin `<topik>.txt` jadi `<topik>.<id>.txt`. Contoh: `cnn.txt` jadi `cnn.s03.txt`.
2. Baca keras naskahmu sekali.
3. Ganti kata yang tidak biasa kamu ucapkan. Contoh: "nggak" jadi "enggak", atau "bandingin" jadi "bandingkan".
4. Jangan ganti istilah yang ada di `<topik>.terms.txt` (prinsip 4). Istilah Inggris tetap Inggris: "weight" tetap "weight", bukan "bobot".
5. Tulis angka dengan huruf: "tiga", bukan "3". Angka bisa diucapkan dengan beberapa cara, sedangkan label harus sama dengan ucapan.
6. Akhiri setiap kalimat dengan titik atau tanda tanya. Skrip pemotong hanya memotong di akhir kalimat.
7. Jangan ubah file `<topik>.txt` yang asli.

Selesai kalau: setiap naskah bagianmu punya file `<topik>.<id>.txt` dengan ID-mu.

## 2. Rekam (±20 menit)

Tujuan: menghasilkan audio yang mirip pemakaian aplikasi (prinsip 3), dengan jeda yang jelas di akhir kalimat supaya mudah dipotong.

Pengaturan:

- Pakai mic bawaan laptop, sama seperti saat memakai aplikasi.
- Rekam di ruang yang tenang. Jauhkan laptop dari kipas angin atau AC yang berisik.
- Matikan peredam bising kalau ada. Di Windows 11: Settings > System > Sound > pilih mikrofon, lalu set Audio enhancements ke Off.
- Aplikasi perekam bawaan laptop sudah cukup. Format WAV, M4A, atau MP3 bisa dipakai.

Cara merekam:

1. Rekam satu naskah hasil edit dalam satu file.
2. Diam sekitar 1 detik sebelum mulai bicara.
3. Baca dengan tempo seperti menjelaskan ke teman, jangan terlalu cepat.
4. Beri jeda singkat di akhir setiap kalimat.
5. Kalau salah ucap, diam sebentar, lalu ulangi kalimat itu dari awal. Rekaman tidak perlu diulang, dan naskah tidak perlu diubah. Potongan itu nanti diberi status `buang` di langkah 4.
6. Simpan rekaman di folder `finetune/data/` dengan nama `T_<id>_<topik>_<mic>_<lokasi>.<format>`.

| Bagian nama | Isi | Contoh |
| --- | --- | --- |
| `T` | Penanda data latih, selalu `T` | `T` |
| `<id>` | ID pembicaramu | `s03` |
| `<topik>` | Sama persis dengan nama naskah | `hash-table` |
| `<mic>` | Jenis mic | `laptop` |
| `<lokasi>` | Tempat rekaman | `kos` |

Contoh lengkap: `T_s03_hash-table_laptop_kos.wav`. Jangan pakai garis bawah `_` di dalam satu bagian nama, karena skrip memakai `_` untuk memisahkan bagian.

Selesai kalau: setiap naskah bagianmu punya satu rekaman di `finetune/data/` dengan nama sesuai format.

## 3. Potong (±10–20 menit, kebanyakan menunggu)

Tujuan: mengubah rekaman panjang jadi potongan pendek yang berlabel. Whisper hanya menerima audio sampai 30 detik. Potongan yang pendek juga mirip potongan audio yang diproses aplikasi saat streaming.

Cara kerja `segment.py`:

1. Skrip mentranskrip rekaman dengan `large-v3-turbo` dan mencatat waktu setiap kata.
2. Skrip mencocokkan kata hasil transkrip dengan kata di naskah hasil edit.
3. Skrip memotong audio di jeda antarkalimat. Setiap potongan paling lama 20 detik (`FT_MAX_SEGMENT_S`).
4. Skrip memberi status `cek` kalau WER potongan di atas 15% (`FT_FLAG_WER`), atau kalau titik potongnya tidak pasti. Potongan yang lebih dari 30 detik langsung diberi status `buang`.

Jalankan pemotong. Rekaman yang sudah pernah dipotong akan dilewati.

```powershell
.\backend\.venv\Scripts\python.exe finetune\segment.py
```

Kalau laptopmu tidak punya GPU NVIDIA, tambahkan `--device cpu`. Proses pertama juga mengunduh model sekitar 1,6 GB.

Untuk tiap rekaman, skrip menulis satu baris seperti ini:

```
T_s03_cnn_laptop_kos.wav: 9 potongan, 2 perlu dicek, 0 dibuang otomatis
```

Hasilnya ada di `finetune/data/segments/T_s03_cnn_laptop_kos/`: file `001.wav`, `002.wav`, dan seterusnya, ditambah `segments.csv`. Kalau ada baris yang diawali `gagal`, lihat tabel masalah di bagian bawah.

Selesai kalau: setiap rekaman punya folder di `finetune/data/segments/`, dan tidak ada baris `gagal`.

## 4. Cek potongan (±20 menit)

Tujuan: memastikan setiap label sama persis dengan audionya (prinsip 1). Langkah ini paling menentukan kualitas model.

Buka `segments.csv` di VS Code atau Notepad. Jangan buka dengan Excel, karena Excel bisa merusak format file.

| Kolom | Isi | Boleh diubah? |
| --- | --- | --- |
| `file` | Nama file audio potongan | Tidak |
| `status` | `ok`, `cek`, atau `buang` | Ya |
| `note` | Alasan potongan diberi status `cek` | Tidak perlu |
| `wer` | Seberapa beda transkrip ASR dari `text`. 0 berarti sama | Tidak |
| `text` | Label: kalimat yang kamu ucapkan | Ya |
| `asr_text` | Transkrip model sekarang, hanya sebagai pembanding | Tidak |
| `start`, `end` | Posisi potongan di rekaman asli, dalam detik | Tidak |

Arti status:

| Status | Arti | Dipakai untuk training? |
| --- | --- | --- |
| `ok` | Label sudah sama dengan audio | Ya |
| `cek` | Skrip menemukan kemungkinan masalah, dan potongan ini belum didengar | Tidak. Notebook berhenti kalau masih ada status ini |
| `buang` | Potongan tidak layak dipakai | Tidak |

Dengarkan semua potongan, termasuk yang statusnya `ok`. Skrip hanya bisa menandai potongan yang beda beberapa kata. Kalau bedanya hanya satu kata, statusnya tetap `ok`.

Untuk setiap potongan:

1. Putar file audionya. Klik file `.wav` di VS Code, atau double-click di File Explorer.
2. Bandingkan yang kamu dengar dengan kolom `text`, bukan dengan `asr_text`.
3. Ubah baris itu sesuai tabel ini.

| Yang kamu dengar | Yang diubah |
| --- | --- |
| Sama persis dengan `text` | Status jadi `ok` |
| Ada kata yang beda dari `text` | Perbaiki `text` sesuai yang diucapkan, lalu status jadi `ok` |
| Kata terpotong, ada kalimat yang diulang, atau tertutup suara lain | Status jadi `buang` |

Kalau `asr_text` salah tapi audionya sama dengan `text`, statusnya tetap `ok`. Kesalahan ASR seperti itulah yang mau diperbaiki dengan fine-tuning.

Aturan menulis `text`:

- Tulis persis yang diucapkan, termasuk "nah", "jadi", dan "gitu".
- Jangan tulis suara ragu seperti "eee" atau "emm".
- Tulis istilah Inggris sama seperti di file terms.
- Kalau `text` berisi koma, teksnya ada di dalam tanda kutip `"..."`. Jangan hapus tanda kutipnya.

Kalau hampir semua potongan di satu rekaman berstatus `cek`, mungkin rekaman itu dipasangkan dengan naskah yang salah. Periksa nama file dan naskahnya, lalu potong ulang:

```powershell
.\backend\.venv\Scripts\python.exe finetune\segment.py --force T_s03_cnn_laptop_kos.wav
```

`--force` menghapus hasil potong dan hasil cek lama untuk rekaman itu.

Setelah semua rekaman selesai dicek, jalankan:

```powershell
.\backend\.venv\Scripts\python.exe finetune\segment.py --check
```

Baris yang diawali `belum` menyebut potongan mana yang masih perlu dibereskan.

Selesai kalau: `--check` menulis `siap` untuk semua rekamanmu.

## 5. Unggah (±5 menit)

Tujuan: mengumpulkan potongan dari semua pembaca di satu folder yang bisa dibaca notebook Colab. Rekaman asli ikut diunggah sebagai cadangan kalau perlu dipotong ulang.

1. Unggah setiap folder di `finetune/data/segments/` ke `feynman-finetune/segments/` di Drive. Unggah foldernya utuh, bukan hanya isinya.
2. Unggah rekaman asli dan naskah hasil editmu ke `feynman-finetune/raw/<id>/`.
3. Kabari koordinator.

Jangan commit rekaman ke git (prinsip 5). Folder `finetune/data/` sudah diabaikan oleh `.gitignore`.

Selesai kalau: folder potongan dan rekaman sudah ada di Drive, dan koordinator sudah dikabari.

## 6. Training (koordinator, ±30–45 menit)

Tujuan: melatih adapter LoRA dengan potongan dari semua pembaca, lalu menghasilkan model yang bisa dibuka faster-whisper di laptop.

Cara kerja notebook:

1. Notebook membaca semua `segments.csv` dari Drive, dan berhenti kalau masih ada status `cek`.
2. Notebook memisahkan topik `decision-tree` (Machine Learning) dan `sql-join` (Basis Data) sebagai data validasi (prinsip 2). Topik lain menjadi data latih.
3. Notebook melatih adapter LoRA sampai 5 epoch, dan menghitung WER validasi setelah setiap epoch.
4. Notebook menyimpan adapter dari epoch dengan WER validasi terendah. Training berhenti sendiri kalau WER validasi tidak membaik selama 2 epoch berturut-turut.
5. Notebook menggabungkan adapter ke model, lalu mengonversinya ke format CTranslate2 untuk faster-whisper.
6. Notebook menguji model hasil konversi, lalu menyimpan model, adapter, dan log ke Drive.

Langkah:

1. Buka https://colab.research.google.com, pilih File > Upload notebook, lalu pilih `finetune/finetune_colab.ipynb`.
2. Pilih Runtime > Change runtime type > T4 GPU.
3. Pilih Runtime > Run all. Izinkan akses Google Drive saat diminta.
4. Periksa output sel-sel ini:

| Sel | Yang diperiksa |
| --- | --- |
| 3. Data | Tabel menit per pembicara dan topik tidak punya sel kosong (NaN) |
| 4. Fitur | Label pertama diawali `<\|id\|><\|transcribe\|><\|notimestamps\|>` |
| 6. Training | WER validasi di epoch 0, lalu di setiap epoch |
| 8. Uji | Transkrip satu potongan validasi masuk akal |

Hasilnya ada di `feynman-finetune/models/` di Drive:

| File | Isi |
| --- | --- |
| `turbo-ft-<waktu>.zip` | Model untuk faster-whisper |
| `turbo-ft-<waktu>-adapter/` | Adapter LoRA saja |
| `turbo-ft-<waktu>.json` | Parameter, data, WER per epoch, dan versi library. Dipakai untuk laporan |

Jangan mengulang training sambil mengubah parameter sampai angkanya bagus. Data validasinya kecil, jadi angka bagus bisa hanya kebetulan. Catat setiap run yang dijalankan.

Selesai kalau: tiga file hasil ada di Drive, dan WER validasi di epoch 0 dan di epoch terbaik sudah dicatat.

## 7. Pasang dan uji (koordinator)

Tujuan: memastikan model hasil training berjalan di laptop dengan backend yang sama dengan aplikasi.

1. Unduh `turbo-ft-<waktu>.zip` dari Drive.
2. Ekstrak isinya ke `finetune/models/turbo-ft/`. Di folder itu harus ada `model.bin`, `tokenizer.json`, dan `preprocessor_config.json`.
3. Uji model dengan rekaman pilot, lalu bandingkan dengan `large-v3-turbo`.

   ```powershell
   .\backend\.venv\Scripts\python.exe eval\pilot_compare.py eval\data\A_s01_backprop_iphone_lkc.m4a backpropagation finetune\models\turbo-ft
   ```

   Angka `large-v3-turbo` di rekaman ini: WER 12,4% dan term recall 91,1% (`docs/eksperimen/2026-10-13-pilot-model.md`). Rekaman ini suara `s01`, yang ikut dilatih, jadi angkanya hanya uji cepat dan bukan hasil evaluasi.

4. Untuk memakai model di aplikasi, ubah `ASR_MODEL` di `backend/config.py` jadi `"finetune/models/turbo-ft"`. Path ini relatif terhadap root repo, karena backend dijalankan dari sana.

Evaluasi lengkapnya membandingkan `large-v3-turbo` dengan `turbo-ft`, masing-masing tanpa dan dengan hotwords, di Set A dan Set B. Hasil Set A dari tiga pembaca (`s01` sampai `s03`) dilaporkan terpisah, karena suara mereka ikut dilatih.

Selesai kalau: perintah uji menulis WER dan term recall tanpa error.

## Masalah yang sering muncul

| Pesan atau gejala | Penyebab | Solusi |
| --- | --- | --- |
| `nama file harus T_<id>_<topik>_<mic>_<lokasi>` | Format nama rekaman salah | Ganti nama file. Jangan pakai `_` di dalam satu bagian nama |
| `topik tidak dikenal` | Ejaan topik beda dengan nama naskah | Samakan dengan nama file di `finetune/naskah/` |
| `naskah hasil edit belum ada` | Langkah 1 belum selesai, atau ID di nama file beda | Buat `<topik>.<id>.txt` dengan ID yang sama |
| `sudah dipotong` | Hasil potong rekaman itu sudah ada | Tidak perlu apa-apa. Pakai `--force` hanya kalau memang mau memotong ulang |
| `tidak ada kata yang cocok` | Rekaman dipasangkan dengan naskah yang salah, atau rekamannya kosong | Periksa topik dan ID di nama file, lalu dengarkan rekamannya |
| Error yang menyebut CUDA, cuBLAS, atau cuDNN | Laptop tanpa GPU NVIDIA, atau driver GPU bermasalah | Tambahkan `--device cpu` |
| `--check` menulis `kolom hilang` | `segments.csv` rusak, biasanya karena disimpan dengan Excel | Potong ulang rekaman itu dengan `--force`, lalu cek lagi |
| Colab: `Runtime belum GPU` | Runtime masih CPU | Pilih Runtime > Change runtime type > T4 GPU |
| Colab: `CUDA out of memory` | Batch terlalu besar untuk GPU | Ubah jadi `BATCH, ACCUM = 2, 4` di sel parameter |
| Colab: `Status belum ok/buang` | Ada pembaca yang belum menyelesaikan langkah 4 | Minta pembaca itu menyelesaikan cek, lalu unggah ulang foldernya |
| Colab: `Tidak ada segments.csv` | Folder `feynman-finetune` tidak ada di My Drive akun yang menjalankan notebook | Buat shortcut folder itu di My Drive |

## Mulai dengan AI

Salin prompt di bawah ke AI-mu, misalnya ChatGPT, Claude, atau Gemini. Isi bagian dalam kurung siku `[...]`. Setelah itu, beri AI-mu akses ke panduan ini dengan salah satu cara berikut:

- Lampirkan file `finetune/README.md`, atau tempel isinya di bawah prompt.
- Kalau AI-mu bisa membuka web, berikan link https://raw.githubusercontent.com/SauHin/feynman-asr/feat/finetune/finetune/README.md
- Kalau AI-mu bekerja langsung di repo (misalnya Claude Code atau Copilot di VS Code), minta AI membaca `finetune/README.md`.

```text
Kamu akan membimbing saya mengerjakan bagian pembaca dari panduan fine-tuning ASR proyek Feynman Speech Coach. Panduannya adalah finetune/README.md.

Tentang saya:
- ID pembicara: [s01 / s02 / s03]
- Naskah bagian saya: [tulis topiknya, sesuai tabel pembagian naskah di langkah 0]
- Sistem operasi: [Windows / macOS / Linux]
- GPU NVIDIA di laptop: [ada / tidak ada / tidak tahu]

Cara membimbing:
1. Baca seluruh panduan dulu, terutama bagian Prinsip dan Catatan untuk asisten AI. Ikuti aturan di sana.
2. Bimbing saya satu langkah per kali, dari langkah 0 sampai langkah 5. Langkah 6 dan 7 dikerjakan koordinator.
3. Di awal setiap langkah, jelaskan tujuannya dalam satu atau dua kalimat. Lalu berikan perintah atau tindakan yang harus saya lakukan.
4. Tunggu laporan saya sebelum lanjut. Pindah ke langkah berikutnya hanya kalau syarat "Selesai kalau" di panduan sudah terpenuhi.
5. Kalau saya mengirim error, minta output lengkapnya. Cocokkan dulu dengan tabel "Masalah yang sering muncul" sebelum mencari penyebab lain.
6. Di langkah 1, jangan menulis ulang naskah saya. Saya sendiri yang memilih kata yang diganti, karena naskah harus sesuai cara bicara saya.
7. Di langkah 4, kamu tidak bisa mendengar audio. Keputusan ok, perbaiki text, atau buang tetap saya yang ambil. Kamu boleh membantu membaca segments.csv dan menjelaskan baris yang membingungkan.
8. Kalau pertanyaan saya menyangkut keputusan koordinator, misalnya mengganti topik atau mengubah parameter, arahkan saya ke koordinator.

Mulai dari langkah 0.
```

## Catatan untuk asisten AI

Bagian ini untuk asisten AI yang membantu anggota tim mengerjakan panduan ini.

- Tanyakan dulu langkah mana yang sedang dikerjakan, ID pembicaranya, sistem operasinya, dan pesan error atau output perintah yang lengkap.
- Baca bagian Tujuan di langkah itu dan bagian Prinsip sebelum menyarankan sesuatu. Cara lain boleh dipakai, asal tujuan langkah dan semua prinsip tetap terpenuhi.
- Detail teknis ada di `finetune/segment.py` (pemotong), `finetune/finetune_colab.ipynb` (training), dan parameter yang namanya diawali `FT_` di `backend/config.py`.
- Kalau ragu apakah sebuah label benar, sarankan status `buang`. Kehilangan satu potongan lebih murah daripada label yang salah.
- Jangan sarankan hal-hal berikut:
  - memakai layanan speech recognition online untuk membuat atau memeriksa label
  - mengubah naskah asli atau file terms
  - merekam naskah dari `eval/naskah/`, atau memakai topik naskah latih untuk evaluasi
  - membuka atau menyimpan `segments.csv` dengan Excel
  - menjalankan `--force` pada rekaman yang sudah dicek, tanpa menyebutkan bahwa hasil ceknya akan hilang
  - mengubah status jadi `ok` tanpa mendengarkan audionya
  - meng-commit rekaman atau model ke git
- Keputusan berikut milik koordinator, jadi arahkan pertanyaannya ke koordinator: mengganti atau menambah topik, mengubah parameter `FT_` atau parameter training, dan mengulang training.
