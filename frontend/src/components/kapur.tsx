import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { MOOD_LABEL, TONES, useKapurPrefs, type KapurMood, type KapurTone, type Tone } from '../lib/kapur'
import { reducedMotion, useSpring } from '../lib/spring'

// Empur: sebatang kapur dalam gaya datar (B2 di eksplorasi maskot): gradasi diagonal, tutup elips
// dua warna, tanpa garis luar dan tanpa kilau di sisi badan. Tangan samping digambar di belakang
// badan dengan gradasi yang sama, jadi badan dan tangan terlihat satu bentuk. Bagian tangan di depan
// badan diberi bayangan datar dan makin terang ke arah tangan, supaya terbaca di atas badan.
// Tangan `hold` keluar dari samping badan, lalu lengan bawahnya (mulai dari siku) digambar lagi di depan.

const SPARK = '#FFD34D'
const SPARK_HI = '#FFF3B0'

// Badan dalam viewBox 120 x 150: sisi x 33..87, tutup elips di y 34, dasar membulat di y 132.
const CX = 60
const W = 27
const TOP = 34
const RY = W * 0.36
const BOT = 132
const BODY = `M${CX - W} ${TOP}V${BOT - 14.7}C${CX - W} ${BOT - 5.3} ${CX - W * 0.7} ${BOT} ${CX} ${BOT}C${CX + W * 0.7} ${BOT} ${CX + W} ${BOT - 5.3} ${CX + W} ${BOT - 14.7}V${TOP}A${W} ${RY} 0 0 0 ${CX - W} ${TOP}Z`

// Tangan kanan: bahu (x, y) di dalam badan, sudut a dari arah bawah (positif ke luar badan,
// negatif ke depan badan), panjang len. bend melengkungkan lengan dan curl membelokkan ujungnya
// (pecahan dari len; positif ke arah jarum jam dilihat dari bahu). Tangan kiri dicerminkan terhadap x = 60.
// thumb: besar tonjolan jempol (0..1) di sisi datar kepalan yang menghadap ke atas.
type ArmPose = {
  x: number
  y: number
  a: number
  len: number
  bend: number
  curl: number
  front?: boolean
  hold?: boolean
  thumb?: number
}
const ARM = {
  down: { x: 80, y: 72, a: 20, len: 23, bend: 0.2, curl: -0.08 },
  up: { x: 80, y: 70, a: 128, len: 27, bend: -0.25, curl: 0.25 },
  cheer: { x: 80, y: 68, a: 130, len: 27, bend: -0.18, curl: 0.22 },
  // Tangan memegang sisi atas kepala, siku keluar: pusing.
  head: { x: 82, y: 66, a: 160, len: 30, bend: -0.75, curl: 0.45, hold: true },
  ear: { x: 82, y: 70, a: 150, len: 23, bend: -0.8, curl: 0.35 },
  chin: { x: 82, y: 86, a: -104, len: 23, bend: 0.25, curl: -0.1, front: true },
  clasp: { x: 84, y: 92, a: -133, len: 21.5, bend: 0.35, curl: 0, front: true },
  tick: { x: 80, y: 78, a: 90, len: 27, bend: -0.12, curl: 0.04 },
  thumb: { x: 80, y: 76, a: 100, len: 21, bend: -0.2, curl: 0.35, thumb: 1 },
} satisfies Record<string, ArmPose>
type Pose = keyof typeof ARM
const RIGHT: Record<KapurMood, Pose> = {
  wave: 'up',
  listen: 'ear',
  happy: 'clasp',
  curious: 'chin',
  confused: 'head',
  think: 'chin',
  cheer: 'cheer',
}
// Mood yang tidak tercantum: tangan kiri turun.
const LEFT: Partial<Record<KapurMood, Pose>> = { happy: 'clasp', cheer: 'cheer' }

// Gerak tangan saat diam, berputar di bahu (kelas kapur-arm-* di index.css).
type Motion = 'wave' | 'sway' | 'cup' | 'tap' | 'rub' | 'pump' | 'clap' | 'thumb'
const MOTION: Record<KapurMood, [right: Motion, left: Motion]> = {
  wave: ['wave', 'sway'],
  listen: ['cup', 'sway'],
  happy: ['clap', 'clap'],
  curious: ['tap', 'sway'],
  confused: ['rub', 'sway'],
  think: ['rub', 'sway'],
  cheer: ['pump', 'pump'],
}

