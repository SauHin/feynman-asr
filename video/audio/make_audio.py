"""Musik latar dan efek suara untuk video promo dan showreel, disintesis dari nol dengan numpy dan scipy.

Tidak ada sampel atau musik pihak ketiga, jadi tidak ada urusan lisensi.
Pakai:  python audio/make_audio.py   ->  public/music.wav, public/showreel.wav, public/sfx/*.wav

Tempo 120 BPM: satu ketukan 0,5 detik, satu birama 2 detik. Setiap lagu punya peta bagian di atas
fungsinya (promo dan showreel), dalam ketukan, yang mengikuti linimasa videonya.
"""


import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
BEAT = 0.5
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


# ---------- Mixer ----------


class Mix:
    """Tiga bus stereo: dry, pump (bass, akor, pad yang ditekan setiap kick), dan send ke reverb."""

    def __init__(self, beats):
        self.beats = beats
        self.n = int((beats * BEAT + 3) * SR)
        self.dry, self.pump, self.send = (np.zeros((2, self.n)) for _ in range(3))
        self.kicks = []

    def put(self, y, beat, gain=1.0, pan=0.0, rev=0.0, pump=False):
        i = int(beat * BEAT * SR)
        if y.ndim == 1:
            a = (pan + 1) * np.pi / 4
            y = np.stack([y * np.cos(a), y * np.sin(a)])
        y = y[:, : self.n - i] * gain
        (self.pump if pump else self.dry)[:, i : i + y.shape[1]] += y
        if rev:
            self.send[:, i : i + y.shape[1]] += y * rev

    def premaster(self):
        """Sidechain (bus pump turun tajam di setiap kick lalu pulih ~150 ms) dan reverb."""
        t = np.arange(self.n) / SR
        duck = np.ones(self.n)
        for b in self.kicks:
            i = int(b * BEAT * SR)
            j = min(self.n, i + int(0.35 * SR))
            duck[i:j] = np.minimum(duck[i:j], 1 - 0.65 * np.exp(-t[: j - i] / 0.09))
        wet = np.stack([fftconvolve(self.send[c], reverb_ir()[c])[: self.n] for c in range(2)])
        return (self.dry + self.pump * duck + 0.3 * wet)[:, : int(self.beats * BEAT * SR)]


def master(mix, fade_seconds=1.5):
    length = mix.shape[1] / SR
    mix = mix * np.clip((length - np.arange(mix.shape[1]) / SR) / fade_seconds, 0, 1)
    return np.tanh(1.2 * mix / np.abs(mix).max()) / np.tanh(1.2) * 0.89


CHORDS = {
    "C": ([60, 64, 67], 48),
    "G": ([59, 62, 67], 43),
    "Am": ([60, 64, 69], 45),
    "F": ([60, 65, 69], 41),
    "Gsus": ([60, 62, 67], 43),
}


def section_of(sections, beat):
    for start, name in sections:
        if beat >= start:
            current = name
    return current


def closing_chord(m, beat):
    """Akor C penuh dan arpeggio lonceng turun."""
    m.put(supersaw([48, 55, 60, 64, 67, 72], 4.0, 2600, attack=0.01, release=3.5), beat, 0.45, rev=0.35)
    m.put(bass(36, 3.0) * np.exp(-span(3.0) * 1.2), beat, 0.6)
    for k, note in enumerate([84, 79, 76, 72, 67]):
        m.put(bell(note, 2.5), beat + 0.5 + k * 0.5, 0.22, rev=0.5)


def snare_roll(m, start, end):
    """Gulungan snare yang makin rapat dan keras sebelum drop."""
    t = start
    while t < end:
        u = (t - start) / (end - start)
        m.put(snare(), t, 0.08 + 0.3 * u, rev=0.2)
        t += 0.5 if u < 0.25 else 0.25 if u < 0.6 else 0.125


def reverse_cymbal(m, beat):
    """Cymbal terbalik yang membesar tepat sebelum `beat`."""
    m.put(crash()[: int(1.5 * SR)][::-1], beat - 1.5 / BEAT, 0.18)


# ---------- Lagu video promo (src/Promo.tsx), 88 ketukan ----------
#   0-8    pembuka yang menggantung (masalah), riser ke drop
#   8-16   drop pertama saat Empur muncul
#   16-32  groove ringan untuk setup
#   32-56  groove penuh dengan melodi untuk sesi live
#   56-64  jeda tenang untuk adegan privasi, riser ke drop
#   64-80  drop kedua untuk feedback dan ajakan
#   80-88  akor penutup yang bergema


