"""Musik latar dan efek suara untuk video promo, disintesis dari nol dengan numpy dan scipy.

Tidak ada sampel atau musik pihak ketiga, jadi tidak ada urusan lisensi.
Pakai:  python audio/make_audio.py   ->  public/music.wav dan public/sfx/*.wav

Tempo 120 BPM: satu ketukan 0,5 detik (15 frame video), satu birama 2 detik (60 frame).
Struktur musik mengikuti linimasa di src/Promo.tsx, dalam ketukan:
  0-8    pembuka yang menggantung (masalah), riser ke drop
  8-16   drop pertama saat Empur muncul
  16-32  groove ringan untuk setup
  32-56  groove penuh dengan melodi untuk sesi live
  56-64  jeda tenang untuk adegan privasi, riser ke drop
  64-80  drop kedua untuk feedback dan ajakan
  80-88  akor penutup yang bergema
"""

import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
BEAT = 0.5
LENGTH = 88 * BEAT
OUT = Path(__file__).resolve().parent.parent / "public"
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def span(seconds):
    return np.arange(int(seconds * SR)) / SR


def sos(kind, f, order=2):
    return butter(order, f, kind, fs=SR, output="sos")


def lp(x, f, order=2):
    return sosfilt(sos("low", f, order), x)


def hp(x, f, order=2):
    return sosfilt(sos("high", f, order), x)


def bp(x, lo, hi, order=2):
    return sosfilt(sos("band", [lo, hi], order), x)


def sweep(x, cutoffs, kind="band", width=0.5, chunk=512):
    """Filter dengan frekuensi yang bergerak (riser, whoosh). cutoffs: satu nilai per sampel.
    Diproses per potongan, dan state filter dibawa ke potongan berikutnya supaya tidak berbunyi klik."""
    out = np.zeros_like(x)
    zi = np.zeros((1, 2)) if kind != "band" else np.zeros((2, 2))
    for i in range(0, len(x), chunk):
        c = float(np.clip(cutoffs[min(i + chunk // 2, len(x) - 1)], 40, 18000))
        s = sos("band", [c * (1 - width), min(c * (1 + width), 20000)]) if kind == "band" else sos(kind, c)
        out[i : i + chunk], zi = sosfilt(s, x[i : i + chunk], zi=zi)
    return out


def noise(seconds):
    return rng.standard_normal(int(seconds * SR))


# ---------- Instrumen ----------


def saw(f, seconds):
    """Gergaji dengan polyBLEP, supaya nada tinggi tidak kasar (aliasing)."""
    t = span(seconds)
    ph = (f * t + rng.random()) % 1.0
    dt = f / SR
    y = 2 * ph - 1
    m = ph < dt
    x = ph[m] / dt
    y[m] -= x + x - x * x - 1
    m = ph > 1 - dt
    x = (ph[m] - 1) / dt
    y[m] -= x * x + x + x + 1
    return y


def supersaw(notes, seconds, cutoff, attack=0.01, release=0.25, voices=5, detune=12):
    """Akor dari beberapa gergaji yang sedikit sumbang, disebar kiri-kanan. Hasil stereo."""
    n = int(seconds * SR)
    out = np.zeros((2, n))
    for note in notes:
        for v in range(voices):
            k = (v - (voices - 1) / 2) / ((voices - 1) / 2)
            y = saw(midi(note) * 2 ** (k * detune / 1200), seconds)
            pan = 0.5 + 0.35 * k
            out[0] += y * np.cos(pan * np.pi / 2)
            out[1] += y * np.sin(pan * np.pi / 2)
    t = span(seconds)
    e = np.minimum(1, t / attack) * np.clip((seconds - t) / release, 0, 1)
    return np.stack([lp(out[0], cutoff), lp(out[1], cutoff)]) * e / (len(notes) * voices) ** 0.5


def pluck(note, seconds=0.5, bright=1.0):
    """Petikan: harmonik tinggi meluruh lebih cepat daripada nada dasar."""
    f = midi(note)
    t = span(seconds)
    y = np.zeros_like(t)
    for k in range(1, 24):
        if f * k > 15000:
            break
        y += np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (5 + 6 * k * bright))
    return y * np.minimum(1, t / 0.002) * 0.7


def bell(note, seconds=1.8):
    """Lonceng kecil (glockenspiel): parsial tidak harmonis dengan peluruhan masing-masing."""
    f = midi(note)
    t = span(seconds)
    parts = [(1.0, 1.0, 2.4), (2.0, 0.3, 4.0), (3.0, 0.14, 6.0), (4.07, 0.1, 8.0), (5.4, 0.05, 11.0)]
    y = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in parts)
    return y * np.minimum(1, t / 0.002) * 0.5


def bass(note, seconds):
    f = midi(note)
    t = span(seconds)
    y = 0.7 * np.sin(2 * np.pi * f * t) + 0.3 * np.sin(np.pi * f * t) + 0.25 * lp(saw(f, seconds), 700)
    return y * np.minimum(1, t / 0.004) * np.clip((seconds - t) / 0.03, 0, 1)


def kick():
    t = span(0.45)
    f = 47 + 125 * np.exp(-t * 30)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    y += 0.2 * hp(noise(0.45), 2500) * np.exp(-t * 300)
    return np.tanh(1.7 * y)


def clap():
    t = span(0.35)
    n = bp(noise(0.35), 900, 3400)
    e = sum(np.exp(-np.clip(t - d, 0, None) * 140) * (t >= d) for d in (0, 0.011, 0.023)) * 0.7
    e += np.exp(-np.clip(t - 0.03, 0, None) * 17) * (t >= 0.03)
    return n * e


def hat(open_=False):
    s = 0.4 if open_ else 0.08
    t = span(s)
    return hp(noise(s), 7500) * np.exp(-t * (8 if open_ else 60))


def snare():
    t = span(0.25)
    return bp(noise(0.25), 1200, 7500) * np.exp(-t * 24) + 0.6 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 32)


def crash():
    t = span(2.6)
    return lp(hp(noise(2.6), 3800), 12000) * np.exp(-t * 1.5)


def impact():
    t = span(2.5)
    f = 36 + 70 * np.exp(-t * 7)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.0)
    return np.tanh(1.4 * (boom + 0.5 * lp(noise(2.5), 1500) * np.exp(-t * 6)))


