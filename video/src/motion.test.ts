import { expect, test } from 'vitest'
import { armSwing, reactionAt, springAt, stops } from './motion'

test('keyframe CSS melewati setiap titik dan kembali ke awal', () => {
  const points: [number, number][] = [[0, 0], [0.5, 10], [1, 0]]
  expect(stops(0, points)).toBe(0)
  expect(stops(0.5, points)).toBe(10)
  expect(stops(0.25, points)).toBeCloseTo(5)
  expect(stops(1, points)).toBe(0)
})

test('pegas sampai di target lalu diam', () => {
  const [x] = springAt((f) => [f < 5 ? 0 : 10], 200, 140, 15)
  expect(x).toBeCloseTo(10, 2)
})

test('reaksi Web Animations membagi offset kosong dan berhenti setelah selesai', () => {
  const frames = [{ scale: '1 1' }, { scale: '2 2' }, { scale: '1 1' }]
  expect(reactionAt([[frames, 100]], 50).scale).toEqual([2, 2])
  expect(reactionAt([[frames, 100]], 25).scale![0]).toBeCloseTo(1.5)
  expect(reactionAt([[frames, 100]], 100)).toEqual({})
})

test('gerak tangan kiri adalah cermin tangan kanan', () => {
  expect(armSwing('sway', 1.6, -1)).toBeCloseTo(-armSwing('sway', 1.6, 1))
  expect(armSwing(undefined, 1, 1)).toBe(0)
})
