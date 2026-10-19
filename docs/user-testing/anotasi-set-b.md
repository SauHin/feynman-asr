# Template anotasi Set B

Draf. Dasarnya PLAN 8.3 (melabeli Set B) dan PLAN 8.4 (metrik). Anotasi Set B adalah kunci jawaban untuk F, E2 (checklist), dan E7.

Set B hanya untuk evaluasi. Jangan mengubah ambang di `config.py` (misalnya `CONCEPT_MENTION_SCORE` atau `FLUENCY_PAUSE_S`) setelah melihat anotasi ini. Ambang dikalibrasi hanya dengan rekaman pilot peneliti, supaya hasil evaluasi tidak bias.

## Rekaman yang dilabeli

Labeli dulu sesi Task 2 setiap peserta. Itu menghasilkan 5–8 rekaman, sesuai target Set B. Sesi Task 3 dilabeli kalau waktunya cukup.

## File per rekaman

Semua file ada di `eval/data/`, yang tidak di-commit.

| File | Isi |
| --- | --- |
| `<file_id>.wav` | Salinan `eval/data/sesi/<id>.wav`, tanpa diubah |
| `<file_id>.ref.txt` | Transkrip verbatim |
| `<file_id>.labels.txt` | Label jeda dan filler dari Audacity |
| `<file_id>.concepts.csv` | Anotasi konsep |
| `<file_id>.terms.txt` | Daftar istilah teknis yang diucapkan |

Format `file_id` adalah `B_<speaker>_<topik>_<mic>_<lokasi>_<n>`. `speaker` adalah kode peserta dengan huruf kecil. `n` bernilai 1 untuk Task 2 dan 2 untuk Task 3. Contoh: `B_p01_regularisasi_laptop_lab_1`.

Tambahkan satu baris di `eval/data/metadata.csv`. Tambahkan juga kolom `sesi` di akhir header, supaya rekaman terhubung ke log dan feedback sesinya. Rekaman lama mengosongkan kolom ini.

```csv
file_id,set,speaker_id,topik,mic,lokasi,kondisi,durasi_s,consent,sesi
B_p01_regularisasi_laptop_lab_1,B,p01,regularisasi,laptop,lab,tenang,183,tertulis,20261018-140322-a3f9
```

## Urutan kerja

Semua label dibuat dari draf otomatis, lalu dicek sambil mendengarkan rekaman.

1. Salin WAV sesi dengan nama `file_id`, lalu isi baris metadata, termasuk kolom `sesi`.
2. Buat draf dari root repo. Run pertama mengunduh model large-v3, sekitar 3 GB.

   ```bash
   backend/.venv/Scripts/python.exe eval/draft_labels.py eval/data/B_p01_regularisasi_laptop_lab_1.wav
   ```

3. Buka WAV di Audacity. Impor `.draft.words.txt` dan `.draft.labels.txt` lewat File > Import > Labels. Setiap file menjadi satu *label track*.
4. Koreksi transkrip, label, konsep, dan istilah dengan aturan di bawah.
5. Hapus `.draft` dari nama setiap file yang sudah dicek. Contoh: `B_p01_..._1.draft.ref.txt` menjadi `B_p01_..._1.ref.txt`. `eval/metrics.py` tidak membaca file berakhiran `.draft`, jadi draf yang belum dicek tidak bisa terpakai sebagai kunci jawaban.

`draft_labels.py` tidak menimpa file yang sudah ada. Untuk membuat ulang satu draf, hapus file draf itu dulu.

Jangan membuka feedback Gemini dan checklist sesi itu sebelum anotasi konsep selesai. Hasil sistem bisa membuat anotator ikut menilai sama dengan sistem.

