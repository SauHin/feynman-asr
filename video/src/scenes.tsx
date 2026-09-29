import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, Easing, Img, random, Sequence, useCurrentFrame } from 'remotion'
import logo from '../../frontend/public/logo.svg'
import { Empur, type Cue } from './empur'
import { C, inOut, leave, marker, outExpo, Pill, pop, Sfx, StatusIcon, tween, Wavy, Words } from './ui'

// Tujuh adegan video promo. Setiap adegan memakai frame lokal (0 = awal Sequence-nya di Promo.tsx)
// dan menutupi adegan sebelumnya dengan transisinya sendiri: lingkaran, lembar, atau dorongan.

const abs = (style: CSSProperties): CSSProperties => ({ position: 'absolute', ...style })

// Latar putih dengan dua cahaya lembut yang bergeser pelan.
function Glow({ warm = 'rgba(255,216,77,0.18)', cool = 'rgba(34,119,91,0.10)' }) {
  const f = useCurrentFrame()
  const blob = (x: number, y: number, r: number, color: string, k: number) => (
    <div
      style={abs({
        left: x - r + Math.sin(f / 70 + k) * 40,
        top: y - r + Math.cos(f / 80 + k) * 30,
        width: 2 * r,
        height: 2 * r,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      })}
    />
  )
  return (
    <AbsoluteFill>
      {blob(260, 180, 560, warm, 0)}
      {blob(1700, 940, 640, cool, 2)}
    </AbsoluteFill>
  )
}

// Lembar yang naik dari bawah (atau turun dari atas) menutupi adegan sebelumnya.
function Sheet({ from, color, children }: { from: 'bottom' | 'top'; color: string; children: ReactNode }) {
  const f = useCurrentFrame()
  const p = tween(f, [0, 22], [0, 1])
  const r = 72 * (1 - p)
  return (
    <AbsoluteFill
      style={{
        background: color,
        overflow: 'hidden',
        transform: `translateY(${(from === 'bottom' ? 1 : -1) * 1100 * (1 - p)}px)`,
        borderRadius: from === 'bottom' ? `${r}px ${r}px 0 0` : `0 0 ${r}px ${r}px`,
        boxShadow: '0 0 90px rgba(0,0,0,0.18)',
      }}
    >
      {children}
    </AbsoluteFill>
  )
}

// Lingkaran yang membesar dari titik (x, y) sampai menutupi layar.
function Iris({ x = 960, y = 540, children, style }: { x?: number; y?: number; children: ReactNode; style?: CSSProperties }) {
  const f = useCurrentFrame()
  const r = tween(f, [0, 22], [0, 2300], Easing.bezier(0.55, 0, 0.1, 1))
  return <AbsoluteFill style={{ clipPath: `circle(${r}px at ${x}px ${y}px)`, ...style }}>{children}</AbsoluteFill>
}

const GREEN_BG = `radial-gradient(circle at 30% 62%, #2c8f6d 0%, ${C.go} 52%, #1a6049 100%)`

// Empur di dalam kotak berukuran tetap. Isyaratnya berlaku mulai frame `at` adegan.
function Actor({ cues, at = 0, width, style, mirror, quiet }: { cues: Cue[]; at?: number; width: number; style?: CSSProperties; mirror?: boolean; quiet?: boolean }) {
  return (
    <div style={abs({ width, height: width * 1.25, ...style })}>
      <Sequence from={at} layout="none">
        <Empur cues={cues} mirror={mirror} quiet={quiet} style={{ width: '100%', height: '100%' }} />
      </Sequence>
    </div>
  )
}

const Shadow = ({ x, y, w, k = 1 }: { x: number; y: number; w: number; k?: number }) => (
  <div style={abs({ left: x - w / 2, top: y - w * 0.07, width: w, height: w * 0.14, borderRadius: '50%', background: 'rgba(0,0,0,0.16)', filter: 'blur(4px)', transform: `scale(${k})` })} />
)

// 1. Masalah: satu slide yang sama dibaca tiga kali, tapi saat menjelaskan malah tersendat.
// Setiap kali selesai dibaca, satu garis turus tertulis di sampingnya.
const PASSES = [3, 18, 33]
const PASS = 12

export function Hook() {
  const f = useCurrentFrame()
  const out = leave(f, 56, 14)
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Glow />
      <div style={abs({ left: 0, right: 0, top: 0, ...out })}>
        <Reading />
        <Tally />
      </div>
      <div style={abs({ left: 0, right: 0, top: 580, textAlign: 'center', ...out })}>
        <Words text="Sudah baca slide tiga kali." at={12} size={108} mark={{ tiga: marker(f, 38), 'kali.': marker(f, 41) }} />
      </div>
      <div style={abs({ left: 0, right: 0, top: 290, textAlign: 'center' })}>
        <Words text="Tapi saat harus menjelaskan…" at={62} size={96} />
      </div>
      <Bubble at={80} />

      <Sfx at={0} name="paper" volume={0.5} />
      {PASSES.map((t) => (
        <Sfx key={t} at={t + PASS} name="scratch" volume={0.6} />
      ))}
      <Sfx at={56} name="whoosh" volume={0.35} />
      <Sfx at={80} name="pop" volume={0.55} />
      <Sfx at={94} name="bonk" volume={0.55} />
      <Sfx at={104} name="bonk" volume={0.45} />
    </AbsoluteFill>
  )
}

