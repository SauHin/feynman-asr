---
name: Feynman Speech Coach
description: Aplikasi latihan menjelaskan yang terang dan bersih, dengan Empur, sebatang kapur hidup, sebagai teman belajar.
colors:
  bg: "#ffffff"
  bg-malam: "#141414"
  surface: "#ffffff"
  surface-malam: "#1a1a1d"
  card: "#f5f5f7"
  card-malam: "#1f1f22"
  card-2: "#ececf0"
  card-2-malam: "#2a2a2e"
  line: "#e7e7ec"
  line-malam: "#34343a"
  ink: "#16161d"
  ink-malam: "#f5f5f7"
  ink-2: "#5c5c6e"
  ink-2-malam: "#a8a8b3"
  ink-3: "#8c8c9c"
  ink-3-malam: "#7c7c88"
  go: "#22c55e"
  go-edge: "#16994a"
  stop: "#f04438"
  stop-edge: "#b42318"
  focus: "#4b7bff"
  status-mentioned: "#ffb020"
  marker: "#ffd84d"
  filler: "#ff93ae"
  pause-bg: "#e8eeff"
  pause-bg-malam: "#1c2748"
  pause-ink: "#3656c9"
  pause-ink-malam: "#9db6ff"
  selected-top: "#ecebff"
  selected-bottom: "#b8e9da"
  selected-top-malam: "#2b2f58"
  selected-bottom-malam: "#154a3c"
  empur-jingga-top: "#ffd84d"
  empur-jingga-bottom: "#ff7f3f"
typography:
  hero:
    fontFamily: "'Lexend Variable', system-ui, sans-serif"
    fontSize: "3.6rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  greeting:
    fontFamily: "'Lexend Variable', system-ui, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 700
    lineHeight: 1.25
  question:
    fontFamily: "'Lexend Variable', system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.375
  card-title:
    fontFamily: "'Lexend Variable', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
  panel-title:
    fontFamily: "'Lexend Variable', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  button:
    fontFamily: "'Lexend Variable', system-ui, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 600
    lineHeight: 1.5
  transcript:
    fontFamily: "'Lexend Variable', system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 400
    lineHeight: 1.7
  body:
    fontFamily: "'Lexend Variable', system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.625
  stat:
    fontFamily: "'Lexend Variable', system-ui, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 700
    lineHeight: 1
  label:
    fontFamily: "'Lexend Variable', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
rounded:
  row: "16px"
  tile: "20px"
  option: "22px"
  score: "24px"
  card: "28px"
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
    textColor: "#ffffff"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.8rem"
  button-stop:
    backgroundColor: "{colors.stop}"
    textColor: "#ffffff"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 2rem"
  button-plain:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.8rem"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.row}"
    padding: "0.7rem 1rem"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  segment-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  white-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "28px"
  gray-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "12px 12px 12px 16px"
  option-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.option}"
    padding: "24px 8px"
  stat-tile:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.stat}"
    rounded: "{rounded.tile}"
    padding: "14px 16px 12px"
  speech-bubble:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.row}"
    padding: "12px 16px"
  pause-chip:
    backgroundColor: "{colors.pause-bg}"
    textColor: "{colors.pause-ink}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
---

# Design System: Feynman Speech Coach

## Overview

**Creative North Star: "Terang dan bersih, dengan Empur"**

Aplikasi ini terasa seperti aplikasi belajar premium, dengan rasa Brilliant.org: latar putih polos, banyak ruang kosong, kartu abu muda tanpa garis, dan tombol pil yang terasa bisa ditekan. Karakternya datang dari Empur, sebatang kapur hidup yang digambar datar dengan gradasi tegas. Empur menyapa, mendengarkan, mencentang agenda, dan menulis feedback.

Gaya ini menggantikan "Kelas Si Kapur" (papan tulis berbingkai kayu dan stiker bergaris luar tebal). User menilai gaya lama murahan karena dua hal: garis luar yang tebal, dan aset yang tampak seperti stiker datar dari bentuk dasar. Referensi yang user pilih adalah Brilliant (untuk layar dan maskot datar) dan Speak (sempat dicoba untuk render 3D maskot). Arah akhirnya adalah "A. Terang dan bersih".

