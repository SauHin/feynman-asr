"""Bangun docs/diagram/pipeline-asr.svg: 9 langkah dari suara ke teks, plus contoh waktu tiap 1 detik.
Defs (font, gradien, marker, ikon) diambil dari arsitektur.svg supaya gayanya sama.

Jalankan dari root repo: backend/.venv/Scripts/python.exe docs/diagram/pipeline_asr.py
"""
import math
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = (ROOT / "docs/diagram/arsitektur.svg").read_text(encoding="utf-8")
end = '<rect width="1600" height="900" fill="#fff"/>'
head = src[: src.index(end) + len(end)] + "\n\n"
head = re.sub(r"<!-- Gambar arsitektur.*?-->", "<!-- Pipeline ASR real-time (laporan bab 2 dan 3, presentasi). Gaya sama dengan arsitektur.svg, font Lexend ditanam. Dibuat oleh pipeline_asr.py. -->", head, count=1, flags=re.S)
extra_css = (
    ".num{font-size:13px;font-weight:600;fill:#fff;text-anchor:middle}\n"
    ".tag{font-size:13px;font-weight:600}\n"
    ".tt{font-size:19px;font-weight:600;fill:#16161d}\n"
    ".tx{font-size:14px;fill:#5c5c6e}\n"
    ".sm{font-size:13px;fill:#8c8c9c}\n"
    ".sn{font-size:16px;font-weight:600;fill:#16161d}\n"
)
head = head.replace("</style>", extra_css + "</style>")

out = []
w = out.append
f = lambda v: f"{v:.1f}".rstrip("0").rstrip(".")


def wave(x0, x1, cy, amp, cycles, env=lambda t: 1.0, stroke="#4b7bff", width=2.4):
    pts = []
    n = int(x1 - x0)
    for i in range(n + 1):
        t = i / n
        y = cy - amp * env(t) * math.sin(2 * math.pi * cycles * t)
        pts.append(f"{f(x0 + i)} {f(y)}")
    w(f'<path d="M{" L".join(pts)}" fill="none" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>')


TAGS = {
    "Browser": ("#4b7bff", "#2f5bd8"),
    "Server": ("#8b5cf6", "#6d3fd6"),
    "Whisper · GPU": ("#22775b", "#22775b"),
}
H = 228  # tinggi semua kartu langkah


def card(n, x, y, width, tag, title, lines, note=""):
    w(f'<rect class="card" x="{x}" y="{y}" width="{width}" height="{H}" rx="18"/>')
    w(f'<circle cx="{x + 29}" cy="{y + 29}" r="13" fill="#22775b"/>')
    w(f'<text class="num" x="{x + 29}" y="{y + 33.5}">{n}</text>')
    fill, ink = TAGS[tag.split(" · AudioWorklet")[0]]
    tw = len(tag) * 7.3 + 24
    w(f'<rect x="{x + 52}" y="{y + 16}" width="{f(tw)}" height="26" rx="13" fill="{fill}" fill-opacity="0.12"/>')
    w(f'<text class="tag" x="{f(x + 52 + tw / 2)}" y="{y + 33.5}" text-anchor="middle" fill="{ink}">{tag}</text>')
    w(f'<text x="{x + 16}" y="{y + 72}"><tspan class="tt">{title}</tspan><tspan class="sm" dx="10">{note}</tspan></text>')
    for i, line in enumerate(lines):
        w(f'<text class="tx" x="{x + 16}" y="{y + 176 + 19 * i}">{line}</text>')
    return x + 16, y + 86  # pojok kiri atas area visual, tinggi 64


XS = [56, 359, 662, 965, 1268]  # baris 1: lima kartu 278 px
XS2 = [56, 434, 812, 1190]  # baris 2: empat kartu 353 px, dibaca dari kanan
R1, R2 = 42, 304

w('<rect class="col" x="40" y="26" width="1520" height="522" rx="26"/>')

# 1 Microphone
vx, vy = card(1, XS[0], R1, 278, "Browser", "Microphone", ["Mic menangkap gelombang suara.", "Filter bawaan browser dimatikan", "supaya suara tetap asli."])
w(f'<use href="#i-mic" x="{vx}" y="{vy + 17}" width="30" height="30"/>')
wave(vx + 46, vx + 244, vy + 32, 22, 6.5, env=lambda t: 0.35 + 0.65 * math.sin(math.pi * t) ** 0.7)

