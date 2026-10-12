import { createContext, useContext, useId, type CSSProperties, type ReactNode } from 'react'
import { Easing, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { TONES, type KapurTone, type Tone } from '../../../frontend/src/lib/kapur'
import { Sfx } from '../ui'

// Perkakas showreel. Semua waktu di sini dalam detik (lokal di Sequence), bukan frame, supaya
// animasinya sama di 30 atau 60 fps.

export const REEL_FPS = 60
// 120 BPM: satu ketukan 0,5 detik. Potongan dan transisi jatuh di ketukan (audio/make_audio.py).
export const BEAT = 0.5

export const outExpo = Easing.bezier(0.16, 1, 0.3, 1)
export const inExpo = Easing.bezier(0.7, 0, 0.84, 0)
export const inOut = Easing.bezier(0.65, 0, 0.35, 1)
export const outBack = Easing.bezier(0.34, 1.56, 0.64, 1)
export const linear = (t: number) => t

export function useT() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return frame / fps
}

// interpolate dalam detik, selalu dijepit.
export const ease = (t: number, [a, b]: [number, number], [x, y]: [number, number] = [0, 1], easing = outExpo) =>
  interpolate(t, [a, b], [x, y], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing })

const SPRINGS = {
  // Lewat sedikit lalu mengendap: muncul, mendarat.
  bouncy: { damping: 12, stiffness: 180, mass: 0.8 },
  // Hampir tanpa lewat: kamera, tata letak.
  soft: { damping: 26, stiffness: 120, mass: 1 },
  // Cepat dan tegas: potongan tipografi.
  snappy: { damping: 20, stiffness: 320, mass: 0.6 },
  // Sangat kenyal: karakter.
  jelly: { damping: 7, stiffness: 140, mass: 0.7 },
}
export const spr = (t: number, at: number, kind: keyof typeof SPRINGS = 'bouncy') =>
  t < at ? 0 : spring({ frame: (t - at) * 60, fps: 60, config: SPRINGS[kind] })

export const mix = (a: number, b: number, u: number) => a + (b - a) * u

// Efek suara di detik `at`.
export function Hit({ at, name, volume = 0.6 }: { at: number; name: string; volume?: number }) {
  const { fps } = useVideoConfig()
  return <Sfx at={at * fps} name={name} volume={volume} />
}

// Warna Empur di antara dua nada warna, untuk Empur yang berganti warna.
export function mixTone(a: KapurTone, b: KapurTone, u: number): Tone {
  const [x, y] = [TONES[a], TONES[b]]
  const out = {} as Tone
  for (const k of Object.keys(x) as (keyof Tone)[]) out[k] = interpolateColors(u, [0, 1], [x[k], y[k]])
  return out
}

// Butiran film yang bergerak tiap frame: derau statis yang posisinya diacak, jadi murah dirender.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
export function Grain({ opacity = 0.07 }: { opacity?: number }) {
  const frame = useCurrentFrame()
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: GRAIN,
        backgroundPosition: `${Math.floor(random(`gx${frame}`) * 240)}px ${Math.floor(random(`gy${frame}`) * 240)}px`,
        mixBlendMode: 'overlay',
        opacity,
      }}
    />
  )
}

// Motion blur searah: Gaussian dengan simpangan berbeda di x dan y, sebanding dengan kecepatan.
export function Blur({ x = 0, y = 0, children, style }: { x?: number; y?: number; children: ReactNode; style?: CSSProperties }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const on = x > 0.3 || y > 0.3
  return (
    <div style={{ position: 'absolute', inset: 0, filter: on ? `url(#${id})` : undefined, ...style }}>
      {on && (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={`${x.toFixed(1)} ${y.toFixed(1)}`} />
          </filter>
        </svg>
      )}
      {children}
    </div>
  )
}