def promo():
    global rng
    rng = np.random.default_rng(7)
    m = Mix(88)
    put = m.put
    # (ketukan mulai, akor). Akor terakhir bertahan sampai akhir.
    progression = [
        (0, "Am"), (4, "F"), (6, "G"),
        (8, "C"), (12, "G"), (16, "Am"), (20, "F"),
        (24, "C"), (28, "G"), (32, "Am"), (36, "F"),
        (40, "C"), (44, "G"), (48, "Am"), (52, "F"),
        (56, "F"), (60, "Gsus"), (62, "G"),
        (64, "C"), (68, "G"), (72, "Am"), (76, "F"), (78, "G"),
        (80, "C"),
    ]  # fmt: skip
    # Melodi lonceng per akor, satu nada per seperdelapan (None = diam).
    melody = {
        "C": [76, None, 79, None, 81, 79, None, 76],
        "G": [74, None, None, 71, 74, None, 79, None],
        "Am": [72, None, 76, None, 81, None, 79, 76],
        "F": [77, None, 76, None, 72, None, None, None],
    }
    sections = [(0, "intro"), (8, "drop"), (16, "setup"), (32, "live"), (56, "break"), (64, "drop2"), (80, "end")]

    for idx, (start, name) in enumerate(progression):
        end = progression[idx + 1][0] if idx + 1 < len(progression) else 88
        notes, root = CHORDS[name]
        sec = section_of(sections, start)
        length = (end - start) * BEAT

        # Pad: selalu ada, redup di pembuka dan jeda, terang di bagian penuh.
        cutoff = {"intro": 900, "break": 1400, "end": 2600}.get(sec, 1800)
        put(supersaw([n - 12 for n in notes] + notes, length + 0.6, cutoff, attack=0.25, release=0.6), start, 0.32, pump=True, rev=0.3)

        if sec in ("drop", "live", "drop2", "setup"):
            gain = 0.34 if sec == "setup" else 0.42
            put(supersaw([n + 12 for n in notes], length, 3200), start, gain, pump=True, rev=0.15)
            # Bas di setiap seperdelapan, dengan tekanan kick membuatnya "memompa".
            for k in range(int((end - start) * 2)):
                put(bass(root, BEAT / 2 * 0.9), start + k / 2, 0.55, pump=True)

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
            for k, note in enumerate(melody.get(name, []) * int((end - start) / 4)):
                if note:
                    put(bell(note), start + k / 2, 0.26, pan=-0.15, rev=0.4)
        if sec == "break":
            for k, note in enumerate((melody.get(name) or [74, None, None, None, 72, None, None, None])[::2]):
                if note:
                    put(bell(note, 2.5), start + k, 0.22, rev=0.6)

    # Drum per ketukan.
    for b in range(88):
        sec = section_of(sections, b)
        if sec in ("drop", "setup", "live", "drop2"):
            put(kick(), b, 0.95)
            m.kicks.append(b)
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

    for start, end in [(6, 8), (60, 64), (79, 80)]:
        snare_roll(m, start, end)
    for b, seconds in [(4, 2.0), (58, 3.0)]:
        put(riser(seconds), b, 0.18)
    for b in (8, 64, 80):
        reverse_cymbal(m, b)
    for b in (8, 64, 76, 80):
        put(impact(), b, 0.75 if b != 76 else 0.45)
        put(crash(), b, 0.28, rev=0.2)
    put(kick(), 80, 0.9)
    closing_chord(m, 80)
    return master(m.premaster())


# ---------- Lagu showreel (src/reel), 120 ketukan = 60 detik ----------
#   0-12    masalah: groove penuh dan stab akor di setiap kartu ("Baca slide.", "Hafalin.", "Baca lagi.")
#   12-17   "Pas ujian…": ketukan makin renggang, redam, dan turun nada, lalu lagu berhenti
#   17-20   hening: "blank." muncul dan hurufnya rontok
#   20-28   "Coba jelasin.": pad dan lonceng, tanpa drum
#   28-36   "Tapi siapa yang dengerin?": dengung menggantung, ketukan kapur, riser ke drop
#   36-44   drop: Empur muncul sebagai jawaban
#   44-56   groove ringan untuk setup
#   56-84   groove penuh untuk live dan feedback
#   84-94   jelasin lagi: stab di setiap centang (86-90)
#   94-104  grid: stutter di ketukan 101, riser ke drop
#   104-112 drop final
#   112-120 akor penutup


def stutter(mix, beat, slices):
    """Ulangi potongan pendek mulai `beat`: slices = [(panjang potongan, jumlah ulang), ...] dalam ketukan."""
    at = beat
    for size, times in slices:
        n = int(size * BEAT * SR)
        i = int(at * BEAT * SR)
        piece = mix[:, i : i + n].copy()
        piece *= np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / 60)
        for r in range(times):
            mix[:, i + r * n : i + (r + 1) * n] = piece
        at += size * times