type Pt = [number, number]
// Sirip melengkung: garis tengah kurva kuadrat dari bahu ke tangan, lebar menyempit ke ujung
// dengan sedikit pinggang, pangkal dan ujung setengah lingkaran. Hasilnya poligon rapat.
function arm(p: ArmPose, side: 1 | -1) {
  const L = p.len
  const b = 9
  const r = 7
  const C: Pt = [p.bend * L, L * 0.5]
  const E: Pt = [p.curl * L, L]
  const at = (t: number): Pt => [2 * (1 - t) * t * C[0] + t * t * E[0], 2 * (1 - t) * t * C[1] + t * t * E[1]]
  const tan = (t: number): Pt => {
    const x = 2 * (1 - t) * C[0] + 2 * t * (E[0] - C[0])
    const y = 2 * (1 - t) * C[1] + 2 * t * (E[1] - C[1])
    const m = Math.hypot(x, y)
    return [x / m, y / m]
  }
  const base = (t: number) => b + (r - b) * t - 1.2 * Math.sin(Math.PI * t)
  const f = (-p.a * Math.PI) / 180
  const c = Math.cos(f)
  const s = Math.sin(f)
  const world = ([x, y]: Pt): Pt => {
    const X = p.x + x * c - y * s
    return [side === 1 ? X : 2 * CX - X, p.y + x * s + y * c]
  }
  const rim = (t: number, dir: 1 | -1, w: number): Pt => {
    const [qx, qy] = at(t)
    const [tx, ty] = tan(t)
    return [qx - ty * w * dir, qy + tx * w * dir]
  }
  // Jempol menempel di sisi datar kepalan yang lebih tinggi di layar, tepat sebelum ujung yang bulat.
  // Posisinya diukur dari ujung dalam satuan panjang, karena kecepatan kurva berbeda per pose.
  const speed = 2 * Math.hypot(E[0] - C[0], E[1] - C[1])
  const tThumb = 1 - (0.9 * r) / speed
  const spread = (0.75 * r) / speed
  const up: 1 | -1 = world(rim(tThumb, 1, r))[1] < world(rim(tThumb, -1, r))[1] ? 1 : -1
  const width = (t: number, dir: 1 | -1) =>
    base(t) + (dir === up ? 3.8 * (p.thumb ?? 0) * Math.exp(-(((t - tThumb) / spread) ** 2)) : 0)
  const edge = (t: number, dir: 1 | -1) => rim(t, dir, width(t, dir))

  const K = 24
  // Setengah lingkaran dari arah `from`, berputar 180 derajat.
  const cap = (o: Pt, from: Pt, rad: number): Pt[] => {
    const a0 = Math.atan2(from[1], from[0])
    return Array.from({ length: 9 }, (_, i) => [o[0] + rad * Math.cos(a0 + (Math.PI * i) / 8), o[1] + rad * Math.sin(a0 + (Math.PI * i) / 8)])
  }
  const [t1x, t1y] = tan(1)
  const outline = (from: number) => {
    const [t0x, t0y] = tan(0)
    const steps = (a: number, dir: 1 | -1) => Array.from({ length: K - a }, (_, i) => edge((dir === -1 ? a + i : K - 1 - i) / K, dir))
    const start = from === 0 ? cap([0, 0], [-t0y, t0x], b) : []
    const first = from === 0 ? 1 : from
    return [...start, ...steps(first, -1), ...cap(E, [t1y, -t1x], r), ...steps(first, 1)]
  }
  const path = (pts: Pt[]) => `M${pts.map((q) => world(q).map((v) => v.toFixed(1)).join(' ')).join('L')}Z`
  const d = path(outline(0))
  // Siku: titik garis tengah yang paling jauh dari badan. Bagian depan tangan `hold` dimulai dari
  // sana, di luar badan, jadi potongannya tertutup lengan yang sama di belakang.
  let elbow = 0
  for (let i = 1; i < K; i++) if (Math.abs(world(at(i / K))[0] - CX) > Math.abs(world(at(elbow / K))[0] - CX)) elbow = i
  const front = p.hold
    ? { d: path(outline(elbow)), from: world(at(elbow / K)), to: world(E) }
    : p.front
      ? { d, from: world([0, 0]), to: world(E) }
      : undefined
  return { d, front, behind: !p.front }
}