// Filter "gooey": lingkaran yang berdekatan menyatu seperti cairan.
export function Goo({ children, blur = 26 }: { children: ReactNode; blur?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <div style={{ position: 'absolute', inset: 0, filter: `url(#${id})` }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id={id}>
          <feGaussianBlur stdDeviation={blur} />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
        </filter>
      </svg>
      {children}
    </div>
  )
}

// Angka bergulir seperti odometer. value boleh pecahan: digit satuan bergulir halus, digit di atasnya
// ikut berputar saat digit di bawahnya lewat dari 9 ke 0.
export function Odometer({ value, digits = 1, style }: { value: number; digits?: number; style?: CSSProperties }) {
  const cols = Array.from({ length: digits }, (_, i) => {
    const place = 10 ** (digits - 1 - i)
    const whole = Math.floor(value / place)
    const below = (value % place) / place
    // Berputar hanya di sepersepuluh terakhir sebelum naik, seperti roda odometer.
    const carry = place === 1 ? value % 1 : Math.max(0, (below - 0.9) * 10)
    return (whole % 10) + carry
  })
  const lead = cols.findIndex((c, i) => c >= 0.5 || i === digits - 1)
  return (
    <span style={{ display: 'inline-flex', fontVariantNumeric: 'tabular-nums', ...style }}>
      {cols.map((c, i) =>
        i < lead ? null : (
          <span key={i} style={{ display: 'inline-block', height: '1.1em', overflow: 'hidden', lineHeight: 1.1 }}>
            <span style={{ display: 'flex', flexDirection: 'column', transform: `translateY(${-c * 1.1}em)` }}>
              {Array.from({ length: 11 }, (_, d) => (
                <span key={d} style={{ height: '1.1em' }}>
                  {d % 10}
                </span>
              ))}
            </span>
          </span>
        ),
      )}
    </span>
  )
}

// Ledakan debu kapur: butir terlempar keluar, melambat, jatuh sedikit, dan memudar.
export function Dust({ at, t, x, y, n = 14, spread = 140, colors = ['#FFD34D', '#FFF3B0', '#ffffff'], size = 12, seed = 'd' }: { at: number; t: number; x: number; y: number; n?: number; spread?: number; colors?: string[]; size?: number; seed?: string }) {
  const u = (t - at) / 0.9
  if (u < 0 || u > 1) return null
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2
        const d = spread * (0.4 + random(`${seed}r${i}`) * 0.6) * outExpo(u)
        const s = size * (0.5 + random(`${seed}s${i}`))
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.cos(a) * d - s / 2,
              top: y + Math.sin(a) * d * 0.8 + 60 * u * u - s / 2,
              width: s,
              height: s,
              borderRadius: s,
              background: colors[i % colors.length],
              opacity: (1 - u) ** 1.4,
              transform: `scale(${1 - 0.6 * u})`,
            }}
          />
        )
      })}
    </>
  )
}

// Lompatan karakter dengan antisipasi, regangan saat naik, dan pepat saat mendarat.
// Mengembalikan pergeseran y (piksel, negatif ke atas) dan skala [x, y] yang berpusat di kaki.
export function jump(t: number, up: number, land: number, height: number) {
  const pre = 0.12
  if (t < up - pre) return { y: 0, sx: 1, sy: 1 }
  if (t < up) {
    const u = Math.sin(((t - (up - pre)) / pre) * Math.PI * 0.5)
    return { y: 0, sx: 1 + 0.16 * u, sy: 1 - 0.18 * u }
  }
  if (t < land) {
    const u = (t - up) / (land - up)
    const v = 1 - Math.abs(2 * u - 1)
    return { y: -height * 4 * u * (1 - u), sx: 1 - 0.1 * v, sy: 1 + 0.14 * v }
  }
  const k = spr(t, land, 'jelly')
  const squash = (1 - k) * 0.9
  return { y: 0, sx: 1 + 0.22 * squash, sy: 1 - 0.26 * squash }
}

// Musik yang sudah dianalisis per frame (Showreel.tsx), untuk visual yang bergerak mengikuti bunyi.
export const LevelContext = createContext<number[]>([])
export const useLevels = () => useContext(LevelContext)
export const useBass = () => {
  const levels = useLevels()
  return levels.length ? (levels[0] + levels[1]) / 2 : 0
}

