# Kalibrasi checklist konsep

15 Oktober 2026 · kalibrasi opsi a: satu rekaman pilot s01, dua run replay. Set B tidak dipakai (PLAN 8.3). Uji tambahan 17 Oktober dengan naskah precision-recall ada di bagian [Uji tambahan](#uji-tambahan-naskah-precision-recall).

## Pertanyaan

Aturan dan ambang apa yang membuat status "dijelaskan" menyala saat konsep dijelaskan, tapi tidak menyala untuk konsep yang hanya disebut atau tidak dibahas?

## Setup

| Item | Nilai |
| --- | --- |
| Rekaman | `A_s01_backprop_iphone_lkc` (101 detik, s01 membaca naskah backpropagation) |
| Transkrip | Kata confirmed dari log replay `e2-off` (tanpa hotwords) dan `e2-on` (dengan hotwords), lihat [pilot hotwords](2026-10-15-pilot-hotwords.md) |
| Konsep | 6 konsep hasil ekstraksi Gemini untuk topik "Backpropagation" tanpa materi (`eval/naskah/backpropagation.concepts.json`) |
| Pengecoh | 6 konsep hasil ekstraksi Gemini untuk "Mencegah overfitting di neural network" (`eval/naskah/mencegah-overfitting.concepts.json`). Konsep ini satu domain tapi tidak dibahas di rekaman, jadi setiap centang "jelas" untuknya salah. |
| Label | Rentang detik saat tiap konsep dijelaskan (`eval/kalibrasi/A_s01_backprop_iphone_lkc.concepts.csv`). Draf dibuat Claude dari naskah dan timestamp transkrip. s01 perlu mengeceknya sambil mendengarkan rekaman. |
| Skrip | `eval/calibrate_concepts.py`: kata confirmed diputar ulang batch demi batch ke `ConceptTracker` yang sama dengan server |
| Penilaian | Tepat: centang pertama di dalam rentang label sampai 5 detik sesudahnya. Terlalu awal: sebelum rentang. Telat: lebih dari 5 detik sesudahnya. Terlewat: tidak pernah. |

Satu temuan dari transkrip langsung mengubah desain. Di run `e2-on`, Whisper tidak memberi tanda titik selama 49 detik pertama. Jendela "2–3 kalimat terakhir" yang dipotong di tanda baca bisa sepanjang 49 detik, jadi jendela dihitung dalam jumlah kata.

## Pilihan library embedding

| Opsi | Paket baru | Unduhan paket | Masalah |
| --- | --- | --- | --- |
| sentence-transformers 6.1.0 | torch, transformers, scipy, scikit-learn | ±182 MB (torch 124 MB) | Butuh `huggingface-hub<2.0`, venv punya 2.2.0 dari faster-whisper |
| fastembed 0.9.0 | fastembed, loguru, mmh3, dan lainnya | kecil | Juga butuh `huggingface-hub<2.0` |
| onnxruntime + tokenizers | tidak ada | 0 MB | Mean pooling ditulis sendiri |

Dipilih onnxruntime + tokenizers, yang sudah terpasang sebagai dependensi faster-whisper. Model `paraphrase-multilingual-MiniLM-L12-v2`, file `onnx/model_quint8_avx2.onnx` (118 MB, versi fp32 470 MB). Satu jendela butuh 7,9 ms di CPU dengan thread default, atau 18,5 ms dengan satu thread.

## Desain yang dicoba

Semua angka dari 2 run × 12 konsep (6 dibahas, 6 pengecoh).

| Desain | Hasil |
| --- | --- |
| Jendela 30 kata vs deskripsi saja, tanpa syarat apa pun | Tidak ada ambang yang bebas centang salah. Pengecoh mencapai 0,63, dan "weight-update" lebih mirip sebelum dijelaskan (0,70) daripada saat dijelaskan (0,65). Konsep yang benar jadi yang paling mirip hanya di 20 dari 57 jendela berlabel. |
| Embedding "nama: deskripsi" | Konsep yang benar paling mirip di 45 dari 57 jendela. `multilingual-e5-small` mendapat 38 dari 57 (43 dengan nama), dengan selisih skor antarkonsep hanya sekitar 0,03. |
| "Nama: deskripsi" + harus disebut dulu, jendela 30 kata | Ambang 0,600–0,650: 8 tepat, 0 terlalu awal, 4 terlewat, 0 salah. Jendela 20 kata: rentang 0,575–0,650 dengan hasil sama dan delay median 6,3 detik. Jendela 40 kata masih terlalu awal sampai 0,625. |
| Uji sebut nama saja pada desain di atas | Gagal. Kalimat seperti "terus ada juga yang namanya learning rate tapi itu nanti aja deh dijelasinnya" mendapat 0,68 di awal sesi dan sampai 0,71 di tengah sesi. Konsep yang cuma disebut jadi tercentang "jelas". |
| Nama konsep dihapus dari jendela | Ditolak. Paling baik 6 tepat dan 2 telat (ambang 0,55). Nama ternyata membawa sinyal yang dibutuhkan. |
| **Jendela hanya kata sesudah penyebutan pertama, maksimal 20 kata** | **Dipakai.** Uji sebut nama saja paling tinggi 0,26. Hasil kalibrasi di bawah. Jendela 30 kata memberi hasil terbaik yang sama di ambang 0,55. |

## Hasil desain final

| Ambang | Tepat | Terlalu awal | Telat | Terlewat | Salah (pengecoh) | Delay median |
| --- | --- | --- | --- | --- | --- | --- |
| 0,475 | 8 | 2 | 0 | 2 | 0 | 7,1 dtk |
| 0,500 | 9 | 1 | 0 | 2 | 0 | 6,9 dtk |
| 0,525 | 8 | 0 | 1 | 3 | 0 | 7,1 dtk |
| 0,550 | 8 | 0 | 1 | 3 | 0 | 7,2 dtk |
| 0,575 | 6 | 0 | 0 | 6 | 0 | 9,0 dtk |
| 0,600 | 4 | 0 | 0 | 8 | 0 | 9,9 dtk |

`CONCEPT_EXPLAIN_SIM = 0.54`, di tengah rentang 0,525–0,550 yang tidak menghasilkan centang terlalu awal maupun salah. Centang terlalu awal lebih menyesatkan daripada centang yang terlewat, karena checklist yang terlewat masih diperiksa ulang oleh Gemini setelah sesi.

Rincian di ambang 0,54:

| Konsep | Label | `e2-off` | `e2-on` |
| --- | --- | --- | --- |
| forward-pass | 14,3–23,6 | terlewat | 18,7 dtk, tepat |
| loss-function | 26,7–39,5 | 33,9 dtk, tepat | 33,9 dtk, tepat |
| chain-rule | 42,8–65,9 | 52,2 dtk, tepat | 58,9 dtk, tepat |
| gradient | 66,4–69,9 | 80,0 dtk, telat | 73,1 dtk, tepat |
| weight-update | 70,2–76,7 | terlewat | terlewat |
| learning-rate | 78,0–89,5 | 83,0 dtk, tepat | 84,9 dtk, tepat |

## Temuan

1. **"weight-update" tidak pernah disebut.** Pembaca mengucapkan "weight-nya kita geser ... cara update ini", bukan "weight update" atau "pembaruan bobot". Pencocokan nama butuh istilah yang utuh, jadi konsep ini tidak bisa dijelaskan.
2. **"gradient" telat di `e2-off`.** Penjelasannya hanya satu kalimat (66–70 detik). Centangnya baru menyala di detik 80, saat kalimat tentang learning rate ("seberapa besar langkahnya") mirip dengan deskripsi gradient.
3. **Checklist tidak menambah latency yang terukur.** Replay `checklist-off` (daftar konsep di atas, hotwords mati) memberi WER 15,3%, latency confirmed p90 2,87 detik, dan RTF 0,59. Angka ini sama dengan `e2-off` (15,3%, 2,83–2,86 detik, 0,60–0,61). Pesan concept sampai 1,4–2,1 detik setelah kata pemicunya diucapkan.
4. **Replay server sama dengan skrip kalibrasi.** Waktu centang di `checklist-off` (33,9, 52,2, 80,0, 83,0 detik) sama persis dengan rincian `e2-off` di atas.

## Uji tambahan: naskah precision-recall

17 Oktober 2026. Saat s01 mencoba mic langsung dengan naskah precision-recall, status "disebut" tepat, tapi waktu centang "jelas" terasa acak. Sesi itu direproduksi dengan rekaman Set T `T_s01_precision-recall_laptop_kos` (naskah yang sama, 121 detik), run replay `t-off` dan `t-on-t02` dari [uji temperature](2026-10-17-uji-temperature.md).

| Item | Nilai |
| --- | --- |
| Konsep | 7 konsep seperti di sesi s01 (`eval/kalibrasi/precision-recall.concepts.json`): precision, recall, dan trade-off dari ekstraksi Gemini "Precision dan recall", lalu true positive, true negative, false positive, dan false negative dari ekstraksi Gemini "Confusion matrix" |
| Label | `eval/kalibrasi/T_s01_precision-recall_laptop_kos.concepts.csv`, disusun Claude dari naskah dan timestamp transkrip replay |
| Pemakaian Set T | Hanya untuk kalibrasi dan diagnosis, bukan evaluasi. Suaranya s01, jadi sesuai PLAN 8.3. |

Rincian di ambang 0,54:

| Konsep | Label | `t-off` | `t-on-t02` |
| --- | --- | --- | --- |
| precision | 66,3–83,2 | 67,8 dtk, tepat | 67,8 dtk, tepat |
| recall | 72,8–87,5 | 75,6 dtk, tepat | 18,8 dtk, terlalu awal |
| true positive | 21,5–25,3 | 75,6 dtk, telat | 75,0 dtk, telat |
| false positive | 26,5–30,8 | 47,0 dtk, telat | 47,0 dtk, telat |
| false negative | 32,0–37,5 | 53,4 dtk, telat | terlewat |
| true negative | 38,8–43,4 | 77,9 dtk, telat | terlewat |
| trade-off | 89,0–99,4 | terlewat | terlewat |

Total dua run: 3 tepat, 1 terlalu awal, 6 telat, 4 terlewat. Centang yang "telat" menyala saat kalimat tentang konsep lain, misalnya true positive saat recall dijelaskan, jadi bagi user terasa acak.

Tiga pola kegagalan:

1. **Penjelasan sebelum nama.** "Kalau email spam ditebak spam, itu true positive." Aturan sekarang hanya menilai kata sesudah nama, jadi keempat konsep confusion matrix tidak pernah dinilai dari penjelasannya sendiri.
2. **Konsep bersaudara tidak bisa dibedakan.** Deskripsi true positive dan false positive hanya beda satu kata, dan semuanya bicara soal "prediksi positif". Kalimat tentang recall atau akurasi bisa melewati ambang untuk konsep yang salah.
3. **Konsep dijelaskan tanpa namanya.** Naskah menjelaskan trade-off sebagai "dua-duanya biasanya tarik-tarikan" tanpa kata "trade-off", jadi konsep itu tidak pernah disebut.

Varian yang dicoba (subclass `ConceptTracker` sementara, tidak di-commit), dibandingkan di kedua naskah. Format: tepat / terlalu awal / telat / terlewat.

| Model | Aturan | Ambang | Backprop (12) | Precision-recall (14) | Sebut nama saja |
| --- | --- | --- | --- | --- | --- |
| MiniLM | Sekarang: kata sesudah penyebutan | 0,54 | 8 / 0 / 1 / 3 | 3 / 1 / 6 / 4 | 0,26 |
| MiniLM | + jendela 20 kata yang berakhir di nama | 0,40 | 8 / 2 / 0 / 2 | 5 / 4 / 3 / 2 | 0,69 |
| MiniLM | + jendela itu, nama dihapus | 0,40 | 8 / 2 / 0 / 2 | 3 / 4 / 5 / 2 | 0,56 |
| MiniLM | + syarat paling mirip di antara konsep sesi | 0,40–0,55 | paling baik 8 / 1 / 0 / 3 | paling baik 3 tepat | tidak diuji |
| `paraphrase-multilingual-mpnet-base-v2` (int8, 279 MB) | Sekarang | 0,625 | 5 / 2 / 0 / 5 | 2 / 2 / 6 / 4 | 0,29 |
| mpnet | + jendela yang berakhir di nama | 0,375 | 8 / 2 / 0 / 2 | 8 / 4 / 0 / 2 | 0,80 |
| mpnet | + jendela itu, nama dihapus | 0,35 | 8 / 2 / 0 / 2 | 5 / 4 / 3 / 2 | 0,63 |

Satu-satunya perbaikan berarti, yaitu mpnet dengan jendela yang berakhir di nama, membuat kalimat yang hanya menyebut nama ikut jadi "jelas" (0,80 jauh di atas ambang 0,375), dan menambah 6 centang terlalu awal.

**Keputusan:** aturan dan model tidak diubah. Centang "jelas" yang salah lebih menyesatkan daripada centang yang terlewat: user mengira sudah menjelaskan padahal belum. Centang yang terlewat masih diperiksa ulang Gemini setelah sesi, dan agenda sudah menulis "Centangnya sementara, nanti dicek ulang". Untuk pola 3, user bisa menambah alias seperti "tarik-tarikan" di layar review.

## Batasan

- Naskah backprop menyebut nama dulu baru menjelaskan, dan konsepnya cukup berbeda satu sama lain, jadi hasil kalibrasi utama terlalu optimistis. Naskah precision-recall menunjukkan bahwa "jelas" lemah untuk penjelasan sebelum nama dan untuk konsep bersaudara.
- Dua rekaman bacaan dari satu pembicara. Di bacaan, nama dan penjelasan hampir selalu ada di kalimat yang sama. Bicara spontan bisa memberi skor lebih rendah.
- Rentang ambang yang aman sempit (0,525–0,550). Ambang 0,500 sudah memberi satu centang terlalu awal.
- Hanya 12 keputusan per run. Angka tepat dan terlewat bisa berubah besar dengan satu rekaman baru.
- Daftar konsep dari satu kali ekstraksi Gemini. Deskripsi dan alias yang berbeda bisa menggeser skor.

## Langkah berikutnya

- Opsi b: rekam satu pilot spontan s01 (2–3 menit, backprop), tandai detik penjelasan tiap konsep, lalu jalankan ulang skrip ini sebelum user testing.
- Pertimbangkan meminta Gemini menambah alias berupa frasa yang sering diucapkan (misalnya "update weight") supaya konsep seperti weight-update bisa tercentang.
- E7 memakai `eval/replay.py --concepts` di Set B untuk precision, recall, dan detection delay. Hitung juga seberapa sering penjelasan datang sebelum nama di bicara spontan, karena pola itu menentukan apakah aturan ini perlu diganti.
