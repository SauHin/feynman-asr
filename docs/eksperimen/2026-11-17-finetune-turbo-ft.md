# Fine-tuning turbo-ft

17 November 2026 · satu run LoRA di Colab, `turbo-ft-20261117-1640`. Ini catatan training, bukan hasil E8. Log lengkapnya ada di [turbo-ft-20261117-1640.json](turbo-ft-20261117-1640.json).

## Setup

| Item | Nilai |
| --- | --- |
| Notebook | `finetune/finetune_colab.ipynb` di commit `1860c90`, ditambah perbaikan `torchao` di sel setup (lihat bagian Masalah selama run) |
| Data latih | 81 potongan dari 12 topik, 20,6 menit, dari tiga orang dengan empat ID (`s01` sampai `s04`). `s01` dan `s03` adalah orang yang sama dan menyumbang 14,5 menit (70%). Empat rekaman `s02` dan `s04` dilewati lewat `SKIP_RECS`, supaya setiap kalimat hanya dilatih sekali |
| Data validasi | 18 potongan, 4,8 menit: `decision-tree` (`s03`) dan `sql-join` (`s02` dan `s04`) |
| Model | `openai/whisper-large-v3-turbo`. LoRA rank 16, alpha 32, dropout 0,05, di `q_proj` dan `v_proj`. Yang dilatih 3.276.800 dari 812.154.880 parameter (0,40%) |
| Training | Learning rate 5e-4, warmup 10 step, maksimal 5 epoch, patience 2, batch 4 dengan akumulasi gradien 2, fp16, seed 0 |
| Hardware | Colab NVIDIA L4. PLAN 8.8 menyebut T4, tetapi runtime yang tersedia L4 |
| Versi | torch 2.14.1+cu130, transformers 5.22.1, peft 0.21.2, ctranslate2 4.8.2 |

## Hasil

| Epoch | Loss latih | WER validasi |
| --- | --- | --- |
| 0, tanpa fine-tuning | - | 5,6% |
| 1 | 0,354 | 6,7% |
| 2 | 0,100 | 4,3% |
| 3 | 0,057 | 4,4% |
| 4 | 0,032 | 3,8% |
| 5 | 0,013 | 4,3% |

Adapter dari epoch 4 yang disimpan, lalu digabung ke model dan dikonversi ke CTranslate2 float16. Early stopping tidak terpicu, karena epoch 5 baru epoch pertama yang tidak membaik.

Uji cepat dengan `eval/pilot_compare.py` di `A_s01_backprop_iphone_lkc` (101 detik, mic iPhone, tempat ramai). Kedua model dijalankan di laptop dengan kode yang sama.

| Model | WER | CER | Term recall | Istilah yang kurang (benar/rujukan) |
| --- | --- | --- | --- | --- |
| `large-v3-turbo` | 12,4% | 6,4% | 41/45 (91,1%) | network (2/3), output layer (1/2), label (0/1), weight (1/2) |
| `turbo-ft` | 13,4% | 6,8% | 39/45 (86,7%) | backpropagation (2/3), forward pass (0/1), output layer (1/2), weight (1/2), epoch (0/2) |

## Temuan

1. WER validasi turun 1,8 poin, dari 5,6% ke 3,8%.
2. Di epoch 5, loss latih turun ke 0,013, tetapi WER validasi naik lagi ke 4,3%. Model mulai menghafal data latih.
3. Label validasi `T_s02_sql-join_laptop_kos` potongan 001 kemungkinan berbeda dengan audionya. Label menulis "saya bahas" dan "data biasanya". `large-v3-turbo` dan `turbo-ft` sama-sama mendengar "saya mau bahas" dan "datanya biasa". Potongan ini perlu didengar ulang.
4. Di rekaman pilot, `turbo-ft` belum lebih baik. WER naik dari 12,4% ke 13,4%, dan term recall turun dari 41/45 ke 39/45. Selisihnya hanya beberapa kata di satu rekaman, jadi belum bisa disimpulkan. Hasil ini muncul walaupun suara pembicaranya mengisi 70% data latih. Mic dan ruangannya berbeda: rekaman pilot memakai iPhone di tempat ramai, sedangkan data latih memakai mic laptop di ruang tenang.
5. Ada yang membaik. "lambe" menjadi "label", dan "terima kasih" palsu di akhir rekaman hilang.
6. Ada juga yang memburuk. "epoch" menjadi "epok" dua kali, dan "forward pass" menjadi "forward test". "epoch", "forward pass", dan "backpropagation" tidak pernah muncul di label latih.
7. `turbo-ft` menulis "bener" dan "sampe", sesuai gaya label latih. Naskah rujukan menulis "benar" dan "sampai", jadi perbedaan ejaan ini ikut menaikkan WER walaupun bukan salah dengar.

## Keputusan

`ASR_MODEL` tetap `large-v3-turbo`. Penggantian model diputuskan di E8, sesuai PLAN 8.5.

## Batasan

- Data validasi hanya 18 potongan, jadi selisih WER antar-epoch masih kasar.
- Epoch terbaik dipilih dengan data validasi yang sama, jadi 3,8% cenderung terlalu bagus. Angka evaluasi model diambil dari E8 di Set A dan Set B.
- Rekaman pilot adalah suara `s01`, yang ikut dilatih. Hasil uji cepat bukan hasil evaluasi.
- Data latih hanya berasal dari tiga orang, dan 70% di antaranya dari satu orang.

## Masalah selama run

- `peft` 0.21.2 menolak `torchao` 0.10.0 bawaan Colab, dengan pesan "Found an incompatible version of torchao". Notebook tidak memakai `torchao`, jadi sel setup sekarang menghapus paket itu dengan `!pip uninstall -y -q torchao`.
- Di Drive koordinator, folder data ada di `MyDrive/01_Projects/feynman-finetune`. Karena itu, `DRIVE_DIR` diubah untuk run ini saja. Nilai bawaan di notebook tetap `MyDrive/feynman-finetune`.

## Langkah berikutnya

- Dengarkan ulang potongan 001 `T_s02_sql-join_laptop_kos`, lalu perbaiki labelnya kalau memang berbeda.
- Jalankan E8 setelah Set A dan Set B direkam: `large-v3-turbo` dan `turbo-ft`, masing-masing tanpa dan dengan hotwords.
- Di E8, pisahkan term recall untuk istilah yang ada di label latih dan yang tidak ada. Temuan 6 menunjukkan bahwa keduanya bisa berubah ke arah yang berbeda.
- Sebelum E8, tentukan apakah normalisasi WER menyamakan bentuk lisan seperti "bener" dan "benar".
