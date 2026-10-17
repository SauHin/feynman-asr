# Uji hotwords dan temperature

17 Oktober 2026 · 5 rekaman s01, satu run per kondisi. Ini uji pengembangan untuk memilih nilai awal sebelum user testing, bukan hasil E2.

## Pertanyaan

[Pilot hotwords](2026-10-15-pilot-hotwords.md) menemukan bahwa hotwords menaikkan term recall, tapi latency confirmed p90 hampir dua kali lipat karena temperature fallback. Apakah membatasi fallback mempertahankan kenaikan term recall tanpa biaya latency?

## Setup

| Item | Nilai |
| --- | --- |
| Rekaman | 4 rekaman Set T s01 (k-means, precision-recall, transaction, transformer), masing-masing 111–127 detik, mic laptop, di kos, dan `A_s01_backprop_iphone_lkc` (101 detik). Total 9,6 menit. |
| Rujukan | Naskah yang disesuaikan pembaca (`finetune/naskah/<topik>.s01.txt`), disalin ke `eval/data/<file_id>.ref.txt`. Untuk backprop: `eval/naskah/backpropagation.txt`. |
| Hotwords | `--terms`, dari daftar istilah tiap naskah. Daftar Set T disalin sementara dari `finetune/naskah/` ke `eval/naskah/`. |
| Kondisi | Hotwords mati atau nyala, dikali `ASR_TEMPERATURE` bawaan faster-whisper (0,0–1,0), 0,0 saja, atau 0,0 lalu 0,2 |
| Konfigurasi lain | `large-v3-turbo`, `int8_float16`, beam 5, bahasa `id`, interval 1 detik, VAD aktif |
| Hardware | RTX 3050 Laptop 6 GB, batas daya 63 W (mode Performance), clock GPU p50 1740–1747 MHz |

**Batas pemakaian data.** Set T adalah data latih fine-tuning dan tidak boleh dipakai untuk angka evaluasi di laporan (PLAN 8.3). Angka di sini hanya untuk memilih nilai awal konfigurasi. `turbo-ft` tidak boleh diuji dengan rekaman ini.

## Hasil

| Kondisi | WER | Term recall | Confirmed p50 / p90 | RTF | Sisipan |
| --- | --- | --- | --- | --- | --- |
| Hotwords mati | 9,2% | 161/202 (79,7%) | 2,05 / 2,68 dtk | 0,58 | 9 |
| Hotwords mati, temperature 0 | 9,2% | 161/202 (79,7%) | 2,05 / 2,66 dtk | 0,59 | 9 |
| Hotwords, fallback bawaan | 7,8% | 181/202 (89,6%) | 2,37 / 5,09 dtk | 0,77 | 18 |
| Hotwords, temperature 0 | 8,8% | 182/202 (90,1%) | 2,13 / 2,80 dtk | 0,66 | 28 |
| **Hotwords, 0,0 lalu 0,2** | **8,1%** | **182/202 (90,1%)** | **2,20 / 3,24 dtk** | **0,70** | **23** |

Per rekaman (WER, istilah benar, confirmed p90):

| Rekaman | Hotwords mati | Fallback bawaan | Temperature 0 |
| --- | --- | --- | --- |
| A_s01 backprop | 15,3%, 36/45, 2,8 dtk | 11,4%, 42/45, 4,3 dtk | 12,9%, 38/45, 2,7 dtk |
| k-means | 3,9%, 26/29, 2,6 dtk | 4,4%, 26/29, 2,5 dtk | 4,4%, 26/29, 2,5 dtk |
| precision-recall | 9,8%, 33/47, 2,7 dtk | 6,2%, 41/47, 5,1 dtk | 12,4%, 41/47, 2,8 dtk |
| transaction | 9,7%, 22/32, 2,6 dtk | 11,2%, 24/32, 5,5 dtk | 8,7%, 30/32, 3,5 dtk |
| transformer | 7,0%, 44/49, 2,6 dtk | 5,4%, 48/49, 9,0 dtk | 5,4%, 47/49, 2,7 dtk |

## Temuan

1. **Tanpa hotwords, temperature tidak berpengaruh.** Hasil hotwords mati sama persis untuk fallback bawaan dan temperature 0. Fallback hampir tidak pernah terjadi tanpa hotwords.
2. **Hotwords menaikkan term recall sekitar 10 poin di semua kondisi temperature.** Substitusi turun dari 74 ke 51–55 kata. Kenaikan terjadi di 4 dari 5 rekaman, dan di k-means tidak berubah.
3. **Fallback bawaan membuat latency tidak stabil.** Confirmed p90 sampai 9,0 detik di transformer.
4. **Tanpa fallback, halusinasi lolos.** Dengan hotwords dan temperature 0, sisipan naik dari 9 ke 28 kata. Contohnya "and now i m going to", "thank you" tiga kali, "terima kasih", dan "positive" untuk "positif". Hotwords bahasa Inggris tampaknya mendorong model ke bahasa Inggris, dan fallback biasanya menangkap kalimat seperti ini.
5. **Satu ulangan adalah jalan tengah.** Temperature 0,0 lalu 0,2 memberi term recall sama dengan temperature 0 (90,1%), WER lebih rendah (8,1%), dan latency confirmed p90 3,24 detik, naik 0,56 detik dari tanpa hotwords. Sisipan masih 23, termasuk "thank you" tiga kali.

## Keputusan

`ASR_HOTWORDS = True` dan `ASR_TEMPERATURE = (0.0, 0.2)` sebagai nilai awal sampai E2 di Set A.

## Batasan

- Satu run per kondisi. Kondisi yang memakai sampling (fallback bawaan, dan 0,0 lalu 0,2) tidak deterministik, jadi selisih WER di bawah sekitar 1 poin belum bermakna.
- Semua rekaman berupa bacaan dari satu pembicara.
- Rujukan Set T adalah naskah yang dibaca, belum dikoreksi sesuai ucapan sebenarnya.

## Langkah berikutnya

- E2 di Set A dengan kondisi yang sama, minimal dua run untuk kondisi yang memakai sampling.
- Cari cara menekan halusinasi "thank you" dan "terima kasih", misalnya `hallucination_silence_threshold` faster-whisper. Uji di E2, bukan sekarang.
