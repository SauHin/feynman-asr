import { AbsoluteFill, Easing, interpolateColors, random, Sequence, useCurrentFrame } from 'remotion'
import { Empur, type Cue } from '../empur'
import { Dust, ease, exitUp, Goo, Grain, Hit, jump, Letters, mix, Rise, spr, useBass, useT } from './kit'

// Pembuka showreel: masalah belajar (lambat, satu kartu per dua detik), titik balik "Coba jelasin.",
// lalu pertanyaan yang dijawab oleh kelahiran Empur di papan tulis.

// Warna badan Empur kuning di titik zoom, tempat adegan setup mulai.
export const DIVE_COLOR = '#FFC624'
export const GREEN = 'radial-gradient(circle at 38% 55%, #2e9472 0%, #22775b 48%, #164f3d 100%)'
const BOARD = 'radial-gradient(ellipse at 50% 48%, #26573f 0%, #183b2b 42%, #0a1811 100%)'
const INK = '#16161d'
const at60 = (s: number) => Math.round(s * 60)

// Empur dalam kotak 120 x 150 satuan rig. foot: titik kaki (60, 132) di layar.
export const box = (width: number, foot: [number, number]) => {
  const s = width / 120
  return { left: foot[0] - 60 * s, top: foot[1] - 132 * s, width, height: 150 * s, s }
}

// Kapsul dengan sudut elips terpisah di atas dan bawah, kaki di y = 132. Lingkaran saat w = h dan
// semua jari-jari setengahnya; badan Empur saat w = 54, h = 107.7, atas 27 x 9.72, bawah 27 x 14.7.
function capsule(w: number, h: number, rty: number, rby: number) {
  const [l, r, top, b, rx] = [60 - w / 2, 60 + w / 2, 132 - h, 132, w / 2]
  const f = (n: number) => n.toFixed(2)
  return `M${f(l)} ${f(top + rty)}A${f(rx)} ${f(rty)} 0 0 1 ${f(r)} ${f(top + rty)}L${f(r)} ${f(b - rby)}A${f(rx)} ${f(rby)} 0 0 1 ${f(l)} ${f(b - rby)}Z`
}

const pulse = (t: number, at: number, dur: number) => (t > at && t < at + dur ? Math.sin((Math.PI * (t - at)) / dur) : 0)

// ---------- Masalah ----------

// Tiga kartu pertama bersemangat (berdenyut di setiap ketukan), "Pas ujian…" melambat, lagu berhenti,
// lalu "blank." langsung muncul dan hurufnya rontok dalam hening.
const ENERGY_END = 6
const BLANK = 8.4
const SHATTER = 9.0
const CARDS = [0, 2, 4, 6, BLANK, 10]
// Waktu tiap huruf "Pas ujian…" diketik: jaraknya makin lebar, seperti tempo yang melambat.
const TYPE_AT = Array.from('Pas ujian…', (_, i) => 6.15 + i * 0.08 + (0.028 * i * (i - 1)) / 2)