| Draf | Asal | Yang dicek |
| --- | --- | --- |
| `.draft.ref.txt` | Whisper large-v3 tanpa hotwords, satu segmen per baris | Semua kata |
| `.draft.words.txt` | Waktu tiap kata dari draf | Hanya alat bantu, tidak di-rename |
| `.draft.labels.txt` | Celah antarkata minimal 1,5 detik, dan kata yang cocok dengan daftar filler | Batas waktu, filler yang terlewat |
| `.draft.concepts.csv` | Konsep dari log sesi, dan waktu nama atau alias pertama kali muncul di draf | Waktu, status, catatan |
| `.draft.terms.txt` | Nama dan alias konsep | Istilah lain yang diucapkan |

Draf memakai large-v3, bukan model aplikasi, dan tanpa hotwords. Kalau draf memakai transkrip aplikasi, kesalahan sistem yang sedang dievaluasi mudah ikut diterima sebagai kunci jawaban. Model large-v3 juga bisa menimbulkan bias yang sama walau lebih kecil, jadi seluruh rekaman tetap harus didengarkan. Catat pemakaian draf ini di `AI_LOG.md`.

Sebagai gambaran, draf model medium untuk rekaman pilot backprop (bacaan 101 detik) salah 26 dari 202 kata, atau WER 12,9%. Draf large-v3 belum diukur, dan bicara spontan biasanya lebih sulit dari bacaan.

## 1. Transkrip referensi (`.ref.txt`)

Koreksi draf kata per kata sambil mendengarkan. Aturan penulisan:

- Tulis yang benar-benar diucapkan, termasuk kalimat yang diulang atau tidak selesai.
- Istilah Inggris ditulis dengan ejaan Inggris yang benar. Contoh: "weight-nya", bukan "wetnya".
- Filler vokal ditulis sesuai bunyinya: `eee`, `emm`, `hmm`. `eval/normalize.py` membuang bentuk ini dari perhitungan WER.
- Filler leksikal seperti "kayak" dan "gitu" ditulis biasa. Kata ini tetap dihitung di WER.
- Tidak perlu tanda baca khusus. Normalisasi membuang tanda baca sebelum WER dihitung.

## 2. Label jeda dan filler (`.labels.txt`)

Setiap label adalah rentang waktu dengan satu teks. Draf jeda dihitung dari waktu kata Whisper, yang tidak selalu tepat, jadi geser batasnya ke awal dan akhir hening yang sebenarnya. Whisper jarang menulis filler vokal, sehingga sebagian besar `eee` dan `emm` harus ditambahkan sendiri.

| Label | Kapan dipakai | Rentang |
| --- | --- | --- |
| `jeda` | Hening antara dua kata, minimal 1,5 detik | Dari akhir kata sebelumnya sampai awal kata berikutnya |
| `eee`, `emm`, `hmm` | Filler vokal | Selama bunyinya |
| `kayak`, `gitu`, `anu` | Filler leksikal, hanya kalau kata itu tidak membawa arti | Selama katanya |

Contoh filler leksikal: "jadi kayak... kita hitung dulu" berisi filler. Sebaliknya, "bentuknya kayak huruf S" tidak berisi filler, karena "kayak" berarti "seperti".

Aplikasi memakai ambang jeda 2,0 detik. Label dimulai dari 1,5 detik, supaya E7 juga bisa menguji ambang lain.

Ekspor label dengan menu *Export Labels* di Audacity ke `<file_id>.labels.txt`. Hasilnya berupa tiga kolom yang dipisah tab: mulai, akhir, dan label, dalam detik.

## 3. Anotasi konsep (`.concepts.csv`)

Satu baris untuk setiap konsep di daftar konsep sesi (field `concepts` pada `eval/data/sesi/<id>.json`). Draf sudah berisi `concept_id`, `name`, dan kandidat `first_mention_s`. `status` dan `catatan` selalu kosong di draf.

Kandidat waktu hanya dicari dari teks draf, dengan pencocokan persis nama dan alias. Sebutan yang salah ditranskrip, atau yang memakai istilah di luar alias, tidak muncul sebagai kandidat. Pada rekaman pilot backprop, misalnya, konsep `weight-update` tidak mendapat kandidat. Karena itu, dengarkan seluruh rekaman, dan cek waktu setiap kandidat di *label track* kata.

