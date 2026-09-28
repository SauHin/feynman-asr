# Panduan Git untuk Eksplorasi Desain Bersama

Panduan ini untuk kasus: dua orang ingin mengeksplorasi arah desain baru untuk
UI. Arah baru ini tidak boleh mengubah v1 yang sudah ada di `master`, sampai
ada persetujuan arah mana yang dipakai.

Setiap command dijelaskan supaya panduan ini juga bisa dipakai untuk belajar
git, bukan cuma referensi copy-paste.

Repo ini: `https://github.com/SauHin/feynman-asr` (remote bernama `origin`).

---

## 1. Konsep dasar yang perlu dipahami dulu

- **Commit**: snapshot dari semua file di repo pada satu titik waktu. Setiap
  commit punya id unik (hash) dan menunjuk ke commit sebelumnya, jadi git
  sebenarnya adalah rantai (chain) dari snapshot-snapshot ini.
- **Branch**: cuma label/pointer yang menunjuk ke satu commit tertentu.
  Membuat branch itu murah dan cepat karena tidak menyalin file apa pun,
  hanya membuat pointer baru.
- **`master`**: branch utama di repo ini, isinya v1 yang sudah disetujui.
  Ini yang harus dijaga tetap stabil.
- **Remote**: salinan repo di server lain, di sini yaitu GitHub. `origin`
  adalah nama alias untuk remote itu di komputer kamu.
- **Working directory vs staging area vs commit**: file yang kamu edit ada
  di working directory. `git add` memindahkan perubahan ke staging area
  (draft yang mau di-commit). `git commit` mengunci draft itu jadi snapshot
  permanen di riwayat lokal. `git push` mengirim commit itu ke remote.

---

## 2. Langkah persiapan (sekali saja, oleh kamu sebagai pemilik repo)

### 2.1 Tandai v1 supaya gampang kembali

```bash
git tag v1-mockup
git push origin v1-mockup
```

- `git tag v1-mockup` membuat penanda permanen bernama `v1-mockup` yang
  menunjuk ke commit saat ini (v1 yang sudah jadi). Beda dengan branch, tag
  tidak akan "maju" mengikuti commit baru, jadi ini titik kembali yang tetap.
- `git push origin v1-mockup` mengirim tag itu ke GitHub, supaya teman kamu
  juga bisa melihat dan kembali ke titik yang sama.

Kalau nanti semua eksplorasi gagal atau ingin dibuang, kamu selalu bisa
kembali lihat versi ini dengan `git checkout v1-mockup`.

### 2.2 Tambahkan teman sebagai collaborator

Di GitHub: buka repo → **Settings** → **Collaborators** → **Add people** →
masukkan username atau email GitHub teman kamu. Ini perlu supaya teman bisa
push branch ke repo yang sama (bukan fork).

### 2.3 Pastikan `master` terkunci dari perubahan langsung (opsional tapi disarankan)

Di GitHub: **Settings** → **Branches** → **Add branch protection rule** →
nama pattern `master` → centang **Require a pull request before merging**.

Efeknya: tidak ada yang bisa `git push` langsung ke `master`, semua perubahan
harus lewat pull request yang bisa kamu review dulu. Ini jaring pengaman
teknis, bukan cuma kesepakatan lisan.

---

## 3. Setiap orang membuat branch eksplorasi sendiri

Teman kamu clone repo dulu (kalau belum punya):

```bash
git clone https://github.com/SauHin/feynman-asr.git
cd feynman-asr
```

- `git clone` menyalin seluruh riwayat repo dari GitHub ke komputer teman
  kamu, sekaligus otomatis mengatur `origin` menunjuk ke URL itu.

Lalu masing-masing orang membuat branch eksplorasi dari `master`:

```bash
git checkout master
git pull origin master
git checkout -b explore/kalem-modern
```

- `git checkout master` pindah ke branch `master` dulu. Ini memastikan
  branch baru dibuat dari titik yang benar (v1 terbaru), bukan dari branch
  lain yang mungkin sedang aktif.
- `git pull origin master` mengambil (`fetch`) commit terbaru dari GitHub
  lalu menggabungkannya (`merge`) ke branch lokal. Ini memastikan kamu mulai
  dari v1 yang paling baru, terutama kalau ada orang lain yang sempat push.
- `git checkout -b explore/kalem-modern` membuat branch baru bernama
  `explore/kalem-modern` dan langsung pindah ke situ. Semua commit
  setelah ini masuk ke branch ini, bukan ke `master`.

Nama branch sebaiknya deskriptif per arah desain, misalnya:

- `explore/kalem-modern`
- `explore/playful-cerah`

Teman kamu buat branch keduanya dengan cara yang sama tapi nama berbeda,
misalnya `explore/monokrom-fokus`.

---

## 4. Kerja dan commit di branch eksplorasi

Ini bagian yang sudah biasa kamu lakukan, tapi diulang di sini supaya
lengkap:

```bash
git status
git add src/components/LiveScreen.tsx
git commit -m "Coba palet warna kalem untuk live screen"
```

