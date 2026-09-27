# Arah visual layar live

Status: **arah A versi 2 dipakai** (2026-09-27). Versi 1 ditolak user karena terlalu kalem. Versi 2 memakai rasa aplikasi edukasi seperti Duolingo, dengan maskot Si Kapur dan papan tulis sebagai benda di ruang kelas. Batasan tetap: tidak ada font serif, tidak ada teks kapital penuh, dan tidak ada XP, streak, nyawa, atau badge. Arah B dan C disimpan sebagai catatan pilihan yang tidak dipakai. DESIGN.md ditulis dari layar live setelah selesai dibangun.

## Arah A versi 2 — Kelas Ceria dan Si Kapur (dipakai)

Papan tulis hijau berbingkai kayu tergantung di dinding kelas yang cerah. Si Kapur, batang kapur hidup, berdiri di baki kapur. Ia pergi ke baris agenda untuk mencentang konsep, bersorak saat konsep dijelaskan, dan bingung saat kamu diam terlalu lama. Mode malam adalah kelas yang sama setelah gelap: jendela menampilkan bulan dan bintang, dan lampu gantung menyala.

### Palet

| Peran | Siang | Malam |
|---|---|---|
| Dinding | `#EAF5FF` | `#152231` |
| Papan | `#245A45` | `#1F4F3C` |
| Bingkai kayu | `#C98A4B` | `#8A5A30` |
| Teks UI | `#1E2B3A` | `#EEF4FA` |
| Kapur (sama di kedua mode) | putih `#F4F7F0`, kuning `#FFE27A`, biru `#9BD8FF`, pink `#FFB3D1`, mint `#9EE8C0` | sama |
| Tombol mulai | hijau `#3CCB7F`, teks `#0E3B22` | sama |
| Tombol berhenti | coral `#FF7A6E`, teks `#3B0D0E` | sama |

Semua kapur di atas papan minimal 4,8:1. Teks tombol minimal 6:1.

### Font

- **Fredoka** untuk judul, agenda, tombol, angka, dan kalimat Si Kapur. Bentuknya bulat dan ramah, seperti aplikasi edukasi.
- **Atkinson Hyperlegible Next** untuk transkrip, supaya tetap mudah dibaca dari jarak proyektor.

### Prompt aset untuk versi yang lebih rapi

Si Kapur, dinding kelas, dan tekstur papan sekarang digambar sebagai SVG di kode. Prompt di bawah untuk membuat versi ilustrasi yang lebih rapi di Higgsfield, Gemini, atau GPT Image. Setelah gambarnya jadi, kirim ke aku untuk dipasang. Prompt setiap gambar yang dipakai akan dicatat bersama asetnya.

**K1. Lembar ekspresi Si Kapur** · 3072 × 1536 · rasio 2:1 · PNG transparan

```
Character expression sheet for an original mascot named "Si Kapur": a living
stick of classroom chalk, standing upright on two short dark legs with small
oval feet and two thin dark arms with round hands. The chalk body is a
rounded cylinder in warm off-white (#FFF6D8) with a soft yellow shade on the
right side (#F1D98C), a sky-blue paper wrapper (#9BD8FF) around the lower
third with a dashed white seam, and a worn, slightly crumbly white tip with a
few chalk-dust specks floating above it. Face: two glossy dark navy eyes
(#1E2B3A) with small white highlights, pink blush cheeks (#FFB3D1), a small
expressive mouth. Friendly, clean, flat vector style of a modern language-
learning app mascot: bold simple shapes, smooth curves, minimal soft shading,
no outlines thicker than the arms. Show the same character eight times in two
rows, same size, evenly spaced, each clearly different: (1) waving hello with
the right arm raised, (2) listening calmly with a gentle smile, (3) happy
jump with closed happy eyes, big open smile and yellow sparkles, (4) curious
with raised brows, small "o" mouth and a yellow question mark, (5) puzzled
with one brow raised and a small wobbly mouth and a blue question mark,
friendly not angry, (6) thinking with eyes looking up and three small chalk
dots above the head, (7) cheering with both arms up and sparkles, (8) proud
with a soft smile. Transparent background, no text, no labels.
```

Negative prompt: `text, letters, labels, owl, bird, green owl, existing brand mascot, realistic, 3D render, photo, gradients, heavy outlines, angry expression, weapons, extra limbs, background scene`