def riser(seconds):
    t = span(seconds)
    u = t / seconds
    n = sweep(noise(seconds), 250 * 32**u, width=0.35)
    tone = np.sin(2 * np.pi * np.cumsum(220 * 4**u) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(4 + 20 * u) / SR))
    return (n * 1.2 + 0.25 * tone) * u**2.2


def reverb_ir(seconds=2.4, rt=1.6):
    t = span(seconds)
    ir = [lp(noise(seconds) * np.exp(-6.9 * t / rt), 6500) for _ in range(2)]
    pre = np.zeros(int(0.018 * SR))
    ir = np.stack([np.concatenate([pre, x]) for x in ir])
    return ir / np.sqrt((ir**2).sum() / 2)


# ---------- Aransemen ----------

N = int((LENGTH + 3) * SR)
dry = np.zeros((2, N))
pump = np.zeros((2, N))  # bass, akor, pad: ditekan setiap kick (sidechain)
send = np.zeros((2, N))  # ke reverb
kicks = []


def put(y, beat, gain=1.0, pan=0.0, rev=0.0, bus=None):
    i = int(beat * BEAT * SR)
    if y.ndim == 1:
        a = (pan + 1) * np.pi / 4
        y = np.stack([y * np.cos(a), y * np.sin(a)])
    y = y[:, : N - i] * gain
    (bus if bus is not None else dry)[:, i : i + y.shape[1]] += y
    if rev:
        send[:, i : i + y.shape[1]] += y * rev


CHORDS = {
    "C": ([60, 64, 67], 48),
    "G": ([59, 62, 67], 43),
    "Am": ([60, 64, 69], 45),
    "F": ([60, 65, 69], 41),
    "Gsus": ([60, 62, 67], 43),
}
# (ketukan mulai, akor). Akor terakhir bertahan sampai akhir.
PROGRESSION = [
    (0, "Am"), (4, "F"), (6, "G"),
    (8, "C"), (12, "G"), (16, "Am"), (20, "F"),
    (24, "C"), (28, "G"), (32, "Am"), (36, "F"),
    (40, "C"), (44, "G"), (48, "Am"), (52, "F"),
    (56, "F"), (60, "Gsus"), (62, "G"),
    (64, "C"), (68, "G"), (72, "Am"), (76, "F"), (78, "G"),
    (80, "C"),
]  # fmt: skip
# Melodi lonceng per akor, satu nada per seperdelapan (None = diam).
MELODY = {
    "C": [76, None, 79, None, 81, 79, None, 76],
    "G": [74, None, None, 71, 74, None, 79, None],
    "Am": [72, None, 76, None, 81, None, 79, 76],
    "F": [77, None, 76, None, 72, None, None, None],
}


def section(beat):
    for start, name in [(0, "intro"), (8, "drop"), (16, "setup"), (32, "live"), (56, "break"), (64, "drop2"), (80, "end")]:
        if beat >= start:
            current = name
    return current


