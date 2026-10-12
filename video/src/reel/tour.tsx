import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, Easing, Sequence } from 'remotion'
import { Empur, type Cue } from '../empur'
import { C, Pill, StatusIcon, Wavy } from '../ui'
import { Blur, Dust, ease, exitUp, Grain, Hit, inExpo, inOut, jump, Label, mix, Odometer, Rise, spr, useLevels, useT } from './kit'
import { DIVE_COLOR } from './opening'

// Tur aplikasi: setup dalam ruang 3D, baris konsep yang terbang ke agenda live, sesi live dengan kamera,
// lalu feedback. Copy mengikuti aplikasi (nada santai).

const at60 = (s: number) => Math.round(s * 60)
const abs = (style: CSSProperties): CSSProperties => ({ position: 'absolute', ...style })
const STAGE = 'linear-gradient(180deg, #f7f9f8 0%, #e8eeeb 100%)'
const CONCEPTS = ['Forward pass', 'Loss function', 'Chain rule', 'Gradient descent', 'Learning rate']

// Kotak Empur berukuran `width`, untuk diletakkan dengan left/top.
function Actor({ cues, width, from = 0, style, ...rest }: { cues: Cue[]; width: number; from?: number; style?: CSSProperties } & Omit<Parameters<typeof Empur>[0], 'cues' | 'style'>) {
  return (
    <div style={abs({ width, height: width * 1.25, ...style })}>
      <Sequence from={at60(from)} layout="none">
        <Empur cues={cues} {...rest} style={{ width: '100%', height: '100%' }} />
      </Sequence>
    </div>
  )
}