**K2. Si Kapur mencentang** · 1024 × 1024 · 1:1 · PNG transparan

```
The same mascot "Si Kapur" (living chalk stick, off-white body with a
sky-blue paper wrapper, dark navy eyes, pink cheeks) leaning forward at
about 25 degrees and drawing a check mark with his own chalk tip, a small
puff of white chalk dust bursting from the tip. Happy, focused expression,
tongue slightly out. Flat vector style, bold simple shapes, minimal soft
shading. Transparent background, no text.
```

Negative prompt: `text, owl, bird, realistic, 3D, photo, gradients, background, extra limbs`

**K3. Dinding kelas siang** · 2560 × 1440 · 16:9

```
Flat vector illustration of a cheerful classroom wall, seen straight on, for
the background of a learning app. Pale sky-blue wall (#EAF5FF), a light blue
chair rail and lower wall along the bottom, a round wooden wall clock at the
upper left, a pinned yellow sticky note with a small hand-drawn neural-network
doodle (circles connected by lines) below it, and at the upper right a small
wooden-framed window with a sunny sky, one white cloud and a yellow sun, plus
a warm wooden pendant lamp. Leave the whole center of the wall empty, about
80% of the width, because a large chalkboard will be placed there. Clean
shapes, soft minimal shading, modern language-learning app style.
```

Negative prompt: `chalkboard, whiteboard, desks, people, text, letters, numbers on the note, clutter, realistic photo, 3D, heavy gradients`

**K4. Dinding kelas malam** · 2560 × 1440 · 16:9

```
The same classroom wall at night, same layout and objects: deep navy wall
(#152231) and a slightly lighter navy chair rail, the wall clock, the pinned
yellow note, the wooden-framed window now showing a dark night sky with a
pale crescent moon and a few small stars, and the pendant lamp switched on
with a warm yellow bulb casting a soft round pool of warm light on the wall
at the upper right. Center of the wall left empty for a chalkboard. Flat
vector style, cozy but calm.
```

Negative prompt: `chalkboard, people, text, letters, clutter, realistic photo, 3D, neon, glow on everything`

**K5. Tekstur permukaan papan** · 2048 × 1024 · 2:1 · bisa diulang ke samping

```
Flat vector-style texture of a green classroom chalkboard surface (#245A45),
head-on and even: very soft, wide eraser smears and a faint haze of old chalk
dust, plus a few barely visible ghost scribbles of erased writing. All marks
are white at only 4 to 6 percent opacity so bright chalk text stays readable
on top. No readable text, no frame.
```

Negative prompt: `readable text, letters, numbers, equations, frame, wood, strong contrast, stains, photo realism`

---

## Arah A versi 1 — Papan Kuliah Feynman (ditolak, disimpan sebagai catatan)

Dasar dari PRODUCT.md dan jawabanmu:

- Dalam satu lirikan, user harus langsung melihat **konsep yang belum** dibahas.
- Layar dipakai malam di kos, siang di perpustakaan, dan di proyektor saat demo. Jadi setiap arah punya **mode terang dan gelap** dengan toggle.
- Hasil yang terasa salah: **seperti game** (poin, badge, streak, confetti, maskot).
- Tiga status konsep dibedakan lewat **bentuk tanda dan label**, bukan hanya warna.
- Build: code-first. Sesi ini tidak punya alat pembuat gambar, jadi aset dibuat dari prompt di bawah.

Semua pasangan teks dan latar di bawah lolos kontras WCAG AA (minimal 4,5:1).


**Tesis.** Kamu berdiri di depan papan dan memberi kuliah. Aplikasi mencatat kuliahmu dan mencentang agenda di pinggir papan.

**Kenapa cocok.** The Feynman Lectures on Physics disusun dari rekaman kuliah Feynman di Caltech. Alurnya sama dengan aplikasi ini: penjelasan lisan menjadi transkrip. Mode gelap adalah papan tulis saat kuliah berjalan. Mode terang adalah halaman buku kuliah, yaitu transkrip yang sudah dicetak.

### Palet

