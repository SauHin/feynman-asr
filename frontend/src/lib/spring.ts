import { useEffect, useRef, useState } from 'react'

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// Satu langkah pegas (Euler semi-implisit), mengubah x dan v di tempat. k: kekakuan, c: redaman.
// c < 2√k membuat nilai sedikit lewat target lalu mengendap, seperti rig maskot Brilliant.
export function springStep(x: number[], v: number[], goal: number[], k: number, c: number, dt: number) {
  for (let i = 0; i < x.length; i++) {
    v[i] += (k * (goal[i] - x[i]) - c * v[i]) * dt
    x[i] += v[i] * dt
  }
}

// Deretan angka yang mengejar target dengan pegas. Loop animasi hanya berjalan selama nilai bergerak.
// Target baru di tengah gerakan meneruskan kecepatan yang ada, jadi tidak ada patahan.
export function useSpring(target: number[], k: number, c: number) {
  const [value, setValue] = useState(target)
  const state = useRef({ x: [...target], v: target.map(() => 0) })
  const key = target.join()
  useEffect(() => {
    const s = state.current
    const target = key.split(',').map(Number)
    if (reducedMotion()) {
      s.x = [...target]
      s.v.fill(0)
      setValue(s.x)
      return
    }
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      springStep(s.x, s.v, target, k, c, Math.min((now - last) / 1000, 1 / 30))
      last = now
      const done = s.x.every((x, i) => Math.abs(target[i] - x) < 0.01 && Math.abs(s.v[i]) < 0.01)
      if (done) {
        s.x = [...target]
        s.v.fill(0)
      }
      setValue([...s.x])
      if (!done) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [key, k, c])
  return value
}
