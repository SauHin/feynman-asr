import type { ReactNode } from 'react'
import type { KapurMood } from '../lib/kapur'

// Si Kapur mengikuti referensi user (docs/design/referensi-si-kapur.jpg): batang kapur putih
// berbentuk silinder dengan tutup elips, lengan sirip, kaki bulat, dan pipi merah muda.
// Garis luar memakai currentColor, jadi warnanya sama dengan semua ilustrasi kelas (text-outline).

const BODY = '#FBFBF8'
const SHADE = '#E3E7E1'
const TOP = '#F1F3EE'
const EYE = '#2A2A33'
const CHEEK = '#FFB3C4'
const MOUTH = '#D9485F'
const TONGUE = '#FF9AAD'
const YELLOW = '#FFE27A'
const BLUE = '#9BD8FF'
const PINK = '#FFB3D1'
const MINT = '#9EE8C0'

const MOOD_LABEL: Record<KapurMood, string> = {
  wave: 'melambai',
  listen: 'mendengarkan',
  happy: 'senang',
  curious: 'penasaran',
  confused: 'bingung',
  think: 'berpikir',
  cheer: 'bersorak',
  proud: 'bangga',
}

const line = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const inked = { stroke: 'currentColor', strokeWidth: 2.6, strokeLinejoin: 'round' as const }

// Lengan sirip untuk sisi kanan. Sisi kiri dicerminkan terhadap x = 60.
const ARMS = {
  down: 'M89 66C100 72 106 88 104 101C103 106 97 104 94 98C91 91 89 82 89 76Z',
  up: 'M88 64C96 56 104 44 110 33C114 27 121 31 118 39C113 55 103 73 90 84Z',
  ear: 'M89 70C98 72 105 64 103 52C102 45 95 43 93 50C92 56 92 61 89 63Z',
  chin: 'M89 72C85 87 73 94 62 92C56 91 56 85 62 84C71 83 80 78 86 68Z',
  tick: 'M89 67C100 64 111 68 117 73C121 76 120 82 116 82C106 81 97 86 89 85Z',
  hip: 'M89 72C100 74 105 86 99 95C96 99 90 97 91 92C93 86 94 81 89 81Z',
  chest: 'M31 72C36 90 50 100 66 100C72 100 73 94 67 93C54 92 42 86 36 70Z',
}
type Pose = keyof typeof ARMS
const mirror = (d: string) =>
  d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (_, x: string, y: string) => `${120 - Number(x)} ${y}`)

function Arm({ pose, side, className }: { pose: Pose; side: 1 | -1; className?: string }) {
  return <path d={side === 1 ? ARMS[pose] : mirror(ARMS[pose])} fill={BODY} {...inked} className={className} />
}