// Slide yang sama: pita stabilo menyapu dari atas ke bawah, dan nomor halaman berjalan 1 sampai 24.
// Di awal setiap putaran slide sedikit tersentak, lalu halaman kembali ke 1.
function Reading() {
  const f = useCurrentFrame()
  const p = pop(f, 0)
  const pass = PASSES.findLast((t) => t <= f)
  const u = pass === undefined ? 0 : tween(f, [pass, pass + PASS], [0, 1], (t) => t)
  const scanning = pass !== undefined && f < pass + PASS
  const flick = pass === undefined ? 0 : Math.sin(Math.min(1, (f - pass) / 6) * Math.PI)
  return (
    <div
      style={abs({
        left: 560,
        top: 130,
        width: 560,
        height: 350,
        borderRadius: 28,
        background: '#fff',
        boxShadow: '0 40px 70px -36px rgba(22,22,29,0.4), 0 0 0 1.5px #e7e7ec',
        padding: '34px 40px',
        overflow: 'hidden',
        opacity: Math.min(1, p * 2),
        transform: `translateY(${(1 - p) * 80 - 6 * flick}px) rotate(${-2 * flick}deg)`,
      })}
    >
      <div style={{ width: 110, height: 16, borderRadius: 8, background: '#FFD84D' }} />
      <div style={{ marginTop: 20, fontSize: 38, fontWeight: 700, color: C.ink }}>Backpropagation</div>
      {[100, 88, 94, 70].map((w, i) => (
        <div key={i} style={{ marginTop: 18, width: `${w}%`, height: 14, borderRadius: 7, background: C.card2 }} />
      ))}
      <div style={abs({ right: 32, bottom: 22, fontSize: 22, color: C.ink3, fontVariantNumeric: 'tabular-nums' })}>
        {pass === undefined ? 1 : Math.max(1, Math.round(u * 24))} / 24
      </div>
      <div
        style={abs({
          left: 0,
          right: 0,
          top: -70 + u * 420,
          height: 90,
          opacity: scanning ? 1 : 0,
          background: 'linear-gradient(transparent, rgba(255,216,77,0.45) 50%, transparent)',
        })}
      />
    </div>
  )
}

