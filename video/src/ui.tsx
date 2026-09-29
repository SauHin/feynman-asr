import type { CSSProperties, ReactNode } from 'react'
import { Easing, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame } from 'remotion'
import { FPS } from './motion'

// Token warna dan huruf dari DESIGN.md (arah A, terang dan bersih).
export const C = {
  bg: '#ffffff',
  card: '#f5f5f7',
  card2: '#ececf0',
  line: '#e7e7ec',
  ink: '#16161d',
  ink2: '#5c5c6e',
  ink3: '#8c8c9c',
  go: '#22775b',
  goEdge: '#17523f',
  stop: '#f04438',
  mentioned: '#FFB020',
  filler: '#ff93ae',
  night: '#141414',
  nightCard: '#1f1f22',
}
export const FONT = "'Lexend Variable', system-ui, sans-serif"

export const outExpo = Easing.bezier(0.16, 1, 0.3, 1)
export const inOut = Easing.bezier(0.65, 0, 0.35, 1)

// interpolate yang selalu dijepit di kedua ujung.
export const tween = (frame: number, range: [number, number], out: [number, number], easing = outExpo) =>
  interpolate(frame, range, out, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing })

// Pegas 0..1 yang mulai di frame `at`. bounce: sedikit lewat lalu mengendap.
export const pop = (frame: number, at: number, bounce = true) =>
  spring({ frame: frame - at, fps: FPS, config: bounce ? { damping: 12, stiffness: 170, mass: 0.7 } : { damping: 200 } })

// Keluar ke atas sambil memudar dan kabur, dipakai untuk mengganti judul.
export const leave = (frame: number, at: number, dur = 12): CSSProperties => {
  const q = tween(frame, [at, at + dur], [0, 1], Easing.bezier(0.7, 0, 0.84, 0))
  return q === 0 ? {} : { opacity: 1 - q, transform: `translateY(${-40 * q}px)`, filter: `blur(${8 * q}px)` }
}

// Judul kinetik: kata demi kata naik dari balik garis, dengan sedikit kabur yang menajam.
export function Words({
  text,
  at,
  stagger = 3,
  size,
  weight = 700,
  color = C.ink,
  style,
  mark,
}: {
  text: string
  at: number
  stagger?: number
  size: number
  weight?: number
  color?: string
  style?: CSSProperties
  // Kata yang diberi gaya khusus, misalnya warna aksen.
  mark?: Record<string, CSSProperties>
}) {
  const frame = useCurrentFrame()
  return (
    <div style={{ fontSize: size, fontWeight: weight, color, lineHeight: 1.12, letterSpacing: '-0.025em', ...style }}>
      {text.split(' ').map((w, i) => {
        const p = tween(frame, [at + i * stagger, at + i * stagger + 20], [0, 1])
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', padding: '0.06em 0.02em 0.14em', margin: '-0.06em 0 -0.14em', verticalAlign: 'top' }}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - p) * 105}%)`,
                // Tanpa ini, kabur dari kata yang masih tersembunyi merembes ke atas garis potong.
                opacity: Math.min(1, p * 4),
                filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
                ...mark?.[w],
              }}
            >
              {w}
              {' '}
            </span>
          </span>
        )
      })}
    </div>
  )
}

// Tanda status konsep, sama bentuknya dengan components/marks.tsx: cincin kosong, setengah terisi,
// dan centang yang menggambar dirinya sendiri mulai frame `drawAt`.
export function StatusIcon({ status, size = 34, drawAt = -99 }: { status: 'none' | 'mentioned' | 'explained'; size?: number; drawAt?: number }) {
  const frame = useCurrentFrame()
  const s = pop(frame, drawAt)
  const draw = tween(frame, [drawAt + 2, drawAt + 12], [1, 0])
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0, overflow: 'visible' }}>
      {status === 'explained' && (
        <g transform={`translate(12 12) scale(${0.6 + 0.4 * s}) translate(-12 -12)`}>
          <circle cx="12" cy="12" r="11" fill={C.go} />
          <path d="M7 12.5l3.2 3.2L17 9" pathLength={1} strokeDasharray={1} strokeDashoffset={draw} fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {status === 'mentioned' && (
        <g transform={`translate(12 12) scale(${0.7 + 0.3 * s}) translate(-12 -12)`}>
          <circle cx="12" cy="12" r="10" fill="none" stroke={C.mentioned} strokeWidth="2.4" />
          <path d="M12 2a10 10 0 0 1 0 20Z" fill={C.mentioned} />
        </g>
      )}
      {status === 'none' && <circle cx="12" cy="12" r="10" fill="none" stroke={C.ink3} strokeOpacity="0.45" strokeWidth="2.4" />}
    </svg>
  )
}

// Filler: garis bawah bergelombang merah muda seperti .chalk-filler di aplikasi, tergores dari kiri
// mulai frame `at`. Garisnya ada di salinan kata yang transparan, jadi hanya garis yang terpotong.
export function Wavy({ at, children }: { at: number; children: string }) {
  const frame = useCurrentFrame()
  const hide = tween(frame, [at, at + 12], [100, 0])
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          paddingBottom: '0.5em',
          color: 'transparent',
          textDecoration: `underline wavy ${C.filler}`,
          textDecorationThickness: '0.07em',
          textUnderlineOffset: '0.22em',
          clipPath: `inset(0 ${hide}% 0 0)`,
        }}
      >
        {children}
      </span>
    </span>
  )
}

// Sorotan stabilo kuning di separuh bawah huruf (.term-mark), tergores dari kiri mulai frame `at`.
export const marker = (frame: number, at: number): CSSProperties => ({
  backgroundImage: 'linear-gradient(transparent 58%, rgb(255 216 77 / 0.6) 58%, rgb(255 216 77 / 0.6) 92%, transparent 92%)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: `${tween(frame, [at, at + 12], [0, 100])}% 100%`,
  boxDecorationBreak: 'clone',
  WebkitBoxDecorationBreak: 'clone',
})

// Tombol pil dengan tepi bawah lebih gelap. pressed 0..1 menurunkan tombol ke tepinya.
export function Pill({ children, bg = C.go, edge = C.goEdge, color = '#fff', size = 34, pressed = 0, style }: { children: ReactNode; bg?: string; edge?: string; color?: string; size?: number; pressed?: number; style?: CSSProperties }) {
  const e = 9 * (1 - pressed)
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        borderRadius: 999,
        padding: `${size * 0.62}px ${size * 1.5}px`,
        background: bg,
        color,
        fontSize: size,
        fontWeight: 600,
        boxShadow: `0 ${e}px 0 ${edge}`,
        transform: `translateY(${9 - e}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// Efek suara satu kali di frame `at` (lokal di Sequence tempat ia dipasang).
export const Sfx = ({ at, name, volume = 0.6 }: { at: number; name: string; volume?: number }) => (
  <Sequence from={Math.round(at)} durationInFrames={FPS * 3} layout="none">
    <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
)
