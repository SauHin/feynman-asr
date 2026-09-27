---
name: Feynman Speech Coach
description: Kelas yang terang dengan papan tulis sungguhan, tempat Si Kapur membantumu mengajar.
colors:
  wall: "#eaf5ff"
  wall-malam: "#152231"
  ink: "#1e2b3a"
  ink-malam: "#eef4fa"
  ink-2: "#56677a"
  ink-2-malam: "#a3b4c6"
  surface: "#ffffff"
  surface-malam: "#1e3044"
  line-strong: "#bccddd"
  line-strong-malam: "#0e1824"
  track: "#cfdfee"
  track-malam: "#3a5775"
  outline: "#44586c"
  outline-malam: "#0c1620"
  board: "#245a45"
  board-malam: "#1f4f3c"
  wood: "#c98a4b"
  wood-malam: "#8a5a30"
  wood-dark: "#9a6230"
  wood-dark-malam: "#633e1d"
  wood-light: "#e0a868"
  wood-light-malam: "#a87244"
  chalk: "#f4f7f0"
  chalk-dim: "#b9d3c4"
  chalk-yellow: "#ffe27a"
  chalk-blue: "#9bd8ff"
  chalk-pink: "#ffb3d1"
  chalk-mint: "#9ee8c0"
  go: "#3ccb7f"
  go-ink: "#0e3b22"
  stop: "#ff7a6e"
  stop-ink: "#3b0d0e"
  paper: "#fffdf6"
  paper-malam: "#ebe5d5"
  paper-grid: "#dcebf8"
  paper-grid-malam: "#cfdce6"
  paper-ink: "#1e2b3a"
  paper-ink-2: "#4f5f70"
  paper-margin: "#f59c92"
  mark-none: "#a9700f"
  mark-explained: "#1d8a57"
  mark-wrong: "#d23f33"
typography:
  display:
    fontFamily: "'Fredoka Variable', 'Nunito Variable', system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.1
  letter-greeting:
    fontFamily: "'Fredoka Variable', 'Nunito Variable', system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.25
  headline:
    fontFamily: "'Fredoka Variable', 'Nunito Variable', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "'Fredoka Variable', 'Nunito Variable', system-ui, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 500
    lineHeight: 1.25
  button:
    fontFamily: "'Fredoka Variable', 'Nunito Variable', system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.5
  speech:
    fontFamily: "'Fredoka Variable', 'Nunito Variable', system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.375
  body-transcript:
    fontFamily: "'Nunito Variable', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.7
  body:
    fontFamily: "'Nunito Variable', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.625
  label:
    fontFamily: "'Nunito Variable', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
rounded:
  segment: "10px"
  strip: "8px"
  focus: "12px"
  md: "16px"
  paper: "20px"
  board: "28px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "32px"
components:
  button-go:
    backgroundColor: "{colors.go}"
    textColor: "{colors.go-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0.8rem 1.6rem"
  button-stop:
    backgroundColor: "{colors.stop}"
    textColor: "{colors.stop-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0.8rem 2rem"
  button-plain:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0.8rem 1.6rem"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  theme-toggle-active:
    backgroundColor: "{colors.chalk-yellow}"
    textColor: "{colors.go-ink}"
    rounded: "{rounded.segment}"
    padding: "4px 12px"
  speech-bubble:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.speech}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  board-panel:
    backgroundColor: "{colors.board}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.md}"
    padding: "24px 28px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.65rem 0.95rem"
  answer-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 8px 8px 16px"
  paper-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.paper}"
    padding: "40px 48px"
  paper-quote:
    backgroundColor: "#ffffff"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.strip}"
    padding: "10px 16px"
  side-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px 20px 20px"
---

# Design System: Feynman Speech Coach

## Overview

**Creative North Star: "Kelas Si Kapur"**