// Tiga garis turus, masing-masing tergores setelah satu putaran membaca selesai.
function Tally() {
  const f = useCurrentFrame()
  const strokes = ['M26 18 L20 150', 'M70 14 L66 152', 'M114 20 L108 148']
  return (
    <svg viewBox="0 0 140 170" width={170} height={206} style={abs({ left: 1170, top: 200, overflow: 'visible' })}>
      {strokes.map((d, i) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={tween(f, [PASSES[i] + PASS, PASSES[i] + PASS + 6], [1, 0])}
          fill="none"
          stroke={C.ink}
          strokeWidth={13}
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

function Bubble({ at }: { at: number }) {
  const f = useCurrentFrame()
  const p = pop(f, at)
  const shake = (t0: number) => (f > t0 ? Math.sin((f - t0) * 0.9) * 3 * Math.exp(-(f - t0) / 12) : 0)
  return (
    <div style={abs({ left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center' })}>
      <div
        style={{
          position: 'relative',
          background: C.card,
          borderRadius: 48,
          padding: '40px 64px 52px',
          fontSize: 80,
          fontWeight: 600,
          color: C.ink,
          display: 'flex',
          gap: 26,
          transformOrigin: '12% 100%',
          opacity: Math.min(1, p * 2),
          transform: `scale(${0.6 + 0.4 * p}) rotate(${shake(at + 14) + shake(at + 24)}deg)`,
        }}
      >
        <span>Jadi…</span>
        <Wavy at={at + 12}>eee…</Wavy>
        <Wavy at={at + 22}>gitu</Wavy>
        <span>deh.</span>
        <div style={abs({ left: 80, bottom: -18, width: 44, height: 44, background: C.card, transform: 'rotate(45deg)', borderRadius: 8 })} />
      </div>
    </div>
  )
}

// 2. Empur muncul di papan hijau: perkenalan.
export function Reveal() {
  const f = useCurrentFrame()
  const rise = pop(f, 6)
  return (
    <Iris y={600} style={{ background: GREEN_BG }}>
      <Shadow x={560} y={846} w={300} k={rise} />
      <Actor
        at={6}
        width={390}
        cues={[
          { at: 0, mood: 'wave' },
          { at: 54, mood: 'happy' },
        ]}
        style={{ left: 560 - 195, top: 360, transform: `translateY(${(1 - rise) * 320}px)` }}
      />
      <div style={abs({ left: 880, top: 360, width: 960 })}>
        <Words text="Kenalin, Empur." at={16} size={148} color="#fff" />
        <Words text="Teman latihan yang mendengarkan penjelasanmu." at={30} stagger={2} size={50} weight={500} color="rgba(255,255,255,0.82)" style={{ marginTop: 22, lineHeight: 1.3 }} />
      </div>
      <Sfx at={8} name="pop" volume={0.6} />
      <Sfx at={60} name="sparkle" volume={0.45} />
    </Iris>
  )
}

// 3. Setup: ketik topik, unggah materi, Empur menyusun daftar konsep.
const TOPIC = 'Backpropagation'
const CONCEPTS = ['Forward pass', 'Loss function', 'Chain rule', 'Gradient descent', 'Learning rate']
const TYPE_AT = 34
const FILE_AT = 76
const LIST_AT = 146

export function Setup() {
  const f = useCurrentFrame()
  const card = pop(f, 10, false)
  const push = tween(f, [240, 256], [0, -1920], inOut)
  return (
    <Sheet from="bottom" color={C.bg}>
      <AbsoluteFill style={{ transform: `translateX(${push}px)` }}>
        <Glow />
        <div style={abs({ left: 150, top: 380, width: 700 })}>
          <div style={leave(f, 128)}>
            <Words text="Ketik topik. Unggah materi." at={18} size={84} />
          </div>
        </div>
        <div style={abs({ left: 150, top: 380, width: 700 })}>
          <Words text="Empur menyusun daftar konsepnya." at={134} size={84} />
        </div>

        <div
          style={abs({
            left: 900,
            top: 128,
            width: 880,
            height: 824,
            borderRadius: 40,
            background: '#fff',
            boxShadow: '0 50px 90px -40px rgba(22,22,29,0.35), 0 0 0 1.5px #e7e7ec',
            padding: '44px 52px',
            opacity: card,
            transform: `perspective(2200px) translateX(${(1 - card) * 260}px) rotateY(${(1 - card) * -16}deg)`,
          })}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: 118 }}>
            <Actor
              at={14}
              width={96}
              cues={[
                { at: 0, mood: 'wave' },
                { at: TYPE_AT - 14, mood: 'listen', gaze: [1.5, 1] },
                { at: LIST_AT - 30, mood: 'think' },
                { at: LIST_AT + 52, mood: 'happy' },
              ]}
              style={{ position: 'relative', flexShrink: 0 }}
            />
            <div style={{ fontSize: 38, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>Mau menjelaskan topik apa hari ini?</div>
          </div>
          <Field />
          <DropZone />
          <div style={{ marginTop: 30, fontSize: 24, fontWeight: 600, color: C.ink3, opacity: tween(f, [LIST_AT - 6, LIST_AT + 4], [0, 1]) }}>Daftar konsep</div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CONCEPTS.map((name, i) => {
              const t = LIST_AT + i * 9
              return (
                <div
                  key={name}
                  style={{
                    height: 58,
                    borderRadius: 18,
                    background: C.card,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px 0 24px',
                    fontSize: 27,
                    fontWeight: 600,
                    color: C.ink,
                    clipPath: `inset(0 ${tween(f, [t, t + 16], [100, 0])}% 0 0 round 18px)`,
                  }}
                >
                  {name}
                  <StatusIcon status="none" size={32} />
                </div>
              )
            })}
          </div>
        </div>
      </AbsoluteFill>

      <Sfx at={0} name="swoosh" volume={0.4} />
      {Array.from(TOPIC, (_, i) => (
        <Sfx key={i} at={TYPE_AT + i * 2} name={`key${(i % 3) + 1}`} volume={0.35} />
      ))}
      <Sfx at={FILE_AT + 8} name="drop" volume={0.6} />
      {CONCEPTS.map((_, i) => (
        <Sfx key={i} at={LIST_AT + i * 9} name={`note${i + 1}`} volume={0.4} />
      ))}
      <Sfx at={240} name="whoosh" volume={0.4} />
    </Sheet>
  )
}

function Field() {
  const f = useCurrentFrame()
  const n = Math.max(0, Math.min(TOPIC.length, Math.floor((f - TYPE_AT) / 2) + 1))
  const typing = f >= TYPE_AT - 6 && f < TYPE_AT + 2 * TOPIC.length + 24
  const caret = typing && Math.floor(f / 8) % 2 === 0
  return (
    <div
      style={{
        marginTop: 18,
        height: 86,
        borderRadius: 20,
        border: `2px solid ${typing ? '#4b7bff' : C.line}`,
        boxShadow: typing ? '0 0 0 5px rgba(75,123,255,0.18)' : undefined,
        display: 'flex',
        alignItems: 'center',
        padding: '0 26px',
        fontSize: 34,
        color: n ? C.ink : C.ink3,
      }}
    >
      {n ? TOPIC.slice(0, n) : 'Contoh: Backpropagation'}
      {caret && <span style={{ width: 3, height: 40, marginLeft: 3, background: C.go, borderRadius: 2 }} />}
    </div>
  )
}

function DropZone() {
  const f = useCurrentFrame()
  const drop = pop(f, FILE_AT)
  const landed = f >= FILE_AT + 8
  const flash = landed ? tween(f, [FILE_AT + 8, FILE_AT + 30], [1, 0]) : 0
  return (
    <div
      style={{
        marginTop: 20,
        height: 120,
        borderRadius: 24,
        border: `2.5px dashed rgba(34,119,91,${landed ? 0.2 : 0.45})`,
        background: `rgba(34,119,91,${0.04 + 0.12 * flash})`,
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
      }}
    >
      {f < FILE_AT + 4 && <span style={{ fontSize: 26, color: C.go, fontWeight: 500 }}>Seret PDF atau PPTX ke sini</span>}
      {f >= FILE_AT && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '14px 26px 14px 16px',
            borderRadius: 20,
            background: '#fff',
            boxShadow: '0 14px 30px -16px rgba(22,22,29,0.4), 0 0 0 1.5px #e7e7ec',
            transform: `translateY(${(1 - drop) * -260}px) rotate(${(1 - drop) * 10}deg)`,
          }}
        >
          <div style={{ width: 54, height: 64, borderRadius: 12, background: '#F04438', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 17, fontWeight: 700 }}>PDF</div>
          <div>
            <div style={{ fontSize: 27, fontWeight: 600, color: C.ink }}>materi-minggu-5.pdf</div>
            <div style={{ fontSize: 21, color: C.ink3 }}>24 halaman</div>
          </div>
        </div>
      )}
    </div>
  )
}

// 4. Sesi live: transkrip berjalan, Empur mencentang konsep yang sudah dijelaskan.
// Naskah dari mocks/backprop.ts. Setiap kalimat bisa memicu status konsep (indeks CONCEPTS).
const SCRIPT: { text: string; gap: number; concept?: [number, 'mentioned' | 'explained'] }[] = [
  { text: 'Oke, jadi eee backpropagation itu algoritma buat melatih neural network.', gap: 10 },
  { text: 'Pertama ada forward pass,', gap: 8, concept: [0, 'mentioned'] },
  { text: 'input masuk ke network, dihitung layer demi layer sampai keluar prediksi.', gap: 28, concept: [0, 'explained'] },
  { text: 'Terus prediksinya dibandingin sama label pakai loss function,', gap: 8, concept: [1, 'mentioned'] },
  { text: 'yang ngukur seberapa jauh prediksi dari jawaban yang benar.', gap: 28, concept: [1, 'explained'] },
  { text: 'Nah, error-nya dirambatkan balik pakai chain rule…', gap: 0, concept: [2, 'mentioned'] },
]
const TERMS = ['forward pass', 'loss function', 'chain rule']
// Kata muncul sebagai partial (samar), lalu confirmed CONFIRM frame kemudian.
const WORD = 4
const CONFIRM = 12
const WORDS: { w: string; t: number; term: boolean; filler: boolean }[] = []
const EVENTS: { i: number; status: 'mentioned' | 'explained'; t: number }[] = []
{
  let t = 24
  for (const u of SCRIPT) {
    const ws = u.text.split(' ')
    ws.forEach((w, k) => {
      const pair = `${w} ${ws[k + 1] ?? ''}`.toLowerCase().replace(/[,.…]/g, '')
      const prev = `${ws[k - 1] ?? ''} ${w}`.toLowerCase().replace(/[,.…]/g, '')
      WORDS.push({ w, t, term: TERMS.includes(pair) || TERMS.includes(prev), filler: w === 'eee' || w === 'jadi' })
      t += WORD
    })
    if (u.concept) EVENTS.push({ i: u.concept[0], status: u.concept[1], t: t - WORD + CONFIRM })
    t += u.gap
  }
}
// Empur pergi ke baris, menunggu DRAW frame sebelum centang tergambar, lalu kembali setelah WRITE.
const TRAVEL = 14
const DRAW = 11
const WRITE = 39
const TICKS = EVENTS.filter((e) => e.status === 'explained')
const statusAt = (i: number, f: number) =>
  EVENTS.filter((e) => e.i === i && (e.status === 'explained' ? e.t + DRAW : e.t) <= f).at(-1)?.status ?? 'none'

// Tata letak jendela aplikasi (koordinat di dalam jendela).
const WIN = { x: 120, y: 70, w: 1680, h: 940 }
const AGENDA = { x: 32, y: 112, w: 500, h: 700 }
const ROW0 = 124
const ROW = 80
const TRANS = { x: 556, y: 112, w: 1092, h: 700 }
const HOME = { x: TRANS.x + 40, y: TRANS.y + 488, w: 160 }
// Ujung tangan saat dicerminkan (x = 120 - KAPUR_HAND.x), dalam piksel kotak Empur.
const HAND = { x: ((120 - 114) / 120) * HOME.w, y: (77.5 / 150) * HOME.w * 1.25 }

// Kamera: [frame, skala, titik fokus x, y di layar]. Setiap ruas memakai ease in-out.
const CAMERA: [number, number, number, number][] = [
  [0, 1, 960, 540],
  [26, 1, 960, 540],
  [70, 1.28, 1180, 420],
  [128, 1.28, 1180, 420],
  [150, 1.4, 600, 430],
  [196, 1.4, 600, 430],
  [226, 1, 960, 540],
  [270, 1, 960, 540],
  [292, 1.14, 760, 500],
  [334, 1.14, 760, 500],
  [360, 1, 960, 540],
]
const camera = (f: number) => {
  const i = Math.max(0, CAMERA.findLastIndex(([t]) => t <= f))
  const [t0, ...a] = CAMERA[i]
  const [t1, ...b] = CAMERA[Math.min(i + 1, CAMERA.length - 1)]
  const u = t1 === t0 ? 0 : inOut(Math.min(1, (f - t0) / (t1 - t0)))
  const [s, x, y] = a.map((v, k) => v + (b[k] - v) * u)
  return `translate(960px, 540px) scale(${s}) translate(${-x}px, ${-y}px)`
}

export function Live() {
  const f = useCurrentFrame()
  const enter = tween(f, [0, 16], [1920, 0], inOut)
  const explained = CONCEPTS.filter((_, i) => statusAt(i, f) === 'explained').length

  // Empur: di rumah, atau sedang pergi mencentang baris.
  const tick = TICKS.findLast((e) => e.t <= f && f < e.t + WRITE + TRAVEL)
  const go = tick ? tween(f, [tick.t, tick.t + TRAVEL], [0, 1]) * (1 - tween(f, [tick.t + WRITE, tick.t + WRITE + TRAVEL], [0, 1])) : 0
  const writing = !!tick && f < tick.t + WRITE
  const target = tick ? { x: AGENDA.x + AGENDA.w - 24 - 18 - 2, y: AGENDA.y + ROW0 + tick.i * ROW + 34 } : { x: 0, y: 0 }
  const reach = { x: (target.x - HOME.x - HAND.x) * go, y: (target.y - HOME.y - HAND.y) * go }

  const cues: Cue[] = [{ at: 0, mood: 'listen' }]
  const lines = ['Aku menyimak. Mulai jelaskan kapan saja.']
  for (const e of EVENTS.slice(0, -1)) {
    const name = CONCEPTS[e.i]
    if (e.status === 'mentioned') {
      cues.push({ at: e.t, mood: 'curious' })
      lines.push(`${name}? Jelaskan lebih lanjut, dong.`)
    } else {
      cues.push({ at: e.t, mood: 'happy', tick: true }, { at: e.t + WRITE, mood: 'happy' })
      lines.push('', `Yes! ${name} sudah jelas.`)
    }
  }
  const cue = Math.max(0, cues.findLastIndex((c) => c.at <= f))

  return (
    <AbsoluteFill style={{ background: '#eef5f1', transform: `translateX(${enter}px)` }}>
      <Glow warm="rgba(255,216,77,0.14)" cool="rgba(34,119,91,0.12)" />
      <AbsoluteFill style={{ transform: camera(f), transformOrigin: '0 0' }}>
        <div style={abs({ left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 36, background: '#fff', boxShadow: '0 60px 120px -50px rgba(23,82,63,0.45), 0 0 0 1.5px #e3ebe7' })}>
          <TopBar f={f} explained={explained} />
          <div style={abs({ left: AGENDA.x, top: AGENDA.y, width: AGENDA.w, height: AGENDA.h, borderRadius: 30, background: C.card, padding: 28 })}>
            <div style={{ fontSize: 27, fontWeight: 600, color: C.ink }}>Agenda</div>
            <div style={{ fontSize: 17, color: C.ink3, marginTop: 4 }}>Perkiraan langsung, diperiksa lagi setelah sesi.</div>
            {CONCEPTS.map((name, i) => {
              const s = statusAt(i, f)
              const change = EVENTS.filter((e) => e.i === i && (e.status === 'explained' ? e.t + DRAW : e.t) <= f).at(-1)
              const drawAt = change ? (change.status === 'explained' ? change.t + DRAW : change.t) : -99
              return (
                <div key={name} style={abs({ left: 24, top: ROW0 + i * ROW, width: AGENDA.w - 48, height: 68, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 18px 0 24px' })}>
                  <span style={{ fontSize: 25, fontWeight: 600, color: C.ink, flex: 1 }}>{name}</span>
                  <span style={{ fontSize: 18, color: C.ink3, marginRight: 12 }}>{{ none: 'belum', mentioned: 'disebut', explained: 'dijelaskan' }[s]}</span>
                  <StatusIcon status={s} size={36} drawAt={drawAt} />
                  {s === 'explained' && <Dust at={drawAt} />}
                </div>
              )
            })}
            <div style={abs({ left: 28, bottom: 28, display: 'flex', gap: 22, fontSize: 18, color: C.ink2, alignItems: 'center' })}>
              {(['none', 'mentioned', 'explained'] as const).map((s) => (
                <span key={s} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusIcon status={s} size={24} />
                  {{ none: 'belum', mentioned: 'disebut', explained: 'dijelaskan' }[s]}
                </span>
              ))}
            </div>
          </div>

          <div style={abs({ left: TRANS.x, top: TRANS.y, width: TRANS.w, height: TRANS.h, borderRadius: 30, border: `1.5px solid ${C.line}`, background: '#fff', padding: '30px 36px' })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 23, fontWeight: 600, color: C.ink }}>Penjelasanmu</span>
              <span style={{ fontSize: 17, color: C.ink3 }}>Teks samar masih bisa berubah.</span>
            </div>
            <Transcript f={f} />
          </div>

          <Shadow x={HOME.x + HOME.w / 2} y={HOME.y + HOME.w * 1.25 - 16} w={90} />
          <div style={abs({ left: HOME.x, top: HOME.y, transform: `translate(${reach.x}px, ${reach.y}px) rotate(${4 * go}deg)`, transformOrigin: `${HAND.x}px ${HAND.y}px` })}>
            <Actor cues={cues} width={HOME.w} mirror={writing} quiet={writing} style={{ position: 'relative' }} />
          </div>
          {!tick && lines[cue] && <SpeechBubble key={cue} at={cues[cue].at} text={lines[cue]} />}

          <Footer f={f} />
        </div>
      </AbsoluteFill>

      <Callout at={40} out={124} x={1000} y={600} text="Transkrip real-time" />
      <Callout at={TICKS[0].t + 8} out={TICKS[0].t + 50} x={1130} y={690} text="Dicentang saat kamu menjelaskan" />
      <Callout at={234} out={264} x={1250} y={214} text="Latensi tampil langsung" />

      {EVENTS.map((e) =>
        e.status === 'mentioned' ? (
          <Sfx key={e.t} at={e.t} name="pop" volume={0.35} />
        ) : (
          <Sequence key={e.t} from={e.t} layout="none">
            <Sfx at={0} name="whoosh" volume={0.25} />
            <Sfx at={DRAW} name="tick" volume={0.9} />
          </Sequence>
        ),
      )}
      {[40, TICKS[0].t + 8, 234].map((t) => (
        <Sfx key={t} at={t} name="blip" volume={0.3} />
      ))}
    </AbsoluteFill>
  )
}

function Transcript({ f }: { f: number }) {
  return (
    <div style={{ marginTop: 24, fontSize: 34, lineHeight: 1.6, color: C.ink, maxWidth: 1000 }}>
      {WORDS.filter((w) => w.t <= f).map((w, i) => {
        const confirmed = f >= w.t + CONFIRM
        const style: CSSProperties = {
          color: confirmed ? C.ink : C.ink3,
          opacity: tween(f, [w.t, w.t + 4], [0, 1]),
          ...(w.term && confirmed ? marker(f, w.t + CONFIRM) : {}),
        }
        return (
          <span key={i}>
            <span style={style}>{w.filler && confirmed ? <Wavy at={w.t + CONFIRM}>{w.w}</Wavy> : w.w}</span>{' '}
          </span>
        )
      })}
    </div>
  )
}

function SpeechBubble({ at, text }: { at: number; text: string }) {
  const f = useCurrentFrame()
  const p = tween(f, [at, at + 8], [0, 1])
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
        opacity: p,
        transform: `translateY(${(1 - p) * 8}px) scale(${0.96 + 0.04 * p})`,
      })}
    >
      {text}
    </div>
  )
}

// Kepulan debu kapur kuning saat centang tergambar.
function Dust({ at }: { at: number }) {
  const f = useCurrentFrame()
  const t = (f - at) / 22
  if (t < 0 || t > 1) return null
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + random(`dust${i}`)
        const d = 30 + random(`d${i}`) * 26
        const e = outExpo(t)
        return (
          <span
            key={i}
            style={abs({
              right: 34,
              top: 30,
              width: 9,
              height: 9,
              borderRadius: 9,
              background: '#FFD34D',
              opacity: 1 - t,
              transform: `translate(${Math.cos(a) * d * e}px, ${Math.sin(a) * d * e}px) scale(${0.5 + e})`,
            })}
          />
        )
      })}
    </>
  )
}