# 2 Preprocessing
vx, vy = card(2, XS[1], R1, 278, "Browser · AudioWorklet", "Preprocessing", ["Suara diubah jadi angka: 16.000", "sampel per detik (16 kHz), lalu", "dikirim tiap 0,1 detik."])
for k in range(3):
    bx = vx + k * 86
    w(f'<rect x="{bx}" y="{vy + 2}" width="74" height="44" rx="10" fill="#4b7bff" fill-opacity="0.07" stroke="#4b7bff" stroke-opacity="0.45" stroke-width="1.2" stroke-dasharray="4 3"/>')
    for j in range(9):
        sx = bx + 9 + j * 7
        sy = vy + 24 - 14 * math.sin(2 * math.pi * (k * 9 + j) / 11) * (0.5 + 0.5 * math.sin(math.pi * (k * 9 + j) / 27))
        w(f'<path d="M{f(sx)} {vy + 24}V{f(sy)}" stroke="#9fb9ff" stroke-width="1.6" stroke-linecap="round"/>')
        w(f'<circle cx="{f(sx)}" cy="{f(sy)}" r="2.2" fill="#4b7bff"/>')
    w(f'<text class="sm" x="{bx + 37}" y="{vy + 62}" text-anchor="middle">0,1 s</text>')

# 3 Audio buffer: semua potongan masuk, termasuk yang hening (abu)
vx, vy = card(3, XS[2], R1, 278, "Server", "Audio buffer", ["Potongan dari WebSocket masuk,", "termasuk yang hening. Tiap 1", "detik, seluruhnya diproses."])
w(f'<rect x="{vx}" y="{vy + 10}" width="246" height="20" rx="10" fill="#ececf0"/>')
for j in range(30):
    quiet = 13 <= j <= 16  # sama dengan bagian hening di langkah 4
    fill = "#c9c9d3" if quiet else "url(#gb)"
    w(f'<rect x="{f(vx + 2 + j * 6.8)}" y="{vy + 13}" width="5.4" height="14" rx="2" fill="{fill}"/>')
for s in range(1, 4):
    tx = vx + 2 + s * 68
    w(f'<path d="M{tx} {vy + 34}V{vy + 42}" stroke="#8c8c9c" stroke-width="1.5" stroke-linecap="round"/>')
    w(f'<text class="sm" x="{tx}" y="{vy + 58}" text-anchor="middle">{s} s</text>')

# 4 VAD
vx, vy = card(4, XS[3], R1, 278, "Whisper · GPU", "VAD", ["Bagian hening dilewati supaya", "Whisper tidak mengarang kata.", "Isi buffer sendiri tetap utuh."], note="voice activity detection")
wave(vx, vx + 88, vy + 32, 20, 3.2, env=lambda t: math.sin(math.pi * t) ** 0.6)
w(f'<rect x="{vx + 96}" y="{vy + 8}" width="58" height="48" rx="10" fill="#f5f5f7" stroke="#c9c9d3" stroke-width="1.2" stroke-dasharray="4 3"/>')
w(f'<text class="sm" x="{vx + 125}" y="{vy + 37}" text-anchor="middle">hening</text>')
wave(vx + 162, vx + 246, vy + 32, 20, 3.0, env=lambda t: math.sin(math.pi * t) ** 0.6)

# 5 Mel spectrogram: sumbu tegak frekuensi, sumbu datar waktu
vx, vy = card(5, XS[4], R1, 278, "Whisper · GPU", "Mel spectrogram", ["Gambar kekuatan suara per", "frekuensi: 128 mel bins, satu", "kolom tiap 10 ms."])
SHADES = ["#f1f7f4", "#d3f0e2", "#a6e3c7", "#62c99f", "#22a077", "#13704f"]
mx, mw, mh = vx + 20, 226, 46
cols, rows = 28, 7
cw, ch = mw / cols, mh / rows
for c in range(cols):
    t = c / (cols - 1)
    voiced = 0.0 if 0.40 < t < 0.55 else 1.0  # bagian hening dari langkah 4 tidak dibaca
    for r in range(rows):
        low = (rows - 1 - r) / (rows - 1)  # 1 di frekuensi terendah (bawah)
        ridge = math.exp(-((low - (0.55 + 0.25 * math.sin(2 * math.pi * t * 2.3))) ** 2) / 0.03)
        v = voiced * (0.55 * low + 0.6 * ridge) * (0.7 + 0.3 * math.sin(7 * t + r))
        lvl = max(0, min(len(SHADES) - 1, int(v * len(SHADES))))
        w(f'<rect x="{f(mx + c * cw)}" y="{f(vy + r * ch)}" width="{f(cw - 0.8)}" height="{f(ch - 0.8)}" rx="1.2" fill="{SHADES[lvl]}"/>')