// Pose sebagai deret angka untuk pegas. front dan hold ikut dipadukan dan berganti di tengah jalan,
// jadi urutan gambar (di belakang atau di depan badan) berpindah saat tangan sudah setengah jalan.
const ARM_LEN = 9
const armVec = (p: ArmPose) => [p.x, p.y, p.a, p.len, p.bend, p.curl, p.front ? 1 : 0, p.hold ? 1 : 0, p.thumb ?? 0]
const armOf = ([x, y, a, len, bend, curl, front, hold, thumb]: number[]): ArmPose => ({
  x,
  y,
  a,
  len,
  bend,
  curl,
  front: front > 0.5,
  hold: hold > 0.5,
  thumb,
})

const SPARKLE = 'M0-14C2-4 4-2 14 0C4 2 2 4 0 14C-2 4-4 2-14 0C-4-2-2-4 0-14Z'

// Tanpa mulut dan tanpa alis, jadi mata membawa seluruh ekspresi. Semua mata satu keluarga: pil
// tinta yang kelopak atasnya bisa turun dan miring (lid, tilt), sisi bawahnya bisa terangkat seperti
// pipi tersenyum (smile), dan bisa diputar (rot). Setiap mata mendapat titik cahaya.
type Eye = { w?: number; h?: number; dx?: number; dy?: number; lid?: number; tilt?: number; smile?: number; rot?: number }
const [EL, ER] = [CX - W * 0.35, CX + W * 0.35]
const EYE_Y = 61

// Mata sebagai deret angka untuk pegas. lidK dan smileK (0..1) memadukan lengkung bulat dengan kelopak
// datar di atas dan dengan lengkung pipi di bawah, jadi setiap mata bisa berubah mulus ke mata lain.
const EYE_LEN = 10
const eyeVec = (e: Eye) => [
  e.w ?? 6.6,
  e.h ?? 13,
  e.dx ?? 0,
  e.dy ?? 0,
  e.lid ?? 0,
  e.lid === undefined ? 0 : 1,
  e.tilt ?? 0,
  e.smile ?? 0,
  e.smile === undefined ? 0 : 1,
  e.rot ?? 0,
]
const mix = (a: number, b: number, t: number) => a + (b - a) * t

function pill(x: number, [w, h, dx, dy, lid, lidK, tilt, smile, smileK]: number[]) {
  const cx = x + dx
  const r = w / 2
  const top = EYE_Y + dy - h / 2
  const bot = EYE_Y + dy + h / 2
  const N = 12
  const pts: Pt[] = []
  // Atas, kiri ke kanan: setengah lingkaran atau garis kelopak (miring sebesar tilt).
  for (let i = 0; i <= N; i++) {
    const q = Math.PI * (1 - i / N)
    const u = Math.cos(q)
    pts.push([cx + r * u, mix(top + r - r * Math.sin(q), top + lid + (tilt * u) / 2, lidK)])
  }
  // Bawah, kanan ke kiri: setengah lingkaran atau lengkung pipi yang terangkat sebesar smile.
  for (let i = 0; i <= N; i++) {
    const q = (Math.PI * i) / N
    const u = Math.cos(q)
    pts.push([cx + r * u, mix(bot - r + r * Math.sin(q), bot - smile * (1 - u * u), smileK)])
  }
  const d = `M${pts.map((p) => p.map((v) => v.toFixed(2)).join(' ')).join('L')}Z`
  // Titik cahaya di kiri atas bagian yang terlihat: di bawah kelopak jika ada, di lengkung atas jika
  // tidak. Mata yang sempit (menyipit atau lengkung senang) mendapat titik yang lebih kecil.
  const k = 0.7 + 0.3 * Math.min(1, Math.max(0, h - lid * lidK - 2 * smile * smileK - 6))
  const glint = {
    cx: cx - r * mix(0.3, 0.4, lidK),
    cy: mix(top + r * 0.85, top + lid - 0.15 * tilt + 1.2 + 1.1 * k, lidK),
    rx: w * 0.15 * k,
    ry: w * 0.24 * k,
  }
  return { d, glint }
}

