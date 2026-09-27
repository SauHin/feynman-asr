import { expect, test } from 'vitest'
import { initialLiveState, liveReducer, type LiveAction } from './live-state'

const run = (actions: LiveAction[]) => actions.reduce(liveReducer, initialLiveState)

test('confirmed ditambahkan, partial diganti', () => {
  const s = run([
    { type: 'transcript', confirmed: '', partial: 'kita pakai', t: 1, latency_ms: 500 },
    { type: 'transcript', confirmed: 'kita', partial: 'pakai cen rul', t: 2, latency_ms: 600 },
    { type: 'transcript', confirmed: 'pakai chain rule', partial: 'buat', t: 3, latency_ms: 700 },
  ])
  expect(s.confirmed).toBe('kita pakai chain rule')
  expect(s.partial).toBe('buat')
  expect(s.latencyMs).toBe(700)
})

test('status konsep tidak turun dari dijelaskan ke disebut', () => {
  const s = run([
    { type: 'concept', concept_id: 'a', status: 'mentioned', t: 1 },
    { type: 'concept', concept_id: 'a', status: 'explained', t: 2 },
    { type: 'concept', concept_id: 'a', status: 'mentioned', t: 3 },
  ])
  expect(s.concepts).toEqual({ a: 'explained' })
})

test('jeda panjang dikumpulkan, reset mengosongkan sesi', () => {
  const s = run([
    { type: 'fluency', wpm: 90, filler_count: 2, t: 5 },
    { type: 'fluency', wpm: 95, filler_count: 3, long_pause: { start: 37, duration: 4 }, t: 41 },
  ])
  expect(s.pauses).toEqual([{ start: 37, duration: 4 }])
  expect(s.fillerCount).toBe(3)
  expect(liveReducer(s, { type: 'reset' })).toBe(initialLiveState)
})