function TopBar({ f, explained }: { f: number; explained: number }) {
  const secs = Math.floor(f / 30) + 3
  const latency = ['0,4', '0,5', '0,4', '0,6', '0,5'][Math.floor(f / 24) % 5]
  return (
    <div style={abs({ left: 32, right: 32, top: 24, height: 68, display: 'flex', alignItems: 'center', gap: 22 })}>
      <div style={{ width: 52, height: 52, borderRadius: 99, border: `1.5px solid ${C.line}`, display: 'grid', placeItems: 'center', fontSize: 26, color: C.ink }}>×</div>
      <div style={{ width: 260 }}>
        <div style={{ fontSize: 25, fontWeight: 600, color: C.ink }}>Backpropagation</div>
        <div style={{ fontSize: 17, color: C.ink3 }}>Sesi latihan</div>
      </div>
      <div>
        <div style={{ display: 'flex', gap: 8 }}>
          {CONCEPTS.map((_, i) => (
            <div key={i} style={{ width: 86, height: 12, borderRadius: 99, background: C.card2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: i < explained ? '100%' : '0%', background: C.go }} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 17, color: C.ink3, marginTop: 8 }}>{explained} dari 5 konsep dijelaskan</div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18, background: C.card, borderRadius: 99, padding: '12px 24px', fontSize: 20, color: C.ink }}>
        <span style={{ width: 12, height: 12, borderRadius: 12, background: C.stop, opacity: 0.55 + 0.45 * Math.cos(f / 6) }} />
        <span style={{ fontWeight: 600 }}>Merekam</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>0:{String(secs).padStart(2, '0')}</span>
        <span style={{ color: C.ink3 }}>Latensi</span>
        <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{latency} dtk</span>
      </div>
    </div>
  )
}

