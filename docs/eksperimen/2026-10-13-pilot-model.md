# Pilot pemilihan model ASR

13 Oktober 2026 · satu rekaman, satu pembicara. Ini pilot untuk memilih model default selama Fase 1, bukan hasil E1.

## Pertanyaan

Apakah model Whisper yang sudah di-fine-tune ke bahasa Indonesia lebih baik dari Whisper pretrained untuk penjelasan CS yang bercampur istilah Inggris?

## Setup

| Item | Nilai |
| --- | --- |
| Rekaman | `eval/data/A_s01_backprop_iphone_lkc.m4a`: 101 detik, ALAC 48 kHz mono, iPhone Voice Memos |
| Kondisi | LKC BINUS Alam Sutera, ada keramaian di latar. Perkiraan kasar: RMS per 100 ms di persentil 10 sekitar -41 dB, di persentil 90 sekitar -20 dB. |
| Pembicara | s01 (Jonathan), membaca naskah |
| Naskah | `eval/naskah/backpropagation.txt` (201 kata), daftar 21 istilah di `backpropagation.terms.txt` |
| Hardware | RTX 3050 Laptop 6 GB, driver 566.24 |
| Software | Python 3.12.4, faster-whisper 1.2.1, CTranslate2 4.8.2, cuBLAS 12.9.2.10 |
| Decoding | `language="id"`, `beam_size=5`, `compute_type="int8_float16"`, `word_timestamps=True`, tanpa VAD, tanpa hotwords, offline (satu file utuh) |
| Metrik | WER dan CER setelah normalisasi minimal (huruf kecil, tanda baca dan tanda hubung jadi spasi). Term recall = jumlah kemunculan istilah di transkrip, maksimal sebanyak di naskah, dibagi kemunculan di naskah. |
| Skrip | `eval/pilot_compare.py` |

## Hasil

| Model | WER | CER | Term recall | RTF | VRAM |
| --- | --- | --- | --- | --- | --- |
| `large-v3-turbo` | **12,4%** | 6,4% | **41/45 (91,1%)** | 0,067 | 993 MB |
| `medium` | 13,4% | **6,1%** | 39/45 (86,7%) | 0,148 | 929 MB |
| `cahya/faster-whisper-medium-id` | 20,1% | 10,3% | 35/45 (77,8%) | 0,138 | 929 MB |
| `small` | 22,0% | 7,1% | 37/45 (82,2%) | 0,099 | 385 MB |

VRAM adalah selisih VRAM total GPU sebelum load model dan setelah transkripsi. RTF berasal dari satu run. Run ulang `large-v3-turbo` dengan skrip yang sama memberi RTF 0,095 dengan WER yang sama persis, jadi angka waktu satu run masih kasar.

Istilah yang kurang per model (jumlah di transkrip / di naskah):

- `large-v3-turbo`: network (2/3), output layer (1/2), label (0/1), weight (1/2).
- `medium`: backpropagation (2/3), network (2/3), layer (5/6), output layer (1/2), weight (0/2).
- `cahya/faster-whisper-medium-id`: backpropagation (2/3), network (2/3), output layer (1/2), chain rule (1/2), gradient (1/3), weight (1/2), error (0/1), epoch (0/2).
- `small`: backpropagation (2/3), output layer (1/2), loss (5/7), label (0/1), gradient descent (0/1), training (0/2).

## Temuan

1. **Fine-tune bahasa Indonesia memperburuk hasil.** Dari `medium` ke `medium-id`, WER naik dari 13,4% ke 20,1% dan term recall turun dari 86,7% ke 77,8%. Ada tiga pola kesalahan:
   - Istilah Inggris dieja ala Indonesia: "ipok demi ipok" (epoch), "gradim" dan "Gradian" (gradient), "eror" (error).
   - Kata lisan diubah jadi baku: "ngukur" menjadi "mengukur", "ngitung" menjadi "menghitung", "jelasin" menjadi "jelaskan".
   - Satu frasa hilang: "Chain rule itu intinya turunan fungsi".

   Dugaan penyebabnya: data latih model ini (Common Voice, TITML, Magic Data) berisi bahasa Indonesia baku yang dibacakan, tanpa istilah Inggris.
