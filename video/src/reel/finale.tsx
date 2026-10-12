import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, Easing, Img, random, Sequence } from 'remotion'
import logo from '../../../frontend/public/logo.svg'
import { Empur } from '../empur'
import { C, Pill, Wavy } from '../ui'
import { Blur, Dust, ease, Grain, Hit, inOut, mix, Odometer, Rise, spr, useBass, useLevels, useT } from './kit'
import { GREEN } from './opening'

// Dua adegan penutup: grid alasan untuk percaya (privasi, filler, jeda) dan finale logo.

const at60 = (s: number) => Math.round(s * 60)
const abs = (style: CSSProperties): CSSProperties => ({ position: 'absolute', ...style })
type Rect = { x: number; y: number; w: number; h: number }

// ---------- 8. Grid ----------

const CELLS: { id: 'privasi' | 'filler' | 'jeda'; r: Rect; bg: string; at: number }[] = [
  { id: 'privasi', r: { x: 60, y: 60, w: 1000, h: 960 }, bg: '#173d30', at: 0.9 },
  { id: 'filler', r: { x: 1084, y: 60, w: 776, h: 468 }, bg: '#ffffff', at: 1.4 },
  { id: 'jeda', r: { x: 1084, y: 552, w: 776, h: 468 }, bg: '#EEF3FF', at: 1.9 },
]
const GLITCH: [number, number] = [3.9, 4.4]
const ISO: [number, number] = [4.4, 5.2]