for idx, (start, name) in enumerate(PROGRESSION):
    end = PROGRESSION[idx + 1][0] if idx + 1 < len(PROGRESSION) else 88
    notes, root = CHORDS[name]
    sec = section(start)
    length = (end - start) * BEAT

    # Pad: selalu ada, redup di pembuka dan jeda, terang di bagian penuh.
    cutoff = {"intro": 900, "break": 1400, "end": 2600}.get(sec, 1800)
    put(supersaw([n - 12 for n in notes] + notes, length + 0.6, cutoff, attack=0.25, release=0.6), start, 0.32, bus=pump, rev=0.3)

    if sec in ("drop", "live", "drop2", "setup"):
        gain = 0.34 if sec == "setup" else 0.42
        put(supersaw([n + 12 for n in notes], length, 3200), start, gain, bus=pump, rev=0.15)
        # Bas di setiap seperdelapan, dengan tekanan kick membuatnya "memompa".
        for k in range(int((end - start) * 2)):
            put(bass(root, BEAT / 2 * 0.9), start + k / 2, 0.55, bus=pump)

    # Arpeggio petik: seperdelapan di pembuka dan setup, seperenam belas di bagian penuh.
    tones = sorted(notes) + [notes[0] + 12]
    order = [0, 1, 2, 3, 2, 1, 2, 3]
    step = 0.25 if sec in ("drop", "live", "drop2") else 0.5
    if sec != "end":
        k = 0
        while start + k * step < end:
            note = tones[order[k % 8]] + 12
            gain = {"intro": 0.2, "break": 0.12, "setup": 0.28}.get(sec, 0.22)
            put(pluck(note, 0.35, 1.2), start + k * step, gain * (1.0 if k % 2 == 0 else 0.7), pan=0.3 * np.sin(k), rev=0.25)
            k += 1

    # Melodi lonceng di live (mulai birama 10) dan drop kedua.
    if (sec == "live" and start >= 40) or sec == "drop2":
        for k, note in enumerate(MELODY.get(name, []) * int((end - start) / 4)):
            if note:
                put(bell(note), start + k / 2, 0.26, pan=-0.15, rev=0.4)
    if sec == "break":
        for k, note in enumerate((MELODY.get(name) or [74, None, None, None, 72, None, None, None])[::2]):
            if note:
                put(bell(note, 2.5), start + k, 0.22, rev=0.6)

# Drum per ketukan.
for b in range(88):
    sec = section(b)
    if sec in ("drop", "setup", "live", "drop2"):
        put(kick(), b, 0.95)
        kicks.append(b)
        if b % 2 == 1 and sec != "setup":
            put(clap(), b, 0.42, rev=0.25)
        if b % 2 == 1 and sec == "setup":
            put(clap(), b, 0.28, rev=0.3)
        put(hat(), b + 0.5, 0.2, pan=0.25)
        if sec in ("live", "drop2"):
            put(hat(), b + 0.25, 0.07, pan=0.25)
            put(hat(), b + 0.75, 0.07, pan=0.25)
        if b % 4 == 3:
            put(hat(True), b + 0.5, 0.1, pan=-0.2)
    if sec == "intro":
        put(hat(), b + 0.5, 0.08, pan=0.3)

# Gulungan snare yang makin rapat dan keras sebelum setiap drop.
for start, end in [(6, 8), (60, 64), (79, 80)]:
    t = start
    while t < end:
        u = (t - start) / (end - start)
        put(snare(), t, 0.08 + 0.3 * u, rev=0.2)
        t += 0.5 if u < 0.25 else 0.25 if u < 0.6 else 0.125

for b, seconds in [(4, 2.0), (58, 3.0)]:
    put(riser(seconds), b, 0.18)
# Cymbal terbalik yang membesar tepat sebelum drop.
for b in (8, 64, 80):
    rev_cymbal = crash()[: int(1.5 * SR)][::-1]
    put(rev_cymbal, b - 1.5 / BEAT, 0.18)
for b in (8, 64, 76, 80):
    put(impact(), b, 0.75 if b != 76 else 0.45)
    put(crash(), b, 0.28, rev=0.2)
put(kick(), 80, 0.9)

# Penutup: akor C penuh dan arpeggio lonceng turun.
put(supersaw([48, 55, 60, 64, 67, 72], 4.0, 2600, attack=0.01, release=3.5), 80, 0.45, rev=0.35)
put(bass(36, 3.0) * np.exp(-span(3.0) * 1.2), 80, 0.6)
for k, note in enumerate([84, 79, 76, 72, 67]):
    put(bell(note, 2.5), 80.5 + k * 0.5, 0.22, rev=0.5)

