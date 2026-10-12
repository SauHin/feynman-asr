import { expect, test } from 'vitest'
import { TONES } from '../../../frontend/src/lib/kapur'
import { ease, jump, mixTone, spr } from './kit'

test('lompatan: diam sebelum antisipasi, naik di udara, lalu kembali ke tanah', () => {
  expect(jump(0, 1, 2, 100)).toEqual({ y: 0, sx: 1, sy: 1 })
  expect(jump(0.95, 1, 2, 100).sy).toBeLessThan(1)
  expect(jump(1.5, 1, 2, 100).y).toBeCloseTo(-100)
  const rest = jump(5, 1, 2, 100)
  expect(rest.y).toBe(0)
  expect(rest.sy).toBeCloseTo(1, 2)
})

test('pegas dan ease dalam detik', () => {
  expect(spr(0.5, 1)).toBe(0)
  expect(spr(5, 1, 'soft')).toBeCloseTo(1, 2)
  expect(ease(2, [0, 1], [10, 20])).toBe(20)
})

test('campuran warna Empur sama dengan nada aslinya di kedua ujung', () => {
  expect(mixTone('kuning', 'mint', 0).bot.toLowerCase()).toBe(`rgba(${parseInt(TONES.kuning.bot.slice(1, 3), 16)}, ${parseInt(TONES.kuning.bot.slice(3, 5), 16)}, ${parseInt(TONES.kuning.bot.slice(5, 7), 16)}, 1)`)
})
