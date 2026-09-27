import { expect, test } from 'vitest'
import { buildSegments } from '../lib/transcript-segments'
import { BACKPROP_FLUENCY, BACKPROP_TRANSCRIPT } from './backprop-feedback'
import { FILLERS } from './mock-transcript-source'

test('transkrip final memakai kata confirmed dan menaruh jeda sebelum chain rule', () => {
  const { text, pauses } = BACKPROP_TRANSCRIPT
  expect(text).toContain('kita pakai chain rule')
  expect(text).not.toContain('{')
  expect(pauses).toHaveLength(1)
  expect(text.slice(pauses[0].offset).trimStart().startsWith('kita pakai chain rule')).toBe(true)
})

test('jumlah filler di kartu kelancaran sama dengan tanda filler di transkrip', () => {
  const marked = buildSegments(BACKPROP_TRANSCRIPT.text, [], [], [...FILLERS]).filter(
    (s) => s.kind === 'text' && s.filler,
  )
  expect(BACKPROP_FLUENCY.filler_count).toBe(marked.length)
})
