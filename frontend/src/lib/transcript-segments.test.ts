import { expect, test } from 'vitest'
import { buildSegments } from './transcript-segments'

const concepts = [
  { id: 'loss-function', terms: ['Loss function', 'loss'] },
  { id: 'gradient-descent', terms: ['Gradient descent', 'gradient'] },
]

test('istilah konsep ditandai, istilah terpanjang menang', () => {
  expect(buildSegments('pakai loss function, lalu Loss turun', [], concepts)).toEqual([
    { kind: 'text', text: 'pakai ' },
    { kind: 'text', text: 'loss function', conceptId: 'loss-function' },
    { kind: 'text', text: ', lalu ' },
    { kind: 'text', text: 'Loss', conceptId: 'loss-function' },
    { kind: 'text', text: ' turun' },
  ])
})

test('istilah tidak cocok di tengah kata, tetapi cocok sebelum tanda hubung', () => {
  const segs = buildSegments('glossary dan gradient-nya', [], concepts)
  expect(segs.filter((s) => s.kind === 'text' && s.conceptId).map((s) => s.kind === 'text' && s.text)).toEqual([
    'gradient',
  ])
})

test('jeda disisipkan di posisi offset-nya', () => {
  const text = 'habis itu kita pakai'
  expect(buildSegments(text, [{ start: 37, duration: 4, offset: 'habis itu'.length }], [])).toEqual([
    { kind: 'text', text: 'habis itu' },
    { kind: 'pause', duration: 4 },
    { kind: 'text', text: ' kita pakai' },
  ])
})

test('filler ditandai terpisah dari istilah konsep', () => {
  expect(buildSegments('loss, eee, gitu', [], concepts, ['eee', 'gitu'])).toEqual([
    { kind: 'text', text: 'loss', conceptId: 'loss-function' },
    { kind: 'text', text: ', ' },
    { kind: 'text', text: 'eee', filler: true },
    { kind: 'text', text: ', ' },
    { kind: 'text', text: 'gitu', filler: true },
  ])
})