| Peran | Gelap (papan) | Terang (halaman buku) |
|---|---|---|
| Latar | `#1F2A25` papan hijau-hitam | `#F6F6F3` kertas putih dingin (bukan krem) |
| Panel | `#27352F` papan bekas hapusan | `#ECECE7` |
| Teks utama | `#ECEDE4` kapur putih (12,6:1) | `#1D1C1A` tinta (15,7:1) |
| Teks sekunder, partial | `#A3ADA6` debu kapur (6,4:1) | `#5F5B55` (6,2:1) |
| Aksen: rekam, tombol utama | `#F1CF5B` kapur kuning (9,8:1) | `#A8231C` merah sampul buku (6,6:1) |
| Garis | `#3A4A43` | `#D6D5CF` |

Strategi warna: restrained. Aksen hanya dipakai untuk status rekam dan tombol utama.

### Font

- **Atkinson Hyperlegible Next** untuk semua teks: label, checklist, transkrip, dan tombol. Font ini dirancang untuk keterbacaan, sehingga tetap jelas dari jarak proyektor dan dalam lirikan. Checklist dan transkrip dibedakan lewat ukuran dan ketebalan, bukan lewat font lain.
- **Atkinson Hyperlegible Mono** untuk angka yang terus berubah: timer, latency, kata/menit, dan anotasi waktu seperti `<jeda 4,0 dtk>`. Lebar angkanya tetap, jadi angka tidak bergoyang.
- Tidak ada font serif (permintaan user).
- Semua teks memakai huruf kalimat biasa, tanpa kapital penuh. Penekanan dibuat lewat ukuran dan ketebalan.
- Tulisan tangan kapur hanya ada di tanda (kotak, garis miring, centang, garis bawah), tidak pernah di teks.

### Tanda status konsep

| Status | Tanda | Perlakuan |
|---|---|---|
| Belum | kotak kosong □ | Teks paling terang dan tebal, karena inilah yang harus dilirik |
| Disebut | garis miring di kotak | Teks normal |
| Dijelaskan | centang ✓ | Teks meredup ke warna debu kapur |

### Sketsa layout (laptop 1366 × 768)

```
+----------------------------------------------------------------------+
| Backpropagation               (o) Merekam 01:24   latency 0,6 dtk  [☀/☾] |
+-----------------------+----------------------------------------------+
| Agenda                | Oke, jadi eee backpropagation itu algoritma  |
|                       | buat melatih neural network. Pertama ada     |
| [ ] Gradient descent  | forward pass, input masuk ke network ...     |
| [ ] Learning rate     |                                              |
| [/] Chain rule        | <jeda 4,0 dtk> kita pakai chain rule buat    |
| [v] Forward pass      | ngitung gradient. Chain rule itu turunan     |
| [v] Loss function     | fungsi gabungan ... (partial: kapur tipis)   |
|                       |                                              |
| 2 belum · 1 disebut   |                                              |
+-----------------------+----------------------------------------------+
| 0:00 ----|----|--    (jeda)    --|----|----·--   89 kpm · filler 9  [ Berhenti ] |
+----------------------------------------------------------------------+
```

Urutan agenda tidak pernah berubah selama sesi, supaya posisi konsep tidak melompat. (Sketsa di atas hanya contoh susunan, bukan urutan yang diputuskan.)

### Panduan dalam aplikasi

Sebelum Start, area transkrip berisi tiga langkah yang "ditulis di papan":

1. Izinkan mikrofon.
2. Jelaskan topikmu seolah ke teman yang belum paham.
3. Lirik agenda di kiri: □ belum, garis miring = disebut, ✓ dijelaskan.

Di bawahnya ada satu baris: "Audio diproses di laptop ini. Setelah selesai, teks transkrip dikirim ke Gemini untuk feedback." Tombol Mulai ada di tengah.

### Interaksi khas

Saat status konsep berubah, tanda kapurnya tergambar sendiri dalam satu goresan (sekitar 250 ms). Istilah yang sama di transkrip ikut mendapat garis bawah kapur.

### Peningkatan dari challenger yang ditolak

Kelima challenger yang ditolak tetap menyumbang satu disiplin ke arah ini:

- **Dari osiloskop:** satu sumbu waktu terukur. Jeda, filler, dan event konsep digambar di strip waktu yang sama di bawah layar.
- **Dari identitas generatif:** satu state menggerakkan semua tanda. Tanda di agenda dan garis bawah di transkrip selalu berasal dari state yang sama.
- **Dari katalog doujin:** tanda terasa dibuat tangan di atas teks cetak. Tanda digambar saat status berubah, bukan muncul begitu saja.
- **Dari badai huruf:** kata yang sedang berubah hanya punya satu perlakuan. Partial ditulis dengan kapur tipis, lalu mengendap menjadi confirmed tanpa berkedip.
- **Dari kolom tensegrity:** anotasi menempel di titik kejadian. Jeda panjang ditandai langsung di transkrip, misalnya `<jeda 4,0 dtk>`.

