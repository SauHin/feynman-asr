import { useId, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { random, useCurrentFrame, useVideoConfig } from 'remotion'
import { Eyes, KAPUR_RIG, Props } from '../../frontend/src/components/kapur'
import { TONES, type KapurMood, type KapurTone, type Tone } from '../../frontend/src/lib/kapur'
import { armSwing, breathe, reactionAt, springAt, type Motion } from './motion'

// Empur yang digerakkan per frame. Bentuk, pose, pegas, dan reaksinya diambil dari rig aplikasi
// (KAPUR_RIG), jadi Empur di video sama dengan Empur di aplikasi. Yang diganti hanya jamnya: di sini
// semua gerak dihitung dari nomor frame, bukan dari timer browser.

// Satu isyarat: mulai frame `at` (lokal di Sequence), Empur berganti mood atau mencentang.
export type Cue = { at: number; mood: KapurMood; tick?: boolean; gaze?: [number, number] }

const R = KAPUR_RIG
const { CX, W, TOP, RY, BOT, BODY, EYE_LEN, ARM_LEN } = R

type ArmPose = keyof typeof R.ARM
const poses = (c: Cue): [ArmPose, ArmPose] =>
  c.tick ? ['tick', 'thumb'] : [R.RIGHT[c.mood] as ArmPose, (R.LEFT[c.mood] ?? 'down') as ArmPose]
const motions = (c: Cue): [Motion | undefined, Motion | undefined] => (c.tick ? [undefined, 'thumb'] : R.MOTION[c.mood])
const look = (c: Cue) => (c.tick ? [2, 1] : (c.gaze ?? [0, 0]))
const reactionName = (c: Cue) => (c.tick ? 'tick' : c.mood)

// Kedip dengan jeda acak tapi tetap (seed), kadang dua kali. Nilai: skala tinggi mata per frame 30 fps.
const BLINKS = (() => {
  const at: number[] = []
  for (let f = 40, i = 0; f < 4000; i++) {
    at.push(f)
    if (random(`double${i}`) < 0.25) at.push(f + 8)
    f += 45 + Math.floor(random(`blink${i}`) * 100)
  }
  return at
})()
const BLINK_SHAPE = [0.45, 0.1, 0.1, 0.55]
const blinkAt = (frame: number) => {
  const b = BLINKS.findLast((f) => f <= frame)
  return b === undefined ? 1 : (BLINK_SHAPE[frame - b] ?? 1)
}

export function Empur({
  cues,
  tone = 'kuning',
  enter = true,
  quiet = false,
  mirror = false,
  arms: withArms = true,
  eyesOpen = 1,
  armGrow = 1,
  blinks = true,
  style,
}: {
  cues: Cue[]
  tone?: KapurTone | Tone
  // Reaksi masuk (muncul dari kecil) di isyarat pertama.
  enter?: boolean
  // Tanpa properti mood (gelombang suara, bintang, konfeti).
  quiet?: boolean
  // Dicerminkan saat mencentang dari kanan, seperti di layar live.
  mirror?: boolean
  arms?: boolean
  // 0..1: mata membuka dan tangan tumbuh dari bahu, untuk kelahiran Empur di showreel.
  eyesOpen?: number
  armGrow?: number
  // false: tidak berkedip, misalnya saat kamera masuk ke mata.
  blinks?: boolean
  style?: CSSProperties
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const t = typeof tone === 'string' ? TONES[tone] : tone
  const cueIndex = (f: number) => Math.max(0, cues.findLastIndex((c) => c.at <= f))
  const i = cueIndex(frame)
  const cue = cues[i]
  const since = frame - cue.at

  // Rig: mata dan tangan mengejar pose lewat pegas yang sama dengan aplikasi. Lirikan cepat, badan lambat.
  const target = (f: number) => {
    const c = cues[cueIndex(f)]
    const [right, left] = poses(c)
    return [...R.EYES[c.mood].flatMap(R.eyeVec), ...R.armVec(R.ARM[right]), ...R.armVec(R.ARM[left])]
  }
  const rig = springAt(target, frame, 140, 15, fps)
  const gaze = springAt((f) => look(cues[cueIndex(f)]), frame, 500, 40, fps)
  const [lean] = springAt((f) => {
    const c = cues[cueIndex(f)]
    return [c.tick ? 0 : (R.LEAN[c.mood] ?? 0) + look(c)[0] * 1.5]
  }, frame, 120, 14, fps)
  const eyes = [rig.slice(0, EYE_LEN), rig.slice(EYE_LEN, 2 * EYE_LEN)]
  const open = cue.mood !== 'happy' && cue.mood !== 'cheer'

  // Reaksi sekali jalan saat isyarat berganti (antisipasi, lewat, mengendap).
  const prev = cues[i - 1]
  const name = !prev ? (enter ? 'enter' : null) : reactionName(prev) === reactionName(cue) ? null : reactionName(cue)
  const react = name ? reactionAt(R.REACTION[name as keyof typeof R.REACTION], (since / fps) * 1000) : {}
  const [tx, ty] = react.translate ?? [0, 0]
  const [sx, sy = sx] = react.scale ?? [1, 1]
  const reactTransform = `translate(${CX + tx} ${BOT + ty}) rotate(${react.rotate?.[0] ?? 0}) scale(${sx} ${sy}) translate(${-CX} ${-BOT})`

  // Gerak tangan dari bahu. Gerak baru masuk perlahan sambil gerak lama memudar, jadi tidak ada lompatan.
  const blend = Math.min(1, since / (fps / 3))
  const swing = (side: 0 | 1) => {
    const dir = side === 0 ? 1 : -1
    const now = armSwing(motions(cue)[side], since / fps, dir)
    const before = prev ? armSwing(motions(prev)[side], (frame - prev.at) / fps, dir) : 0
    return before + (now - before) * blend
  }

  const arms = ([0, 1] as const).map((s) => {
    const side = s === 0 ? 1 : -1
    const v = s === 0 ? rig.slice(2 * EYE_LEN, 2 * EYE_LEN + ARM_LEN) : rig.slice(2 * EYE_LEN + ARM_LEN)
    const p = { ...R.armOf(v) }
    p.len *= armGrow
    const shoulder = [side === 1 ? p.x : 2 * CX - p.x, p.y]
    return { side, ...R.arm(p, side), rotate: `rotate(${swing(s).toFixed(2)} ${shoulder[0]} ${shoulder[1]})` }
  })
  const back = arms.filter((a) => a.behind).map((a) => <path key={a.side} d={a.d} transform={a.rotate} fill={`url(#${id}base)`} />)
  const front = arms.map((a) => {
    if (!a.front) return null
    const { d, from, to } = a.front
    const fade = `${id}fade${a.side}`
    return (
      <g key={a.side} transform={a.rotate}>
        <linearGradient id={fade} gradientUnits="userSpaceOnUse" x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}>
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.22" />
        </linearGradient>
        <path d={d} fill={t.dark} opacity="0.22" transform="translate(1.3 2.4)" clipPath={`url(#${id}body)`} />
        <path d={d} fill={`url(#${id}base)`} />
        <path d={d} fill={`url(#${fade})`} />
      </g>
    )
  })

  // Properti mood memakai animasi CSS dari aplikasi (video.css). Animasinya dijeda dan waktunya diatur
  // dari frame, jadi setiap frame tetap sama saat dirender ulang.
  const svg = useRef<SVGSVGElement>(null)
  useLayoutEffect(() => {
    for (const a of svg.current?.getAnimations({ subtree: true }) ?? []) {
      a.pause()
      a.currentTime = (since / fps) * 1000
    }
  })
  const propIn = Math.min(1, since / (fps / 3))
  const blink = (open && blinks ? blinkAt(Math.floor((frame * 30) / fps)) : 1) * eyesOpen
  const breath = breathe(frame / fps)

  const eyesNode: ReactNode = <Eyes eyes={eyes} gaze={gaze} ink={t.ink} />
  return (
    <svg ref={svg} viewBox="0 0 120 150" style={{ overflow: 'visible', opacity: react.opacity?.[0] ?? 1, ...style }}>
      <defs>
        <linearGradient id={`${id}base`} gradientUnits="userSpaceOnUse" x1={CX - W} y1={TOP - RY} x2={CX - W + 0.8 * W} y2={BOT}>
          <stop offset="0" stopColor={t.top} />
          <stop offset="1" stopColor={t.bot} />
        </linearGradient>
        <radialGradient id={`${id}spark`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#FFF3B0" />
          <stop offset="1" stopColor="#FFD34D" />
        </radialGradient>
        <radialGradient id={`${id}cloud`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#E3E6EF" />
        </radialGradient>
        <clipPath id={`${id}body`}>
          <path d={BODY} />
        </clipPath>
      </defs>
      <g transform={mirror ? `translate(120 0) scale(-1 1)` : undefined}>
        <g transform={`translate(0 ${BOT}) scale(1 ${breath}) translate(0 ${-BOT})`}>
          <g transform={reactTransform}>
            <g transform={`rotate(${lean.toFixed(2)} ${CX} ${BOT})`}>
              {withArms && armGrow > 0.02 && back}
              <path d={BODY} fill={`url(#${id}base)`} />
              <ellipse cx={CX} cy={TOP} rx={W} ry={RY} fill={t.cap} />
              <ellipse cx={CX - 2.7} cy={TOP - 1.3} rx={W * 0.75} ry={RY * 0.65} fill={t.capHi} />
              <g transform={`translate(0 61) scale(1 ${blink}) translate(0 -61)`}>{eyesNode}</g>
              {withArms && armGrow > 0.02 && front}
              {!quiet && !cue.tick && (
                <g key={cue.mood} opacity={propIn} transform={`translate(0 ${(1 - propIn) * 4})`}>
                  <Props mood={cue.mood} t={t} id={id} />
                </g>
              )}
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