function Chapter({ t, at, n, text }: { t: number; at: number; n: number; text: string }) {
  const p = spr(t, at, 'bouncy')
  return (
    <div style={abs({ left: 140, top: 104, display: 'flex', alignItems: 'center', gap: 18, opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * -40}px)` })}>
      <div style={{ width: 64, height: 64, borderRadius: 64, background: '#FFD84D', display: 'grid', placeItems: 'center', fontSize: 32, fontWeight: 700, color: C.ink, transform: `scale(${p})` }}>{n}</div>
      <span style={{ fontSize: 34, fontWeight: 600, color: C.ink }}>{text}</span>
    </div>
  )
}

// ---------- 4. Setup ----------

// Kartu setup saat sudah rata (sebelum diserahkan ke live). Baris konsep ke-i ada di ROW_FROM(i).
const CARD = { x: 900, y: 140, w: 880, h: 830 }
const SETUP_ROW = (i: number) => ({ x: CARD.x + 52, y: CARD.y + 480 + 64 * i, w: 776, h: 54 })
const TOPIC = 'Backpropagation'
const TYPE = 0.62
const THROW = 2.0
const LAND = 2.5
const BURST = 3.45
const DOCK = (i: number) => 3.85 + 0.09 * i
export const HANDOFF = 5.4

export function Setup() {
  const t = useT()
  const iris = ease(t, [0, 0.55], [0, 1300])
  const enter = spr(t, 0.2, 'soft')
  const flat = ease(t, [5.0, 5.35], [0, 1], inOut)
  const rotY = mix(mix(-26, -9, ease(t, [0.2, 5.0], [0, 1], inOut)), 0, flat)
  const rotX = mix(mix(9, 3, ease(t, [0.2, 5.0], [0, 1], inOut)), 0, flat)
  const recede = ease(t, [HANDOFF, 5.75], [0, 1], inExpo)
  return (
    <AbsoluteFill style={{ background: DIVE_COLOR }}>
      <AbsoluteFill style={{ clipPath: `circle(${iris}px at 960px 540px)`, background: STAGE }}>
        <div style={abs({ left: 1100, top: -300, width: 1200, height: 1200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,216,77,0.22), transparent 62%)' })} />
        <div style={{ opacity: 1 - recede }}>
          <Chapter t={t} at={0.25} n={1} text="Pilih topik" />
          <div style={abs({ left: 140, top: 380, width: 660 })}>
            <div style={exitUp(t, 1.62)}>{t < 2.0 && <Rise text="Ketik topiknya." t={t} at={0.35} size={84} />}</div>
          </div>
          <div style={abs({ left: 140, top: 380, width: 660 })}>
            <div style={exitUp(t, 3.25)}>{t > 1.9 && t < 3.6 && <Rise text="Lempar catatanmu." t={t} at={2.0} size={84} />}</div>
          </div>
          <div style={abs({ left: 140, top: 380, width: 660 })}>
            <div style={exitUp(t, 5.0)}>{t > 3.5 && <Rise text="Empur bikin daftar konsepnya." t={t} at={3.6} size={84} />}</div>
          </div>
        </div>

        <AbsoluteFill style={{ perspective: 1800, perspectiveOrigin: '1340px 540px' }}>
          <div
            style={abs({
              left: CARD.x,
              top: CARD.y,
              width: CARD.w,
              height: CARD.h,
              transformStyle: 'preserve-3d',
              transformOrigin: '50% 50%',
              opacity: Math.min(1, enter * 1.5) * (1 - recede),
              transform: `translateX(${(1 - enter) * 500}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${1 - 0.08 * recede})`,
            })}
          >
            <Actor
              width={150}
              from={0.5}
              style={{ left: 54, top: -128 }}
              cues={[
                { at: 0, mood: 'wave' },
                { at: at60(TYPE - 0.5), mood: 'listen', gaze: [1.5, 1.5] },
                { at: at60(THROW - 0.5), mood: 'curious', gaze: [-2, 0.5] },
                { at: at60(2.85 - 0.5), mood: 'think' },
                { at: at60(4.4 - 0.5), mood: 'happy' },
              ]}
            />
            <div style={abs({ inset: 0, borderRadius: 40, background: '#fff', boxShadow: '0 60px 120px -50px rgba(22,22,29,0.45), 0 0 0 1.5px #e7e7ec' })}>
              <div style={abs({ left: 52, top: 46, fontSize: 36, fontWeight: 600, color: C.ink })}>Halo! Mau jelasin topik apa hari ini?</div>
              <Field t={t} />
              <div style={abs({ left: 52, top: 222, fontSize: 22, color: C.ink3 })}>Satu subtopik aja, biar cukup 2–5 menit.</div>
              <DropZone t={t} />
              <div style={abs({ left: 52, top: 440, fontSize: 24, fontWeight: 600, color: C.ink3, opacity: ease(t, [BURST, BURST + 0.3]) })}>Daftar konsep</div>
              {t < HANDOFF && <Chips t={t} />}
            </div>
          </div>
        </AbsoluteFill>
        <Grain opacity={0.05} />
      </AbsoluteFill>

      <Hit at={0} name="ripple" volume={0.4} />
      {Array.from(TOPIC, (_, i) => (
        <Hit key={i} at={TYPE + i * 0.05} name={`key${(i % 3) + 1}`} volume={0.32} />
      ))}
      <Hit at={THROW} name="swish" volume={0.5} />
      <Hit at={LAND} name="drop" volume={0.4} />
      <Hit at={LAND} name="ripple" volume={0.4} />
      <Hit at={BURST} name="pop" volume={0.55} />
      {CONCEPTS.map((_, i) => (
        <Hit key={`n${i}`} at={DOCK(i) + 0.22} name={`note${i + 1}`} volume={0.4} />
      ))}
      <Hit at={5.0} name="whoosh" volume={0.35} />
    </AbsoluteFill>
  )
}

function Field({ t }: { t: number }) {
  const n = Math.max(0, Math.min(TOPIC.length, Math.floor((t - TYPE) / 0.05) + 1))
  const focus = t > TYPE - 0.2 && t < TYPE + 1.3
  return (
    <div
      style={abs({
        left: 52,
        top: 116,
        width: 776,
        height: 86,
        borderRadius: 20,
        border: `2px solid ${focus ? '#4b7bff' : C.line}`,
        boxShadow: focus ? '0 0 0 5px rgba(75,123,255,0.18)' : undefined,
        display: 'flex',
        alignItems: 'center',
        padding: '0 26px',
        fontSize: 34,
        color: n ? C.ink : C.ink3,
      })}
    >
      {n ? TOPIC.slice(0, n) : 'Contoh: Backpropagation'}
      {focus && Math.floor(t * 4) % 2 === 0 && <span style={{ width: 3, height: 40, marginLeft: 3, background: C.go, borderRadius: 2 }} />}
    </div>
  )
}

// Zona unggah dan file yang dilempar dari luar kartu: melengkung, berputar, lalu mendarat memantul.
function DropZone({ t }: { t: number }) {
  const fly = ease(t, [THROW, LAND], [0, 1], (u) => u)
  const landed = t >= LAND
  const squash = landed ? 1 - spr(t, LAND, 'jelly') : 0
  const [x, y] = landed ? [0, 0] : [mix(-1150, 0, fly), mix(260, 0, fly) - 340 * Math.sin(Math.PI * fly)]
  const rot = landed ? 0 : -540 * (1 - Math.sin((fly * Math.PI) / 2))
  const ring = ease(t, [LAND, LAND + 0.7])
  const scan = ease(t, [2.85, 3.35], [-0.2, 1.2], inOut)
  return (
    <div style={abs({ left: 52, top: 272, width: 776, height: 136, borderRadius: 24, border: `2.5px dashed rgba(34,119,91,${landed ? 0.22 : 0.45})`, background: `rgba(34,119,91,${0.04 + 0.12 * (landed ? 1 - ring : 0)})` })}>
      {!landed && t < THROW + 0.2 && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 25, color: C.go, fontWeight: 500 }}>Taruh PDF atau PPTX di sini</div>}
      {landed && ring < 1 && <div style={abs({ left: 388 - 200 * (0.5 + ring), top: 68 - 60 * (0.5 + ring), width: 400 * (0.5 + ring), height: 120 * (0.5 + ring), borderRadius: '50%', border: `3px solid ${C.go}`, opacity: 1 - ring })} />}
      {t >= THROW && (
        <div style={abs({ left: 388 - 210, top: 22, width: 420, height: 92, transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${1 + 0.18 * squash}, ${1 - 0.22 * squash})`, transformOrigin: '50% 100%' })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, height: '100%', padding: '0 24px 0 14px', borderRadius: 20, background: '#fff', boxShadow: '0 18px 36px -18px rgba(22,22,29,0.45), 0 0 0 1.5px #e7e7ec', overflow: 'hidden', position: 'relative' }}>
            <div style={{ width: 56, height: 66, borderRadius: 12, background: '#F04438', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 17, fontWeight: 700, flexShrink: 0 }}>PDF</div>
            <div>
              <div style={{ fontSize: 27, fontWeight: 600, color: C.ink }}>catatan-kuliah.pdf</div>
              <div style={{ fontSize: 21, color: C.ink3 }}>24 halaman</div>
            </div>
            {scan > -0.2 && scan < 1.2 && <div style={abs({ top: 0, bottom: 0, left: `${scan * 100 - 20}%`, width: '22%', background: 'linear-gradient(90deg, transparent, rgba(255,216,77,0.55), transparent)' })} />}
          </div>
        </div>
      )}
      <Dust t={t} at={LAND} x={388} y={110} n={14} spread={170} seed="drop" />
    </div>
  )
}