| Kolom | Isi |
| --- | --- |
| `concept_id` | `id` konsep dari log sesi |
| `name` | Nama konsep |
| `first_mention_s` | Detik di WAV saat konsep pertama kali selesai disebut. Kosong kalau tidak pernah disebut |
| `status` | Salah satu dari `not_covered`, `mentioned`, `explained_correct`, `explained_incorrect` |
| `catatan` | Bukti singkat, kesalahan isi, atau sebutan di luar alias |

**Kapan konsep dianggap disebut.** Pembicara mengucapkan nama konsep, salah satu aliasnya, atau istilah lain yang jelas merujuk ke konsep itu. Kalau istilahnya tidak ada di daftar alias, tulis di catatan, misalnya `di luar alias: aturan rantai`. Catatan ini memisahkan dua penyebab centang yang tidak menyala: alias yang kurang di daftar, atau ASR yang salah dengar.

**Waktu disebut** diambil dari akhir kata terakhir sebutan itu. Checklist baru bisa menyala setelah kata itu selesai diucapkan, jadi *detection delay* dihitung dari titik ini.

**Status** memakai kode yang sama dengan feedback Gemini, supaya bisa dibandingkan langsung:

| Status | Label di aplikasi | Arti |
| --- | --- | --- |
| `not_covered` | belum | Tidak disebut dan tidak dijelaskan |
| `mentioned` | disebut | Disebut, tetapi tidak dijelaskan apa itu, cara kerjanya, atau gunanya |
| `explained_correct` | jelas | Minimal satu kalimat menjelaskan apa itu, cara kerjanya, atau gunanya, tanpa kesalahan isi |
| `explained_incorrect` | masih keliru | Ada penjelasan, tetapi memuat kesalahan isi. Tulis kesalahannya di catatan |

Konsep bisa dijelaskan tanpa pernah disebut namanya. Dalam kasus itu, `first_mention_s` kosong, tetapi `status` tetap `explained_correct` atau `explained_incorrect`. Checklist live memang tidak bisa menangkap kasus ini, dan jumlahnya perlu dilaporkan.

Contoh isi (bukan data asli):

```csv
concept_id,name,first_mention_s,status,catatan
l2-regularization,L2 regularization,42.6,explained_correct,"menjelaskan penalti kuadrat bobot"
overfitting,Overfitting,18.3,mentioned,
lambda,Lambda,,not_covered,
dropout,Dropout,,explained_incorrect,"dijelaskan tanpa menyebut nama, bilang neuron dihapus permanen"
```

## 4. Daftar istilah (`.terms.txt`)

Draf berisi nama dan alias konsep. Tambahkan semua istilah teknis lain yang diucapkan di transkrip referensi. Istilah yang tidak pernah diucapkan tidak memengaruhi term recall, jadi boleh dibiarkan. Satu istilah per baris, huruf kecil, tanpa akhiran "-nya". Formatnya sama dengan `eval/naskah/backpropagation.terms.txt`. Daftar ini dipakai untuk term recall di F.

`eval/metrics.py` saat ini hanya membaca daftar istilah dari `eval/naskah/<topik>.terms.txt`. Pembacaan `<file_id>.terms.txt` ditambahkan saat skrip F dibuat.

## Cara anotasi dipakai

| Metrik (PLAN 8.4) | Dibandingkan dengan |
| --- | --- |
| Precision dan recall checklist | Konsep dengan `first_mention_s` terisi dibanding pesan `concept` di log |
| *Detection delay* | Waktu pesan `concept` di log dikurangi `first_mention_s` |
| Cakupan versi Gemini | `status` dibanding `concept_coverage` di `<id>.feedback.jsonl` |
| Precision dan recall jeda | Label `jeda` dibanding `long_pause` di pesan `fluency` |
| Precision dan recall filler | Label filler dibanding `filler_count` di pesan `fluency` |
| WER, CER, term recall | `.ref.txt` dan `.terms.txt` dibanding transkrip hasil replay |