Kepadatannya rendah. Di layar live, user berbicara dan hanya melirik layar, jadi satu lirikan harus cukup untuk melihat konsep mana yang belum dibahas. Di layar lain, teks dibuat pendek dan rincian dilipat.

Ada dua mode, Siang dan Malam, dengan kontrol bersegmen di bilah atas. Tema awal dipasang di `index.html` sebelum render (dari `localStorage`, lalu `prefers-color-scheme`) supaya tidak berkedip. Siang adalah putih polos. Malam hampir hitam (#141414) dengan kartu yang dibatasi garis tipis abu, mengikuti tampilan malam Brilliant.

**Key Characteristics:**
- Latar polos, kartu abu muda tanpa garis, dan kartu putih dengan garis tipis 1px.
- Tidak ada garis luar tebal di mana pun. Kedalaman datang dari warna kartu dan tepi bawah tombol.
- Satu keluarga huruf, Lexend, untuk seluruh aplikasi.
- Empur: maskot datar bergradasi dengan tujuh mood, pilihan warna, dan pilihan tampil dengan atau tanpa tangan.
- Status konsep selalu memakai bentuk sekaligus warna: cincin kosong, setengah terisi, centang, dan silang.
- Semua ilustrasi dan ikon adalah SVG di kode. Tidak ada aset raster yang ikut dikirim.

## Colors

Putih atau hampir hitam sebagai latar, abu muda untuk kartu, dan hijau untuk aksi utama. Warna kapur (jingga, kuning, biru, merah muda, mint, lilac) dipakai untuk ilustrasi dan ikon.

### Neutral
- **Latar** (`bg`, Malam `bg-malam`): latar halaman.
- **Permukaan** (`surface`, Malam `surface-malam`): kartu putih besar, baris di dalam kartu abu, gelembung bicara, bilah bawah, isian, dan pil kontrol.
- **Kartu** (`card`, Malam `card-malam`): kartu abu muda tanpa garis, seperti agenda, kartu pilihan, ubin angka, dan baris konsep. `card-2` untuk hover, jalur bilah kemajuan, dan tepi bawah tombol biasa.
- **Garis** (`line`, Malam `line-malam`): garis 1px pada kartu putih, pil kontrol, isian, dan pemisah. Ini satu-satunya garis di aplikasi.
- **Tinta** (`ink`, `ink-2`, `ink-3`): teks utama, teks sekunder, dan teks kecil seperti label, catatan, serta placeholder.

### Aksi
- **Hijau** (`go`, tepi `go-edge`): tombol utama (Mulai sesi, Lanjut, Ambil konsep, Mulai, Jelaskan ulang), isi bilah kemajuan, centang dijelaskan, dan warna kursor teks.
- **Merah** (`stop`, tepi `stop-edge`): tombol Berhenti, titik rekam yang berdenyut, pesan kesalahan, dan silang dijelaskan keliru.
- **Biru fokus** (`focus`): cincin fokus dan garis isian yang sedang aktif.

### Penanda
- **Kuning disebut** (`status-mentioned`): setengah lingkaran untuk konsep yang baru disebut, di agenda dan di bilah kemajuan live.
- **Stabilo** (`marker`): sorotan istilah konsep di transkrip, 60% di Siang dan 32% di Malam. Juga titik debu saat konsep dijelaskan dan warna seleksi teks.
- **Filler** (`filler`): garis bawah bergelombang di bawah filler pada lampiran transkrip.
- **Jeda** (`pause-bg`, `pause-ink`): chip jeda panjang di transkrip.
- **Terpilih** (`selected-top` ke `selected-bottom`): gradasi lavender ke mint pada kartu pilihan yang aktif, seperti kartu terpilih di Brilliant.

### Ilustrasi
- **Gradasi ikon:** setiap ikon ilustrasi berupa bentuk datar dengan gradasi diagonal dari warna muda ke warna tua. Pasangannya adalah kuning ke jingga (#FFE27A ke #FF9F43), biru muda ke biru (#9FDBFF ke #4B7BFF), dan merah muda (#FFC1D3 ke #FF5A8A). Dua lainnya adalah mint (#B8F5D6 ke #12B886) dan lilac (#DCC2FF ke #8B5CF6).
- **Tanda aplikasi dan favicon:** kotak bergradasi jingga (#FFD84D ke #FF7F3F) dengan centang putih.
- **Warna Empur:** lihat bagian Empur.

### Named Rules
**The Tanpa Garis Tebal Rule.** Tidak ada garis luar tebal pada kontrol, kartu, atau ilustrasi. Batas benda datang dari perbedaan warna kartu dan latar, atau dari garis `line` 1px. Garis luar tebal adalah salah satu dari dua hal yang membuat gaya lama terasa murahan.

**The Empat Tanda Rule.** Status konsep selalu memakai bentuk dan warna sekaligus, plus label teks. Belum: cincin kosong `ink-3`. Disebut: setengah lingkaran kuning. Dijelaskan: lingkaran hijau dengan centang putih. Dijelaskan keliru (hanya di feedback): lingkaran merah dengan silang putih. Labelnya selalu belum, disebut, dijelaskan, dan dijelaskan keliru. Warna saja tidak pernah cukup.

## Typography

**Font:** Lexend Variable (dengan system-ui), dipasang lokal lewat `@fontsource-variable/lexend` supaya tetap jalan tanpa internet.

**Character:** Lexend dirancang untuk keterbacaan, dengan jarak antarhuruf yang lega. Satu keluarga huruf untuk judul, tombol, ucapan Empur, dan transkrip menjaga tampilan tetap bersih.

### Hierarchy
- **Hero** (700, 2.6rem, 3.6rem dari 768px, 1.05, rapat -0.02em): judul beranda "Belajar dengan menjelaskan".
- **Greeting** (700, 1.9rem, 1.25): sapaan di feedback.
- **Question** (600, 1.4rem, 1.75rem dari 768px): pertanyaan Empur di setup.
- **Card title** (600, 1.25rem): judul kartu di feedback.
- **Panel title** (600, 1.125rem): judul bagian seperti "Agenda", "Penjelasanmu", dan "Daftar konsep", serta judul di bilah atas.
- **Button** (600, 1.1rem): semua tombol. Tombol utama memakai 1.125rem.
- **Transcript** (400, 1.3rem, 1.7): transkrip live, maksimal 64ch.
- **Body** (400, sekitar 1.05rem, 1.625): paragraf, poin feedback, dan gelembung bicara.
- **Stat** (700, 1.9rem, 1): angka kelancaran. Angka skor memakai 3rem.
- **Label** (400, 0.875rem): label status, catatan kecil, subjudul, dan teks privasi, dalam `ink-3`.

Angka yang berubah (timer, latensi, statistik, jumlah karakter) memakai `tabular-nums`.

### Named Rules
**The Huruf Kalimat Rule.** Semua teks memakai huruf kalimat biasa: judul, label, tombol, dan chip. Tidak ada teks kapital penuh dan tidak ada font serif, di mana pun. Ini batasan user.

**The Satu Huruf Rule.** Semua teks memakai Lexend. Penekanan dibuat lewat berat, ukuran, dan posisi, bukan lewat font kedua.

## Layout

Kolom di tengah dengan banyak ruang kosong. Tepi halaman 16px di layar sempit dan 32px dari 768px. Jarak antar kartu 12px sampai 20px.

- **Beranda:** maksimal 72rem. Dua kolom dari 768px: judul, kalimat pembuka, tombol Mulai sesi, dan satu baris privasi di kiri. Di kanan ada kartu contoh agenda. Empur berdiri di sudut kiri atas kartu di layar sempit, dan di samping kiri kartu dari 1024px, supaya tetap di tengah layar. Empat kartu tahap ada di bawah: dua kolom di layar sempit dan empat dari 768px.
- **Setup:** satu kolom maksimal 44rem, satu pertanyaan per langkah seperti onboarding Brilliant. Urutannya bilah kemajuan tiga bagian, chip jawaban sebelumnya, Empur di samping pertanyaan, isian, lalu satu tombol utama di tengah. Pemberitahuan Gemini ada di bawah, hanya di langkah yang mengirim data.
- **Live:** satu layar penuh (`100dvh`) tanpa gulir halaman dari 768px, maksimal 80rem. Kartu agenda abu di kiri (34%, maksimal 26rem) dan kartu penjelasan putih di kanan. Agenda dan transkrip menggulir di dalam kartunya. Bilah bawah berisi statistik atau teks privasi, lalu tombol. Di layar sempit kartu bertumpuk dan bilah bawah menempel setelah sesi mulai.
- **Feedback:** satu kolom maksimal 54rem yang menggulir. Urutannya Empur besar dan sapaan, kartu skor dan empat ubin kelancaran, kartu isi, pemisah "Rincian", kartu rincian, penutup, dan lampiran transkrip yang dilipat. Bilah bawah menempel dengan tombol Jelaskan ulang dan Ganti topik.

## Elevation & Depth

Hampir semua benda datar. Kedalaman datang dari tiga hal: warna kartu yang berbeda dari latar, tepi bawah tombol yang lebih gelap, dan bayangan lembut untuk benda yang melayang di atas yang lain.

### Shadow Vocabulary
- **Tepi bawah tombol** (`box-shadow: 0 5px 0 var(--edge)`, saat ditekan `0 0 0` dan turun 5px): semua tombol. `--edge` adalah `go-edge`, `stop-edge`, atau `card-2`.
- **Kartu melayang** (`0 24px 60px -36px rgba(22,22,29,0.35)`): kartu contoh agenda di beranda dan formulir konsep di setup.
- **Gelembung bicara** (`0 12px 32px -18px rgba(0,0,0,0.4)`): gelembung Empur.
- **Menu melayang** (`0 24px 60px -28px rgba(0,0,0,0.45)`): menu Empur di bilah atas.
- **Segmen aktif** (`0 1px 3px rgba(0,0,0,0.12)`): pilihan aktif di kontrol bersegmen.
- **Bayangan jatuh tangan** (bentuk tangan dalam warna gelap Empur 22%, digeser 1.3px dan 2.4px): tangan Empur yang ada di depan badan.

### Named Rules
**The Kartu Bukan Bayangan Rule.** Kartu biasa tidak diberi bayangan. Kartu abu cukup dengan warnanya, dan kartu putih cukup dengan garis `line` 1px. Bayangan lembut hanya untuk benda yang benar-benar melayang: gelembung, menu, dan kartu di atas kartu.

## Shapes

Bulat dan lega. Tombol, chip, pil status, kontrol bersegmen, chip jawaban, dan chip jeda bulat penuh. Kartu utama 28px, kartu skor 24px, kartu pilihan dan kartu tahap 22px, ubin angka 20px, dan baris serta isian 16px. Zona unggah 24px dengan garis putus-putus 2px.

Ikon kontrol (panah, pensil, sampah, jam, mikrofon) adalah SVG garis dengan ujung bulat dalam `currentColor`. Ikon ilustrasi (tahap, pilihan materi, tanda aplikasi) adalah bentuk datar bergradasi tanpa garis luar.

## Components

### Buttons
Pil yang terasa bisa ditekan, seperti tombol Continue di Brilliant.
- **Shape:** bulat penuh, tanpa garis luar, tepi bawah 5px yang lebih gelap.
- **Primary:** `go` dengan teks putih. Di tengah halaman lebarnya penuh sampai maksimal 18 sampai 20rem.
- **Stop (Berhenti, Memproses…):** `stop` dengan teks putih.
- **Plain (Ganti topik, Coba lagi, Batal):** `card` dengan teks `ink`.
- **Hover / Active / Disabled:** hover menaikkan kecerahan 4%. Saat ditekan, tombol turun 5px dan tepi bawahnya hilang (80ms). Disabled menjadi abu (grayscale) dan pudar 55%.
- **Focus:** cincin `focus` 3px dengan jarak 3px, untuk semua elemen fokus.
- **Tombol ikon (ubah, hapus):** lingkaran 36px transparan dengan ikon `ink-3`, berisi `card-2` saat hover.
- **Tambah konsep:** tombol lebar dengan garis putus-putus 2px `line`.

### Inputs / Fields
- **Style:** `surface`, garis 1.5px `line`, sudut 16px. Placeholder dalam `ink-3`. Label di atas isian dalam 0.875rem tebal.
- **Focus:** garis berubah `focus` dengan cahaya lembut 4px (`focus` 22%) yang mengikuti sudut isian.
- **Error:** garis `stop` dan pesan `stop` tebal di bawah isian, dengan kalimat yang menjelaskan cara memperbaikinya.

### Navigation
- **Bilah atas:** tanda aplikasi 36px di beranda, atau tombol kembali berupa lingkaran 40px bergaris tipis di layar lain. Judul 1.125rem tebal dengan subjudul `ink-3`. Di kanan ada menu Empur dan kontrol tema, berkelompok supaya tetap bersama saat bilah terlipat.
- **Kontrol bersegmen (tema, tangan Empur, keadaan contoh):** wadah `card` bulat penuh. Pilihan aktif berupa pil `surface` (Malam `card-2`) dengan bayangan kecil. Pilihan lain berisi teks `ink-3`.
- **Menu Empur:** tombol pil dengan titik gradasi warna Empur. Menu adalah popover bawaan browser yang menempel di tombol lewat anchor CSS dan menutup sendiri saat klik di luar atau Esc. Isinya pratinjau Empur, tujuh titik warna, dan pilihan dengan atau tanpa tangan. Warna yang terpilih diberi cincin dan centang, bukan warna saja.

### Cards / Containers
- **Kartu putih:** `surface`, garis 1px `line`, radius 28px, padding 20px sampai 28px. Dipakai untuk kartu penjelasan live dan kartu isi feedback.
- **Kartu abu:** `card`, tanpa garis, radius 28px. Dipakai untuk agenda live dan lampiran transkrip. Baris di dalamnya berupa `surface` radius 16px.
- **Kartu pilihan:** `card`, radius 22px, ikon gradasi di atas dan label di bawah. Pilihan aktif memakai gradasi terpilih, teks `ink`, dan centang hijau di sudut kanan atas.
- **Kartu tahap (beranda):** `card`, radius 22px, ikon gradasi 48px di atas, lalu nomor `ink-3` dan judul tahap.
- **Kartu skor (feedback):** radius 24px dengan gradasi dari `card` ke hijau muda. Isinya angka besar dengan penyebut `ink-3`, label, dan deretan tanda status 24px. Di sesi ke-2 ada pil hijau "+n dari sesi pertama". Sebelum Gemini selesai, labelnya diberi "(perkiraan live)".
- **Ubin kelancaran:** empat ubin `card` radius 20px (durasi, kata/menit, jeda panjang, filler). Setiap ubin berisi angka besar rata kiri, lalu ikon dan label di bawahnya. Tidak ada satuan di samping angka, supaya semua angka segaris. Di sesi ke-2, angka sesi sebelumnya ditulis kecil di bawah label.
- **Kutipan:** garis kiri 4px biru muda dengan teks `ink-2` dalam tanda kutip. Pembaca layar mendengar "Kutipan dari transkripmu".
- **Lipatan:** `<details>` bawaan dengan chevron yang berputar 90 derajat saat terbuka. Kutipan konsep yang sudah dijelaskan dilipat. Kutipan konsep yang baru disebut atau keliru langsung terbuka.

### Setup
- **Bilah kemajuan:** tiga bagian (Topik, Materi, Konsep) setinggi 8px. Bagian selesai terisi penuh hijau dan bagian aktif terisi sebagian. Pembaca layar mendengar "Langkah 2 dari 3: Materi".
- **Chip jawaban:** pil `card` berisi label, jawaban, dan tombol "Ubah". Mengubah jawaban lama memulai ulang dari langkah itu.
- **Zona unggah:** kotak radius 24px dengan garis putus-putus 2px, ikon unggah, dan teks "Tarik file ke sini". Diklik atau ditekan Enter, zona membuka pemilih file. Ada tiga keadaan. Siap: biru dan berdenyut saat file diseret di jendela. Di atas zona: hijau, sedikit membesar, dan ikon terangkat. Ditolak: merah dan bergetar sekali. File yang dilepas di luar zona tidak dibuka browser.
- **Pilihan halaman:** satu isian gaya dialog cetak ("1-5, 8, 11-13"). Kosong berarti semua halaman. Di bawahnya ada ringkasan langsung ("9 halaman dipilih: 1–5, 8, 11–13") atau pesan kesalahan.
- **Daftar konsep:** baris `card` berisi nomor dalam lingkaran, nama tebal, alias dan deskripsi, lalu tombol ubah dan hapus. Baris muncul satu per satu dari kiri saat daftar pertama kali tampil. Hapus bisa dibatalkan.

### Live
- **Bilah kemajuan konsep:** satu bagian per konsep, setinggi 10px. Hijau penuh berarti dijelaskan dan kuning setengah berarti disebut. Bagian menghitung jumlah, bukan baris agenda. Di bawahnya ada teks "x dari n konsep dijelaskan · y baru disebut". Bilah memantul sekali saat satu konsep lagi dijelaskan.
- **Pil status:** satu pil `card` berisi titik rekam, status (lebarnya tetap untuk semua status), timer, dan latensi.
- **Agenda:** baris `surface` berisi nama konsep, label status, dan tanda status di ujung kanan. Konsep yang belum dibahas paling tegas, dan yang sudah dijelaskan meredup ke `ink-3`. Legenda ada di bawah kartu.
- **Transkrip:** teks yang sudah pasti dalam `ink` dan teks parsial dalam `ink-3`. Istilah konsep diberi sorotan stabilo di separuh bawah huruf. Jeda panjang tampil sebagai chip jeda ("jeda 4,0 dtk").
- **Statistik:** pil `card` untuk kata/menit, filler, dan jeda panjang.

### Empur (signature)
Sebatang kapur dalam gaya datar Brilliant: badan silinder dengan gradasi diagonal, tutup elips dua warna, dan tanpa kilau di sisi badan. Komponennya ada di `components/kapur.tsx`, dan pratinjau semua mood ada di `/maskot`.
- **Warna:** jingga (bawaan), kuning, mint, langit, koral, lilac, dan putih. User memilihnya lewat menu Empur, dan pilihannya disimpan di browser.
- **Wajah:** tanpa mulut, tanpa alis, dan tanpa pipi merah muda. Semua mata berasal dari satu keluarga pil tinta. Bentuknya diubah lewat kelopak atas yang turun atau miring, sisi bawah yang terangkat seperti pipi tersenyum, dan rotasi. Setiap mata punya titik cahaya putih yang lebih kecil untuk mata yang sempit.
- **Mood:** melambai, mendengarkan, senang, penasaran, bingung, berpikir, dan bersorak. Tidak ada mood bangga, karena senang dipakai di tempatnya. Setiap mood punya bentuk mata, pose tangan, dan properti sendiri, misalnya gelombang suara, lampu, tanda tanya, awan pikiran, atau konfeti.
- **Tangan:** sirip gemuk dan pendek yang melengkung. Tangan samping digambar di belakang badan dengan gradasi yang sama, jadi badan dan tangan terlihat satu bentuk. Tangan di depan badan (dagu, tangan yang digenggam) diberi bayangan jatuh datar dan makin terang ke arah tangan. Tangan yang menyentuh kepala keluar dari samping badan, bukan dari depan badan.
- **Tanpa tangan:** pilihan di menu Empur. Mata harus tetap membawa ekspresi tanpa bantuan tangan.
- **Mencentang (live):** dengan tangan, Empur berjalan ke kanan tanda status, dicerminkan menghadap kiri, lalu menunjuk tanda dengan satu tangan dan mengacungkan jempol dengan tangan lain. Jempolnya berupa tonjolan kecil di sisi datar kepalan. Tanpa tangan, Empur miring 28° dengan ujung bawah di tanda, lalu badannya bergerak membentuk centang seperti kapur yang menulis. Kalau ruang di kanan tanda tidak cukup, Empur tetap di tempat.
- **Gelembung bicara:** `surface`, garis 1px, bayangan lembut, di samping Empur.

### Motion
Easing utama `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Empur:** badan bernapas pelan (skala 2.5%, 3.2s) dan mata berkedip. Tangan bergerak dari bahu sesuai mood: melambai, menyimak, mengetuk dagu, bertepuk, mengusap kepala, dan mengacungkan tangan. Properti ikut hidup: gelombang berdenyut, kilau berkelip, tanda tanya dan awan melayang, dan konfeti berputar. Senang dan bersorak diawali lompatan kecil.
- **Konten:** gelembung dan kartu baru muncul naik (260ms). Baris konsep tertulis dari kiri (520ms, jeda 140ms per baris). Centang menggambar dirinya sendiri (300ms) dan debu kuning mengepul (750ms), setelah jeda 380ms supaya Empur tiba lebih dulu. Sorotan istilah tergores dari kiri (420ms).
- **Kontrol:** warna berpindah dalam 150ms. Tombol turun saat ditekan (80ms). Zona unggah berdenyut saat siap dan bergetar saat menolak.
- **Reduced motion:** dengan `prefers-reduced-motion`, semua animasi berhenti, termasuk gerak tangan, properti, zona unggah, dan tulisan baris. Empur tidak berjalan untuk mencentang, dan debu tidak tampil.

## Do's and Don'ts

### Do:
- **Do** pakai latar polos, kartu `card` tanpa garis, dan kartu `surface` dengan garis `line` 1px.
- **Do** buat tombol sebagai pil dengan tepi bawah yang lebih gelap.
- **Do** tampilkan status konsep dengan bentuk, warna, dan label teks sekaligus: cincin kosong, setengah kuning, centang hijau, dan silang merah.
- **Do** gambar ilustrasi dan ikon baru sebagai bentuk datar bergradasi, tanpa garis luar, dalam satu gaya dengan Empur.
- **Do** pakai Lexend untuk semua teks dan huruf kalimat biasa di mana pun.
- **Do** jaga teks tetap pendek. Katakan setiap fakta sekali, dan lipat rincian di balik `<details>`.
- **Do** sebut hasil setelah sesi sebagai "feedback", bukan "catatan". "Catatan kuliah" di setup tetap berarti catatan milik user.
- **Do** uji Siang, Malam, dan lebar layar HP untuk setiap perubahan.
- **Do** sediakan versi diam untuk setiap gerakan di bawah `prefers-reduced-motion`.

### Don't:
- **Don't** pakai garis luar tebal, stiker bergaris, atau bentuk dasar datar tanpa gradasi sebagai ilustrasi.
- **Don't** pakai font serif atau teks kapital penuh, termasuk di label, judul, dan tombol.
- **Don't** bedakan status konsep hanya lewat warna.
- **Don't** beri bayangan pada kartu biasa. Bayangan lembut hanya untuk benda yang melayang.
- **Don't** ubah Empur menjadi gumpalan mengilap berkaki. Siluetnya harus tetap sebatang kapur.
- **Don't** beri Empur mulut, alis, pipi merah muda, atau mata dari bentuk lain selain keluarga pil.
- **Don't** tambahkan XP, streak, hati, atau lencana. Progres cukup lewat bilah konsep dan perayaan kecil.
- **Don't** kirim aset raster, atau pakai emoji dan huruf sebagai ikon.