// Spiral 2,5 putaran untuk mata bingung.
const spiral = (cx: number, cy: number) => {
  const pts: string[] = []
  for (let a = 0; a <= Math.PI * 5; a += 0.35) {
    const r = 0.5 + a * 0.42
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}`
}

// Tanda tanya yang digambar (bukan huruf), dengan titiknya.
function Question({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-5-4q0-7 6-7t6 6c0 4-6 5-6 10" {...line} stroke={color} strokeWidth="3.4" />
      <circle cx="1" cy="10" r="2" fill={color} />
    </g>
  )
}

// Daun laurel bergaris luar di kedua sisi tutup kapur (pose bangga).
function Laurel() {
  const leaves: [number, number, number][] = [
    [28, 30, -65],
    [31, 21, -45],
    [37, 14, -25],
  ]
  return (
    <g>
      <path d="M31 36q-4-14 12-24M89 36q4-14-12-24" {...line} strokeWidth="2" />
      {leaves.flatMap(([x, y, r]) => [
        <ellipse key={`l${x}`} cx={x} cy={y} rx="5" ry="2.6" fill={MINT} {...inked} strokeWidth="1.8" transform={`rotate(${r} ${x} ${y})`} />,
        <ellipse key={`r${x}`} cx={120 - x} cy={y} rx="5" ry="2.6" fill={MINT} {...inked} strokeWidth="1.8" transform={`rotate(${-r} ${120 - x} ${y})`} />,
      ])}
    </g>
  )
}

const star = (x: number, y: number, r: number) =>
  `M${x} ${y - r}L${x + r * 0.3} ${y - r * 0.3}L${x + r} ${y}L${x + r * 0.3} ${y + r * 0.3}L${x} ${y + r}L${x - r * 0.3} ${y + r * 0.3}L${x - r} ${y}L${x - r * 0.3} ${y - r * 0.3}Z`
const heart = (x: number, y: number) =>
  `M${x} ${y + 4}C${x - 6} ${y} ${x - 5} ${y - 5} ${x - 2} ${y - 5}C${x - 0.5} ${y - 5} ${x} ${y - 4} ${x} ${y - 3}C${x} ${y - 4} ${x + 0.5} ${y - 5} ${x + 2} ${y - 5}C${x + 5} ${y - 5} ${x + 6} ${y} ${x} ${y + 4}Z`

function Eyes({ mood }: { mood: KapurMood }) {
  if (mood === 'happy' || mood === 'cheer')
    return <path d="M39 64q7-8 14 0M67 64q7-8 14 0" {...line} stroke={EYE} strokeWidth="3.6" />
  if (mood === 'confused')
    return (
      <g {...line} stroke={EYE} strokeWidth="2.2">
        <path d={spiral(46, 62)} />
        <path d={spiral(74, 62)} />
      </g>
    )
  if (mood === 'curious')
    return (
      <g className="kapur-eyes">
        <circle cx="46" cy="61" r="7.5" fill="#fff" {...inked} strokeWidth="2.4" />
        <circle cx="74" cy="61" r="7.5" fill="#fff" {...inked} strokeWidth="2.4" />
        <circle cx="48.5" cy="58" r="3.4" fill={EYE} />
        <circle cx="76.5" cy="58" r="3.4" fill={EYE} />
      </g>
    )
  // Mata setengah tertutup: mendengarkan melirik ke kanan, berpikir melirik ke kiri, bangga lurus.
  if (mood === 'listen' || mood === 'think' || mood === 'proud') {
    const dx = mood === 'listen' ? 2 : mood === 'think' ? -2 : 0
    return (
      <g className="kapur-eyes">
        {[46, 74].map((cx) => (
          <g key={cx}>
            <path d={`M${cx - 5.5 + dx} 62a5 5 0 0 0 11 0Z`} fill={EYE} />
            <path d={`M${cx - 7} 62h14`} {...line} stroke={EYE} strokeWidth="3" />
            <circle cx={cx - 1.5 + dx} cy="64" r="1.3" fill="#fff" />
          </g>
        ))}
      </g>
    )
  }
  // Titik bulat (melambai).
  return (
    <g className="kapur-eyes">
      <circle cx="46" cy="62" r="4.6" fill={EYE} />
      <circle cx="74" cy="62" r="4.6" fill={EYE} />
      <circle cx="44.6" cy="60.4" r="1.5" fill="#fff" />
      <circle cx="72.6" cy="60.4" r="1.5" fill="#fff" />
    </g>
  )
}

const BROWS: Partial<Record<KapurMood, string>> = {
  listen: 'M39 53l12 3M69 56l12-3',
  think: 'M39 55h12M69 52l12 3',
  proud: 'M39 53l12 3.5M69 56.5l12-3.5',
  curious: 'M40 50q6-4 11 0M69 50q6-4 11 0',
}

function Mouth({ mood }: { mood: KapurMood }) {
  if (mood === 'wave' || mood === 'think')
    return <path d="M58 64.5q6 1.6 0 4.2q6 1.6 0 4.2" {...line} stroke={EYE} strokeWidth="2.8" />
  if (mood === 'listen' || mood === 'curious')
    return <ellipse cx="60" cy="69" rx="3.2" ry="4" fill={MOUTH} stroke={EYE} strokeWidth="2.2" />
  if (mood === 'confused')
    return <path d="M51.5 70.5q2.2-2.6 4.3 0t4.3 0 4.3 0 4.3 0" {...line} stroke={EYE} strokeWidth="2.4" />
  if (mood === 'proud') return <path d="M53 68q7 6 14 0" {...line} stroke={EYE} strokeWidth="2.8" />
  // Senang dan bersorak: mulut terbuka dengan lidah.
  return (
    <>
      <path d="M52 65h16q0 11-8 11t-8-11Z" fill={MOUTH} stroke={EYE} strokeWidth="2.2" strokeLinejoin="round" />
      <ellipse cx="60" cy="72.5" rx="4.2" ry="2.4" fill={TONGUE} />
    </>
  )
}

// Properti per mood, dalam warna kapur.
function Props({ mood }: { mood: KapurMood }): ReactNode {
  switch (mood) {
    case 'wave':
      return <path d="M110 24q6 4 7 10M103 20q8 1 12 7" {...line} stroke={BLUE} strokeWidth="2.6" />
    case 'listen':
      return <path d="M108 44q4 6 0 12M113 39q8 11 0 22" {...line} stroke={BLUE} strokeWidth="2.6" />
    case 'happy':
      return (
        <>
          <path d={star(14, 36, 7)} fill={YELLOW} />
          <path d={star(108, 60, 5)} fill={YELLOW} />
          <path d={heart(104, 30)} fill={PINK} />
        </>
      )
    case 'curious':
      return (
        <g>
          <circle cx="104" cy="24" r="7" fill={YELLOW} {...inked} strokeWidth="2.2" />
          <path d="M101 31h6v4h-6Z" fill={SHADE} {...inked} strokeWidth="2.2" />
          <path d="M104 11v-4M114 16l3-3M94 16l-3-3" {...line} stroke={YELLOW} strokeWidth="2.4" />
        </g>
      )
    case 'confused':
      return (
        <>
          <Question x={104} y={24} s={1.1} color={BLUE} />
          <Question x={14} y={36} s={0.8} color={YELLOW} />
        </>
      )
    case 'think':
      return (
        <g>
          <path
            d="M90 20c-4 0-6-4-3-7 0-4 5-6 8-3 2-4 8-4 10 0 4-2 9 1 7 5 4 1 4 7-1 7-2 3-7 3-9 0-3 2-9 2-12-2Z"
            fill="#fff"
            {...inked}
            strokeWidth="2.2"
          />
          <g fill={EYE}>
            <circle cx="95" cy="16" r="1.4" />
            <circle cx="100" cy="16" r="1.4" />
            <circle cx="105" cy="16" r="1.4" />
          </g>
          <circle cx="88" cy="31" r="2.6" fill="#fff" {...inked} strokeWidth="1.8" />
          <circle cx="84" cy="38" r="1.6" fill="#fff" {...inked} strokeWidth="1.6" />
        </g>
      )
    case 'cheer':
      return (
        <g>
          <rect x="10" y="22" width="7" height="3.5" rx="1.5" fill={YELLOW} transform="rotate(-25 13 24)" />
          <rect x="102" y="18" width="7" height="3.5" rx="1.5" fill={PINK} transform="rotate(30 105 20)" />
          <rect x="22" y="8" width="6" height="3" rx="1.5" fill={BLUE} transform="rotate(15 25 10)" />
          <rect x="92" y="6" width="6" height="3" rx="1.5" fill={MINT} transform="rotate(-20 95 8)" />
          <rect x="112" y="40" width="6" height="3" rx="1.5" fill={YELLOW} transform="rotate(40 115 42)" />
          <rect x="4" y="50" width="6" height="3" rx="1.5" fill={BLUE} transform="rotate(-35 7 52)" />
        </g>
      )
    case 'proud':
      return <Laurel />
  }
}

// `tick`: pose mencentang, tangan kanan terulur ke kanan (ujungnya di KAPUR_HAND, lib/kapur.ts).
// `quiet`: tanpa properti, supaya kotak agenda lain tetap bersih saat mencentang.
export function Kapur({
  mood,
  tick = false,
  quiet = false,
  className = '',
}: {
  mood: KapurMood
  tick?: boolean
  quiet?: boolean
  className?: string
}) {
  const right: Pose = tick
    ? 'tick'
    : mood === 'wave' || mood === 'cheer'
      ? 'up'
      : mood === 'listen'
        ? 'ear'
        : mood === 'curious' || mood === 'think'
          ? 'chin'
          : mood === 'proud'
            ? 'hip'
            : 'down'
  // Bangga: tangan kiri di dada dan tangan kanan di pinggang, seperti di referensi.
  const left: Pose = tick ? 'down' : mood === 'cheer' ? 'up' : 'down'
  const chestArm = mood === 'proud' && !tick
  const armInFront = right === 'chin'

  return (
    <svg
      viewBox="0 0 120 150"
      className={`overflow-visible text-outline ${className}`}
      role="img"
      aria-label={`Si Kapur ${MOOD_LABEL[mood]}`}
    >
      <g key={`${mood}-${tick}`} className={`kapur kapur-${tick ? 'tick' : mood}`}>
        {/* Kaki */}
        <rect x="39" y="124" width="18" height="15" rx="7.5" fill={BODY} {...inked} />
        <rect x="63" y="124" width="18" height="15" rx="7.5" fill={BODY} {...inked} />

        {!chestArm && <Arm pose={left} side={-1} />}
        {!armInFront && (
          <Arm pose={right} side={1} className={mood === 'wave' && !tick ? 'kapur-wave-arm' : undefined} />
        )}

        {/* Badan silinder: sisi, bayangan kanan, kilap kiri, dua garis pita, tutup elips */}
        <path d="M30 26V116Q30 128 42 128H78Q90 128 90 116V26Z" fill={BODY} />
        <path d="M77 26H90V116Q90 128 78 128H77Z" fill={SHADE} />
        <path d="M30 26V116Q30 128 40 128H36Q34 118 34 110V26Z" fill={SHADE} opacity="0.7" />
        <rect x="38" y="40" width="5" height="54" rx="2.5" fill="#fff" />
        <path d="M30 26V116Q30 128 42 128H78Q90 128 90 116V26" fill="none" {...inked} />
        <path d="M30 40q30 9 60 0M30 113q30 9 60 0" {...line} strokeWidth="2.2" opacity="0.55" />
        <ellipse cx="60" cy="26" rx="30" ry="8" fill={TOP} {...inked} />
        <g fill="#C9CFC7">
          <circle cx="44" cy="104" r="0.9" />
          <circle cx="72" cy="98" r="0.8" />
          <circle cx="80" cy="52" r="0.9" />
          <circle cx="52" cy="24" r="0.8" />
          <circle cx="68" cy="27" r="0.7" />
        </g>

        {/* Tanda "v" di perut, seperti di referensi */}
        <path
          d="M48 88l4.5 4.5 4.5-4.5M63 88l4.5 4.5 4.5-4.5M55.5 96l4.5 4.5 4.5-4.5"
          {...line}
          strokeWidth="2.2"
          opacity="0.55"
        />

        {/* Wajah */}
        <ellipse cx="38" cy="70" rx="6" ry="3.6" fill={CHEEK} />
        <ellipse cx="82" cy="70" rx="6" ry="3.6" fill={CHEEK} />
        <Eyes mood={mood} />
        {BROWS[mood] && <path d={BROWS[mood]} {...line} stroke={EYE} strokeWidth="2.8" />}
        <Mouth mood={mood} />

        {armInFront && <Arm pose={right} side={1} />}
        {chestArm && <path d={ARMS.chest} fill={BODY} {...inked} />}
        {!quiet && <Props mood={mood} />}
      </g>
    </svg>
  )
}