export function Problem() {
  const t = useT()
  const frame = useCurrentFrame()
  const card = CARDS.findLastIndex((c) => c <= t)
  const center = { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' } as const
  // Denyut ketukan: teks membesar sedikit di setiap kick, layar bergetar saat kartu menghantam.
  const kick = t < ENERGY_END ? Math.exp(-(t % 0.5) * 12) : 0
  const hit = CARDS.slice(0, 3).findLast((c) => c <= t) ?? 0
  const shake = t < ENERGY_END ? 16 * Math.max(0, 1 - (t - hit) / 0.25) : 0
  const sx = (random(`sx${frame}`) - 0.5) * shake
  const sy = (random(`sy${frame}`) - 0.5) * shake
  const pulse = (from: number) => ({ transform: `translate(${sx}px, ${sy}px) scale(${1 + 0.03 * (t - from) + 0.035 * kick})` })
  const bg = ['#ffffff', '#FFD84D', INK, '#ffffff', '#ffffff', '#ffffff'][card]
  const flash = t < ENERGY_END ? 0.4 * Math.max(0, 1 - (t - hit) / 0.16) : 0
  return (
    <AbsoluteFill style={{ background: card === 3 ? interpolateColors(t, [7, 8.3], ['#ffffff', '#e6e6ec']) : bg }}>
      {t < ENERGY_END && <BeatRings t={t} color={card === 1 ? '#ffffff' : '#FFD84D'} />}
      {card === 0 && (
        <div style={{ ...center, ...pulse(0) }}>
          <Letters text="Baca slide." t={t} at={0.15} size={300} mode="slam" stagger={0.045} weight={[900, 800]} />
        </div>
      )}
      {card === 1 && (
        <div style={{ ...center, ...pulse(2) }}>
          <Letters text="Hafalin." t={t} at={2.0} size={310} mode="drop" stagger={0.05} weight={[400, 800]} />
        </div>
      )}
      {card === 2 && (
        <div style={{ ...center, ...pulse(4) }}>
          {[0.1, 0.18, 0.3].map((o, i) => (
            <div key={i} style={{ position: 'absolute', opacity: o * ease(t, [4.1, 4.3]), transform: `translateX(${(-110 + i * 36) * (1 - 0.7 * ease(t, [4.2, 5.6]))}px)` }}>
              <Letters text="Baca lagi." t={99} at={0} size={290} color="#fff" />
            </div>
          ))}
          <Letters text="Baca lagi." t={t} at={4.0} size={290} mode="slam" stagger={0.04} color="#fff" weight={[900, 800]} />
        </div>
      )}
      {card === 3 && <Typing t={t} />}
      {card === 4 && <Blank t={t} />}
      {card === 5 && <Explain t={t} />}
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)', opacity: card === 3 ? ease(t, [6.5, 8.3], [0, 0.55]) : 0 }} />
      <AbsoluteFill style={{ background: '#000', opacity: ease(t, [0, 0.3], [1, 0]) }} />

      <Hit at={0.15} name="swish" volume={0.4} />
      <Hit at={2.0} name="whoosh" volume={0.35} />
      {Array.from('Hafalin.', (_, i) => (
        <Hit key={`d${i}`} at={2.0 + 0.05 * i + 0.2} name="tap" volume={0.22} />
      ))}
      <Hit at={4.0} name="swish" volume={0.4} />
      {TYPE_AT.map((s, i) => (
        <Hit key={`k${i}`} at={s} name={`key${(i % 3) + 1}`} volume={0.4 - 0.02 * i} />
      ))}
      <Hit at={BLANK} name="pop" volume={0.85} />
      <Hit at={SHATTER} name="bonk" volume={0.6} />
      <Hit at={10.0} name="ripple" volume={0.5} />
      <Hit at={11.9} name="sparkle" volume={0.3} />
      <Hit at={13.55} name="swoosh" volume={0.45} />
    </AbsoluteFill>
  )
}

// Cincin yang memancar dari tengah di setiap ketukan.
function BeatRings({ t, color }: { t: number; color: string }) {
  const beat = Math.floor(t / 0.5)
  return (
    <>
      {[beat, beat - 1].map((b) => {
        const u = (t - b * 0.5) / 0.9
        if (b < 0 || u > 1) return null
        const r = 160 + 900 * Easing.bezier(0.16, 1, 0.3, 1)(u)
        return <div key={b} style={{ position: 'absolute', left: 960 - r, top: 540 - r, width: 2 * r, height: 2 * r, borderRadius: '50%', border: `${10 * (1 - u)}px solid ${color}`, opacity: 0.5 * (1 - u) }} />
      })}
    </>
  )
}

function Typing({ t }: { t: number }) {
  const text = 'Pas ujian…'
  const n = TYPE_AT.filter((s) => s <= t).length
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 240,
        fontWeight: 750,
        letterSpacing: '-0.04em',
        color: interpolateColors(t, [7, 8.3], [INK, '#5c5c6e']),
        transform: `scale(${1 + 0.06 * ease(t, [6, 8.4], [0, 1], (u) => u)})`,
      }}
    >
      <span>{text.slice(0, n)}</span>
      <span style={{ width: 16, height: 220, marginLeft: 10, borderRadius: 8, background: '#22775b', opacity: Math.floor(t / 0.6) % 2 ? 1 : 0.15 }} />
    </div>
  )
}