### Risiko jujur

- Papan gelap di proyektor dalam kelas yang terang bisa pudar. Untuk demo, pakai mode terang.
- Tema "Feynman + papan tulis" adalah bacaan paling harfiah dari nama produk. Tema ini jadi murahan kalau font kapur dipakai untuk teks atau teksturnya terlalu ramai.

### Aset dan prompt

Semua prompt dalam bahasa Inggris, karena model gambar umumnya lebih patuh pada prompt bahasa Inggris. Prompt ini bisa dipakai di Higgsfield, Gemini, atau GPT Image.

**A1. Tekstur papan (mode gelap)** · 2048 × 2048 · rasio 1:1 · PNG/WebP yang bisa diulang (tileable)

```
Seamless tileable texture of a well-used matte slate-green school chalkboard,
photographed perfectly flat and head-on under even, diffuse light. No frame,
no chalk tray, no perspective. Very faint, low-contrast eraser swirls and a
thin haze of chalk dust over fine mineral grain. Base color #1F2A25; all
variation stays within about 4% lightness of the base so white text laid on
top keeps high contrast. Edges wrap seamlessly on all four sides.
Photographic realism, 2048x2048.
```

Negative prompt: `text, letters, numbers, equations, drawings, frame, wood border, chalk tray, vignette, perspective, bright smudges, high-contrast streaks, people, hands`

**A2. Tekstur kertas (mode terang)** · 2048 × 2048 · 1:1 · tileable

```
Seamless tileable texture of smooth uncoated book paper from a mid-century
university physics textbook, cool neutral white #F6F6F3, not cream and not
yellow. Extremely subtle, even fiber grain, flat shadowless lighting, scanned
head-on. Edges wrap seamlessly on all four sides. 2048x2048.
```

Negative prompt: `cream, yellow, beige, aged paper, stains, foxing, folds, creases, vignette, printed text, shadows`

**A3. Lembar referensi tanda kapur** · 3000 × 800 · rasio 15:4 · hanya referensi

```
A reference sheet of five hand-drawn chalk marks on a flat slate-green
chalkboard background #1F2A25, arranged in a single row with generous equal
spacing: (1) an empty square box, (2) a square box with one diagonal slash
inside, (3) a square box with a quick check mark inside, (4) a short straight
underline, (5) a loose circle. Each mark is one confident stroke of white
chalk with slightly broken, dusty edges and a consistent stroke width of about
6% of the mark's height. Top-down scan, even light, nothing else on the board.
```

Negative prompt: `text, letters, numbers, labels, perspective, shadows, colored chalk, frame`

Catatan: gambar ini dipakai sebagai acuan untuk menggambar ulang tanda sebagai path SVG. Tanda SVG bisa dianimasikan goresannya. Raster kapur tidak bisa.

**A4. Ilustrasi panduan pembuka** · 1920 × 1080 · 16:9

```
Chalk line drawing on a slate-green chalkboard (#1F2A25), flat and head-on.
A university student stands at the left third, one hand gesturing, explaining
out loud to an empty chair. Three short curved chalk lines leave the mouth and
turn into loose handwritten-looking scribble lines on the board (abstract
strokes, not readable words). On the right, a short list of three small
square boxes; the top box is ticked in yellow chalk (#F1CF5B), the others are
white and empty. Simple, warm, confident white chalk strokes, lots of empty
board around the drawing, no background clutter.
```

Negative prompt: `readable text, letters, equations, cartoon mascot, cute style, emoji, 3D render, gradients, glow, photo of a real person, badges, stars, trophies, confetti, game UI`

Versi mode terang: ganti kalimat pertama menjadi `Black ink line drawing on smooth cool-white paper (#F6F6F3), in the style of a figure in a 1960s physics textbook`, dan ganti kapur kuning dengan tinta merah `#A8231C`.

**A5. Ikon aplikasi** · 1024 × 1024 · 1:1

```
App icon on a rounded square of slate-green chalkboard (#1F2A25): a single
short stick of white chalk lying diagonally, and beside it one bold chalk
check mark in yellow chalk (#F1CF5B). Flat, minimal, centered, generous
padding, must stay readable at 32x32 pixels.
```