2. **`large-v3-turbo` paling cepat, dan akurasinya setara `medium`.** Dari 209 kata rujukan setelah normalisasi, jumlah error-nya 26 untuk turbo, 28 untuk `medium`, 42 untuk `medium-id`, dan 46 untuk `small`. Selisih 2 kata dari satu rekaman belum cukup untuk menyatakan turbo lebih akurat dari `medium`. Turbo dipilih karena RTF-nya kira-kira setengah RTF `medium`: decoder-nya hanya 4 layer, sedangkan `medium` punya 24.
3. **Turbo berhalusinasi di akhir rekaman.** Turbo menambahkan "Terima kasih." padahal kalimat itu tidak diucapkan. Kalimat itu muncul di bagian hening atau bising setelah bicara selesai. VAD di Fase 1 diharapkan mencegahnya.
4. **Beberapa istilah salah di banyak model.** "output layer" menjadi "octave layer", "outer layer", atau "aktif layer". "weight" menjadi "width", dan "label" menjadi "lambe" atau "lampu". Istilah-istilah ini kandidat uji hotwords di E2.

## Batasan

- Hanya satu rekaman dan satu pembicara, direkam dengan mic iPhone, bukan mic laptop seperti baseline E1.
- Rujukan masih berupa teks naskah. Ada sekitar 12 tempat yang ditulis sama oleh semua model tapi berbeda dari naskah. Contohnya "kesalahannya *itu* sendiri", "banyak *yang* salah", dan "gitu sih *buat* backpropagation *ini*". Kemungkinan besar pembaca memang menyimpang dari naskah di bagian itu, jadi WER absolut terlalu tinggi. Kesalahan ini menimpa semua model sama besar, sehingga urutannya tetap berlaku. Kalimat "Kalau loss-nya besar" ditulis "benar" oleh keempat model, jadi perlu dicek dengan mendengarkan rekamannya.
- Normalisasi belum menyatukan "di sini"/"disini" dan "back propagation"/"backpropagation". Selisih penulisan seperti ini ikut dihitung sebagai error, dan dua "backpropagation" yang hilang di `small` dan `medium` berasal dari sini.
- Transkripsi offline atas satu file utuh, bukan streaming. Latency streaming diukur di Fase 1 dan Fase 2.

## Keputusan

- `ASR_MODEL` di `backend/config.py` diganti dari `small` ke `large-v3-turbo` untuk pengembangan Fase 1.
- `medium` dan `cahya/faster-whisper-medium-id` tetap masuk E1, supaya efek fine-tuning bahasa Indonesia bisa diukur di Set A.

## Langkah berikutnya

- Dengarkan rekaman dan koreksi rujukan sesuai ucapan sebenarnya.
- Rekam ulang dengan mic laptop di ruangan tenang untuk baseline E1. Rekaman ini dipakai sebagai sampel kondisi bising.
- Tetapkan aturan normalisasi WER (`eval/normalize.py`).

## Lampiran: transkrip tiap model

### `large-v3-turbo`

> Oke, jadi disini saya mau jelasin backpropagation. Backpropagation itu algoritma yang dipakai buat melatih neural network. Biar networknya bisa belajar dari kesalahannya itu sendiri. Langkah pertama namanya forward pass. Input masuk ke network, terus dihitung layer demi layer sampai keluar prediksi di octave layer-nya. Nah, prediksi ini belum tentu bener. Makanya kita bandingin sama lambe pakai loss function. Loss function itu ngukur seberapa jauh prediksi kita dari jawaban yang seharusnya. Kalau loss-nya benar, berarti modelnya masih banyak yang salah. Habis itu baru masuk ke backward pass. Disini kita pakai chain rule dari kalkulus buat ngitung gradient loss-nya terhadap setiap width dan bias. Chain rule ini intinya turunan fungsi gabungan sama dengan hasil kali turunan tiap bagiannya. Jadi error-nya dirambatkan mundur dari output layer balik ke hidden layer. Sampai ke layer paling awal. Gradient itu nunjukin arah di mana loss naik paling cepat. Jadi weight-nya bisa kita geser ke arah sebaliknya supaya loss-nya turun. Cara update ini namanya gradient descent. Seberapa besar langkahnya diatur sama learning rate. Kalau learning rate-nya itu terlalu besar, training-nya bisa loncat-loncat. Dan jadinya nggak konvergen. Kalau terlalu kecil, training-nya jadi lama banget. Terus proses ini diulang terus juga, epoch demi epoch, sampai loss-nya cukup kecil. Ya kurang lebih gitu sih buat backpropagation ini. Terima kasih.

### `medium`