// "blank." langsung muncul dengan satu letupan, bertahan dalam hening, lalu hurufnya rontok.
function Blank({ t }: { t: number }) {
  const pop = 0.88 + 0.12 * spr(t, BLANK, 'bouncy')
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', fontSize: 380, fontWeight: 850, letterSpacing: '-0.05em', color: INK, lineHeight: 1, transform: `scale(${pop})` }}>
        {Array.from('blank.').map((ch, i) => {
          const ts = SHATTER + i * 0.035
          const d = Math.max(0, t - ts)
          const vx = (random(`bx${i}`) - 0.5) * 700
          const vr = (random(`br${i}`) - 0.5) * 520
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                transform: `translate(${vx * d}px, ${-420 * d + 0.5 * 6200 * d * d}px) rotate(${vr * d}deg)`,
                opacity: 1 - ease(t, [ts + 0.45, ts + 0.6]),
              }}
            >
              {ch}
            </span>
          )
        })}
      </div>
      {t > SHATTER + 0.3 && <span style={{ position: 'absolute', width: 16, height: 220, borderRadius: 8, background: '#22775b', opacity: Math.floor((t - SHATTER - 0.3) * 3) % 2 ? 0.15 : 1 }} />}
      <Dust t={t} at={SHATTER} x={960} y={560} n={22} spread={420} colors={['#16161d', '#5c5c6e', '#c9c9d4']} size={14} seed="bl" />
    </div>
  )
}

// Titik balik: kursor menjadi gelombang suara, "Coba jelasin." bertahan, lalu alasannya muncul.
// Di akhir, puncak gelombang meletup jadi cairan papan tulis yang memenuhi layar.
function Explain({ t }: { t: number }) {
  const width = ease(t, [10.0, 10.35], [16, 1100])
  const amp = ease(t, [10.2, 10.6], [0, 1]) * (1 + 0.15 * Math.sin(t * 14))
  const pts = Array.from({ length: 121 }, (_, i) => {
    const x = -0.5 + i / 120
    const env = Math.cos(x * Math.PI) ** 2
    const y = amp * env * 110 * Math.sin(x * 34 + t * 12) * Math.sin(x * 9 - t * 5)
    return `${(960 + x * width).toFixed(1)},${(620 + y).toFixed(1)}`
  })
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center' }}>
        <Letters text="Coba jelasin." t={t} at={10.35} size={180} mode="rise" stagger={0.04} weight={[300, 800]} />
      </div>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <polyline points={pts.join(' ')} fill="none" stroke="#22775b" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 780, display: 'flex', justifyContent: 'center' }}>
        <Rise text="Kalau bisa jelasin, kamu beneran paham." t={t} at={11.9} size={62} weight={600} color="#22775b" stagger={0.07} />
      </div>
      <Goo blur={30}>
        {Array.from({ length: 9 }, (_, k) => {
          const d = Math.abs(k - 4) * 0.055
          const r = ease(t, [13.55 + d, 14.0], [0, 1500], Easing.bezier(0.55, 0, 0.75, 0.6))
          const [x, y] = [960 + (k - 4) * 125, 620 + (k % 2 ? -1 : 1) * 70 * Math.min(1, Math.abs(k - 4))]
          return <div key={k} style={{ position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: '#183b2b' }} />
        })}
      </Goo>
    </>
  )
}

// ---------- Solusi muncul ----------

const FOOT: [number, number] = [960, 770]
const TITLE_FOOT: [number, number] = [1510, 566]
const TAPS = [2.0, 2.5]
const STRETCH = 2.75
const SWAP = 3.45
export const DROP = 4.0
const DIVE: [number, number] = [6.8, 7.95]

