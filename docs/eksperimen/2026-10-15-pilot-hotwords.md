# Pilot hotwords

15 Oktober 2026 · satu rekaman, satu pembicara, dua run per kondisi. Ini pengecekan awal setelah hotwords terpasang di pipeline streaming, bukan hasil E2.

## Pertanyaan

Apakah hotwords dari daftar istilah memperbaiki pengenalan istilah teknis saat streaming, dan berapa biayanya untuk latency?

## Setup

| Item | Nilai |
| --- | --- |
| Rekaman | `eval/data/A_s01_backprop_iphone_lkc.m4a`: 101 detik, s01 membaca naskah, ada keramaian di latar |
| Hotwords | 21 istilah dari `eval/naskah/backpropagation.terms.txt`, dikirim lewat `eval/replay.py --terms` |
| Kondisi | off: `--terms --set ASR_HOTWORDS=False`. on: `--terms`. Daftar istilah yang dikirim sama, hanya hotwords yang berubah. |
| Konfigurasi lain | `large-v3-turbo`, `int8_float16`, beam 5, bahasa `id`, interval 1 detik, VAD aktif, temperature fallback bawaan faster-whisper |
| Hardware | RTX 3050 Laptop 6 GB, batas daya 63 W (mode Performance), clock GPU p50 1740–1747 MHz di semua run |
| Run | `e2-off`, `e2-off-2`, `e2-on`, `e2-on-2` di `eval/runs/` |

## Hasil

| Run | WER | CER | Term recall | Partial p50 / p90 | Confirmed p50 / p90 | RTF |
| --- | --- | --- | --- | --- | --- | --- |
| off | 15,3% | 8,7% | 36/45 (80,0%) | 1,09 / 1,65 dtk | 2,11 / 2,86 dtk | 0,61 |
| off-2 | 15,3% | 8,7% | 36/45 (80,0%) | 1,06 / 1,63 dtk | 2,12 / 2,83 dtk | 0,60 |
| on | 11,4% | 7,7% | 39/45 (86,7%) | 1,68 / 3,86 dtk | 3,10 / 5,66 dtk | 0,82 |
| on-2 | 13,4% | 8,8% | 38/45 (84,4%) | 1,43 / 3,76 dtk | 2,67 / 5,37 dtk | 0,78 |

Istilah yang jumlahnya berubah (jumlah di transkrip / di naskah):

| Istilah | off | on | on-2 |
| --- | --- | --- | --- |
| output layer | 1/2 | 2/2 | 2/2 |
| gradient | 2/3 | 3/3 | 3/3 |
| epoch | 0/2 | 2/2 | 0/2 |
| learning rate | 2/2 | 1/2 | 2/2 |

## Temuan

1. **Hotwords membantu istilah yang sering salah.** "output layer" dan "gradient" lengkap di kedua run on. "epoch" tertangkap di satu run on, padahal selalu hilang tanpa hotwords. "weight" dan "label" tetap salah di semua run.
2. **Latency naik.** RTF naik dari 0,6 ke 0,8, dan latency confirmed p90 hampir dua kali lipat, dari 2,8 ke 5,4–5,7 detik. Tanpa hotwords, inference terlama dalam satu sesi 1,07 detik. Dengan hotwords, ada lima inference 2–3,4 detik per run. Selama inference selambat itu, audio menumpuk dan kata baru tertahan.
3. **Penyebabnya temperature fallback.** Kalau hasil decoding gagal ambang kompresi atau log-probability, faster-whisper mendecode ulang dengan temperature lebih tinggi. Uji offline memakai 98 jendela audio sepanjang 2–15 detik, dengan prompt konteks 200 karakter. Fallback terjadi 18 kali tanpa hotwords dan 58 kali dengan hotwords. Total waktu decode-nya 57,1 dan 67,4 detik. Tanpa fallback, waktu decode sama: 18,0 dan 18,3 detik untuk 31 jendela 10 detik.
4. **Run dengan hotwords tidak deterministik.** Decoding ulang di temperature di atas 0 memakai sampling acak, jadi dua run on memberi WER 11,4% dan 13,4%. Run off memberi transkrip yang sama persis.
5. **Halusinasi bahasa Inggris muncul sebagai partial.** Di run on-2, partial sempat berisi "And I'll see you in the next video." Kalimat itu tidak pernah confirmed.

## Batasan

- Satu rekaman bacaan, satu pembicara, mic iPhone. Rekaman spontan bisa memberi pola fallback yang berbeda.
- 21 istilah dari naskah lebih banyak dari daftar konsep biasa di aplikasi (4–8 konsep dengan alias, sekitar 10–20 istilah).
- Rujukan masih teks naskah, belum dikoreksi sesuai ucapan sebenarnya.

## Langkah berikutnya

- Uji di E2 dua cara menekan fallback: temperature 0 saja (tanpa fallback), atau hotwords yang lebih sedikit (hanya nama konsep).
- Kunci keputusan `ASR_HOTWORDS` setelah E2 di Set A. Latency ditimbang setara dengan term recall.