def showreel():
    global rng
    rng = np.random.default_rng(11)
    m = Mix(120)
    put = m.put
    cycle = ["C", "G", "Am", "F"]
    progression = [(0, "Am"), (4, "F"), (8, "C"), (12, "G"), (20, "Am"), (24, "F"), (28, "G"), (32, "Gsus"), (34, "G")]
    progression += [(b, cycle[(b - 36) // 4 % 4]) for b in range(36, 104, 4)]
    progression += [(104, "C"), (108, "G"), (112, "C")]
    melody = {
        "C": [76, None, 79, None, 84, None, 83, 79],
        "G": [74, None, 79, None, 83, None, 81, 79],
        "Am": [76, None, 81, None, 79, 76, None, 74],
        "F": [72, None, 74, 76, None, 72, None, 69],
    }
    sections = [
        (0, "problem"), (12, "slow"), (20, "explain"), (28, "question"), (36, "title"), (44, "setup"),
        (56, "live"), (84, "retry"), (94, "grid"), (104, "finale"), (112, "end"),
    ]  # fmt: skip
    full = ("problem", "title", "live", "retry", "grid", "finale")

    for idx, (start, name) in enumerate(progression):
        end = progression[idx + 1][0] if idx + 1 < len(progression) else 120
        notes, root = CHORDS[name]
        sec = section_of(sections, start)
        length = (end - start) * BEAT
        if sec in ("end", "slow"):
            continue

        cutoff = {"explain": 1500, "question": 650}.get(sec, 1900)
        attack = 0.8 if sec in ("explain", "question") else 0.25
        put(supersaw([n - 12 for n in notes] + notes, length + 0.6, cutoff, attack=attack, release=0.6), start, 0.3, pump=True, rev=0.3)
        if sec == "question":
            put(np.sin(2 * np.pi * midi(31) * span(length)) * np.minimum(1, span(length) / 1.5), start, 0.35)

        if sec in full or sec == "setup":
            put(supersaw([n + 12 for n in notes], length, 3400), start, 0.3 if sec == "setup" else 0.42, pump=True, rev=0.15)
            for k in range(int((end - start) * 2)):
                put(bass(root, BEAT / 2 * 0.9), start + k / 2, 0.55, pump=True)

        tones = sorted(notes) + [notes[0] + 12]
        order = [0, 1, 2, 3, 2, 1, 2, 3]
        if sec in full or sec in ("setup", "explain"):
            step = 0.25 if sec in full else 0.5
            gain = {"setup": 0.26, "explain": 0.14}.get(sec, 0.22)
            k = 0
            while start + k * step < end:
                put(pluck(tones[order[k % 8]] + 12, 0.35, 1.2), start + k * step, gain * (1.0 if k % 2 == 0 else 0.7), pan=0.3 * np.sin(k), rev=0.25)
                k += 1

        if sec in full and start >= 40 and not (sec == "live" and start < 64):
            for k, note in enumerate(melody.get(name, []) * int((end - start) / 4)):
                if note:
                    put(bell(note), start + k / 2, 0.26, pan=-0.15, rev=0.4)
        if sec == "explain":
            for k, note in enumerate(melody[name][::2]):
                if note:
                    put(bell(note, 2.5), start + k, 0.22, rev=0.6)

    # "Pas ujian…": ketukan makin renggang, makin redam, dan nadanya turun, lalu lagu berhenti.
    slow_hits = [6.0, 6.6, 7.25, 7.95]
    g_notes, g_root = CHORDS["G"]
    for k, sec_at in enumerate(slow_hits):
        b = sec_at / BEAT
        drop = -0.5 * k
        put(kick(), b, 0.9 - 0.12 * k)
        m.kicks.append(b)
        put(supersaw([n + drop for n in g_notes] + [n + 12 + drop for n in g_notes], 0.5, 2600 * 0.62**k, attack=0.004, release=0.35), b, 0.5, rev=0.4)
        put(bass(g_root + drop, 0.6) * np.exp(-span(0.6) * 3), b, 0.5)
    put(supersaw([n - 12 for n in g_notes] + g_notes, 2.4, 900, attack=0.3, release=1.2), 12, 0.22, rev=0.4)

    # Stab akor di setiap kartu masalah, di setiap centang sesi kedua, dan di drop final.
    for b in [0, 4, 8, 86, 87, 88, 89, 90]:
        notes, _ = CHORDS[[c for s, c in progression if s <= b][-1]]
        put(supersaw([n + 12 for n in notes] + notes, 0.22, 5200, attack=0.003, release=0.15), b, 0.5, rev=0.25)

    for b in range(120):
        sec = section_of(sections, b)
        if sec in full or sec == "setup":
            put(kick(), b, 0.95)
            m.kicks.append(b)
            if b % 2 == 1:
                put(clap(), b, 0.28 if sec == "setup" else 0.42, rev=0.25)
            put(hat(), b + 0.5, 0.2, pan=0.25)
            if sec in ("problem", "live", "retry", "finale"):
                put(hat(), b + 0.25, 0.07, pan=0.25)
                put(hat(), b + 0.75, 0.07, pan=0.25)
            if b % 4 == 3:
                put(hat(True), b + 0.5, 0.1, pan=-0.2)
    put(snare(), 11.5, 0.2, rev=0.3)
    put(snare(), 11.75, 0.28, rev=0.3)

    snare_roll(m, 34, 36)
    snare_roll(m, 103, 104)
    for b, seconds in [(32, 2.0), (100, 2.0)]:
        put(riser(seconds), b, 0.18)
    for b in (36, 104):
        reverse_cymbal(m, b)
    for b, gain in [(0, 0.5), (36, 0.8), (76, 0.4), (104, 0.8), (112, 0.7)]:
        put(impact(), b, gain)
        put(crash(), b, 0.28, rev=0.2)
    for b in (56, 84, 94):
        put(crash(), b, 0.18, rev=0.2)
    put(kick(), 112, 0.9)
    closing_chord(m, 112)

    mix = m.premaster()
    # Hening total setelah ketukan terakhir "Pas ujian…" sampai "Coba jelasin." (ketukan 20).
    i, j, k = int(8.1 * SR), int(8.4 * SR), int(20 * BEAT * SR)
    mix[:, i:j] *= np.linspace(1, 0, j - i)
    mix[:, j:k] = 0
    stutter(mix, 101, [(0.25, 2), (0.125, 4)])
    return master(mix)


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


def glide(f0, f1, seconds, wobble=0.0, decay=6.0):
    """Nada yang meluncur dari f0 ke f1, dengan getaran (wobble) yang mereda."""
    t = span(seconds)
    f = f0 * (f1 / f0) ** (t / seconds) * (1 + wobble * np.sin(2 * np.pi * 13 * t) * np.exp(-t * 5))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * decay) * np.minimum(1, t / 0.004)


def effects():
    sfx = {
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
        sfx[f"note{k + 1}"] = marimba(note)
    for k in range(3):
        s = 0.05
        sfx[f"key{k + 1}"] = bp(noise(s), 2500 + 900 * k, 6000) * np.exp(-span(s) * 260) + 0.5 * blip(260 - 30 * k, 150, s, 70)

    # Efek tambahan untuk showreel.
    sfx["tap"] = layer((0, click(3200) * 0.6), (0, blip(240, 110, 0.14, 35) * 0.7), (0, hp(noise(0.05), 4000) * np.exp(-span(0.05) * 120) * 0.4))
    sfx["stretch"] = glide(160, 760, 0.38, wobble=0.04, decay=2.0) * np.sin(np.pi * span(0.38) / 0.38) ** 0.5
    sfx["boing"] = glide(300, 170, 0.45, wobble=0.25, decay=6.0)
    sfx["swish"] = whoosh(0.24, 1500, 7000)
    sfx["land"] = layer((0, blip(130, 48, 0.35, 12)), (0, bp(noise(0.2), 300, 2500) * np.exp(-span(0.2) * 35) * 0.5))
    sfx["ripple"] = layer((0, blip(700, 1400, 0.2, 25) * 0.6), (0.08, blip(700, 1400, 0.2, 30) * 0.3))
    sfx["confetti"] = layer(*[(rng.random() * 0.7, click(2000 + rng.random() * 4000) * (0.15 + 0.3 * rng.random())) for _ in range(40)])
    gate = (np.sin(2 * np.pi * 40 * span(0.3)) > 0).astype(float)
    sfx["glitch"] = np.round(bp(noise(0.3), 400, 6000) * 3) / 3 * gate * np.exp(-span(0.3) * 4)
    sfx["thump"] = layer((0, kick() * 0.8), (0, blip(130, 48, 0.35, 12) * 0.5))
    return sfx


def write(path, y, normalize=False):
    y = np.atleast_2d(y)
    if y.shape[0] == 1:
        y = np.vstack([y, y])
    if normalize:
        y = y / max(1e-9, np.abs(y).max()) * 0.89
    data = (np.clip(y.T, -1, 1) * 32767).astype("<i2")
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


if __name__ == "__main__":
    write(OUT / "music.wav", promo())
    sfx = effects()
    for name, y in sfx.items():
        write(OUT / "sfx" / f"{name}.wav", y, normalize=True)
    write(OUT / "showreel.wav", showreel())
    print(f"music.wav, showreel.wav, {len(sfx)} efek suara")