// Label penjelas tanpa garis: muncul tepat di samping bagian yang sedang difokus kamera.
// (x, y) adalah titik jangkar di layar; align menentukan sisi label yang menempel ke titik itu.
export function Label({ t, at, out, x, y, text, align = 'left' }: { t: number; at: number; out: number; x: number; y: number; text: string; align?: 'left' | 'right' | 'center' }) {
  if (t < at || t > out + 0.35) return null
  const p = spr(t, at, 'bouncy')
  const gone = ease(t, [out, out + 0.3], [0, 1], inExpo)
  const shift = { left: '0%', center: '-50%', right: '-100%' }[align]
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${shift}, -50%) translateY(${(1 - p) * 16 - 10 * gone}px) scale(${0.75 + 0.25 * p})`,
        transformOrigin: { left: 'left center', center: 'center', right: 'right center' }[align],
        opacity: Math.min(1, p * 2) * (1 - gone),
        padding: '14px 26px',
        borderRadius: 999,
        background: '#16161d',
        color: '#fff',
        fontSize: 32,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        boxShadow: '0 20px 36px -18px rgba(0,0,0,0.55)',
        pointerEvents: 'none',
      }}
    >
      {text}
    </div>
  )
}

// Huruf demi huruf dengan berat huruf variabel (Lexend 100..900) yang ikut bergerak.
// mode: slam (menghantam dari besar dan kabur), drop (jatuh memantul), rise (naik dari balik garis).
export function Letters({
  text,
  t,
  at,
  size,
  color = '#16161d',
  mode = 'rise',
  stagger = 0.035,
  weight = [800, 800],
  style,
}: {
  text: string
  t: number
  at: number
  size: number
  color?: string
  mode?: 'slam' | 'drop' | 'rise'
  stagger?: number
  weight?: [number, number]
  style?: CSSProperties
}) {
  return (
    <div style={{ fontSize: size, color, lineHeight: 1, letterSpacing: '-0.04em', whiteSpace: 'pre', ...style }}>
      {Array.from(text).map((ch, i) => {
        const at0 = at + i * stagger
        const p = mode === 'drop' ? spr(t, at0, 'bouncy') : mode === 'slam' ? spr(t, at0, 'snappy') : ease(t, [at0, at0 + 0.45])
        const w = mix(weight[0], weight[1], Math.min(1, p))
        const tf =
          mode === 'drop'
            ? `translateY(${(1 - p) * -1.1}em) rotate(${(1 - p) * (i % 2 ? 14 : -14)}deg)`
            : mode === 'slam'
              ? `scale(${mix(2.2, 1, p)})`
              : `translateY(${(1 - p) * 1.05}em)`
        return (
          <span key={i} style={{ display: 'inline-block', overflow: mode === 'rise' ? 'hidden' : undefined, verticalAlign: 'top', paddingBottom: mode === 'rise' ? '0.12em' : undefined }}>
            <span
              style={{
                display: 'inline-block',
                fontWeight: w,
                transform: tf,
                opacity: t < at0 ? 0 : Math.min(1, p * 3),
                filter: mode === 'slam' && p < 0.98 ? `blur(${(1 - p) * 18}px)` : undefined,
              }}
            >
              {ch}
            </span>
          </span>
        )
      })}
    </div>
  )
}

// Kalimat yang naik kata demi kata dari balik garis, dengan kabur yang menajam.
export function Rise({ text, t, at, size, color = '#16161d', weight = 700, stagger = 0.05, style }: { text: string; t: number; at: number; size: number; color?: string; weight?: number; stagger?: number; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: size, fontWeight: weight, color, lineHeight: 1.12, letterSpacing: '-0.025em', ...style }}>
      {text.split(' ').map((w, i) => {
        const p = ease(t, [at + i * stagger, at + i * stagger + 0.5])
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', padding: '0.06em 0.02em 0.14em', margin: '-0.06em 0 -0.14em', verticalAlign: 'top' }}>
            <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`, opacity: Math.min(1, p * 4), filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined }}>
              {w}
              {' '}
            </span>
          </span>
        )
      })}
    </div>
  )
}

// Keluar ke atas sambil kabur, untuk mengganti judul.
export const exitUp = (t: number, at: number, dur = 0.3): CSSProperties => {
  const q = ease(t, [at, at + dur], [0, 1], inExpo)
  return q === 0 ? {} : { opacity: 1 - q, transform: `translateY(${-50 * q}px)`, filter: `blur(${10 * q}px)` }
}