# Sidechain: bus pump turun tajam di setiap kick lalu pulih dalam ~150 ms.
t = np.arange(N) / SR
duck = np.ones(N)
for b in kicks:
    i = int(b * BEAT * SR)
    j = min(N, i + int(0.35 * SR))
    duck[i:j] = np.minimum(duck[i:j], 1 - 0.65 * np.exp(-t[: j - i] / 0.09))

wet = np.stack([fftconvolve(send[c], reverb_ir()[c])[:N] for c in range(2)])
mix = dry + pump * duck + 0.3 * wet
mix = mix[:, : int(LENGTH * SR)]
fade = np.clip((LENGTH - np.arange(mix.shape[1]) / SR) / 1.5, 0, 1)
mix *= fade
mix = np.tanh(1.2 * mix / np.abs(mix).max()) / np.tanh(1.2) * 0.89


# ---------- Efek suara ----------


def blip(f0, f1, seconds, decay):
    t = span(seconds)
    f = f1 + (f0 - f1) * np.exp(-t * 90)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * decay) * np.minimum(1, t / 0.001)


def marimba(note, seconds=0.45):
    f = midi(note)
    t = span(seconds)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t * 11) + 0.25 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 40)
    return y * np.minimum(1, t / 0.001)


def whoosh(seconds, lo, hi):
    t = span(seconds)
    u = t / seconds
    shape = np.sin(np.pi * u) ** 1.5
    y = sweep(noise(seconds), lo * (hi / lo) ** np.sin(np.pi * u * 0.8), width=0.45) * shape
    a = u * np.pi / 2  # bergerak dari kiri ke kanan
    return np.stack([y * np.cos(a), y * np.sin(a)])


def layer(*parts):
    """Jumlahkan sinyal mono yang panjangnya berbeda. parts: (mulai dalam detik, sinyal)."""
    out = np.zeros(max(int(s * SR) + len(y) for s, y in parts))
    for s, y in parts:
        out[int(s * SR) : int(s * SR) + len(y)] += y
    return out


def click(tone=2200):
    t = span(0.06)
    return hp(noise(0.06), 2000) * np.exp(-t * 700) * 0.8 + np.sin(2 * np.pi * tone * t) * np.exp(-t * 180) * 0.5


SFX = {
    "pop": blip(480, 1000, 0.14, 30),
    "blip": blip(1100, 1500, 0.1, 45) * 0.7,
    "paper": bp(noise(0.22), 1500, 6000) * np.exp(-span(0.22) * 22) * np.minimum(1, span(0.22) / 0.015) + 0.5 * blip(160, 70, 0.22, 20),
    "drop": blip(150, 55, 0.4, 11) + 0.4 * bp(noise(0.4), 800, 4000) * np.exp(-span(0.4) * 30),
    "whoosh": whoosh(0.5, 500, 3500),
    "swoosh": whoosh(0.75, 250, 1800),
    "bonk": np.sin(2 * np.pi * np.cumsum((520 * 0.5 ** (span(0.3) / 0.3)) * (1 + 0.05 * np.sin(2 * np.pi * 18 * span(0.3)))) / SR) * np.exp(-span(0.3) * 7) + 0.4 * blip(900, 700, 0.3, 60),
    "tick": layer((0, marimba(88, 0.1)), (0.07, marimba(95, 0.6)), (0, click(3000) * 0.4)),
    "lock": layer((0, click(1800)), (0.09, click(1400))),
    "click": click(),
    # Goresan kapur: derau yang bergetar kasar, seperti kapur menggores papan.
    "scratch": bp(noise(0.2), 2200, 7000) * np.exp(-span(0.2) * 12) * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 60 * span(0.2)))) * np.minimum(1, span(0.2) / 0.01),
    "sparkle": layer(*[(k * 0.045, bell(n, 1.2)) for k, n in enumerate([96, 100, 103, 108])]),
}
for k, note in enumerate([84, 86, 88, 91, 93]):
    SFX[f"note{k + 1}"] = marimba(note)
for k in range(3):
    s = 0.05
    SFX[f"key{k + 1}"] = bp(noise(s), 2500 + 900 * k, 6000) * np.exp(-span(s) * 260) + 0.5 * blip(260 - 30 * k, 150, s, 70)


def write(path, y):
    y = np.atleast_2d(y)
    if y.shape[0] == 1:
        y = np.vstack([y, y])
    y = y / max(1e-9, np.abs(y).max()) * 0.89 if path.parent.name == "sfx" else y
    data = (np.clip(y.T, -1, 1) * 32767).astype("<i2")
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


write(OUT / "music.wav", mix)
for name, y in SFX.items():
    write(OUT / "sfx" / f"{name}.wav", y)
print(f"music.wav {mix.shape[1] / SR:.1f} s, {len(SFX)} efek suara")