function Footer({ f }: { f: number }) {
  const wpm = Math.round(tween(f, [30, 330], [40, 91], (t) => t))
  const fillers = WORDS.filter((w) => w.filler && w.t + CONFIRM <= f).length
  const chip = (value: string | number, label: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, background: C.card, borderRadius: 99, padding: '12px 24px' }}>
      <span style={{ fontSize: 26, fontWeight: 700, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: 19, color: C.ink3 }}>{label}</span>
    </div>
  )
  return (
    <div style={abs({ left: 32, right: 32, top: 840, height: 72, display: 'flex', alignItems: 'center', gap: 14 })}>
      {chip(f < 30 ? 0 : wpm, 'kata/menit')}
      {chip(fillers, 'filler')}
      {chip(0, 'jeda panjang')}
      <Pill bg={C.stop} edge="#b42318" size={24} style={{ marginLeft: 'auto' }}>
        Berhenti
      </Pill>
    </div>
  )
}

function Callout({ at, out, x, y, text }: { at: number; out: number; x: number; y: number; text: string }) {
  const f = useCurrentFrame()
  const p = pop(f, at)
  const q = tween(f, [out, out + 10], [0, 1])
  if (f < at || q >= 1) return null
  return (
    <div
      style={abs({
        left: x,
        top: y,
        padding: '18px 30px',
        borderRadius: 99,
        background: C.ink,
        color: '#fff',
        fontSize: 34,
        fontWeight: 600,
        boxShadow: '0 24px 40px -20px rgba(0,0,0,0.5)',
        opacity: 1 - q,
        transform: `scale(${(0.7 + 0.3 * p) * (1 - 0.1 * q)}) translateY(${q * -12}px)`,
        transformOrigin: 'left center',
      })}
    >
      {text}
    </div>
  )
}