Negative prompt: `text, letters, glossy gradient, 3D bevel, glow, drop shadow, extra objects`

---

## Arah B — Lembar Jawaban Komputer (pilihan Impeccable)

**Tesis.** Setiap konsep adalah satu nomor di LJK. Baris yang bulatannya masih kosong adalah soal yang belum kamu jawab.

**Kenapa cocok.** Hampir semua mahasiswa Indonesia pernah mengisi LJK. Tatanan LJK sudah punya aturan status yang tidak bergantung warna: bulatan kosong, bulatan terisi, dan kotak petunjuk pengisian. Kotak petunjuk itu bisa langsung menjadi panduan dalam aplikasi.

### Palet

| Peran | Terang (kertas LJK) | Gelap (karbon) |
|---|---|---|
| Latar | `#FFFFFF` kertas | `#151518` karbon |
| Panel, kolom isian | `#FCEEF1` isian bertinta | `#1E1E23` |
| Tinta formulir: garis, label, bulatan kosong | `#C22D4B` merah LJK (5,6:1) | `#F07892` (6,8:1) |
| Isian pensil 2B, teks utama | `#26262B` grafit (15,1:1) | `#ECECEF` (15,5:1) |
| Partial: pensil ditekan tipis | `#6E6E75` (5,1:1) | `#9B9BA3` (6,6:1) |
| Tanda waktu (timing mark) | `#111111` | `#F5F5F5` |

Strategi warna: committed. Tinta merah formulir memegang struktur seluruh layar, sedangkan grafit hanya dipakai untuk "jawaban" user.

### Font

- **Archivo** dengan lebar semi-condensed, huruf kapital, untuk label formulir (TOPIK, WAKTU, KONSEP), seperti label cetak di LJK.
- **Public Sans** untuk transkrip, checklist, dan angka. Angkanya memakai tabular figures supaya timer tidak bergoyang.

### Tanda status konsep

Setiap baris konsep punya dua bulatan: **S** (disebut) dan **J** (dijelaskan).

| Status | Tanda | Perlakuan |
|---|---|---|
| Belum | kedua bulatan kosong | Nomor baris diberi penanda margin "◀ belum" |
| Disebut | bulatan S terisi | Penanda margin hilang |
| Dijelaskan | bulatan S dan J terisi | Teks tetap grafit |

### Sketsa layout (laptop 1366 × 768)

```
+-- LEMBAR JAWABAN · LATIHAN FEYNMAN ----------------------------------+
| TOPIK [ BACKPROPAGATION        ]  WAKTU [01:24]  LATENCY [0,6 dtk] [☀/☾] |
+--------------------------------+-------------------------------------+
| NO KONSEP             S   J    | URAIAN (transkrip)                  |
|  1 Forward pass       ●   ●    | ___________________________________ |
|  2 Loss function      ●   ●    | Oke, jadi eee backpropagation itu   |
|  3 Chain rule         ●   ○    | ___________________________________ |
|◀ 4 Gradient descent   ○   ○    | algoritma buat melatih neural ...   |
|◀ 5 Learning rate      ○   ○    | ___________________________________ |
|                                | <jeda 4,0 dtk> kita pakai chain ... |
| PETUNJUK: ○ belum  ● S disebut |                                     |
|           ● J dijelaskan       |                                     |
+--------------------------------+-------------------------------------+
| ▮ ▮ ▮ ▮ ▮ ▮ ▮     ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮ ▮   89 kpm · filler 9  [ BERHENTI ] |
+----------------------------------------------------------------------+
  (strip bawah: tanda waktu LJK, satu tanda per 5 detik; celah = jeda panjang)
```

### Panduan dalam aplikasi

Panduan meniru kotak "Petunjuk Pengisian" di LJK: contoh bulatan kosong, terisi S, dan terisi J, ditambah tiga langkah singkat. Sebelum Start, kotak ini tampil besar di area uraian. Setelah Start, kotak mengecil ke bawah daftar konsep sebagai legenda.

### Interaksi khas

Saat status naik, bulatan terisi dengan goresan pensil yang berputar sekali (sekitar 300 ms). Tanda waktu di strip bawah bertambah setiap 5 detik, jadi user melihat waktu berjalan tanpa harus membaca angka.

### Risiko jujur

