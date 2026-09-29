import { expect, test } from 'vitest'
import { springStep } from './spring'

test('pegas sedikit lewat target, lalu mengendap di target', () => {
  const x = [0]
  const v = [0]
  let peak = 0
  for (let i = 0; i < 120; i++) {
    springStep(x, v, [10], 240, 20, 1 / 60)
    peak = Math.max(peak, x[0])
  }
  expect(peak).toBeGreaterThan(10)
  expect(peak).toBeLessThan(11.5)
  expect(x[0]).toBeCloseTo(10, 1)
})