// 5. Privasi: suara diproses di laptop sendiri.
export function Private() {
  const f = useCurrentFrame()
  const lock = pop(f, 40)
  return (
    <Sheet from="top" color={C.night}>
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 30%, rgba(79,174,138,0.22), transparent 55%)' }} />
      <div style={abs({ left: 960 - 280, top: 150, width: 560, height: 360, opacity: pop(f, 8, false), transform: `translateY(${(1 - pop(f, 8, false)) * 40}px)` })}>
        <div style={{ position: 'absolute', left: 40, top: 0, width: 480, height: 300, borderRadius: 26, background: '#2a2a2e', padding: 16 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 14, background: C.nightCard, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {Array.from({ length: 21 }, (_, i) => {
              const h = 20 + 90 * Math.abs(Math.sin(f / 5 + i * 0.7) * Math.cos(f / 11 + i * 0.35)) * Math.sin((Math.PI * (i + 1)) / 22)
              return <div key={i} style={{ width: 10, height: h, borderRadius: 10, background: '#4fae8a' }} />
            })}
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 300, width: 560, height: 26, borderRadius: '6px 6px 22px 22px', background: '#3a3a40' }} />
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: -26,
            width: 104,
            height: 104,
            borderRadius: 99,
            background: C.go,
            display: 'grid',
            placeItems: 'center',
            boxShadow: `0 0 0 ${10 + 14 * tween(f, [44, 70], [0, 1])}px rgba(79,174,138,${0.35 * (1 - tween(f, [44, 70], [0, 1]))})`,
            transform: `scale(${lock})`,
          }}
        >
          <svg viewBox="0 0 24 24" width="50" height="50">
            <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#fff" />
            <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke="#fff" strokeWidth="2.4" />
          </svg>
        </div>
      </div>
      <div style={abs({ left: 0, right: 0, top: 590, textAlign: 'center' })}>
        <Words text="Suaramu tidak pernah keluar dari laptop." at={16} stagger={2} size={86} color="#fff" />
        <Words text="Transkripsi berjalan lokal dengan Whisper." at={34} stagger={2} size={42} weight={500} color="#a8a8b3" style={{ marginTop: 26 }} />
      </div>
      <Sfx at={0} name="swoosh" volume={0.4} />
      <Sfx at={40} name="lock" volume={0.85} />
    </Sheet>
  )
}

