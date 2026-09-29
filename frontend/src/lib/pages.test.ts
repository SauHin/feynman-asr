import { expect, test } from 'vitest'
import { formatPages, parsePages } from './pages'

test('halaman tunggal dan rentang digabung, diurutkan, dan tanpa duplikat', () => {
  expect(parsePages('1-3, 8 , 11 – 12')).toEqual({ pages: [1, 2, 3, 8, 11, 12] })
  expect(parsePages('5, 2-3, 3')).toEqual({ pages: [2, 3, 5] })
  expect(parsePages('')).toEqual({ pages: [] })
})

test('masukan yang salah memberi pesan', () => {
  expect(parsePages('5-2')).toEqual({ error: '5–2: angka awal harus lebih kecil.' })
  expect(parsePages('1, bab 2')).toEqual({ error: '"bab" bukan nomor atau rentang.' })
  expect(parsePages('0')).toEqual({ error: 'Nomor dimulai dari 1.' })
})

test('ringkasan memadatkan halaman berurutan menjadi rentang', () => {
  expect(formatPages([1, 2, 3, 5, 7, 8])).toBe('1–3, 5, 7–8')
})