- LJK dekat dengan suasana ujian dan bisa menambah rasa tegang.
- Mata cenderung tertarik ke bulatan yang terisi, bukan yang kosong. Penanda margin "◀ belum" wajib ada supaya baris kosong tetap paling menonjol.

### Aset dan prompt

**B1. Tekstur kertas LJK** · 2048 × 2048 · 1:1 · tileable

```
Seamless tileable texture of bright white optical-mark answer-sheet paper,
smooth lightly coated stock, pure white #FFFFFF with only a faint, uniform
paper grain. Flat shadowless scan, head-on, no printing of any kind. Edges
wrap seamlessly on all four sides. 2048x2048.
```

Negative prompt: `printed lines, bubbles, text, numbers, cream, yellow, stains, folds, shadows, vignette`

**B2. Isian pensil 2B** · 1024 × 1024 · 1:1 · PNG transparan

```
Macro top-down scan of one circle completely filled in with a soft 2B pencil,
dense dark graphite (#26262B) with a slight metallic sheen and visible
diagonal pencil stroke direction, edges slightly overshooting the circle in a
natural way. Isolated on a transparent background, even light, no paper
visible.
```

Negative prompt: `paper texture, printed circle outline, text, hand, pencil, shadow, color`

Catatan: GPT Image bisa langsung menghasilkan latar transparan. Kalau memakai Gemini atau Higgsfield, minta latar putih polos lalu hapus latarnya.

**B3. Ilustrasi kotak petunjuk** · 1600 × 900 · 16:9

```
Instructional diagram in the printed style of an Indonesian computer answer
sheet (LJK) instruction box: a hand holding a 2B pencil is filling in one
circle in a row of empty circles. Line art printed in a single red dropout
ink (#C22D4B) on white paper, with only the pencil and the filled circle in
graphite gray (#26262B). Flat, precise, printed-form look, generous margins,
no words or letters.
```

Negative prompt: `readable text, letters, numbers, cartoon, cute, 3D, gradients, photo, stars, badges, game UI`

**B4. Ikon aplikasi** · 1024 × 1024 · 1:1

```
App icon: a white rounded square with one row of three answer-sheet circles
outlined in red ink (#C22D4B); the first two circles are filled with dark
graphite pencil (#26262B), the third is empty. Flat, centered, generous
padding, readable at 32x32 pixels.
```

Negative prompt: `text, letters, glossy, 3D bevel, glow, drop shadow, extra objects`

---

## Arah C — Desktop Satu-Bit (challenger kompetitif)

**Tesis.** Layar live adalah meja kerja komputer awal: jendela Konsep, jendela Transkrip, dan jendela Indikator, semuanya hitam dan putih murni.

**Kenapa kompetitif.** Kontras hitam-putih penuh adalah pilihan paling tahan proyektor. Mode gelap cukup dengan membalik warna, yang memang bahasa asli tampilan satu-bit. Setiap status punya tepat satu tanda, seperti menu komputer lama. Arah ini kalah di identifikasi audiens, karena mahasiswa CS mengenalnya sebagai gaya retro, bukan dunia belajar mereka.

### Palet

| Peran | Terang | Gelap (dibalik) |
|---|---|---|
| Latar | `#FFFFFF` | `#000000` |
| Tinta | `#000000` (21:1) | `#FFFFFF` |
| Abu-abu | hanya lewat pola dither 12/25/50% | pola yang sama, dibalik |

Tidak ada warna lain. Status rekam memakai kotak hitam penuh yang berkedip pelan, bukan warna merah.

### Font

- **Silkscreen** (huruf pixel kapital) hanya untuk judul jendela dan menu.
- **Hanken Grotesk** untuk transkrip, checklist, dan indikator, supaya tetap terbaca di ukuran besar.

### Tanda status konsep

| Status | Tanda |
|---|---|
| Belum | kotak kosong ☐, teks tebal |
| Disebut | kotak berisi dither 50% |
| Dijelaskan | kotak dengan centang ✓, teks normal |

Partial di transkrip diberi garis bawah titik-titik. Huruf partial tidak di-dither, supaya tetap terbaca.

### Sketsa layout (laptop 1366 × 768)