// 6. Feedback: skor, metrik, dan prioritas perbaikan. Diakhiri dengan tombol "Jelaskan ulang".
export const RETRY = { x: 150 + 190, y: 800, at: 160 }

export function Feedback() {
  const f = useCurrentFrame()
  const score = Math.round(tween(f, [28, 52], [0, 4], (t) => t))
  const btn = pop(f, 118)
  const press = tween(f, [RETRY.at - 4, RETRY.at], [0, 1]) - tween(f, [RETRY.at + 4, RETRY.at + 9], [0, 1])
  return (
    <Sheet from="bottom" color={C.bg}>
      <Glow />
      <div style={abs({ left: 150, top: 340, width: 640 })}>
        <Words text="Feedback yang jujur." at={16} size={96} />
        <Words text="Tahu persis konsep mana yang harus diperbaiki." at={30} stagger={2} size={42} weight={500} color={C.ink2} style={{ marginTop: 26, lineHeight: 1.35 }} />
      </div>
      <div style={abs({ left: 150, top: RETRY.y - 50, opacity: btn, transform: `scale(${0.8 + 0.2 * btn})`, transformOrigin: 'left center' })}>
        <Pill size={36} pressed={Math.max(0, press)}>
          Jelaskan ulang
        </Pill>
      </div>

      <div style={abs({ left: 880, top: 200, width: 900 })}>
        <div style={{ display: 'flex', gap: 20 }}>
          <Tile at={18} style={{ width: 440, height: 330, background: '#e8f2ed', padding: 34, position: 'relative' }}>
            <div style={{ fontSize: 120, fontWeight: 700, color: C.ink, lineHeight: 1 }}>
              {score}
              <span style={{ fontSize: 58, color: C.ink3 }}>/5</span>
            </div>
            <div style={{ fontSize: 27, color: C.ink, marginTop: 12 }}>konsep dijelaskan dengan benar</div>
            <div style={{ display: 'flex', gap: 10, position: 'absolute', left: 34, bottom: 34 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ transform: `scale(${pop(f, 30 + i * 5)})` }}>
                  <StatusIcon status={i < 4 ? 'explained' : 'mentioned'} size={40} drawAt={30 + i * 5} />
                </div>
              ))}
            </div>
            <Actor
              at={24}
              width={130}
              cues={[{ at: 0, mood: 'happy' }]}
              style={{ right: 26, top: -86 }}
            />
          </Tile>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1 }}>
            <Stat at={40} value={`1:${String(Math.round(tween(f, [40, 62], [0, 30], (t) => t))).padStart(2, '0')}`} label="durasi" />
            <Stat at={46} value={Math.round(tween(f, [46, 68], [0, 91], (t) => t))} label="kata/menit" />
            <Stat at={52} value={1} label="jeda panjang" />
            <Stat at={58} value={Math.round(tween(f, [58, 76], [0, 10], (t) => t))} label="filler" />
          </div>
        </div>
        <Tile at={82} style={{ marginTop: 22, background: '#fff', boxShadow: '0 40px 80px -40px rgba(22,22,29,0.35), 0 0 0 1.5px #e7e7ec', padding: '34px 38px' }}>
          <div style={{ fontSize: 30, fontWeight: 600, color: C.ink }}>Yang perlu diperbaiki dulu</div>
          {[
            'Jelaskan learning rate: apa yang terjadi kalau langkahnya terlalu besar atau terlalu kecil.',
            'Chain rule baru disebut. Tunjukkan cara error dirambatkan mundur.',
          ].map((t, i) => (
            <div
              key={t}
              style={{
                display: 'flex',
                gap: 18,
                marginTop: 22,
                fontSize: 27,
                lineHeight: 1.45,
                color: C.ink,
                clipPath: `inset(0 ${tween(f, [94 + i * 12, 114 + i * 12], [100, 0])}% 0 0)`,
              }}
            >
              <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 40, background: '#FFE27A', display: 'grid', placeItems: 'center', fontSize: 21, fontWeight: 700 }}>{i + 1}</span>
              {t}
            </div>
          ))}
        </Tile>
      </div>

      <Cursor from={[1500, 1150]} to={[RETRY.x + 40, RETRY.y + 10]} at={126} press={RETRY.at} />

      <Sfx at={0} name="swoosh" volume={0.4} />
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} at={30 + i * 5 + 2} name={`note${i + 1}`} volume={0.35} />
      ))}
      <Sfx at={50} name="tick" volume={0.45} />
      {[40, 46, 52, 58].map((t) => (
        <Sfx key={t} at={t} name="pop" volume={0.3} />
      ))}
      <Sfx at={82} name="whoosh" volume={0.25} />
      <Sfx at={118} name="pop" volume={0.45} />
      <Sfx at={RETRY.at} name="click" volume={0.9} />
    </Sheet>
  )
}