Aplikasi ini adalah ruang kelas yang terang. Papan tulis sungguhan tergantung di dinding: bingkai kayu bergaris luar, dua panel hijau yang dipisah kayu, dan baki kapur di bawahnya. Papan adalah benda yang digambar, bukan warna latar. Di atas baki berdiri Si Kapur, sebatang kapur hidup yang mendengarkan, bertanya, dan bersorak. Saat status konsep naik, ia berjalan ke baris agenda dan mencentang kotaknya dengan tangan, lalu tanda kapur menggambar dirinya sendiri dan debu kapur mengepul.

Registernya ceria dan penuh ilustrasi, seperti aplikasi edukasi Duolingo. Tampilan kalem dan minimalis (seluruh halaman sebagai satu warna papan yang datar) sudah ditolak user karena membosankan. Semua ilustrasi, dari Si Kapur sampai tombol, memakai satu gaya stiker: garis luar satu warna setebal kira-kira 3px, isian datar, dan tepi bawah tebal dalam warna garis luar. Kepadatannya rendah: user berbicara dan hanya melirik layar, jadi satu lirikan harus cukup untuk melihat konsep mana yang belum dibahas.

Ada dua mode, Siang dan Malam, dengan tombol pilihan di bilah atas. Tema awal dipasang di `index.html` sebelum render (dari `localStorage`, lalu `prefers-color-scheme`) supaya tidak berkedip. Malam adalah kelas yang sama setelah gelap: dinding navy, jendela berganti bulan dan bintang, lampu gantung menyala. Papan, kapur, dan tombol tidak berubah.

Selain papan, kelas punya benda kedua: kertas. Beranda adalah buku catatan terbuka di dinding (kertas kotak-kotak, garis margin koral, cincin spiral di lipatan, sampul biru yang mengintip). Feedback adalah surat dari Si Kapur di selembar kertas yang disobek dari buku itu, dengan lampiran transkrip di papan. Setup adalah percakapan dengan Si Kapur di papan. Layar live tetap papan dan agenda.

**Key Characteristics:**
- Papan tulis sebagai benda berbingkai kayu di dinding kelas, bukan latar halaman.
- Satu gaya stiker untuk semua ilustrasi dan kontrol: garis luar 3px dan tepi bawah dalam warna garis luar.
- Si Kapur, maskot SVG yang mengikuti lembar referensi user, bereaksi dan mencentang agenda.
- Tiga status konsep dengan warna dan bentuk sekaligus, sama di agenda dan bar progres. Feedback menambah tanda keempat, dijelaskan keliru.
- Kertas sebagai benda kedua: tetap terang di malam hari, dengan tinta yang sama di kedua mode.
- Semua ilustrasi adalah SVG yang ditulis di kode. Tidak ada aset raster yang ikut dikirim. Favicon juga SVG.
- Progres ringan saja: bar progres konsep dan perayaan kecil.

## Colors

Dinding langit pucat dan papan hijau tua dalam bingkai kayu hangat, dengan kapur putih, kuning, biru, merah muda, dan mint sebagai aksen.

### Primary
- **Hijau Papan** (`board`, Malam `board-malam`): permukaan kedua panel papan. Semua teks di atasnya adalah kapur.
- **Kayu Bingkai** (`wood`, `wood-dark`, `wood-light`): bingkai papan dengan serat kayu, baki kapur (`wood-dark`), kilap atas bingkai (`wood-light`), dan kayu pada jam, jendela, lampu, serta list dinding.
- **Kertas Krem** (`paper`, Malam `paper-malam`): halaman buku catatan di beranda dan surat feedback. Di malam hari kertas hanya sedikit redup, seperti papan yang tetap hijau.
- **Kotak Kertas** (`paper-grid`, Malam `paper-grid-malam`): garis kotak-kotak biru pucat 1.5px setiap 26px di halaman buku catatan. Surat feedback memakai kertas polos.

### Secondary
- **Hijau Mulai** (`go`, teks `go-ink`): tombol Mulai dan Lihat feedback. Juga warna kursor teks.
- **Koral Berhenti** (`stop`, teks `stop-ink`): tombol Berhenti dan titik rekam yang menyala.