w(f'<text class="sm" transform="translate({vx + 10} {vy + mh / 2}) rotate(-90)" text-anchor="middle">frekuensi</text>')
w(f'<text class="sm" x="{mx + mw}" y="{vy + 62}" text-anchor="end">waktu →</text>')

# Panah alur
for i in range(4):
    w(f'<path class="ln" d="M{XS[i] + 280} 156H{XS[i + 1] - 3}" marker-end="url(#mg)"/>')
w(f'<path class="ln" d="M1407 {R1 + H + 2}V{R2 - 3}" marker-end="url(#mg)"/>')
for i in range(3):
    w(f'<path class="ln" d="M{XS2[i + 1] - 2} 418H{XS2[i] + 356}" marker-end="url(#mg)"/>')
# 8 -> 3: setelah tiap tebakan, buffer di-trim (aturannya di baris "Detik 16")
w(f'<path class="ln" d="M724 {R2 - 2}V{R1 + H + 4}" marker-end="url(#mg)"/>')
w(f'<text class="sm" x="736" y="{(R1 + H + R2) // 2 + 5}">trim buffer</text>')

# 6 Encoder
vx, vy = card(6, XS2[3], R2, 353, "Whisper · GPU", "Encoder", ["Transformer encoder membaca pola di", "mel spectrogram dan mengubahnya jadi", "representasi angka (fitur)."])
LIL = ["#efe7ff", "#dcc2ff", "#b99af8", "#8b5cf6", "#6d3fd6"]
for c in range(18):
    for r in range(4):
        v = 0.5 + 0.5 * math.sin(c * 1.7 + r * 2.3) * math.cos(c * 0.6 - r)
        w(f'<circle cx="{f(vx + 9 + c * 17.9)}" cy="{f(vy + 8 + r * 16)}" r="5" fill="{LIL[min(4, int(v * 5))]}"/>')

# 7 Decoder: teks keluar beserta waktu tiap kata
vx, vy = card(7, XS2[2], R2, 353, "Whisper · GPU", "Decoder", ["Menulis teks token demi token (beam", "search 5), dibantu hotwords + konteks.", "Tiap kata diberi waktu (timestamp)."])
cx = vx
for word, span in [("jadi", "0,1–0,4 s"), ("backpropagation", "0,5–1,6 s"), ("itu", "1,7–1,9 s"), ("…", "")]:
    cw_ = len(word) * 7.6 + 18
    if span:
        w(f'<rect x="{f(cx)}" y="{vy + 4}" width="{f(cw_)}" height="26" rx="13" fill="#f5f5f7"/>')
        w(f'<text class="tx" x="{f(cx + cw_ / 2)}" y="{vy + 22}" text-anchor="middle" style="fill:#16161d">{word}</text>')
        w(f'<text class="sm" x="{f(cx + cw_ / 2)}" y="{vy + 50}" text-anchor="middle">{span}</text>')
    else:
        w(f'<rect x="{f(cx)}" y="{vy + 4}" width="{f(cw_)}" height="26" rx="13" fill="none" stroke="#c9c9d3" stroke-width="1.2" stroke-dasharray="4 3"/>')
        w(f'<text class="sm" x="{f(cx + cw_ / 2)}" y="{vy + 22}" text-anchor="middle">{word}</text>')
    cx += cw_ + 8

# 8 LocalAgreement
vx, vy = card(8, XS2[1], R2, 353, "Server", "LocalAgreement", ["Bandingkan dengan tebakan 1 detik lalu.", "Kata yang sama jadi confirmed, sisanya", "partial. Setelah itu buffer di-trim."])
for i, (lab, rest) in enumerate([("lalu", "backprop"), ("baru", "backpropagation itu")]):
    yy = vy + 4 + 32 * i
    w(f'<text class="sm" x="{vx}" y="{yy + 18}">tebakan {lab}</text>')
    w(f'<rect x="{vx + 96}" y="{yy}" width="46" height="26" rx="13" fill="#22775b" fill-opacity="0.14"/>')
    w(f'<text class="tx" x="{vx + 119}" y="{yy + 18}" text-anchor="middle" style="fill:#22775b;font-weight:600">jadi</text>')
    w(f'<text class="tx" x="{vx + 150}" y="{yy + 18}">{rest}</text>')