const EYES: Record<KapurMood, [left: Eye, right: Eye]> = {
  // Pipi terangkat: tersenyum lewat mata.
  wave: [{ w: 7, h: 12, dy: -0.5, smile: 1.1 }, { w: 7, h: 12, dy: -0.5, smile: 1.1 }],
  // Kelopak turun, melirik ke tangan di telinga: menyimak.
  listen: [{ dx: 1.8, lid: 2.5, tilt: -1 }, { dx: 1.8, lid: 2.5, tilt: -1 }],
  // Pil pendek dengan pipi terangkat tinggi: lengkung ∩ yang tebal.
  happy: [{ w: 8, h: 9, dy: -1, smile: 1.9 }, { w: 8, h: 9, dy: -1, smile: 1.9 }],
  // Seperti senang, lebih besar dan miring ke luar.
  cheer: [{ w: 8.5, h: 10, dy: -1, smile: 2.1, rot: -14 }, { w: 8.5, h: 10, dy: -1, smile: 2.1, rot: 14 }],
  // Ukuran sama: satu terbuka lebar, satu terpotong kelopak.
  curious: [{ w: 6.8, h: 14, dy: -0.5 }, { w: 6.8, h: 14, dy: -0.5, lid: 5 }],
  // Kelopak miring dari tengah ke samping, / \: bingung dan pusing.
  confused: [{ lid: 4, tilt: -3 }, { lid: 4, tilt: 3 }],
  // Satu mata melirik ke atas, satu menyipit: "hmm".
  think: [{ dx: -1.5, dy: -2, h: 11 }, { w: 7.5, h: 8, dy: 1, lid: 3, smile: 1 }],
}

// gaze: lirikan kedua mata (dx, dy). blink hanya untuk mata terbuka; mata senang sudah berupa lengkung.
function Eyes({ eyes, gaze, blink, ink }: { eyes: number[][]; gaze: number[]; blink?: boolean; ink: string }) {
  return (
    <g transform={`translate(${gaze[0].toFixed(2)} ${gaze[1].toFixed(2)})`}>
      <g className={blink === undefined ? undefined : `kapur-eyes ${blink ? 'kapur-blink' : ''}`}>
        {[EL, ER].map((x, i) => {
          const { d, glint } = pill(x, eyes[i])
          const rot = eyes[i][9]
          return (
            <g key={x} transform={Math.abs(rot) > 0.01 ? `rotate(${rot.toFixed(2)} ${x} ${EYE_Y})` : undefined}>
              <path d={d} fill={ink} />
              <ellipse {...glint} fill="#fff" opacity="0.9" />
            </g>
          )
        })}
      </g>
    </g>
  )
}

// Hidup saat diam, seperti idle panjang Koji: kedip dengan jeda acak (kadang dua kali) dan sesekali
// melirik, lalu kembali ke depan. Setiap Empur punya jadwal acak sendiri, jadi tidak ada yang serempak.
function useIdle() {
  const [blink, setBlink] = useState(false)
  const [gaze, setGaze] = useState([0, 0])
  useEffect(() => {
    if (reducedMotion()) return
    let timer = 0
    const after = (ms: number, fn: () => void) => {
      timer = window.setTimeout(fn, ms)
    }
    const spread = (n: number) => (Math.random() * 2 - 1) * n
    const shut = (times: number) => {
      setBlink(true)
      after(110, () => {
        setBlink(false)
        if (times > 1) after(150, () => shut(times - 1))
        else rest()
      })
    }
    const look = () => {
      setGaze([spread(1.8), spread(1.2)])
      after(800 + Math.random() * 1400, () => {
        setGaze([0, 0])
        rest()
      })
    }
    const rest = () =>
      after(1400 + Math.random() * 3200, () => (Math.random() < 0.4 ? look() : shut(Math.random() < 0.25 ? 2 : 1)))
    rest()
    return () => clearTimeout(timer)
  }, [])
  return { blink, gaze }
}

// Condong badan per mood (derajat, berputar di ujung bawah badan). Badan juga ikut condong sedikit ke
// arah lirikan, tapi lewat pegas yang lebih lambat: mata bergerak dulu, badan menyusul.
const LEAN: Partial<Record<KapurMood, number>> = { wave: -6, listen: 3, curious: -6, confused: 7 }