### Tertiary
- **Kapur Kuning** (`chalk-yellow`): konsep yang belum dibahas di agenda, judul panduan, segmen tema yang aktif, garis bawah istilah konsep di transkrip, dan warna seleksi teks.
- **Kapur Mint** (`chalk-mint`): tanda centang konsep yang dijelaskan dan isi bar progres di mode Malam. Di mode Siang, isi bar memakai mint yang lebih pekat (#5ccb94) supaya kontras dengan jalur yang pucat.
- **Kapur Biru** (`chalk-blue`): catatan jeda di transkrip dan cincin fokus.
- **Kapur Merah Muda** (`chalk-pink`): ilustrasi (kapur di baki, catatan tertempel, properti Si Kapur), stabilo judul bagian "Yang keliru", dan garis bergelombang di bawah filler di transkrip.
- **Tanda Pekat** (`mark-none`, `mark-explained`, `mark-wrong`): versi pekat dari kapur kuning, mint, dan koral untuk tanda status di atas kertas dan di chip mode Siang, supaya kontras dengan krem dan putih. Tanda disebut di atas kertas memakai `paper-ink`.

### Neutral
- **Dinding Langit** (`wall`, Malam `wall-malam`): latar halaman, dengan wallpaper tanda plus kecil yang warnanya sedikit lebih gelap dari dinding.
- **Tinta** (`ink`, `ink-2`): teks di luar papan. `ink-2` untuk teks sekunder seperti subjudul, label statistik, dan latensi.
- **Permukaan** (`surface`): chip, tombol biasa, gelembung bicara, dan bilah bawah.
- **Garis Luar** (`outline`, Malam `outline-malam`): satu-satunya warna garis untuk semua ilustrasi dan kontrol.
- **Jalur** (`track`): jalur kosong bar progres. `line-strong` untuk titik status yang tidak merekam dan scrollbar.
- **Kapur Putih** (`chalk`, `chalk-dim`): teks di papan. `chalk-dim` untuk catatan kecil, teks parsial, dan konsep yang sudah dijelaskan.
- **Tinta Kertas** (`paper-ink`, `paper-ink-2`): teks di atas kertas, sama di Siang dan Malam karena kertas tetap terang. `paper-ink-2` untuk label status, catatan kecil, dan salam penutup.
- **Margin Koral** (`paper-margin`): garis margin vertikal 2.5px di halaman buku catatan.

### Named Rules
**The Satu Garis Luar Rule.** Setiap benda dan kontrol memakai garis luar `outline` (Malam `outline-malam`) setebal kira-kira 3px. Ini berlaku untuk Si Kapur, papan, baki, benda kelas, chip, tombol, gelembung bicara, dan bar progres. Garis luar berwarna lain berarti benda itu belum masuk dunia ini.

**The Tiga Tanda Rule.** Status konsep selalu memakai warna dan bentuk sekaligus. Belum: kuning dengan kotak kosong (hanya di agenda). Disebut: kapur putih dengan garis miring. Dijelaskan: mint dengan centang. Bar progres memakai warna dan tanda yang sama, dan setiap lingkaran kosong punya cincin dalam supaya tetap bisa dihitung. Warna saja tidak pernah cukup.

**The Papan Selalu Hijau Rule.** Warna kapur dan tombol sama di Siang dan Malam, karena papan selalu hijau. Tema mengubah dinding, permukaan, garis luar, dan benda kelas, bukan semantik kapur.

**The Kertas Tetap Terang Rule.** Kertas adalah benda, bukan tema. Di malam hari `paper` hanya turun ke krem redup dan teks di atasnya tetap `paper-ink`, bukan `ink`. Benda yang menempel di kertas (kutipan, gelembung bicara, label istilah) berisi putih, bukan `surface`, supaya tidak berubah navy di malam hari.

**The Tanda Keempat Rule.** Feedback menambah satu tanda yang tidak ada di layar live: dijelaskan keliru, silang koral di dalam kotak. Di atas kertas keempat tanda memakai warna pekat: belum `mark-none` dengan kotak kosong, disebut `paper-ink` dengan garis miring, dijelaskan `mark-explained` dengan centang, dijelaskan keliru `mark-wrong` dengan silang. Labelnya sama dengan agenda live (belum, disebut, dijelaskan, dijelaskan keliru) dan selalu tampil sebagai teks di samping tanda, dengan legenda "Arti tanda" di bawah daftar.

## Typography

**Display Font:** Fredoka Variable (dengan Nunito Variable, system-ui)
**Body Font:** Nunito Variable (dengan system-ui)

**Character:** Fredoka yang bulat dan ramah adalah suara aplikasi dan Si Kapur. Nunito yang tenang membawa kalimat panjang, terutama kata-kata user sendiri.

### Hierarchy
- **Display** (600, 2.25rem, 1.1): judul panduan di papan ("Sebelum mulai"), dalam kapur kuning.
- **Letter greeting** (600, 2rem, 1.25): salam pembuka surat feedback. Judul halaman kiri buku catatan di beranda lebih besar (2.6rem, 3rem dari 768px, 1.05).
- **Headline** (600, 1.5rem): nama topik di bilah atas dan judul panel papan ("Agenda", "Penjelasanmu"), dengan garis kapur di bawah judul panel.
- **Title** (500, 1.45rem, 1.25): nama konsep di agenda. Konsep yang sudah dijelaskan turun ke 400 dan `chalk-dim`, supaya yang belum dibahas paling mencolok lewat warna dan kotak kosong, bukan lewat huruf tebal. Judul bagian surat memakai ukuran yang sama dengan berat 600.
- **Button** (600, 1.15rem): semua tombol. Mulai memakai 1.25rem.
- **Speech** (400, 1.05rem, 1.375): gelembung bicara Si Kapur, maksimal 26rem.
- **Body transcript** (500, 1.25rem, 1.7): transkrip di papan, maksimal 68ch.
- **Body** (500, 1.125rem, 1.625): paragraf panduan, maksimal 56ch.
- **Label** (400, 0.875rem): catatan panel, label status di samping konsep, subjudul, teks privasi di bilah bawah.

Angka yang berubah (timer, latensi, statistik) memakai `tabular-nums`.

### Named Rules
**The Huruf Kalimat Rule.** Semua teks memakai huruf kalimat biasa: judul, label, tombol, dan chip. Tidak ada teks kapital penuh dan tidak ada font serif, di mana pun. Ini batasan user.

**The Huruf Kapur Rule.** Judul di atas papan memakai filter `chalk-text` (tepi goyah dan bintik kosong) supaya terbaca sebagai tulisan kapur. Transkrip dan teks panjang tidak difilter, supaya tetap mudah dibaca.

**The Stabilo Rule.** Judul di atas kertas tidak memakai filter kapur. Penekanannya adalah stabilo warna kapur di belakang separuh bawah huruf (55% sampai 92% tinggi baris): mint untuk yang sudah bagus, kuning untuk yang perlu diperbaiki dan istilah, biru untuk cakupan dan kesederhanaan, merah muda untuk yang keliru. Stabilo selalu menempel pada judul yang terbaca, tidak pernah menjadi label kecil di atas judul.

## Layout

Satu layar penuh (`100dvh`) tanpa gulir halaman dari lebar 768px ke atas: bilah atas, dinding dengan papan, dan bilah bawah putih. Papan berada di tengah dengan lebar maksimal 68rem (80rem dari 1536px). Di dalamnya, panel agenda di kiri (36% lebar, maksimal 27rem) dan panel penjelasan di kanan mengisi sisanya, dipisah kayu 12px. Agenda dan transkrip menggulir di dalam panelnya sendiri.

- Di bawah 768px, panel bertumpuk, halaman menggulir, dan bilah bawah menempel di bawah layar. Label statistik dan label tema disembunyikan secara visual (tetap untuk pembaca layar).
- Dari 1280px, bar progres pindah ke baris bilah atas di antara judul dan pill rekam. Di bawahnya, bar mengambil baris sendiri selebar penuh.
- Hiasan dinding hanya tampil dari 1340px, saat ada dinding di samping papan. Dinding kiri hanya berisi jam, supaya ada ruang kosong untuk Si Kapur saat mencentang. Dinding kanan berisi lampu, jendela, dan catatan.
- Beranda: buku catatan terbuka selebar maksimal 64rem di tengah dinding. Dari 768px dua halaman berdampingan dengan cincin spiral di lipatan dan sampul yang mengintip. Di bawahnya halaman bertumpuk, dan spiral serta sampul hilang.
- Setup: satu papan dengan satu panel selebar layar (maksimal 68rem), percakapan di kolom tengah maksimal 46rem yang menggulir di dalam panel, dan bilah bawah putih dengan teks privasi dan tombol Mulai menjelaskan. Dari 1280px Si Kapur berdiri di baki di kiri percakapan. Di bawahnya ia muncul kecil di samping pertanyaan terbaru.
- Feedback: halaman menggulir. Surat di kiri dan kolom samping 20rem di kanan dari 1024px (bertumpuk di bawahnya), dan tombol di kolom samping menempel saat digulir. Lampiran transkrip ada di papan tersendiri di bawah surat, maksimal 68rem.
- Ritme jarak: 12px antar baris dan antar panel, 20px padding panel di layar kecil (24px x 28px di desktop), 32px tepi halaman di desktop.

## Elevation & Depth

Kedalaman datang dari tepi bawah yang tegas dan bayangan benda yang datar, bukan dari blur. Kontrol punya tepi bawah dalam warna garis luar dan turun saat ditekan. Benda kelas (jam, jendela, catatan) punya satu bayangan datar hitam 12% yang digeser ke bawah. Panel papan terasa cekung lewat bayangan dalam di tepi atas.

### Shadow Vocabulary
- **Tepi bawah tombol** (`box-shadow: 0 4px 0 var(--outline)`, saat ditekan `0 0 0` dan turun 4px): semua tombol.
- **Tepi bawah chip** (`border-bottom-width: 5px` dengan garis luar 3px): chip, pill rekam, tombol keluar, dan grup tema.
- **Bingkai papan** (`box-shadow: inset 0 3px 0 var(--wood-light), 0 6px 0 rgba(0,0,0,0.15)`): kilap kayu di atas dan bayangan datar di bawah.
- **Panel cekung** (`box-shadow: inset 0 5px 0 rgba(0,0,0,0.18)`): permukaan hijau papan.
- **Bayangan kertas** (`box-shadow: 0 6px 0 rgba(0,0,0,0.15)`): surat, halaman buku catatan yang bertumpuk, dan sampul buku.
- **Tepi bawah kartu isian** (`box-shadow: 0 4px 0 var(--outline)`; ubin langkah beranda `0 3px 0 var(--outline)`): kartu putih yang berdiri di atas papan atau kertas, seperti formulir konsep.
- **Bayangan potongan kertas** (`box-shadow: 0 3px 0 rgba(0,0,0,0.08)`, catatan tempel `0 4px 0 rgba(0,0,0,0.12)`): kutipan dan catatan yang ditempel di kertas.
- **Bayangan benda** (bentuk yang sama, isi `rgba(0,0,0,0.12)`, digeser 4 sampai 6px ke bawah): benda kelas di dinding. Bayangan Si Kapur adalah elips `rgba(0,0,0,0.2)` yang tetap di baki saat ia pergi mencentang.

### Named Rules
**The Tepi Bawah Rule.** Setiap bayangan jatuh lurus ke bawah dan tidak diblur. Tidak ada bayangan diagonal dan tidak ada bayangan lembut yang melayang. Satu-satunya cahaya lembut adalah pendar lampu di mode Malam.

## Shapes

Bentuknya bulat dan tebal seperti stiker. Radius 16px untuk tombol, chip, panel, dan gelembung bicara. Kertas (halaman buku catatan dan surat) 20px. Potongan kertas kutipan 8px. Bingkai papan 28px. Segmen tema yang aktif 10px. Pill (jeda, titik status, baki) bulat penuh. Tanda status digambar sebagai goresan kapur yang sedikit kasar (filter `chalk-rough`), bukan kotak geometris. Tanda tanya, bintang, hati, dan kilau di sekitar Si Kapur juga digambar sebagai path, bukan huruf atau emoji. Ikon adalah SVG garis dengan ujung bulat (1.8 sampai 2.6px) dalam `currentColor`.

Kertas punya detail benda sungguhan yang digambar dengan garis luar yang sama: cincin spiral (pill bergaris 3px dengan dua titik) di lipatan buku catatan, lubang spiral (lingkaran 12px, garis 2px, berisi warna dinding) di tepi atas surat, dan selotip biru (`chalk-blue` 80%, garis 2px, sedikit miring) di sudut kutipan dan di atas catatan tempel.

## Components

### Buttons
Tebal dan terasa bisa ditekan.
- **Shape:** sudut bulat (16px), garis luar 3px `outline`, tepi bawah 4px dalam warna garis luar.
- **Primary (Mulai, Lihat feedback):** `go` dengan teks `go-ink`, Fredoka 600.
- **Stop (Berhenti, Memproses…):** `stop` dengan teks `stop-ink`.
- **Plain (Ulangi dari awal):** `surface` dengan teks `ink`.
- **Hover / Active / Disabled:** hover menaikkan kecerahan 4%. Ditekan, tombol turun 4px dan tepi bawahnya hilang (80ms). Disabled menurunkan saturasi ke 40%.
- **Focus:** cincin `chalk-blue` 3px dengan jarak 3px dan radius 12px, untuk semua elemen fokus.
- **Pilihan (Unggah file, Tempel teks):** tombol biasa yang terpilih berisi `chalk-yellow` dengan teks `go-ink` dan `aria-pressed`.
- **Tombol kapur (ubah, hapus di atas papan):** kotak ikon 40px, radius 12px, garis 2px `chalk-dim` 50% tanpa isi, menjadi `chalk` saat hover. Tambah konsep adalah tombol lebar dengan garis putus-putus 2.5px `chalk-dim` 70%.
- **Tautan teks (Ganti topik, Batalkan):** Fredoka dengan garis bawah 2px berjarak 4px.

### Inputs / Fields
- **Style:** stiker seperti chip: `surface`, garis luar 3px `outline`, tepi bawah 5px, radius 16px, Nunito 500 1.125rem. Placeholder dalam `ink-2`. Label di atas isian dalam Fredoka. Isian angka memakai `tabular-nums` dan rata tengah.
- **Focus:** cincin fokus bersama.
- **Error:** pesan di bawah isian dalam `mark-wrong` tebal, dengan kalimat yang menjelaskan cara memperbaikinya. Di atas papan, pesan kesalahan memakai `chalk-yellow`.

### Navigation
- **Bilah atas (beranda, setup, feedback):** di kiri ada tanda papan kecil (sama dengan favicon) di beranda, atau tombol kembali berupa chip 44px dengan panah kiri di layar lain. Judul Fredoka 600 1.5rem dengan subjudul `ink-2` 0.875rem, lalu pilihan tema di kanan. Layar live punya bilah sendiri.

### Chips
- **Style:** `surface`, garis luar 3px, tepi bawah 5px, radius 16px. Dipakai untuk statistik (ikon, angka Fredoka 600, label), pill rekam dengan titik status dan timer, tombol keluar, dan wadah tombol tema.
- **Theme toggle:** grup radio Siang dan Malam dengan ikon matahari dan bulan. Segmen aktif berisi `chalk-yellow` dengan garis 2px `outline`. Segmen tidak aktif transparan dengan teks `ink-2`.

### Cards / Containers
- **Papan:** bingkai `wood` dengan serat kayu, radius 28px, padding 12px, berisi dua panel dan baki kapur (kapur biru, kapur merah muda, penghapus).
- **Panel:** `board`, radius 16px, garis luar 3px, dengan bekas hapusan samar di permukaannya. Judul panel memakai huruf kapur dengan garis kapur di bawahnya.
- **Kartu samping (Kelancaran, Dibanding sesi pertama):** chip besar dengan padding 16px x 20px, judul Fredoka 600 1.25rem dan catatan `ink-2`. Metrik tersusun dari ikon, label, dan angka Fredoka 600 `tabular-nums`, dengan catatan kecil di bawahnya.
- **Kartu perbandingan:** setiap konsep menampilkan tanda dan label sebelumnya, panah, lalu tanda dan label sekarang yang tebal. Pembaca layar mendengar "sebelumnya" dan "sekarang". Di bawah garis putus-putus `line-strong`, angka kelancaran lama dan baru dipisah panah. Di chip, tanda memakai warna pekat di mode Siang dan kembali ke warna kapur di mode Malam.

### Paper (buku catatan dan surat)
- **Buku catatan:** dua halaman `paper` kotak-kotak dengan garis luar 3px, radius 20px (sisi lipatan tanpa sudut dan tanpa garis), garis margin `paper-margin`, pita lipatan hitam 5%, cincin spiral di tengah, dan sampul `chalk-blue` yang mengintip di sisi dan bawah.
- **Surat:** selembar `paper` polos, radius 20px, padding 40px x 48px, lubang spiral di tepi atas. Isinya salam pembuka, bagian dengan judul stabilo, lalu penutup dengan Si Kapur, "Salam kapur," dan tanda tangan goresan. Si Kapur berdiri di tepi kiri surat dari 1280px.
- **Kutipan:** potongan kertas putih dengan garis 2px, radius 8px, selotip biru di sudut kanan atas, teks dalam tanda kutip. Pembaca layar mendengar "Kutipan dari transkripmu".
- **Label istilah:** stiker putih dengan garis 2.5px, radius 12px, Fredoka 600.
- **Catatan tempel:** kertas kuning pucat, garis 3px, radius 8px, miring 1 derajat, dengan selotip biru di atas.
- **Nomor catatan:** lingkaran 28px `chalk-yellow` dengan garis 2.5px dan angka Fredoka 600. Poin yang sudah bagus diberi bintang kuning bergaris luar.

### Conversation (setup)
Satu giliran adalah gelembung bicara Si Kapur (Fredoka 1.1rem, maksimal 34rem, ekor di kiri) lalu jawaban user rata kanan. Jawaban yang sudah diberikan menjadi chip jawaban: teks Fredoka 1.125rem dan tombol Ubah kecil dengan ikon pensil. Mengubah jawaban lama memulai ulang dari giliran itu. Giliran lama sedikit pudar (90%), dan giliran terbaru selalu digulir ke pandangan. Saat Si Kapur membaca atau menulis, gelembungnya diakhiri tiga titik yang berdenyut (1.2s).

### Concept Editor
Daftar konsep di papan dengan judul kapur dan hitungan "n dari maksimal 8". Setiap baris berisi kotak kosong kuning (36px), nama konsep Fredoka 500 1.35rem dalam `chalk-yellow`, alias dan deskripsi di bawahnya, lalu tombol kapur ubah dan hapus. Saat daftar pertama kali muncul, baris tertulis satu per satu dari kiri (520ms, jeda 140ms per baris). Mengubah atau menambah konsep membuka kartu isian putih dengan tepi bawah 4px di tempat barisnya. Hapus bisa dibatalkan lewat pesan di bawah daftar.

### Progress Track
Bar progres konsep sebagai satu bentuk: jalur dan satu lingkaran per konsep berbagi satu garis luar. Isi mint (dijelaskan) dan kapur putih (disebut) bergeser lewat `scaleX` selama 500ms. Lingkaran berisi centang, garis miring, atau cincin kosong. Saat satu konsep lagi dijelaskan, bar memantul sekali (420ms). Di bawah bar ada teks "x dari n konsep dijelaskan".

### Agenda
Daftar konsep bernomor dengan urutan tetap selama sesi. Setiap baris berisi tanda kapur (36px), nama konsep, dan label status teks (belum, disebut, dijelaskan). Legenda tanda ada di bawah panel. Tanda baru menggambar dirinya sendiri (300ms) dan, untuk dijelaskan, enam titik debu kapur mengepul (750ms), setelah jeda 380ms supaya tangan Si Kapur tiba lebih dulu.

### Transcript
Teks yang sudah pasti dalam `chalk`. Teks parsial dalam `chalk-dim` di ujung ("Teks samar masih bisa berubah."). Istilah konsep mendapat garis bawah kapur kuning yang tergambar sendiri (420ms). Jeda panjang tampil sebagai pill jeda: garis 2px `chalk-blue` 70%, teks Fredoka `chalk-blue`, ikon jeda dan durasi ("jeda 2,4 dtk"). Pill yang sama tanpa durasi dipakai di legenda. Lampiran transkrip di feedback juga menandai filler dengan garis bawah bergelombang `chalk-pink` 2px (bentuknya beda dari garis istilah) dan memberi legenda "Arti tanda" untuk istilah, filler, dan jeda.

### Si Kapur (signature)
Batang kapur putih berbentuk silinder dengan tutup elips, lengan sirip, kaki bulat, dan pipi merah muda, mengikuti referensi user (`docs/design/referensi-si-kapur.jpg`). Garis luarnya `currentColor` dari `outline`. Delapan mood (melambai, mendengarkan, senang, penasaran, bingung, berpikir, bersorak, bangga), masing-masing dengan satu bentuk mata dan satu gestur atau properti. Ia bergoyang pelan saat diam, berkedip, melompat saat senang, dan memiringkan badan saat penasaran atau bingung. Saat mencentang, ia berpindah dengan tangan kanan sebagai titik tuju (480ms), tanpa properti, lalu kembali ke baki. Gelembung bicara (`surface`, garis luar 3px, ekor di kiri) muncul dengan animasi 260ms. Prompt untuk versi raster nanti ada di `docs/design/arah-visual-live.md`.

### Motion
Easing utama `cubic-bezier(0.16, 1, 0.3, 1)`. Baris konsep tertulis dari kiri lewat `clip-path` (520ms, jeda 140ms per baris). Bagian surat yang masih ditulis menampilkan garis coretan yang terus digores ulang (1.8s) dan tiga titik. Dengan `prefers-reduced-motion`, semua animasi mati, termasuk tulisan baris, coretan, dan titik: yang tersisa hanya pose diam dan tanda akhir, Si Kapur mencentang dari baki, dan debu tidak tampil.

## Do's and Don'ts

### Do:
- **Do** gambar setiap benda dan kontrol baru dengan garis luar `outline` sekitar 3px, isian datar, dan tepi bawah dalam warna garis luar.
- **Do** tampilkan status konsep dengan warna dan bentuk sekaligus: kuning dengan kotak kosong, kapur putih dengan garis miring, mint dengan centang, plus label teks. Di feedback, tambahkan silang koral untuk dijelaskan keliru.
- **Do** pakai `paper-ink` dan tanda pekat (`mark-none`, `mark-explained`, `mark-wrong`) untuk semua teks dan tanda di atas kertas, di kedua mode.
- **Do** beri penekanan judul di atas kertas dengan stabilo warna kapur, dan judul di atas papan dengan huruf kapur.
- **Do** pakai Fredoka untuk judul, tombol, agenda, dan ucapan Si Kapur, dan Nunito untuk transkrip dan teks panjang.
- **Do** buat ilustrasi sebagai SVG di kode dan uji kedua mode, Siang dan Malam.
- **Do** sediakan versi diam untuk setiap gerakan di bawah `prefers-reduced-motion`.

### Don't:
- **Don't** pakai font serif atau teks kapital penuh, termasuk di label, judul, dan tombol.
- **Don't** bedakan status konsep hanya lewat warna.
- **Don't** gelapkan kertas menjadi navy di mode Malam, atau pakai `ink` dan `surface` di atasnya.
- **Don't** tambahkan XP, streak, hati, atau lencana. Progres cukup lewat bar konsep dan perayaan kecil.
- **Don't** kembali ke tampilan kalem dan minimalis, atau ke halaman yang seluruhnya satu warna papan datar.
- **Don't** pakai bayangan blur, bayangan diagonal, atau garis luar dengan warna lain selain `outline`.
- **Don't** kirim aset raster atau pakai emoji dan huruf sebagai ikon.
