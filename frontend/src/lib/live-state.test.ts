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

test('konsep yang sudah dibahas hanya dicatat sekali', () => {
  const s = run([
    { type: 'concept', concept_id: 'a', status: 'mentioned', t: 1 },
    { type: 'concept', concept_id: 'a', status: 'mentioned', t: 2 },
  ])
  expect(s.concepts).toEqual({ a: 'mentioned' })
  expect(s.conceptEvents).toEqual([{ id: 'a', t: 1 }])
})

test('jeda menyimpan posisinya di transkrip, filler baru jadi tick, reset mengosongkan sesi', () => {
  const s = run([
    { type: 'transcript', confirmed: 'habis itu', partial: '', t: 39, latency_ms: 500 },
    { type: 'fluency', wpm: 90, filler_count: 2, t: 40 },
    { type: 'fluency', wpm: 95, filler_count: 3, long_pause: { start: 37, duration: 4 }, t: 41 },
  ])
  expect(s.pauses).toEqual([{ start: 37, duration: 4, offset: 'habis itu'.length }])
  expect(s.fillerTicks).toEqual([40, 40, 41])
  expect(liveReducer(s, { type: 'reset' })).toBe(initialLiveState)
})

test('id sesi dari pesan listening bertahan sampai sesi selesai', () => {
  const s = run([
    { type: 'status', state: 'listening', session_id: '20261018-140322-a3f9' },
    { type: 'status', state: 'processing' },
    { type: 'status', state: 'idle' },
  ])
  expect(s.sessionId).toBe('20261018-140322-a3f9')
})