# 9 Layar live
vx, vy = card(9, XS2[0], R2, 353, "Browser", "Layar live", ["confirmed: hitam, sudah tetap.", "partial: abu-abu, masih bisa berubah."])
w(f'<rect x="{vx}" y="{vy + 4}" width="321" height="56" rx="12" fill="#f5f5f7"/>')
w(f'<text x="{vx + 16}" y="{vy + 37}" style="font-size:15px"><tspan style="font-weight:500;fill:#16161d">jadi backpropagation itu</tspan><tspan style="fill:#8c8c9c"> cara</tspan></text>')

# Contoh waktu: tiap 1 detik langkah 4-8 diulang, lalu buffer di-trim setelah lewat 15 detik
w('<rect class="col" x="40" y="566" width="1520" height="314" rx="26"/>')
w('<text class="ch" x="56" y="600">Saat kamu terus bicara</text>')
w('<text class="chs" x="56" y="622">Audio terus masuk ke buffer. Tiap 1 detik, langkah 4–8 diulang untuk seluruh isi buffer.</text>')
w('<text x="1176" y="600" style="font-size:15px"><tspan style="font-weight:500;fill:#16161d">confirmed</tspan><tspan style="fill:#5c5c6e"> teks tetap</tspan></text>')
w('<text x="1356" y="600" style="font-size:15px"><tspan style="font-weight:500;fill:#8c8c9c">partial</tspan><tspan style="fill:#5c5c6e"> teks sementara</tspan></text>')
for x, lab in [(180, "Isi buffer"), (480, "Tebakan Whisper"), (830, "Di layar"), (1170, "Kenapa")]:
    w(f'<text class="cs" x="{x}" y="652">{lab}</text>')
ROWS = [
    ("jadi backprop", ("", "jadi backprop"), "Belum ada pembanding, semua masih partial."),
    ("jadi backpropagation itu", ("jadi", " backpropagation itu"), "“jadi” sama. “backprop” berubah, belum tetap."),
    ("jadi backpropagation itu cara", ("jadi backpropagation itu", " cara"), "“backpropagation itu” sama di tebakan 2 dan 3."),
]
for i, (guess, (conf, part), why) in enumerate(ROWS):
    y = 664 + 52 * i
    w(f'<rect class="card" x="56" y="{y}" width="1488" height="46" rx="16"/>')
    w(f'<text class="sn" x="72" y="{y + 29}">Detik {i + 1}</text>')
    w(f'<rect x="180" y="{y + 16}" width="{80 * (i + 1)}" height="14" rx="7" fill="url(#gb)"/>')
    w(f'<text class="cs" x="{180 + 80 * (i + 1) + 10}" y="{y + 28}">0–{i + 1} s</text>')
    w(f'<text class="cb" x="480" y="{y + 29}">{guess}</text>')
    conf_span = f'<tspan style="font-weight:500;fill:#16161d">{conf}</tspan>' if conf else ""
    w(f'<text x="830" y="{y + 29}" style="font-size:16px">{conf_span}<tspan style="fill:#8c8c9c">{part}</tspan></text>')
    w(f'<text class="cs" x="1170" y="{y + 28}">{why}</text>')
y = 664 + 52 * 3
w(f'<rect class="card" x="56" y="{y}" width="1488" height="46" rx="16"/>')
w(f'<text class="sn" x="72" y="{y + 29}">Detik 16</text>')
w(f'<rect x="180" y="{y + 16}" width="150" height="14" rx="7" fill="#ececf0" stroke="#c9c9d3" stroke-width="1" stroke-dasharray="3 3"/>')
w(f'<rect x="336" y="{y + 16}" width="90" height="14" rx="7" fill="url(#gb)"/>')
w(f'<text class="cb" x="480" y="{y + 29}">Buffer lewat 15 detik: audio sampai kata confirmed terakhir dibuang, teksnya jadi konteks decoder.</text>')

w("</svg>")
(ROOT / "docs/diagram/pipeline-asr.svg").write_text(head + "\n".join(out) + "\n", encoding="utf-8")
print("ok")