export function Grid() {
  const t = useT()
  const enter = ease(t, [0, 0.4], [0, 1], inOut)
  const iso = ease(t, ISO, [0, 1], inOut)
  const glitch = t > GLITCH[0] && t < GLITCH[1]
  const tick = Math.floor(t * 30)
  const jitter = glitch ? (random(`gj${tick}`) - 0.5) * 30 : 0
  const split = glitch ? 6 + random(`gs${tick}`) * 10 : 0
  const bass = useBass()
  return (
    <AbsoluteFill style={{ transform: `translateY(${1080 * (1 - enter)}px)` }}>
      <Blur y={60 * Math.sin(Math.PI * enter)}>
        <AbsoluteFill style={{ background: '#0f0f12' }}>
          <div style={abs({ left: 960 - 900, top: 540 - 900, width: 1800, height: 1800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,174,138,0.12), transparent 60%)', opacity: 0.4 + bass, transform: `scale(${1 + bass * 0.15})` })} />
          <AbsoluteFill style={{ perspective: 2600 }}>
            <AbsoluteFill
              style={{
                transformOrigin: '960px 540px',
                transform: `translateX(${jitter}px) rotateX(${52 * iso}deg) rotateZ(${-26 * iso}deg) scale(${1 - 0.2 * iso})`,
                filter: glitch ? `drop-shadow(${split}px 0 0 rgba(255,0,90,0.75)) drop-shadow(${-split}px 0 0 rgba(0,220,255,0.75))` : undefined,
              }}
            >
              {CELLS.map((c) => (
                <Cell key={c.id} t={t} cell={c} depth={iso}>
                  {c.id === 'privasi' && <Privacy t={t - c.at} r={c.r} />}
                  {c.id === 'filler' && <Filler t={t - c.at} at={c.at} />}
                  {c.id === 'jeda' && <Pause t={t - c.at} />}
                </Cell>
              ))}
            </AbsoluteFill>
            {glitch && [0, 1, 2].map((k) => <div key={k} style={abs({ left: 0, right: 0, top: random(`gb${k}${tick}`) * 1000, height: 8 + random(`gh${k}${tick}`) * 30, background: 'rgba(255,255,255,0.08)', transform: `translateX(${(random(`gx${k}${tick}`) - 0.5) * 120}px)` })} />)}
          </AbsoluteFill>
          <AbsoluteFill style={{ background: '#fff', opacity: ease(t, [5.15, 5.4]) }} />
          <Grain opacity={0.07} />
        </AbsoluteFill>
      </Blur>

      {CELLS.map((c) => (
        <Hit key={c.id} at={c.at} name="blip" volume={0.45} />
      ))}
      <Hit at={CELLS[0].at + 0.5} name="lock" volume={0.6} />
      <Hit at={CELLS[1].at + 0.5} name="bonk" volume={0.35} />
      <Hit at={CELLS[2].at + 1.3} name="pop" volume={0.4} />
      <Hit at={GLITCH[0]} name="glitch" volume={0.55} />
      <Hit at={ISO[0]} name="swoosh" volume={0.5} />
    </AbsoluteFill>
  )
}

function Cell({ t, cell, depth, children }: { t: number; cell: (typeof CELLS)[number]; depth: number; children: ReactNode }) {
  const q = spr(t, cell.at, 'bouncy')
  if (t < cell.at) return null
  return (
    <div
      style={abs({
        left: cell.r.x,
        top: cell.r.y,
        width: cell.r.w,
        height: cell.r.h,
        borderRadius: 40,
        overflow: 'hidden',
        background: cell.bg,
        opacity: Math.min(1, q * 2),
        transform: `translateY(${(1 - q) * 60}px) scale(${0.82 + 0.18 * q})`,
        boxShadow: `0 ${24 * depth}px 0 ${cell.id === 'privasi' ? '#08080a' : '#9aa0b4'}`,
      })}
    >
      {children}
    </div>
  )
}

const Caption = ({ title, sub, light = false, size = 40 }: { title: string; sub?: string; light?: boolean; size?: number }) => (
  <div style={abs({ left: 44, bottom: 38 })}>
    <div style={{ fontSize: size, fontWeight: 700, color: light ? '#fff' : C.ink, letterSpacing: '-0.02em' }}>{title}</div>
    {sub && <div style={{ fontSize: size * 0.6, color: light ? 'rgba(255,255,255,0.72)' : C.ink2, marginTop: 6 }}>{sub}</div>}
  </div>
)

function Privacy({ t, r }: { t: number; r: Rect }) {
  const levels = useLevels()
  const lock = spr(t, 0.5, 'bouncy')
  const ring = ease(t, [0.55, 1.3])
  return (
    <>
      <div style={abs({ left: r.w / 2 - 300, top: 250, width: 600, height: 380 })}>
        <div style={abs({ left: 40, top: 0, width: 520, height: 330, borderRadius: 26, background: '#2a2a2e', padding: 16 })}>
          <div style={{ width: '100%', height: '100%', borderRadius: 14, background: '#101413', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
            {Array.from({ length: 22 }, (_, i) => (
              <div key={i} style={{ width: 10, height: 14 + 150 * Math.min(1, (levels[(i % 11) + 1] ?? 0) * 2.8), borderRadius: 10, background: '#4fae8a' }} />
            ))}
          </div>
        </div>
        <div style={abs({ left: 0, top: 330, width: 600, height: 26, borderRadius: '6px 6px 22px 22px', background: '#3a3a40' })} />
        <div style={abs({ right: 0, top: -30, width: 112, height: 112, borderRadius: 112, background: '#22775b', display: 'grid', placeItems: 'center', transform: `scale(${lock})`, boxShadow: `0 0 0 ${8 + 30 * ring}px rgba(79,174,138,${0.35 * (1 - ring)})` })}>
          <svg viewBox="0 0 24 24" width="54" height="54">
            <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#fff" />
            <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke="#fff" strokeWidth="2.4" />
          </svg>
        </div>
      </div>
      <Caption title="Suaramu tetap di laptop." sub="Yang dikirim ke Gemini cuma teksnya." light size={52} />
    </>
  )
}

function Filler({ t, at }: { t: number; at: number }) {
  const count = ease(t, [0.5, 0.6], [0, 1]) + ease(t, [0.8, 0.9], [0, 1])
  return (
    <>
      <div style={abs({ left: 44, top: 70, fontSize: 60, fontWeight: 600, color: C.ink, display: 'flex', gap: 18 })}>
        <span>Jadi…</span>
        <Wavy at={at60(at + 0.5)}>eee…</Wavy>
        <Wavy at={at60(at + 0.8)}>gitu.</Wavy>
      </div>
      <div style={abs({ left: 44, top: 196, display: 'flex', alignItems: 'baseline', gap: 10, background: C.card, borderRadius: 99, padding: '12px 26px' })}>
        <span style={{ fontSize: 38, fontWeight: 700, color: C.ink }}>
          <Odometer value={count} />
        </span>
        <span style={{ fontSize: 26, color: C.ink3 }}>filler</span>
      </div>
      <Caption title="Filler? Ketahuan." />
    </>
  )
}

function Pause({ t }: { t: number }) {
  const head = ease(t, [0.3, 2.0], [0, 680], (u) => u)
  const segs: [number, number][] = [
    [0, 190],
    [210, 320],
    [520, 680],
  ]
  const chip = spr(t, 1.2, 'bouncy')
  return (
    <>
      <div style={abs({ left: 48, top: 170, width: 680, height: 60 })}>
        {segs.map(([a, b]) => (
          <div key={a} style={abs({ left: a, top: 10, width: b - a, height: 40, borderRadius: 20, background: '#d6defa', overflow: 'hidden' })}>
            <div style={{ height: '100%', width: `${Math.max(0, Math.min(1, (head - a) / (b - a))) * 100}%`, background: '#3656C9' }} />
          </div>
        ))}
        <div style={abs({ left: 330, top: 26, width: 180, height: 8, borderRadius: 8, backgroundImage: 'repeating-linear-gradient(90deg, #9DB6FF 0 10px, transparent 10px 20px)', opacity: head > 330 ? 1 : 0.3 })} />
        <div style={abs({ left: head - 2, top: -12, width: 4, height: 84, borderRadius: 4, background: C.ink })} />
        <div style={abs({ left: 320, top: -84, width: 200, display: 'flex', justifyContent: 'center', transform: `scale(${chip})`, transformOrigin: '50% 100%' })}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 99, background: '#fff', color: '#3656C9', fontSize: 28, fontWeight: 600, boxShadow: '0 10px 24px -14px rgba(54,86,201,0.6)', whiteSpace: 'nowrap' }}>
            <svg viewBox="0 0 12 14" width="13" height="15">
              <path d="M3.5 2.5v9M8.5 2.5v9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            jeda 4,0 dtk
          </span>
        </div>
      </div>
      <Caption title="Jeda panjang kebaca." />
    </>
  )
}

// ---------- 9. Finale ----------

const LOGO = { x: 960, y: 430 }
const CLICK = 4.0

export function Finale() {
  const t = useT()
  const bass = useBass()
  const land = 0.45
  const fall = t < land ? -900 * (1 - ease(t, [0.05, land], [0, 1], Easing.bezier(0.5, 0, 1, 1))) : 0
  const squash = t >= land ? 1 - spr(t, land, 'jelly') : 0
  const go = ease(t, [1.0, 1.45], [0, 1], Easing.bezier(0.5, 0, 0.6, 1))
  const merge = spr(t, 1.45, 'bouncy')
  const slide = ease(t, [1.8, 2.4], [0, 1], inOut)
  const reveal = ease(t, [1.95, 2.55], [0, 1], inOut)
  const float = Math.sin(t * 1.6) * 5 * ease(t, [3, 4])
  const btn = spr(t, 3.1, 'bouncy')
  const press = ease(t, [CLICK - 0.08, CLICK], [0, 1]) - ease(t, [CLICK + 0.08, CLICK + 0.2], [0, 1])
  const logoX = LOGO.x - 330 * slide
  const w = 260
  const foot = mix(860, LOGO.y + 110, go) - 300 * Math.sin(Math.PI * go)
  return (
    <AbsoluteFill style={{ background: GREEN, overflow: 'hidden' }}>
      <div style={abs({ left: 960 - 900, top: 430 - 900, width: 1800, height: 1800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.14), transparent 58%)', opacity: 0.4 + bass, transform: `scale(${1 + bass * 0.1})` })} />
      <Burst t={t} at={0} x={960} y={560} n={90} power={1500} />
      <Burst t={t} at={CLICK} x={960} y={790} n={60} power={1100} />

      {go < 1 && (
        <div style={abs({ left: 960 - w / 2, top: foot - (132 / 120) * w + fall, width: w, height: w * 1.25, transformOrigin: '50% 88%', transform: `scale(${(1 - 0.8 * go) * (1 + 0.2 * squash)}, ${(1 - 0.8 * go) * (1 - 0.24 * squash)})` })}>
          <Sequence from={0} layout="none">
            <Empur enter={false} cues={[{ at: 0, mood: 'cheer' }]} style={{ width: '100%', height: '100%' }} />
          </Sequence>
        </div>
      )}
      <Dust t={t} at={land} x={960} y={860} n={16} spread={180} seed="fin" />

      {t > 1.35 && (
        <div style={abs({ left: logoX - 110, top: LOGO.y - 110 + float, width: 220, height: 220, transform: `scale(${merge})` })}>
          <Img src={logo} style={{ width: '100%', height: '100%', borderRadius: 52, boxShadow: '0 0 0 6px rgba(255,255,255,0.25), 0 40px 80px -30px rgba(0,0,0,0.55)' }} />
        </div>
      )}
      {t > 1.45 && t < 2.2 && <div style={abs({ left: LOGO.x - 250 * ease(t, [1.45, 2.15]), top: LOGO.y - 250 * ease(t, [1.45, 2.15]), width: 500 * ease(t, [1.45, 2.15]), height: 500 * ease(t, [1.45, 2.15]), borderRadius: '50%', border: '6px solid #fff', opacity: 1 - ease(t, [1.45, 2.15]) })} />}
      <div style={abs({ left: logoX + 150, top: LOGO.y - 120 + float, clipPath: `inset(0 ${100 - reveal * 100}% 0 0)`, fontSize: 210, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, transform: `translateX(${(1 - reveal) * -60}px)` })}>Empur</div>
      <div style={abs({ left: 0, right: 0, top: 640 + float, display: 'flex', justifyContent: 'center' })}>
        <Rise text="Partner belajar yang mendengarkan penjelasanmu." t={t} at={2.5} size={52} weight={500} color="rgba(255,255,255,0.9)" stagger={0.06} />
      </div>
      <div style={abs({ left: 0, right: 0, top: 760 + float, display: 'flex', justifyContent: 'center', opacity: Math.min(1, btn * 2), transform: `scale(${0.7 + 0.3 * btn})` })}>
        <Pill bg="#fff" edge="#cfe3da" color={C.go} size={42} pressed={Math.max(0, press)}>
          Yuk, mulai
        </Pill>
      </div>
      {t > CLICK && <div style={abs({ left: 960 - 300 * ease(t, [CLICK, CLICK + 0.7]), top: 806 - 120 * ease(t, [CLICK, CLICK + 0.7]), width: 600 * ease(t, [CLICK, CLICK + 0.7]), height: 240 * ease(t, [CLICK, CLICK + 0.7]), borderRadius: '50%', border: '4px solid #fff', opacity: 1 - ease(t, [CLICK, CLICK + 0.7]) })} />}

      <div style={abs({ left: 1600 - 130, top: 1080 - 210 + 260 * (1 - spr(t, CLICK + 0.15, 'jelly')), width: 260, height: 325 })}>
        <Sequence from={at60(CLICK + 0.15)} layout="none">
          <Empur cues={[{ at: 0, mood: 'wave' }]} enter={false} style={{ width: '100%', height: '100%' }} />
        </Sequence>
      </div>
      <Cursor t={t} from={[1540, 1160]} to={[1000, 812]} at={3.2} press={CLICK} />
      <AbsoluteFill style={{ background: '#fff', opacity: 1 - ease(t, [0, 0.35]) }} />
      <Grain opacity={0.08} />

      <Hit at={0} name="confetti" volume={0.5} />
      <Hit at={land} name="land" volume={0.5} />
      <Hit at={1.0} name="swish" volume={0.5} />
      <Hit at={1.45} name="sparkle" volume={0.6} />
      <Hit at={1.45} name="pop" volume={0.5} />
      <Hit at={1.95} name="whoosh" volume={0.35} />
      <Hit at={3.1} name="pop" volume={0.5} />
      <Hit at={CLICK} name="click" volume={0.6} />
      <Hit at={CLICK} name="confetti" volume={0.4} />
      <Hit at={CLICK + 0.15} name="boing" volume={0.45} />
    </AbsoluteFill>
  )
}

// Konfeti yang meledak dari satu titik: terlempar, berputar, lalu jatuh oleh gravitasi.
function Burst({ t, at, x, y, n, power }: { t: number; at: number; x: number; y: number; n: number; power: number }) {
  const d = t - at
  if (d < 0 || d > 4.5) return null
  const colors = ['#FFD84D', '#93D5FF', '#DCC2FF', '#FF93AE', '#A7F3D0', '#FF7F3F', '#ffffff']
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + (random(`ba${at}${i}`) - 0.5) * Math.PI * 0.9
        const v = power * (0.35 + random(`bv${at}${i}`) * 0.65)
        const drag = (1 - Math.exp(-2.2 * d)) / 2.2
        const px = x + Math.cos(a) * v * drag + Math.sin(d * 3 + i) * 18
        const py = y + Math.sin(a) * v * drag + 0.5 * 900 * d * d * 0.55
        return (
          <div
            key={i}
            style={abs({
              left: px,
              top: py,
              width: 20,
              height: 10,
              borderRadius: 4,
              background: colors[i % colors.length],
              opacity: 1 - ease(d, [3.4, 4.5]),
              transform: `rotate(${d * (300 + (i % 7) * 90) + i * 37}deg) scaleX(${Math.cos(d * 6 + i)})`,
            })}
          />
        )
      })}
    </>
  )
}

function Cursor({ t, from, to, at, press }: { t: number; from: [number, number]; to: [number, number]; at: number; press: number }) {
  if (t < at || t > press + 1.2) return null
  const p = ease(t, [at, press - 0.15], [0, 1], inOut)
  const down = ease(t, [press - 0.08, press], [0, 1]) - ease(t, [press + 0.08, press + 0.2], [0, 1])
  return (
    <svg viewBox="0 0 24 24" width="70" height="70" style={abs({ left: mix(from[0], to[0], p), top: mix(from[1], to[1], p) - 60 * Math.sin(Math.PI * p), opacity: 1 - ease(t, [press + 0.7, press + 1.1]), transform: `scale(${1 - 0.15 * Math.max(0, down)})`, transformOrigin: '4px 3px', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))' })}>
      <path d="M4 3l14.5 8.2-6.4 1.6 3.6 6.6-2.6 1.4-3.6-6.6L4.8 18.6Z" fill="#fff" stroke={C.ink} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