- `git status` menampilkan file mana yang berubah, mana yang belum
  di-`add`. Selalu jalankan ini sebelum `add`/`commit` supaya tidak salah
  commit file yang tidak dimaksud.
- `git add <file>` memindahkan perubahan file itu ke staging area. Hindari
  `git add .` kalau belum yakin semua file di working directory memang mau
  ikut commit.
- `git commit -m "..."` mengunci staging area jadi satu snapshot baru di
  riwayat branch ini, dengan pesan yang menjelaskan perubahan.

Push branch ke GitHub supaya bisa dilihat orang lain:

```bash
git push -u origin explore/kalem-modern
```

- `git push` mengirim commit dari branch lokal ke remote.
- Flag `-u` (singkatan `--set-upstream`) menghubungkan branch lokal
  `explore/kalem-modern` dengan branch di `origin` bernama sama, supaya
  push/pull berikutnya cukup `git push` / `git pull` tanpa perlu sebut nama
  remote dan branch lagi.

**Penting: jangan buka pull request ke `master` dulu.** Cukup push branch
saja. Karena ini tahap eksplorasi, PR baru dibuka setelah ada keputusan arah
mana yang dipakai (lihat bagian 6).

---

## 5. Melihat dan membandingkan hasil eksplorasi

### 5.1 Melihat branch teman secara lokal

```bash
git fetch origin
git checkout explore/monokrom-fokus
```

- `git fetch origin` mengambil semua branch dan commit terbaru dari GitHub
  ke komputer kamu, tapi tidak mengubah file di working directory kamu.
  Beda dengan `pull`, `fetch` murni "download informasi" dulu.
- `git checkout explore/monokrom-fokus` pindah working directory ke isi
  branch itu, supaya kamu bisa jalankan dan lihat langsung di browser.

Setelah selesai lihat-lihat, kembali ke branch kamu sendiri:

```bash
git checkout explore/kalem-modern
```

### 5.2 Membandingkan lewat GitHub (tanpa perlu checkout)

Buka URL compare di browser:

```
https://github.com/SauHin/feynman-asr/compare/explore/kalem-modern..explore/monokrom-fokus
```

Halaman ini menampilkan diff semua file yang berbeda antara dua branch,
enak dipakai untuk diskusi bersama tanpa perlu masing-masing orang
menjalankan kode teman.

### 5.3 Melihat riwayat semua branch eksplorasi

```bash
git log --oneline --graph --all
```

- `--oneline` menyingkat tiap commit jadi satu baris.
- `--graph` menggambar diagram cabang seperti pohon, jadi terlihat titik di
  mana branch-branch ini bercabang dari `master`.
- `--all` menampilkan semua branch, bukan cuma branch aktif saat ini.

---

## 6. Setelah arah desain disepakati

Misalnya arah `explore/kalem-modern` yang dipilih. Baru sekarang buka pull
request ke `master`:

```bash
git checkout explore/kalem-modern
git push
gh pr create --base master --title "Refine UI: arah kalem-modern" --body "Arah desain terpilih dari eksplorasi bersama, menggantikan v1 mockup."
```

- `git push` memastikan branch di GitHub sudah punya commit terbaru.
- `gh pr create` (GitHub CLI) membuka pull request dari branch aktif ke
  `master`. `--base master` menentukan branch tujuan, `--body` mengisi
  deskripsi PR.
- Bisa juga lewat GitHub web: buka tab **Pull requests** → **New pull
  request** → pilih `base: master` dan `compare: explore/kalem-modern`.

Setelah PR dibuka, kamu review perubahannya di GitHub, lalu klik
**Merge pull request** kalau sudah setuju. Baru di titik ini `master`
(v1) benar-benar berubah.

### 6.1 Branch yang tidak terpilih

Tidak perlu dihapus segera, tidak memengaruhi `master` sama sekali karena
tidak pernah di-merge. Kalau mau beres-beres nanti:

```bash
git push origin --delete explore/monokrom-fokus
git branch -d explore/monokrom-fokus
```

- `git push origin --delete <branch>` menghapus branch itu dari GitHub.
- `git branch -d <branch>` menghapus branch itu dari komputer lokal kamu.
  Git akan menolak menghapus kalau branch itu punya commit yang belum
  masuk ke branch lain, sebagai jaring pengaman dari kehilangan kerja.

---

## 7. Ringkasan alur

1. `git tag v1-mockup` + push tag → v1 aman ditandai.
2. Setiap orang: `git checkout master` → `git pull` → `git checkout -b explore/nama-arah`.
3. Kerja dan commit di branch masing-masing, push dengan `-u origin <branch>`.
4. Bandingkan lewat `git fetch` + `checkout`, atau GitHub compare URL.
5. Diskusi, sepakati satu arah.
6. Branch terpilih → `gh pr create --base master` → review → merge.
7. Branch yang tidak terpilih dibiarkan atau dihapus.

Selama proses ini, `master` tidak pernah disentuh langsung, jadi v1 tetap
utuh sampai kalian berdua benar-benar menyetujui hasil PR.