// Konsep meletup dari file, melayang, lalu mendarat satu per satu di baris daftar.
const SCATTER: [number, number, number][] = [
  [-140, 150, -12],
  [700, 40, 10],
  [-220, 560, 8],
  [760, 470, -9],
  [320, 640, 6],
]
function Chips({ t }: { t: number }) {
  return (
    <>
      {CONCEPTS.map((name, i) => {
        if (t < BURST) return null
        const burst = spr(t, BURST + i * 0.03, 'bouncy')
        const dock = spr(t, DOCK(i), 'soft')
        const origin = [388 - 130 + 52, 272 + 68 - 27]
        const [sx, sy, sr] = SCATTER[i]
        const free = [mix(origin[0], sx, burst), mix(origin[1], sy, burst)]
        const x = mix(free[0], 52, dock)
        const y = mix(free[1], 480 + 64 * i, dock) - 60 * Math.sin(Math.PI * Math.min(1, dock))
        const w = mix(260, 776, dock)
        return (
          <div
            key={name}
            style={abs({
              left: x,
              top: y,
              minWidth: w,
              height: 54,
              whiteSpace: 'nowrap',
              gap: 24,
              borderRadius: 18,
              background: dock > 0.9 ? C.card : '#fff',
              boxShadow: `0 ${16 * (1 - dock)}px ${30 * (1 - dock)}px -14px rgba(22,22,29,0.4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px 0 24px',
              fontSize: 26,
              fontWeight: 600,
              color: C.ink,
              transform: `rotate(${sr * (1 - dock) * burst}deg) scale(${0.4 + 0.6 * Math.min(1, burst)})`,
              opacity: Math.min(1, burst * 3),
            })}
          >
            {name}
            <span style={{ opacity: ease(dock, [0.7, 1]) }}>
              <StatusIcon status="none" size={30} />
            </span>
          </div>
        )
      })}
    </>
  )
}

// ---------- 5. Live ----------

const WIN = { x: 120, y: 70, w: 1680, h: 940 }
const AGENDA = { x: 32, y: 112, w: 500, h: 700 }
const ROW0 = 124
const ROW = 80
const TRANS = { x: 556, y: 112, w: 1092, h: 700 }
const LIVE_ROW = (i: number) => ({ x: WIN.x + AGENDA.x + 24, y: WIN.y + AGENDA.y + ROW0 + ROW * i, w: AGENDA.w - 48, h: 68 })
const HOME = { x: TRANS.x + 40, y: TRANS.y + 488, w: 160 }
const HAND = { x: ((120 - 114) / 120) * HOME.w, y: (77.5 / 150) * HOME.w * 1.25 }
const DOCKED = 0.75

// Naskah dari mocks/backprop.ts. Waktu dalam detik sejak awal adegan.
const SCRIPT: { text: string; gap: number; concept?: [number, 'mentioned' | 'explained'] }[] = [
  { text: 'Oke, jadi eee backpropagation itu algoritma buat melatih neural network.', gap: 0.3 },
  { text: 'Pertama ada forward pass,', gap: 0.2, concept: [0, 'mentioned'] },
  { text: 'input masuk ke network, dihitung layer demi layer sampai keluar prediksi.', gap: 0.85, concept: [0, 'explained'] },
  { text: 'Terus prediksinya dibandingin sama label pakai loss function,', gap: 0.2, concept: [1, 'mentioned'] },
  { text: 'yang ngukur seberapa jauh prediksi dari jawaban yang benar.', gap: 0.85, concept: [1, 'explained'] },
  { text: 'Nah, error-nya dirambatkan balik pakai chain rule…', gap: 0, concept: [2, 'mentioned'] },
]
const TERMS = ['forward pass', 'loss function', 'chain rule']
const WORD = 0.11
const CONFIRM = 0.35
const WORDS: { w: string; t: number; term: boolean; filler: boolean }[] = []
const EVENTS: { i: number; status: 'mentioned' | 'explained'; t: number }[] = []
{
  let t = 1.0
  for (const u of SCRIPT) {
    const ws = u.text.split(' ')
    ws.forEach((w, k) => {
      const clean = (s: string) => s.toLowerCase().replace(/[,.…]/g, '')
      const term = TERMS.includes(clean(`${w} ${ws[k + 1] ?? ''}`)) || TERMS.includes(clean(`${ws[k - 1] ?? ''} ${w}`))
      WORDS.push({ w, t, term, filler: w === 'eee' || w === 'jadi' })
      t += WORD
    })
    if (u.concept) EVENTS.push({ i: u.concept[0], status: u.concept[1], t: t - WORD + CONFIRM })
    t += u.gap
  }
}
const TRAVEL = 0.4
const DRAW = 0.37
const WRITE = 1.15
const TICKS = EVENTS.filter((e) => e.status === 'explained')
const changeAt = (e: (typeof EVENTS)[number]) => (e.status === 'explained' ? e.t + DRAW : e.t)
const lastChange = (i: number, t: number) => EVENTS.filter((e) => e.i === i && changeAt(e) <= t).at(-1)

// Kamera: [detik, skala, fokus x, fokus y di layar]. Setiap ruas ease in-out.
const CAMERA: [number, number, number, number][] = [
  [0, 1, 960, 540],
  [1.2, 1, 960, 540],
  [2.0, 1.28, 1180, 420],
  [3.7, 1.28, 1180, 420],
  [4.3, 1.4, 600, 430],
  [5.6, 1.4, 600, 430],
  [6.15, 1.55, 900, 310],
  [7.15, 1.55, 900, 310],
  [7.75, 1.16, 760, 500],
  [9.3, 1.16, 760, 500],
  [9.9, 1, 960, 540],
]
function camera(t: number) {
  const i = Math.max(0, CAMERA.findLastIndex(([s]) => s <= t))
  const [t0, ...a] = CAMERA[i]
  const [t1, ...b] = CAMERA[Math.min(i + 1, CAMERA.length - 1)]
  const u = t1 === t0 ? 0 : inOut(Math.min(1, (t - t0) / (t1 - t0)))
  const [s, x, y] = a.map((v, k) => v + (b[k] - v) * u)
  return { s, x, y }
}
const project = (cam: ReturnType<typeof camera>, x: number, y: number): [number, number] => [960 + (x - cam.x) * cam.s, 540 + (y - cam.y) * cam.s]

export const PUSH = [10.35, 10.75] as const

export function Live() {
  const t = useT()
  const cam = camera(t)
  const appear = ease(t, [0.1, 0.42], [0, 1], inOut)
  const push = ease(t, [PUSH[0], PUSH[1]], [0, 1], inOut)
  const explained = CONCEPTS.filter((_, i) => lastChange(i, t)?.status === 'explained').length
  // Kabur kedalaman: kartu yang tidak sedang difokus kamera sedikit kabur.
  const zoom = Math.max(0, cam.s - 1)
  const blurAgenda = cam.x > 850 ? zoom * 9 : 0
  const blurTrans = cam.x < 800 ? zoom * 7 : 0

  const tick = TICKS.findLast((e) => e.t <= t && t < e.t + WRITE + TRAVEL)
  const go = tick ? ease(t, [tick.t, tick.t + TRAVEL], [0, 1], Easing.bezier(0.16, 1, 0.3, 1)) * (1 - ease(t, [tick.t + WRITE, tick.t + WRITE + TRAVEL], [0, 1], Easing.bezier(0.16, 1, 0.3, 1))) : 0
  const writing = !!tick && t < tick.t + WRITE
  const target = tick ? { x: AGENDA.x + AGENDA.w - 24 - 18 - 2, y: AGENDA.y + ROW0 + tick.i * ROW + 34 } : { x: 0, y: 0 }
  const reach = { x: (target.x - HOME.x - HAND.x) * go, y: (target.y - HOME.y - HAND.y) * go }

  const cues: Cue[] = [{ at: 0, mood: 'listen' }]
  const lines = ['Aku siap dengerin. Mulai kapan aja.']
  for (const e of EVENTS.slice(0, -1)) {
    const name = CONCEPTS[e.i]
    if (e.status === 'mentioned') {
      cues.push({ at: at60(e.t), mood: 'curious' })
      lines.push(`${name}? Jelasin lebih banyak, dong.`)
    } else {
      cues.push({ at: at60(e.t), mood: 'happy', tick: true }, { at: at60(e.t + WRITE), mood: 'happy' })
      lines.push('', `Yes! ${name} beres.`)
    }
  }
  const cue = Math.max(0, cues.findLastIndex((c) => c.at <= at60(t)))

  return (
    <AbsoluteFill>
      <Blur x={70 * Math.sin(Math.PI * push)}>
        <AbsoluteFill style={{ transform: `translateX(${-1920 * push}px)` }}>
          <AbsoluteFill style={{ background: '#eef5f1', opacity: appear }} />
          <AbsoluteFill style={{ perspective: 2400, opacity: appear }}>
            <div style={abs({ inset: 0, transformOrigin: '0 0', transform: `translate(960px, 540px) scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)` })}>
              <div style={abs({ left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 36, background: '#fff', boxShadow: '0 70px 140px -60px rgba(23,82,63,0.5), 0 0 0 1.5px #e3ebe7', transform: `rotateX(${(1 - appear) * 10}deg) scale(${1 + 0.05 * (1 - appear)})` })}>
                <TopBar t={t} explained={explained} />
                <div style={abs({ left: AGENDA.x, top: AGENDA.y, width: AGENDA.w, height: AGENDA.h, borderRadius: 30, background: C.card, padding: 28, filter: blurAgenda > 0.3 ? `blur(${blurAgenda}px)` : undefined })}>
                  <div style={{ fontSize: 27, fontWeight: 600, color: C.ink }}>Agenda</div>
                  <div style={{ fontSize: 17, color: C.ink3, marginTop: 4 }}>Centangnya sementara, nanti dicek ulang.</div>
                  {t >= DOCKED &&
                    CONCEPTS.map((name, i) => {
                      const e = lastChange(i, t)
                      const s = e?.status ?? 'none'
                      return (
                        <div key={name} style={abs({ left: 24, top: ROW0 + i * ROW, width: AGENDA.w - 48, height: 68, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 18px 0 24px' })}>
                          <span style={{ fontSize: 25, fontWeight: 600, color: C.ink, flex: 1 }}>{name}</span>
                          <span style={{ fontSize: 18, color: C.ink3, marginRight: 12 }}>{{ none: 'belum', mentioned: 'disebut', explained: 'jelas' }[s]}</span>
                          <StatusIcon status={s} size={36} drawAt={e ? at60(changeAt(e)) : -99} />
                        </div>
                      )
                    })}
                  <div style={abs({ left: 28, bottom: 28, display: 'flex', gap: 22, fontSize: 18, color: C.ink2, alignItems: 'center' })}>
                    {(['none', 'mentioned', 'explained'] as const).map((s) => (
                      <span key={s} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <StatusIcon status={s} size={24} />
                        {{ none: 'belum', mentioned: 'disebut', explained: 'jelas' }[s]}
                      </span>
                    ))}
                  </div>
                </div>
                {TICKS.map((e) => (
                  <Dust key={e.t} t={t} at={e.t + DRAW} x={AGENDA.x + AGENDA.w - 60} y={AGENDA.y + ROW0 + e.i * ROW + 34} n={16} spread={120} seed={`k${e.i}`} />
                ))}

                <div style={abs({ left: TRANS.x, top: TRANS.y, width: TRANS.w, height: TRANS.h, borderRadius: 30, border: `1.5px solid ${C.line}`, background: '#fff', padding: '30px 36px', filter: blurTrans > 0.3 ? `blur(${blurTrans}px)` : undefined })}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 23, fontWeight: 600, color: C.ink }}>Penjelasanmu</span>
                    <span style={{ fontSize: 17, color: C.ink3 }}>Teks yang pudar masih bisa berubah.</span>
                  </div>
                  <Transcript t={t} />
                </div>

                <div style={abs({ left: HOME.x, top: HOME.y, transform: `translate(${reach.x}px, ${reach.y}px) rotate(${4 * go}deg)`, transformOrigin: `${HAND.x}px ${HAND.y}px` })}>
                  <Actor cues={cues} width={HOME.w} mirror={writing} quiet={writing} style={{ position: 'relative' }} />
                </div>
                {!tick && lines[cue] && t > 0.9 && <Bubble t={t} at={cues[cue].at / 60} text={lines[cue]} />}
                <Footer t={t} />
              </div>
            </div>
          </AbsoluteFill>

          {/* Baris konsep dari setup terbang dan berlabuh di agenda. */}
          {t < DOCKED && CONCEPTS.map((name, i) => <Flying key={name} t={t} i={i} name={name} />)}

          {/* Label tanpa garis, tepat di samping bagian yang sedang difokus kamera. */}
          <Label t={t} at={2.15} out={3.45} x={project(cam, WIN.x + TRANS.x + 36, 0)[0]} y={650} text="Teksnya langsung muncul" />
          <Label t={t} at={TICKS[0].t + 0.35} out={TICKS[0].t + 0.95} x={1170} y={430} text="Udah jelas? Empur centang." />
          <Label t={t} at={6.3} out={7.1} x={960} y={434} text="Filler? Ketahuan." />
        </AbsoluteFill>
      </Blur>

      <Hit at={0.05} name="swoosh" volume={0.45} />
      {CONCEPTS.map((_, i) => (
        <Hit key={i} at={0.5 + 0.03 * i} name="tap" volume={0.3} />
      ))}
      {EVENTS.map((e) =>
        e.status === 'mentioned' ? <Hit key={e.t} at={e.t} name="pop" volume={0.4} /> : <Hit key={e.t} at={e.t + DRAW} name="tick" volume={0.7} />,
      )}
      {TICKS.map((e) => (
        <Hit key={`w${e.t}`} at={e.t} name="whoosh" volume={0.3} />
      ))}
      {[2.15, TICKS[0].t + 0.35, 6.3].map((s) => (
        <Hit key={`c${s}`} at={s} name="blip" volume={0.35} />
      ))}
      <Hit at={PUSH[0]} name="swish" volume={0.55} />
    </AbsoluteFill>
  )
}

function Flying({ t, i, name }: { t: number; i: number; name: string }) {
  const p = ease(t, [0.02 * i, 0.55 + 0.03 * i], [0, 1], inOut)
  const [a, b] = [SETUP_ROW(i), LIVE_ROW(i)]
  const lift = Math.sin(Math.PI * p)
  return (
    <div
      style={abs({
        left: mix(a.x, b.x, p),
        top: mix(a.y, b.y, p) - 120 * lift,
        width: mix(a.w, b.w, p),
        height: mix(a.h, b.h, p),
        borderRadius: 18,
        background: p > 0.5 ? '#fff' : C.card,
        boxShadow: `0 ${30 * lift}px ${50 * lift}px -20px rgba(22,22,29,${0.45 * lift})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${mix(20, 18, p)}px 0 24px`,
        fontSize: mix(26, 25, p),
        fontWeight: 600,
        color: C.ink,
        transform: `rotate(${(i % 2 ? 3 : -3) * lift}deg) scale(${1 + 0.06 * lift})`,
      })}
    >
      {name}
      <StatusIcon status="none" size={mix(30, 36, p)} />
    </div>
  )
}

function Transcript({ t }: { t: number }) {
  return (
    <div style={{ marginTop: 24, fontSize: 34, lineHeight: 1.6, color: C.ink, maxWidth: 1000 }}>
      {WORDS.filter((w) => w.t <= t).map((w, i) => {
        const c = ease(t, [w.t + CONFIRM - 0.06, w.t + CONFIRM])
        const style: CSSProperties = {
          color: c > 0.5 ? C.ink : C.ink3,
          opacity: ease(t, [w.t, w.t + 0.1]),
          filter: c < 1 ? `blur(${(1 - c) * 2.2}px)` : undefined,
          ...(w.term && c >= 1
            ? {
                backgroundImage: 'linear-gradient(transparent 58%, rgb(255 216 77 / 0.6) 58%, rgb(255 216 77 / 0.6) 92%, transparent 92%)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${ease(t, [w.t + CONFIRM, w.t + CONFIRM + 0.3], [0, 100])}% 100%`,
              }
            : {}),
        }
        return (
          <span key={i}>
            <span style={style}>{w.filler && c >= 1 ? <Wavy at={at60(w.t + CONFIRM)}>{w.w}</Wavy> : w.w}</span>{' '}
          </span>
        )
      })}
    </div>
  )
}