function Tile({ at, style, children }: { at: number; style?: CSSProperties; children: ReactNode }) {
  const f = useCurrentFrame()
  const p = pop(f, at)
  return <div style={{ borderRadius: 30, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 60}px) scale(${0.94 + 0.06 * p})`, ...style }}>{children}</div>
}

const Stat = ({ at, value, label }: { at: number; value: string | number; label: string }) => (
  <Tile at={at} style={{ background: C.card, padding: '26px 28px' }}>
    <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    <div style={{ fontSize: 23, color: C.ink3, marginTop: 6 }}>{label}</div>
  </Tile>
)

function Cursor({ from, to, at, press }: { from: [number, number]; to: [number, number]; at: number; press: number }) {
  const f = useCurrentFrame()
  const p = tween(f, [at, press - 6], [0, 1], inOut)
  const down = tween(f, [press - 4, press], [0, 1]) - tween(f, [press + 4, press + 9], [0, 1])
  if (f < at) return null
  return (
    <svg
      viewBox="0 0 24 24"
      width="64"
      height="64"
      style={abs({
        left: from[0] + (to[0] - from[0]) * p,
        top: from[1] + (to[1] - from[1]) * p,
        transform: `scale(${1 - 0.15 * Math.max(0, down)})`,
        transformOrigin: '4px 3px',
        filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.3))',
      })}
    >
      <path d="M4 3l14.5 8.2-6.4 1.6 3.6 6.6-2.6 1.4-3.6-6.6L4.8 18.6Z" fill="#fff" stroke={C.ink} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

// 7. Penutup: prinsip Feynman, logo, dan ajakan mencoba.
export function Outro() {
  const f = useCurrentFrame()
  const rise = pop(f, 4)
  const lock = pop(f, 62, false)
  const btn = pop(f, 74)
  const click = 112
  const press = tween(f, [click - 4, click], [0, 1]) - tween(f, [click + 4, click + 9], [0, 1])
  return (
    <Iris x={RETRY.x} y={RETRY.y} style={{ background: GREEN_BG }}>
      <Confetti />
      <div style={leave(f, 54, 12)}>
        <div style={abs({ left: 0, right: 0, top: 200, textAlign: 'center' })}>
          <Words text="Kalau bisa menjelaskan," at={10} size={112} color="#fff" />
          <Words text="berarti kamu paham." at={22} size={112} color="#FFD84D" />
        </div>
      </div>
      <div style={abs({ left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: lock, transform: `translateY(${(1 - lock) * 40}px) scale(${0.92 + 0.08 * lock})` })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Img src={logo} style={{ width: 176, height: 176, borderRadius: 44, boxShadow: '0 0 0 5px rgba(255,255,255,0.22), 0 30px 60px -30px rgba(0,0,0,0.5)' }} />
          <span style={{ fontSize: 168, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>Empur</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 46, fontWeight: 500, color: 'rgba(255,255,255,0.82)' }}>Latih pemahaman dengan menjelaskan.</div>
        <div style={{ marginTop: 40, opacity: btn, transform: `scale(${0.8 + 0.2 * btn})` }}>
          <Pill bg="#fff" edge="#cfe3da" color={C.go} size={40} pressed={Math.max(0, press)}>
            Mulai sesi
          </Pill>
        </div>
      </div>
      <Actor
        at={4}
        width={380}
        cues={[
          { at: 0, mood: 'cheer' },
          { at: click + 6, mood: 'wave' },
        ]}
        style={{ left: 960 - 190, top: 640, transform: `translateY(${(1 - rise) * 400}px)` }}
      />
      <Cursor from={[1460, 1140]} to={[975, 518]} at={84} press={click} />

      <Sfx at={4} name="pop" volume={0.5} />
      <Sfx at={62} name="sparkle" volume={0.5} />
      <Sfx at={74} name="pop" volume={0.45} />
      <Sfx at={click} name="click" volume={0.9} />
    </Iris>
  )
}

// Konfeti warna-warni Empur yang jatuh sambil berputar.
function Confetti() {
  const f = useCurrentFrame()
  const colors = ['#FFD84D', '#93D5FF', '#DCC2FF', '#FF93AE', '#A7F3D0', '#FF7F3F']
  return (
    <>
      {Array.from({ length: 46 }, (_, i) => {
        const t = f - 4 - random(`c${i}`) * 30
        if (t < 0) return null
        const x = random(`x${i}`) * 1920
        const vx = (random(`vx${i}`) - 0.5) * 6
        const y = -40 - random(`y${i}`) * 300 + t * (7 + random(`vy${i}`) * 5)
        return (
          <div
            key={i}
            style={abs({
              left: x + vx * t + Math.sin(t / 8 + i) * 20,
              top: y,
              width: 18,
              height: 9,
              borderRadius: 4,
              background: colors[i % colors.length],
              transform: `rotate(${t * (4 + (i % 5)) + i * 40}deg)`,
            })}
          />
        )
      })}
    </>
  )
}