```
  Sesi  Tampilan  Bantuan                     [■] Mendengarkan   01:24  [☀/☾]
+-[ KONSEP ]-----------------[x]+  +-[ TRANSKRIP — BACKPROPAGATION ]---------[x]+
| [ ] Gradient descent          |  | Oke, jadi eee backpropagation itu         |
| [ ] Learning rate             |  | algoritma buat melatih neural network.    |
| [▒] Chain rule                |  | Pertama ada forward pass, input masuk ... |
| [v] Forward pass              |  | <jeda 4,0 dtk> kita pakai chain rule buat |
| [v] Loss function             |  | ngitung gradient .......... (partial)     |
+-------------------------------+  |                                           |
+-[ INDIKATOR ]-----------------+  |                                           |
| 89 kata/menit   filler 9      |  |                                           |
| jeda panjang 1   latency 0,6  |  +-------------------------------------------+
+-------------------------------+                                  [ Berhenti ]
```

Jendela disusun tetap dan tidak bisa digeser, karena user tidak boleh sibuk mengatur jendela saat bicara.

### Panduan dalam aplikasi

Sebelum Start, muncul jendela "Selamat datang" bergaya kotak dialog komputer awal. Isinya penjelasan aplikasi dalam satu kalimat, tiga langkah, legenda tanda, dan tombol Mulai yang bergaris tebal sebagai tombol default.

### Interaksi khas

Saat status berubah, kotak tanda terbalik warnanya sekejap (sekitar 150 ms), lalu menetap di tanda barunya.

### Risiko jujur

- Huruf pixel dan dither sangat dekat dengan estetika game retro, padahal "seperti game" adalah hal yang kamu sebut terasa salah. Huruf pixel harus dibatasi ketat di judul jendela.
- Ikon pixel yang dibuat AI sering palsu (ada anti-aliasing dan abu-abu). Lebih aman digambar tangan di editor pixel seperti Piskel.

### Aset dan prompt

Pola dither dibuat di kode (CSS atau canvas), jadi tidak perlu digenerate.

**C1. Set ikon satu-bit** · 9 ikon, masing-masing 32 × 32 px, dirender 8× menjadi 256 × 256

```
Pixel-art icon set in strict 1-bit black and white: every pixel is pure black
or pure white, no anti-aliasing, no gray. Each icon sits on its own 32x32
pixel grid, drawn in the style of early 1980s desktop computer icons: a
microphone, a document with text lines, an empty checkbox, a checked
checkbox, a clock, a speech bubble, a light bulb, a sun, a crescent moon.
Arranged in a 3x3 grid on white with equal spacing, upscaled 8x with
nearest-neighbor so each pixel is a crisp square.
```

Negative prompt: `anti-aliasing, gray pixels, gradients, color, blur, 3D, game sprites, characters, text`

**C2. Ilustrasi panduan pembuka** · sumber 640 × 400, ditampilkan 4× · rasio 16:10

```
1-bit dithered illustration, black pixels on white only, with ordered Bayer
dithering for every gray tone. A university student sits at a desk with a
laptop, speaking; three stepped pixel arcs leave the mouth as sound. On the
laptop screen, a small window with a checklist of three boxes, one checked.
Chunky pixel scale, early desktop-computer illustration style, calm and
practical, no text.
```

Negative prompt: `color, gray pixels, anti-aliasing, gradients, game characters, sprites, score, HUD, hearts, stars, readable text`

**C3. Ikon aplikasi** · 1024 × 1024 · 1:1

```
App icon in strict 1-bit black and white pixel art on a 32x32 grid, upscaled
32x nearest-neighbor: a microphone inside a window frame with a title bar,
and a small check mark in the corner. No gray, no anti-aliasing, centered.
```

Negative prompt: `gray, anti-aliasing, gradient, color, glow, 3D, text`

---

## Standar kategori (pintu keluar)

Aplikasi transkripsi pada umumnya, dikerjakan serapi mungkin: latar putih, abu-abu netral, satu aksen biru `#2563EB`, font sans modern, dan gelombang suara di dekat tombol rekam. Pilihan ini tersedia kalau kamu memang ingin tampilan yang familier. Kalau kamu memilih ini, aku akan minta dua atau tiga aplikasi acuan sebagai standar kualitasnya.

## Catatan untuk semua aset

- Simpan prompt setiap gambar yang dipakai. Prompt ini akan dicatat bersama aset saat build, dan juga berguna untuk AI_LOG.md.
- Tanda status sebaiknya berupa SVG yang digambar di kode, bukan gambar raster, supaya bisa dianimasikan dan tetap tajam.