function Bubble({ t, at, text }: { t: number; at: number; text: string }) {
  const p = spr(t, Math.max(at, 0.9), 'bouncy')
  return (
    <div
      style={abs({
        left: HOME.x + HOME.w + 16,
        top: HOME.y + 40,
        maxWidth: 560,
        padding: '18px 24px',
        borderRadius: 22,
        border: `1.5px solid ${C.line}`,
        background: '#fff',
        boxShadow: '0 16px 36px -22px rgba(0,0,0,0.45)',
        fontSize: 25,
        fontWeight: 500,
        lineHeight: 1.35,
        color: C.ink,
        opacity: Math.min(1, p * 2),
        transformOrigin: '0% 80%',
        transform: `scale(${0.7 + 0.3 * p})`,
      })}
    >
      {text}
    </div>
  )
}

function TopBar({ t, explained }: { t: number; explained: number }) {
  const levels = useLevels()
  const rec = Math.max(0, t - 0.9)
  const latency = ['0,4', '0,5', '0,4', '0,6', '0,5'][Math.floor(t / 0.8) % 5]
  return (
    <div style={abs({ left: 32, right: 32, top: 24, height: 68, display: 'flex', alignItems: 'center', gap: 22 })}>
      <div style={{ width: 52, height: 52, borderRadius: 99, border: `1.5px solid ${C.line}`, display: 'grid', placeItems: 'center', fontSize: 26, color: C.ink }}>×</div>
      <div style={{ width: 260 }}>
        <div style={{ fontSize: 25, fontWeight: 600, color: C.ink }}>Backpropagation</div>
        <div style={{ fontSize: 17, color: C.ink3 }}>Sesi contoh</div>
      </div>
      <div>
        <div style={{ display: 'flex', gap: 8 }}>
          {CONCEPTS.map((_, i) => {
            const e = TICKS[i]
            const fill = e ? ease(t, [e.t + DRAW, e.t + DRAW + 0.5]) : 0
            return (
              <div key={i} style={{ width: 86, height: 12, borderRadius: 99, background: C.card2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${fill * 100}%`, background: C.go, borderRadius: 99 }} />
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 17, color: C.ink3, marginTop: 8 }}>{explained} dari 5 konsep jelas</div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, background: C.card, borderRadius: 99, padding: '12px 24px', fontSize: 20, color: C.ink }}>
        <span style={{ width: 12, height: 12, borderRadius: 12, background: C.stop, opacity: t < 0.9 ? 0.3 : 0.55 + 0.45 * Math.cos(t * 6) }} />
        <span style={{ fontWeight: 600 }}>Merekam</span>
        <span style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 22 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} style={{ width: 4, borderRadius: 4, background: C.go, height: 4 + 18 * Math.min(1, (levels[i + 2] ?? 0) * 3.2) * (t > 0.9 ? 1 : 0) }} />
          ))}
        </span>
        <span style={{ display: 'flex', fontVariantNumeric: 'tabular-nums' }}>
          0:<Odometer value={Math.min(59, 18 + rec)} digits={2} />
        </span>
        <span style={{ color: C.ink3 }}>Delay</span>
        <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{latency} dtk</span>
      </div>
    </div>
  )
}

function Footer({ t }: { t: number }) {
  const wpm = ease(t, [1.0, 9.5], [0, 91], (u) => Math.sqrt(u))
  const fillers = WORDS.filter((w) => w.filler && w.t + CONFIRM <= t).length
  const chip = (value: ReactNode, label: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, background: C.card, borderRadius: 99, padding: '12px 24px' }}>
      <span style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>{value}</span>
      <span style={{ fontSize: 19, color: C.ink3 }}>{label}</span>
    </div>
  )
  return (
    <div style={abs({ left: 32, right: 32, top: 840, height: 72, display: 'flex', alignItems: 'center', gap: 14 })}>
      {chip(<Odometer value={wpm} digits={2} />, 'kata/menit')}
      {chip(<Odometer value={fillers} />, 'filler')}
      {chip(0, 'jeda panjang')}
      <Pill bg={C.stop} edge="#b42318" size={24} style={{ marginLeft: 'auto' }}>
        Berhenti
      </Pill>
    </div>
  )
}

// ---------- 6. Feedback ----------

// Tombol "Jelasin lagi" di feedback, diklik kursor di RETRY_CLICK; adegan berikutnya terbuka dari sini.
export const RETRY_BUTTON: [number, number] = [1407, 990]
export const RETRY_CLICK = 4.1

export function Feedback() {
  const t = useT()
  const enter = ease(t, [0, 0.4], [0, 1], inOut)
  const hop = jump(t, 0.5, 0.9, 70)
  const score = ease(t, [1.0, 1.55], [0, 4], (u) => u)
  const tiles: [number, ReactNode, string][] = [
    [0.86, <>1:<Odometer value={ease(t, [1.05, 1.6], [0, 30], (u) => u)} digits={2} /></>, 'durasi'],
    [0.92, <Odometer value={ease(t, [1.1, 1.7], [0, 91], (u) => u)} digits={2} />, 'kata/menit'],
    [0.98, <Odometer value={ease(t, [1.15, 1.4], [0, 1], (u) => u)} />, 'jeda panjang'],
    [1.04, <Odometer value={ease(t, [1.2, 1.7], [0, 10], (u) => u)} digits={2} />, 'filler'],
  ]
  return (
    <AbsoluteFill style={{ transform: `translateX(${1920 * (1 - enter)}px)` }}>
      <Blur x={70 * Math.sin(Math.PI * enter)}>
        <AbsoluteFill style={{ background: STAGE }}>
          <Chapter t={t} at={0.45} n={3} text="Cek feedback" />
          <div style={abs({ left: 960 - 85, top: 250 - 132 * (170 / 120), width: 170, height: 212.5, transformOrigin: '50% 88%', transform: `translateY(${hop.y}px) scale(${hop.sx}, ${hop.sy})` })}>
            <Sequence from={at60(0.3)} layout="none">
              <Empur cues={[{ at: 0, mood: 'happy' }]} style={{ width: '100%', height: '100%' }} />
            </Sequence>
          </div>
          <div style={abs({ left: 0, right: 0, top: 270, display: 'flex', justifyContent: 'center' })}>
            <Rise text="Penjelasanmu udah aku baca. Ini feedback-nya!" t={t} at={0.55} size={50} stagger={0.04} />
          </div>
          <div style={abs({ left: 360, top: 360, width: 1200, display: 'flex', gap: 20, perspective: 1600 })}>
            <Flip t={t} at={0.8} style={{ width: 480, height: 300, background: '#e8f2ed', padding: 34, position: 'relative' }}>
              <div style={{ fontSize: 120, fontWeight: 700, color: C.ink, lineHeight: 1, display: 'flex', alignItems: 'baseline' }}>
                <Odometer value={score} />
                <span style={{ fontSize: 58, color: C.ink3 }}>/5</span>
              </div>
              <div style={{ fontSize: 27, color: C.ink, marginTop: 12 }}>konsep udah tepat</div>
              <div style={{ display: 'flex', gap: 10, position: 'absolute', left: 34, bottom: 34 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ transform: `scale(${spr(t, 1.1 + i * 0.09, 'bouncy')})` }}>
                    <StatusIcon status={i < 4 ? 'explained' : 'mentioned'} size={42} drawAt={at60(1.1 + i * 0.09)} />
                  </div>
                ))}
              </div>
            </Flip>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1 }}>
              {tiles.map(([at, value, label]) => (
                <Flip key={label} t={t} at={at} style={{ background: '#fff', boxShadow: '0 0 0 1.5px #e7e7ec', padding: '24px 28px' }}>
                  <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, display: 'flex' }}>{value}</div>
                  <div style={{ fontSize: 23, color: C.ink3, marginTop: 4 }}>{label}</div>
                </Flip>
              ))}
            </div>
          </div>
          <div style={abs({ left: 360, top: 690, width: 1200, display: 'flex', gap: 20 })}>
            {(
              [
                ['Perbaiki ini dulu', 'Jelasin learning rate: gimana kalau langkahnya kegedean atau kekecilan.', 2.0],
                ['Ini udah keren', 'Alurnya runtut, dari forward pass sampai gradient descent.', 2.2],
              ] as const
            ).map(([title, item, at], k) => (
              <Flip key={title} t={t} at={at - 0.15} style={{ flex: 1, background: '#fff', boxShadow: '0 30px 60px -30px rgba(22,22,29,0.35), 0 0 0 1.5px #e7e7ec', padding: '28px 32px', height: 220 }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: C.ink }}>{title}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 18, fontSize: 25, lineHeight: 1.45, color: C.ink, clipPath: `inset(0 ${ease(t, [at, at + 0.5], [100, 0])}% 0 0)` }}>
                  {k === 0 ? (
                    <span style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 38, background: '#FFF1C9', color: '#7A5200', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 700 }}>1</span>
                  ) : (
                    <StatusIcon status="explained" size={38} />
                  )}
                  {item}
                </div>
              </Flip>
            ))}
          </div>
          <div style={abs({ right: 360, top: 950, display: 'flex', gap: 20, opacity: Math.min(1, spr(t, 2.6, 'bouncy') * 2), transform: `translateY(${(1 - spr(t, 2.6, 'bouncy')) * 30}px)` })}>
            <Pill bg={C.card} edge={C.card2} color={C.ink} size={30}>
              Ganti topik
            </Pill>
            <Pill size={30} pressed={Math.max(0, ease(t, [RETRY_CLICK - 0.08, RETRY_CLICK]) - ease(t, [RETRY_CLICK + 0.08, RETRY_CLICK + 0.2]))}>
              Jelasin lagi
            </Pill>
          </div>
          <Cursor t={t} at={3.0} to={[RETRY_BUTTON[0] + 10, RETRY_BUTTON[1] + 6]} press={RETRY_CLICK} />
          <Dust t={t} at={0.9} x={960} y={250} n={12} spread={140} seed="fb" />
          <Grain opacity={0.05} />
        </AbsoluteFill>
      </Blur>
      <>
          <Hit at={0.9} name="land" volume={0.5} />
          {[0, 1, 2, 3].map((i) => (
            <Hit key={i} at={1.1 + i * 0.09 + 0.08} name={`note${i + 1}`} volume={0.35} />
          ))}
          {[0.8, 0.86, 0.92, 0.98, 1.04].map((s) => (
            <Hit key={s} at={s} name="tap" volume={0.3} />
          ))}
          <Hit at={1.85} name="whoosh" volume={0.3} />
          <Hit at={2.6} name="pop" volume={0.4} />
          <Hit at={RETRY_CLICK} name="click" volume={0.6} />
      </>
    </AbsoluteFill>
  )
}

// Kartu yang berputar turun dari engsel atas (rotateX) lalu memantul.
function Flip({ t, at, style, children }: { t: number; at: number; style?: CSSProperties; children: ReactNode }) {
  const p = spr(t, at, 'bouncy')
  return (
    <div style={{ borderRadius: 30, transformOrigin: '50% 0%', transform: `rotateX(${(1 - p) * -95}deg)`, opacity: Math.min(1, p * 4), ...style }}>
      {children}
    </div>
  )
}

function Cursor({ t, at, to, press }: { t: number; at: number; to: [number, number]; press: number }) {
  if (t < at) return null
  const from: [number, number] = [to[0] + 380, to[1] + 260]
  const p = ease(t, [at, press - 0.15], [0, 1], inOut)
  const down = ease(t, [press - 0.08, press], [0, 1]) - ease(t, [press + 0.08, press + 0.2], [0, 1])
  return (
    <svg viewBox="0 0 24 24" width="64" height="64" style={abs({ left: mix(from[0], to[0], p), top: mix(from[1], to[1], p) - 50 * Math.sin(Math.PI * p), transform: `scale(${1 - 0.15 * Math.max(0, down)})`, transformOrigin: '4px 3px', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.3))' })}>
      <path d="M4 3l14.5 8.2-6.4 1.6 3.6 6.6-2.6 1.4-3.6-6.6L4.8 18.6Z" fill="#fff" stroke={C.ink} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

// ---------- 7. Jelasin lagi ----------

// Sesi kedua dengan agenda yang sama: satu per satu konsep tercentang, sampai semuanya beres.
const RETRY_TICK = (i: number) => 0.85 + 0.5 * i
export const RETRY_EXIT = [4.6, 5.0] as const

export function Retry() {
  const t = useT()
  const iris = ease(t, [0, 0.5], [0, 2300], inOut)
  const card = spr(t, 0.2, 'soft')
  const done = CONCEPTS.filter((_, i) => t >= RETRY_TICK(i) + 0.15).length
  const exit = ease(t, [RETRY_EXIT[0], RETRY_EXIT[1]], [0, 1], inExpo)
  const all = RETRY_TICK(4) + 0.3
  const hop = jump(t, all, all + 0.4, 90)
  return (
    <AbsoluteFill style={{ clipPath: `circle(${iris}px at ${RETRY_BUTTON[0]}px ${RETRY_BUTTON[1]}px)` }}>
      <Blur y={60 * Math.sin(Math.PI * exit)}>
        <AbsoluteFill style={{ background: '#eef5f1', transform: `translateY(${-1080 * exit}px)` }}>
          <Chapter t={t} at={0.25} n={4} text="Jelasin lagi" />
          <div style={abs({ left: 140, top: 340, width: 660 })}>
            <Rise text="Jelasin lagi sampai semua konsep beres." t={t} at={0.45} size={84} />
          </div>
          <div style={abs({ left: 140, top: 900 - 132 * (200 / 120) + hop.y, width: 200, height: 250, transformOrigin: '50% 88%', transform: `scale(${hop.sx}, ${hop.sy})` })}>
            <Sequence from={0} layout="none">
              <Empur
                enter={false}
                cues={[
                  { at: 0, mood: 'listen', gaze: [2, 0] },
                  { at: at60(all), mood: 'cheer' },
                ]}
                style={{ width: '100%', height: '100%' }}
              />
            </Sequence>
          </div>
          {t > all + 0.1 && (
            <div style={abs({ left: 360, top: 770, padding: '16px 24px', borderRadius: 22, background: '#fff', border: `1.5px solid ${C.line}`, boxShadow: '0 16px 36px -22px rgba(0,0,0,0.45)', fontSize: 28, fontWeight: 600, color: C.ink, transformOrigin: '0% 80%', transform: `scale(${0.7 + 0.3 * spr(t, all + 0.1, 'bouncy')})`, opacity: Math.min(1, spr(t, all + 0.1, 'bouncy') * 2) })}>
              Mantap, semua konsep beres!
            </div>
          )}
          <div style={abs({ left: 900, top: 150, width: 760, height: 780, borderRadius: 40, background: '#fff', boxShadow: '0 60px 120px -50px rgba(23,82,63,0.45), 0 0 0 1.5px #e3ebe7', padding: '40px 44px', opacity: Math.min(1, card * 1.5), transform: `translateX(${(1 - card) * 300}px)` })}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: C.ink }}>Agenda</span>
              <span style={{ fontSize: 22, fontWeight: 600, color: '#7A5200', background: '#FFF1C9', borderRadius: 99, padding: '8px 18px' }}>Sesi ke-2</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
              {CONCEPTS.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 12, borderRadius: 99, background: C.card2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${ease(t, [RETRY_TICK(i) + 0.15, RETRY_TICK(i) + 0.5]) * 100}%`, background: C.go }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 22, color: C.ink3, marginTop: 10 }}>
              <Odometer value={done} /> dari 5 konsep jelas
            </div>
            {CONCEPTS.map((name, i) => {
              const on = t >= RETRY_TICK(i) + 0.15
              const flash = on ? 1 - ease(t, [RETRY_TICK(i) + 0.15, RETRY_TICK(i) + 0.8]) : 0
              return (
                <div key={name} style={abs({ left: 44, top: 210 + i * 108, width: 672, height: 92, borderRadius: 22, background: `rgba(34,119,91,${0.04 + 0.14 * flash})`, display: 'flex', alignItems: 'center', padding: '0 24px 0 30px' })}>
                  <span style={{ fontSize: 32, fontWeight: 600, color: C.ink, flex: 1 }}>{name}</span>
                  <span style={{ fontSize: 22, color: C.ink3, marginRight: 16 }}>{on ? 'jelas' : 'belum'}</span>
                  <StatusIcon status={on ? 'explained' : 'none'} size={46} drawAt={at60(RETRY_TICK(i) + 0.15)} />
                  <Dust t={t} at={RETRY_TICK(i) + 0.15} x={630} y={46} n={12} spread={110} seed={`r${i}`} />
                </div>
              )
            })}
          </div>
          <Grain opacity={0.05} />
        </AbsoluteFill>
      </Blur>
      <Hit at={0} name="whoosh" volume={0.4} />
      {CONCEPTS.map((_, i) => (
        <Hit key={i} at={RETRY_TICK(i) + 0.15} name={`note${i + 1}`} volume={0.45} />
      ))}
      <Hit at={all} name="sparkle" volume={0.5} />
      <Hit at={all + 0.4} name="land" volume={0.4} />
      <Hit at={RETRY_EXIT[0]} name="swish" volume={0.5} />
    </AbsoluteFill>
  )
}