> Oke, jadi disini saya mau jelasin backpropagation. Backpropagation itu algoritma yang dipakai buat melatih neural network. Biar networknya bisa belajar dari kesalahannya itu sendiri. Langkah pertama namanya forward pass. Input masuk ke network, terus dihitung layer demi layer sampai keluar prediksi di outer layernya. Nah, prediksi ini bentuknya benar. Makanya kita bandingin sama label pakai loss function. Loss function itu ngukur seberapa jauh prediksi kita dari jawaban yang seharusnya. Kalau loss-nya benar, berarti modelnya masih banyak yang salah. Habis itu baru masuk ke backward pass. Disini kita pakai chain rule dari kalkulus buat ngitung gradient loss-nya terhadap setiap width dan bias. Chain rule ini intinya turunan fungsi gabungan sama dengan hasil kali turunan tiap bagiannya. Jadi error-nya dirambatkan mundur dari output layer balik ke hidden layer sampai ke layer paling awal. Gradient itu nunjukin arah di mana loss naik paling cepat. Jadi width-nya bisa kita geser ke arah sebaliknya supaya loss-nya turun. Cara update ini namanya gradient descent. Seberapa besar langkahnya diatur sama learning rate. Kalau learning rate-nya itu terlalu besar, training-nya bisa loncat-loncat dan jadinya nggak convergen. Kalau terlalu kecil, training-nya jadi lama banget. Terus proses ini diulang terus juga, epoch demi epoch, sampai loss-nya cukup kecil. Ya, kurang lebih gitu sih buat back propagation ini.

### `cahya/faster-whisper-medium-id`

> Oke, jadi di sini saya mau jelaskan backpropagation. Backpropagation itu algoritma yang dipakai buat melatih neural network, biar networknya bisa belajar dari kesalahannya itu sendiri. Langkah pertama namanya forward pass, input masuk ke Network, terus dihitung layer demi layer sampai keluar prediksi di aktif layer-nya. Prediksi ini bentuk itu benar, makanya kita bandingin sama label pakai loss function. Loss function itu mengukur seberapa jauh prediksi kita dari jawaban yang seharusnya. Kalau loss-nya benar, berarti modelnya masih banyak yang salah. Abis itu, baru masuk ke backward pass, disini kita pakai chain rule dari Calculus buat menghitung gradim loss-nya terhadap setiap width dan bias. Gabungan sama dengan hasil kali turunan tiap bagiannya, jadi erornya dirambatkan mundur dari output-layer balik ke hidden-layer sampai ke layer paling awal. Gradian itu menunjukin arah di mana loss naik paling cepat, jadi weight-nya bisa kita geser ke arah sebaliknya supaya loss-nya turun. cara update ini namanya gradient descent, seberapa besar langkanya diatur sama learning rate, kalau learning rate-nya terlalu besar, training-nya bisa loncat-loncat, dan jadinya nggak konvergen. Kalau terlalu kecil, training-nya jadi lama banget. Terus, proses ini diulang terus juga, ipok demi ipok, sampai loss-nya cukup lama. Ya, kurang lebih gitu sih buat back-propagation ini.

### `small`

> Oke, jadi disini saya mau jelasin backpropagation. Backpropagation itu algoritma yang dipakai untuk melatih neural network. Biar network-nya bisa belajar dari kesalahannya itu sendiri. Langkah pertama namanya Forward Pass. Input masuk ke network, terus di hitung layer demi layer sampai keluar pediksi di octave layer-nya. Nah, pediksi ini belum itu benar. Makanya kita bandingin sama lampu pakai loss function. Loss function itu ngukur seberapa jauh pediksi kita dari jawaban yang seharusnya. Kalau loss-nya benar, berarti model-nya masih banyak yang salah. Habis itu baru masuk ke backward pass. Disini kita pakai chain rule dari kalkulus buat mengitung gradient loss-nya terhadap setiap weight dan bias. Chain rule ini intinya turunan fungsi gabungan sama dengan hasil kali turunan tiap bagiannya. Jadi error-nya dirambatkan mundur dari output layer balik ke hidden layer sampai ke layer paling awal. Gradient itu nunjukkan arah di mana loss naik paling cepat. Jadi weight-nya bisa kita geser ke arah sebaliknya supaya lossnya turun. Cara update ini namanya gradient design. Seberapa besar langkahnya diatur sama learning rate. Kalau learning rate-nya itu kalau besar, trainingnya bisa lancat-lancat dan jadi yang ga-convergen. Kalau terlalu kecil, trainingnya jadi lama banget. Terus proses ini diulang terus juga, epoch demi epoch, sampai lossnya cukup kecil. Ya kurang lebih gitu sih buat back propagation ini.