export function Reveal() {
  const t = useT()
  const bass = useBass()
  const b = box(320, FOOT)
  const r0 = 6
  const appear = spr(t, TAPS[0], 'bouncy') * (1 + 0.4 * pulse(t, TAPS[1], 0.22))
  const squash = ease(t, [STRETCH - 0.2, STRETCH], [0, 1], Easing.bezier(0.3, 0, 0.7, 1))
  const stretch = t < STRETCH ? 0 : spr(t, STRETCH, 'bouncy')
  const w = t < STRETCH ? 2 * r0 * appear * (1 + 0.55 * squash) : mix(2 * r0, 54, Math.min(1, stretch)) * (stretch > 1 ? 1 - (stretch - 1) * 1.3 : 1)
  const h = t < STRETCH ? 2 * r0 * appear * (1 - 0.42 * squash) : mix(2 * r0, 107.72, stretch)
  const rty = Math.min(h / 2, mix(w / 2, 9.72, Math.min(1, stretch)))
  const rby = Math.min(h / 2 - 0.01, mix(w / 2, 14.7, Math.min(1, stretch)))
  const color = ease(t, [STRETCH + 0.05, STRETCH + 0.55])
  const capOn = ease(stretch, [0.6, 1])

  // Saat drop: papan berubah hijau terang, gelombang kejut, dan Empur melompat ke samping judul.
  const lit = ease(t, [DROP, DROP + 0.35])
  const hop = jump(t, DROP + 0.05, DROP + 0.55, 260)
  const move = ease(t, [DROP + 0.05, DROP + 0.55], [0, 1], (u) => u)
  const ring = ease(t, [DROP, DROP + 0.8])
  const end = box(320, TITLE_FOOT)
  const [cx, cy] = [end.left + 60 * end.s, end.top + 122 * end.s]
  const dive = Math.pow(60, ease(t, DIVE, [0, 1], Easing.bezier(0.5, 0, 0.85, 0.55)))
  const cues: Cue[] = [
    { at: 0, mood: 'wave' },
    { at: at60(DROP - SWAP), mood: 'cheer' },
    { at: at60(5.2 - SWAP), mood: 'happy' },
  ]

  return (
    <AbsoluteFill style={{ background: BOARD, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: GREEN, opacity: lit }} />
      <AbsoluteFill style={{ transformOrigin: `${cx}px ${cy}px`, transform: `scale(${dive})` }}>
        {[
          [520, 300, 520, 90, -8],
          [1350, 860, 620, 110, 6],
          [1420, 200, 380, 70, -3],
        ].map(([x, y, rw, rh, rot], i) => (
          <div key={i} style={{ position: 'absolute', left: x - rw / 2, top: y - rh / 2, width: rw, height: rh, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(28px)', transform: `rotate(${rot}deg)`, opacity: 1 - lit }} />
        ))}
        <div style={{ position: 'absolute', left: 960 - 500, top: 640 - 500, width: 1000, height: 1000, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,216,77,0.22), transparent 62%)', opacity: Math.min(1, appear) * (1 - lit) }} />
        <div style={{ position: 'absolute', left: 820 - 700, top: 440 - 700, width: 1400, height: 1400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.16), transparent 60%)', opacity: lit * (0.5 + bass * 0.9), transform: `scale(${1 + bass * 0.12})` }} />

        <div style={{ position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center' }}>
          <div style={exitUp(t, 2.55, 0.35)}>{t < 2.95 && <Rise text="Tapi siapa yang dengerin?" t={t} at={0.25} size={96} color="#fff" stagger={0.08} />}</div>
        </div>

        {t > DROP && (
          <>
            <div style={{ position: 'absolute', left: 240, top: 200 }}>
              <Rise text="Kenalin," t={t} at={DROP + 0.15} size={64} weight={600} color="rgba(255,255,255,0.85)" />
            </div>
            <div style={{ position: 'absolute', left: 230, top: 280 }}>
              <Letters text="Empur" t={t} at={DROP + 0.25} size={340} mode="drop" stagger={0.06} color="#fff" weight={[900, 820]} />
            </div>
            <div style={{ position: 'absolute', left: 240, top: 720, width: 1500 }}>
              <Rise text="Partner belajar yang mendengarkan penjelasanmu." t={t} at={DROP + 1.1} size={56} weight={500} color="rgba(255,255,255,0.9)" stagger={0.06} />
            </div>
          </>
        )}
        {t > DROP && ring < 1 && <div style={{ position: 'absolute', left: FOOT[0] - 900 * ring, top: FOOT[1] - 160 - 900 * ring, width: 1800 * ring, height: 1800 * ring, borderRadius: '50%', border: `${10 * (1 - ring)}px solid rgba(255,255,255,0.7)`, opacity: 1 - ring }} />}

        {t < SWAP ? (
          <svg viewBox="0 0 120 150" style={{ position: 'absolute', left: b.left, top: b.top, width: b.width, height: b.height, overflow: 'visible' }}>
            <defs>
              <linearGradient id="genesis" gradientUnits="userSpaceOnUse" x1={60 - w / 2} y1={132 - h} x2={60 - w / 2 + 0.8 * w} y2={132}>
                <stop offset="0" stopColor={interpolateColors(color, [0, 1], ['#ffffff', '#FFF09A'])} />
                <stop offset="1" stopColor={interpolateColors(color, [0, 1], ['#f4f4ee', '#FFC21A'])} />
              </linearGradient>
            </defs>
            {appear > 0.01 && <path d={capsule(Math.max(0.1, w), Math.max(0.1, h), rty, rby)} fill="url(#genesis)" />}
            {capOn > 0 && (
              <g opacity={capOn}>
                <ellipse cx={60} cy={132 - h + rty} rx={w / 2} ry={rty} fill="#FFEE85" />
                <ellipse cx={60 - 2.7} cy={132 - h + rty - 1.3} rx={w * 0.375} ry={rty * 0.65} fill="#FFF9D1" />
              </g>
            )}
          </svg>
        ) : (
          <div
            style={{
              position: 'absolute',
              left: b.left + (TITLE_FOOT[0] - FOOT[0]) * move,
              top: b.top + (TITLE_FOOT[1] - FOOT[1]) * move + hop.y,
              width: b.width,
              height: b.height,
              transformOrigin: '50% 88%',
              transform: `scale(${hop.sx}, ${hop.sy})`,
            }}
          >
            <Sequence from={at60(SWAP)} layout="none">
              <Empur enter={false} blinks={t < DIVE[0] - 0.4} eyesOpen={Math.min(1.15, spr(t, SWAP + 0.05, 'bouncy'))} armGrow={spr(t, SWAP + 0.2, 'jelly')} cues={cues} style={{ width: '100%', height: '100%' }} />
            </Sequence>
          </div>
        )}
        <Dust t={t} at={TAPS[0]} x={FOOT[0]} y={FOOT[1] - 14} n={10} spread={90} colors={['#ffffff', '#e8efe9']} size={8} seed="g1" />
        <Dust t={t} at={TAPS[1]} x={FOOT[0]} y={FOOT[1] - 14} n={12} spread={120} colors={['#ffffff', '#FFF3B0']} size={9} seed="g2" />
        <Dust t={t} at={DROP + 0.55} x={TITLE_FOOT[0]} y={TITLE_FOOT[1]} n={18} spread={200} seed="tl" />
      </AbsoluteFill>
      <Grain opacity={0.12 - 0.05 * lit} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)', opacity: 1 - lit }} />

      {TAPS.map((s) => (
        <Hit key={s} at={s} name="tap" volume={0.85} />
      ))}
      <Hit at={STRETCH} name="stretch" volume={0.55} />
      <Hit at={SWAP + 0.05} name="pop" volume={0.6} />
      <Hit at={SWAP + 0.2} name="boing" volume={0.45} />
      <Hit at={DROP + 0.05} name="swish" volume={0.45} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Hit key={i} at={DROP + 0.45 + i * 0.06} name="tap" volume={0.3} />
      ))}
      <Hit at={DROP + 0.55} name="land" volume={0.6} />
      <Hit at={DROP + 0.57} name="confetti" volume={0.4} />
      <Hit at={DIVE[0]} name="swoosh" volume={0.5} />
    </AbsoluteFill>
  )
}
