import { Easing } from 'remotion'
import { springStep } from '../../frontend/src/lib/spring'

// Video dirender per frame, jadi semua gerak di sini fungsi murni dari waktu. Tidak ada
// requestAnimationFrame, timer, atau animasi CSS yang berjalan sendiri.

export const FPS = 30
// Musik 120 BPM: satu ketukan 15 frame, satu birama 60 frame. Adegan dan efek suara jatuh di ketukan.
export const BEAT = 15
export const BAR = 60

const cssInOut = Easing.bezier(0.42, 0, 0.58, 1)

// Nilai keyframe gaya CSS pada posisi t (0..1): titik [offset, nilai], tiap ruas memakai ease-in-out.
export function stops(t: number, s: [number, number][], ease = cssInOut) {
  for (let i = 1; i < s.length; i++) {
    if (t > s[i][0]) continue
    const [o0, v0] = s[i - 1]
    const [o1, v1] = s[i]
    return v0 + (v1 - v0) * ease(o1 === o0 ? 1 : (t - o0) / (o1 - o0))
  }
  return s[s.length - 1][1]
}

// Pegas yang sama dengan rig aplikasi (lib/spring.ts), disimulasikan dari frame 0 sampai `frame`.
// goal(f) memberi target di frame f. Dua langkah per frame supaya setara dengan 60 fps di browser.
export function springAt(goal: (f: number) => number[], frame: number, k: number, c: number, sub = 2) {
  const x = [...goal(0)]
  const v = x.map(() => 0)
  for (let f = 0; f < frame; f++) {
    const g = goal(f)
    for (let i = 0; i < sub; i++) springStep(x, v, g, k, c, 1 / FPS / sub)
  }
  return x
}

// Keyframe Web Animations (REACTION di components/kapur.tsx) dibaca pada waktu ms. Offset yang kosong
// dibagi rata seperti di browser, dan easing tiap keyframe berlaku untuk ruas sesudahnya.
type Frame = { offset?: number | null; easing?: string; [prop: string]: unknown }
export type Pose = { translate?: number[]; scale?: number[]; rotate?: number[]; opacity?: number[] }

const nums = (v: unknown) => String(v).match(/-?[\d.]+/g)!.map(Number)
const easingOf = (e?: string) => {
  const m = e?.match(/cubic-bezier\(([^)]+)\)/)
  if (!m) return (t: number) => t
  const [a, b, c, d] = nums(m[1])
  return Easing.bezier(a, b, c, d)
}

function offsets(frames: Frame[]) {
  const o = frames.map((f) => f.offset ?? null)
  o[0] ??= 0
  o[o.length - 1] ??= 1
  for (let i = 1; i < o.length; i++) {
    if (o[i] !== null) continue
    let j = i
    while (o[j] === null) j++
    const [a, b] = [o[i - 1]!, o[j]!]
    for (let n = i; n < j; n++) o[n] = a + ((b - a) * (n - i + 1)) / (j - i + 1)
  }
  return o as number[]
}

export function reactionAt(anims: [Frame[], number, number?][], ms: number): Pose {
  const out: Pose = {}
  for (const [frames, duration, times = 1] of anims) {
    if (ms < 0 || ms >= duration * times) continue
    const t = (ms % duration) / duration
    const o = offsets(frames)
    let i = 0
    while (i < frames.length - 2 && t > o[i + 1]) i++
    const u = easingOf(frames[i].easing)((t - o[i]) / (o[i + 1] - o[i] || 1))
    for (const prop of ['translate', 'scale', 'rotate', 'opacity'] as const) {
      if (frames[i][prop] === undefined) continue
      const [a, b] = [nums(frames[i][prop]), nums(frames[i + 1][prop])]
      out[prop] = a.map((v, n) => v + (b[n] - v) * u)
    }
  }
  return out
}

// Gerak tangan saat diam, salinan keyframe kapur-arm-* di frontend/src/index.css: durasi (detik) dan
// titik [offset, derajat]. mirror: derajat dikali arah tangan (--dir), jadi kedua tangan bercermin.
export type Motion = 'wave' | 'sway' | 'cup' | 'tap' | 'rub' | 'pump' | 'clap' | 'thumb'
const ARM_MOTION: Record<Motion, [seconds: number, points: [number, number][], mirror: boolean]> = {
  wave: [2.8, [[0, 0], [0.12, 16], [0.24, 2], [0.36, 16], [0.5, 0], [1, 0]], false],
  sway: [3.2, [[0, 0], [0.5, 5], [1, 0]], true],
  cup: [1.6, [[0, 0], [0.5, -5], [1, 0]], true],
  tap: [2.4, [[0, 0], [0.12, 7], [0.22, 0], [0.32, 7], [0.45, 0], [1, 0]], true],
  rub: [1.8, [[0, 0], [0.5, 4], [1, 0]], true],
  pump: [0.9, [[0, 0], [0.5, -12], [1, 0]], true],
  clap: [0.9, [[0, 0], [0.5, 6], [1, 0]], true],
  thumb: [0.7, [[0, 0], [0.5, 10], [1, 0]], true],
}

export function armSwing(motion: Motion | undefined, seconds: number, side: 1 | -1) {
  if (!motion) return 0
  const [period, points, mirror] = ARM_MOTION[motion]
  // Tangan kiri yang memompa setengah ketukan lebih dulu, seperti animationDelay di aplikasi.
  const t = seconds + (motion === 'pump' && side === -1 ? 0.45 : 0)
  return stops((t / period) % 1, points) * (mirror ? side : 1)
}

// Badan bernapas (kapur-breathe): skala tinggi 1..1.025 dalam 3,2 detik.
export const breathe = (seconds: number) => 1 + 0.025 * stops((seconds / 3.2) % 1, [[0, 0], [0.5, 1], [1, 0]])
