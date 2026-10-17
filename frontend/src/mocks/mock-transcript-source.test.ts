import { afterEach, expect, test, vi } from 'vitest'
import type { ServerMessage } from '../types/server-message'
import { BACKPROP_SCRIPT } from './backprop'
import { MockTranscriptSource } from './mock-transcript-source'

afterEach(() => {
  vi.useRealTimers()
})

async function runFullSession() {
  vi.useFakeTimers()
  const src = new MockTranscriptSource()
  const msgs: ServerMessage[] = []
  src.onMessage((m) => msgs.push(m))
  await src.start()
  vi.advanceTimersByTime(100_000)
  src.stop()
  vi.advanceTimersByTime(1_000)
  return msgs
}

test('confirmed digabung sama dengan naskah setelah koreksi', async () => {
  const msgs = await runFullSession()
  const transcripts = msgs.filter((m) => m.type === 'transcript')
  const confirmed = transcripts.map((m) => m.confirmed).filter(Boolean).join(' ')
  const expected = BACKPROP_SCRIPT.map((u) => u.text.replace(/\{.+?\|(.+?)\}/g, '$1')).join(' ')
  expect(confirmed).toBe(expected)
  expect(transcripts.some((m) => m.partial.includes('cen rul'))).toBe(true)
  expect(confirmed).not.toMatch(/\bcen rul\b/)
})

test('stop di tengah sesi mengubah sisa partial jadi confirmed', async () => {
  vi.useFakeTimers()
  const src = new MockTranscriptSource()
  const msgs: ServerMessage[] = []
  src.onMessage((m) => msgs.push(m))
  await src.start()
  vi.advanceTimersByTime(45_500) // detik 45: partial "cen rul"
  src.stop()
  vi.advanceTimersByTime(1_000)
  expect(msgs.slice(-3)).toEqual([
    { type: 'status', state: 'processing' },
    { type: 'transcript', confirmed: 'chain rule', partial: '', t: 45, latency_ms: 500 },
    { type: 'status', state: 'idle' },
  ])
})

test('kelima konsep dibahas, masing-masing satu pesan', async () => {
  const msgs = await runFullSession()
  const concepts = msgs.flatMap((m) => (m.type === 'concept' ? [m.concept_id] : []))
  expect(concepts).toEqual(['forward-pass', 'loss-function', 'chain-rule', 'gradient-descent', 'learning-rate'])
})

test('satu jeda panjang, filler terhitung, sesi diakhiri idle', async () => {
  const msgs = await runFullSession()
  const fluency = msgs.filter((m) => m.type === 'fluency')
  expect(fluency.filter((m) => m.long_pause).map((m) => m.long_pause)).toEqual([{ start: 37, duration: 4 }])
  expect(fluency[fluency.length - 1].filler_count).toBeGreaterThan(0)
  expect(msgs[0]).toEqual({ type: 'status', state: 'listening' })
  expect(msgs.slice(-2)).toEqual([
    { type: 'status', state: 'processing' },
    { type: 'status', state: 'idle' },
  ])
})