// Reaksi sekali jalan saat mood berganti: antisipasi, lalu lewat sedikit dan mengendap (squash dan
// stretch). Setiap reaksi terdiri dari beberapa animasi Web Animations yang berjalan bersamaan, satu per
// properti, supaya tiap properti punya kurvanya sendiri. Semua berpusat di ujung bawah badan (.kapur-react).
type Anim = [frames: Keyframe[], ms: number, times?: number]
const inOut = 'cubic-bezier(0.37, 0, 0.63, 1)'
const eased = (...frames: Keyframe[]) => frames.map((f) => ({ easing: inOut, ...f }))
const SETTLE: Anim[] = [[eased({ scale: '1 1' }, { scale: '1.05 0.94', offset: 0.25 }, { scale: '0.98 1.03', offset: 0.6 }, { scale: '1 1' }), 480]]
// Lompat: naik melambat, turun makin cepat; badan memampat sebelum lepas landas dan saat mendarat.
const hop = (times = 1): Anim[] => [
  [
    [
      { translate: '0 0' },
      { translate: '0 0', offset: 0.2, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' },
      { translate: '0 -16px', offset: 0.55, easing: 'cubic-bezier(0.32, 0, 0.67, 0)' },
      { translate: '0 0', offset: 0.84 },
      { translate: '0 0' },
    ],
    720,
    times,
  ],
  [
    eased(
      { scale: '1 1' },
      { scale: '1.1 0.88', offset: 0.2 },
      { scale: '0.94 1.08', offset: 0.32 },
      { scale: '1 1', offset: 0.55 },
      { scale: '0.96 1.05', offset: 0.76 },
      { scale: '1.1 0.9', offset: 0.86 },
      { scale: '0.98 1.02', offset: 0.94 },
      { scale: '1 1' },
    ),
    720,
    times,
  ],
]
const REACTION: Record<KapurMood | 'tick' | 'enter', Anim[]> = {
  enter: [
    [[{ translate: '0 8px', opacity: 0 }, { translate: '0 0', opacity: 1, offset: 0.5, easing: inOut }, { translate: '0 0', opacity: 1 }], 560],
    [eased({ scale: '0.6 0.6' }, { scale: '1.06 0.95', offset: 0.55 }, { scale: '0.98 1.03', offset: 0.78 }, { scale: '1 1' }), 560],
  ],
  wave: SETTLE,
  tick: SETTLE,
  happy: hop(),
  cheer: hop(2),
  // Tegak dan sedikit melonjak: "hm?".
  curious: [
    [eased({ scale: '1 1' }, { scale: '1.05 0.93', offset: 0.2 }, { scale: '0.95 1.08', offset: 0.45 }, { scale: '1.01 0.99', offset: 0.75 }, { scale: '1 1' }), 560],
    [eased({ translate: '0 0' }, { translate: '0 0', offset: 0.2 }, { translate: '0 -4px', offset: 0.45 }, { translate: '0 0' }), 560],
  ],
  // Goyang yang makin kecil.
  confused: [
    [eased({ rotate: '0deg' }, { rotate: '-6deg', offset: 0.18 }, { rotate: '5deg', offset: 0.42 }, { rotate: '-3deg', offset: 0.64 }, { rotate: '1deg', offset: 0.82 }, { rotate: '0deg' }), 800],
  ],
  // Mengangguk kecil.
  listen: [
    [eased({ scale: '1 1' }, { scale: '1.03 0.97', offset: 0.3 }, { scale: '1 1' }), 420],
    [eased({ translate: '0 0' }, { translate: '0 2px', offset: 0.3 }, { translate: '0 0' }), 420],
  ],
  // Merendah pelan: "hmm".
  think: [[eased({ scale: '1 1' }, { scale: '1.04 0.95', offset: 0.45 }, { scale: '1 1' }), 700]],
}

// Properti per mood, dalam gaya datar yang sama. Kelas kapur-pulse, -twinkle, -drift, dan -confetti
// menghidupkannya (index.css); jeda yang berbeda membuat gerakannya tidak serempak.
const delay = (s: number) => ({ animationDelay: `${s}s` })

function Props({ mood, t, id }: { mood: KapurMood; t: Tone; id: string }): ReactNode {
  const line = { fill: 'none', stroke: t.dark, strokeOpacity: 0.5, strokeLinecap: 'round' as const }
  const sparkle = (x: number, y: number, r: number, wait = 0) => (
    <g key={`${x}-${y}`} className="kapur-twinkle" style={delay(wait)}>
      <path d={SPARKLE} transform={`translate(${x} ${y}) scale(${r / 14})`} fill={`url(#${id}spark)`} />
    </g>
  )
  const arcs = (d: string[], width: number) =>
    d.map((a, i) => <path key={a} d={a} {...line} strokeWidth={width} className="kapur-pulse" style={delay(i * 0.3)} />)
  switch (mood) {
    case 'wave':
      return arcs(['M98 36q5 4 5 10', 'M102 30q7 6 7 14'], 2.2)
    case 'listen':
      return arcs(['M98 40q4 6.5 0 13', 'M103 35q8 11.5 0 23'], 2.4)
    case 'happy':
      return [sparkle(16, 42, 6), sparkle(104, 38, 4.5, 0.8)]
    case 'curious':
      return (
        <g>
          <circle cx="98" cy="24" r="10.5" fill={SPARK} opacity="0.3" className="kapur-pulse" />
          <rect x="95" y="29" width="6" height="6" rx="1.8" fill="#CDD2DE" />
          <circle cx="98" cy="24" r="7" fill={`url(#${id}spark)`} />
        </g>
      )
    case 'confused':
      return [
        [102, 30, 1],
        [18, 38, 0.75],
      ].map(([x, y, k], i) => (
        <g key={x} className="kapur-drift" style={delay(i * 0.7)}>
          <g transform={`translate(${x} ${y}) scale(${k})`}>
            <path d="M-5-4q0-7 6-7t6 6c0 4-6 5-6 10" fill="none" stroke={t.dark} strokeWidth="3.4" strokeLinecap="round" />
            <circle cx="1" cy="10" r="2.1" fill={t.dark} />
          </g>
        </g>
      ))
    case 'think':
      return [
        [85, 30, 2.4],
        [92, 22, 3.4],
        [102, 12, 5],
      ].map(([x, y, r], i) => (
        <circle key={x} cx={x} cy={y} r={r} fill={`url(#${id}cloud)`} className="kapur-drift" style={delay(i * 0.35)} />
      ))
    case 'cheer':
      return (
        <g>
          {(
            [
              [12, 24, -25, '#FFD84D'],
              [106, 20, 30, '#93D5FF'],
              [24, 10, 15, '#DCC2FF'],
              [96, 8, -20, '#FF93AE'],
              [112, 44, 40, '#A7F3D0'],
              [6, 50, -35, '#FF7F3F'],
            ] as const
          ).map(([x, y, r, c], i) => (
            <g key={x} className="kapur-confetti" style={delay(i * 0.2)}>
              <rect x={x - 3.5} y={y - 1.75} width="7" height="3.5" rx="1.5" fill={c} transform={`rotate(${r} ${x} ${y})`} />
            </g>
          ))}
        </g>
      )
  }
}

// `tick`: pose mencentang, tangan kanan terulur ke kanan (ujungnya di KAPUR_HAND, lib/kapur.ts).
// `quiet`: tanpa properti, supaya kotak agenda lain tetap bersih saat mencentang.
// `tone` dan `arms` bawaannya mengikuti pilihan user di menu Empur (useKapurPrefs). Tanpa tangan,
// pose mencentang hanya membuat properti diam; gerak menulisnya ada di LiveScreen.
export function Kapur({
  mood,
  tick = false,
  quiet = false,
  arms: armsOption,
  tone,
  className = '',
}: {
  mood: KapurMood
  tick?: boolean
  quiet?: boolean
  arms?: boolean
  tone?: KapurTone
  className?: string
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const prefs = useKapurPrefs()
  const t = TONES[tone ?? prefs.tone]
  const withArms = armsOption ?? prefs.arms

  const right: Pose = tick ? 'tick' : RIGHT[mood]
  // Mencentang: tangan kanan menunjuk kotak, tangan kiri mengacungkan jempol.
  const left: Pose = tick ? 'thumb' : (LEFT[mood] ?? 'down')
  // Saat mencentang tangan penunjuk diam supaya tepat di kotak; jempol yang bergerak.
  const [mRight, mLeft] = tick ? [undefined, 'thumb' as const] : MOTION[mood]

  // Rig: mata dan tangan mengejar pose mood lewat pegas yang sedikit lewat lalu mengendap. Lirikan memakai
  // pegas cepat, condong badan memakai pegas lambat, jadi mata memimpin dan badan menyusul.
  const idle = useIdle()
  // Saat mencentang, mata melirik ke tangan penunjuk.
  const look = tick ? [2, 1] : idle.gaze
  const rig = useSpring([...EYES[mood].flatMap(eyeVec), ...armVec(ARM[right]), ...armVec(ARM[left])], 140, 15)
  const gaze = useSpring(look, 500, 40)
  // Saat mencentang badan tegak, supaya ujung tangan tepat di KAPUR_HAND.
  const [lean] = useSpring([tick ? 0 : (LEAN[mood] ?? 0) + look[0] * 1.5], 120, 14)
  const eyes = [rig.slice(0, EYE_LEN), rig.slice(EYE_LEN, 2 * EYE_LEN)]
  const open = mood !== 'happy' && mood !== 'cheer'

  const react = useRef<SVGGElement>(null)
  const shown = useRef<string>(null)
  useEffect(() => {
    const now = tick ? 'tick' : mood
    const name = shown.current === null ? 'enter' : shown.current === now ? null : now
    shown.current = now
    if (!name || reducedMotion()) return
    for (const [frames, duration, iterations = 1] of REACTION[name]) react.current?.animate?.(frames, { duration, iterations })
  }, [mood, tick])

  const arms = [
    { v: rig.slice(2 * EYE_LEN, 2 * EYE_LEN + ARM_LEN), side: 1 as const, motion: mRight },
    { v: rig.slice(2 * EYE_LEN + ARM_LEN), side: -1 as const, motion: mLeft },
  ].map((a) => {
    const p = armOf(a.v)
    const style = { '--dir': a.side, transformOrigin: `${a.side === 1 ? p.x : 2 * CX - p.x}px ${p.y}px` } as CSSProperties
    return { ...a, ...arm(p, a.side), style }
  })

  // Pembungkus yang menggerakkan satu bagian tangan dari bahu. Bagian belakang dan depan tangan
  // `hold` memakai kelas yang sama, jadi keduanya bergerak bersama.
  const moving = (a: (typeof arms)[number], children: ReactNode) => (
    <g
      key={a.side}
      className={a.motion && `kapur-arm kapur-arm-${a.motion}`}
      style={{ ...a.style, animationDelay: a.motion === 'pump' && a.side === -1 ? '-0.45s' : undefined }}
    >
      {children}
    </g>
  )
  const back = arms.filter((a) => a.behind).map((a) => moving(a, <path d={a.d} fill={`url(#${id}base)`} />))
  const front = arms.map((a) => {
    if (!a.front) return null
    const { d, from, to } = a.front
    const fade = `${id}fade${a.side}`
    return moving(
      a,
      <>
        <linearGradient id={fade} gradientUnits="userSpaceOnUse" x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}>
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.22" />
        </linearGradient>
        <path d={d} fill={t.dark} opacity="0.22" transform="translate(1.3 2.4)" clipPath={`url(#${id}body)`} />
        <path d={d} fill={`url(#${id}base)`} />
        <path d={d} fill={`url(#${fade})`} />
      </>,
    )
  })

  return (
    <svg viewBox="0 0 120 150" className={`overflow-visible ${className}`} role="img" aria-label={`Empur ${MOOD_LABEL[mood]}`}>
      <defs>
        <linearGradient id={`${id}base`} gradientUnits="userSpaceOnUse" x1={CX - W} y1={TOP - RY} x2={CX - W + 0.8 * W} y2={BOT}>
          <stop offset="0" stopColor={t.top} />
          <stop offset="1" stopColor={t.bot} />
        </linearGradient>
        <radialGradient id={`${id}spark`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor={SPARK_HI} />
          <stop offset="1" stopColor={SPARK} />
        </radialGradient>
        <radialGradient id={`${id}cloud`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#E3E6EF" />
        </radialGradient>
        <clipPath id={`${id}body`}>
          <path d={BODY} />
        </clipPath>
      </defs>

      <g className="kapur">
        <g ref={react} className="kapur-react">
          <g transform={`rotate(${lean.toFixed(2)} ${CX} ${BOT})`}>
            {withArms && back}
            <path d={BODY} fill={`url(#${id}base)`} />
            <ellipse cx={CX} cy={TOP} rx={W} ry={RY} fill={t.cap} />
            <ellipse cx={CX - 2.7} cy={TOP - 1.3} rx={W * 0.75} ry={RY * 0.65} fill={t.capHi} />
            <Eyes eyes={eyes} gaze={gaze} blink={open ? idle.blink : undefined} ink={t.ink} />
            {withArms && front}
            {!quiet && (
              <g key={mood} className="kapur-prop-in">
                <Props mood={mood} t={t} id={id} />
              </g>
            )}
          </g>
        </g>
      </g>
    </svg>
  )
}
