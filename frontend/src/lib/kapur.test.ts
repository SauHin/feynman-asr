import { expect, test } from 'vitest'
import { BACKPROP_CONCEPTS } from '../mocks/backprop'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { kapurSays, setKapurPrefs, useKapurPrefs, type KapurPrefs } from './kapur'
import { initialLiveState, liveReducer, type LiveAction } from './live-state'

const at = (actions: LiveAction[], elapsed: number, started = true) =>
  kapurSays({
    state: actions.reduce(liveReducer, { ...initialLiveState, status: 'listening' }),
    concepts: BACKPROP_CONCEPTS,
    started,
    elapsed,
    topic: 'Backpropagation',
  })

test('sebelum mulai Kapur melambai', () => {
  expect(at([], 0, false).mood).toBe('wave')
})

test('konsep yang baru dijelaskan membuat Kapur senang, lalu kembali menyimak', () => {
  const actions: LiveAction[] = [
    { type: 'transcript', confirmed: 'forward pass', partial: '', t: 12, latency_ms: 500 },
    { type: 'concept', concept_id: 'forward-pass', status: 'explained', t: 20 },
  ]
  expect(at(actions, 22)).toEqual({ mood: 'happy', text: 'Yes! Forward pass sudah jelas.' })
  expect(at(actions, 30)).toEqual({ mood: 'listen', text: 'Aku menyimak. Yang belum dibahas: Loss function.' })
})

test('jeda panjang yang lebih baru dari event konsep membuat Kapur bingung', () => {
  const line = at(
    [
      { type: 'concept', concept_id: 'loss-function', status: 'explained', t: 35 },
      { type: 'fluency', wpm: 90, filler_count: 3, long_pause: { start: 37, duration: 4 }, t: 41 },
    ],
    42,
  )
  expect(line.mood).toBe('confused')
  expect(line.text).toContain('4 detik')
})

test('sesi selesai menyebut jumlah konsep yang sudah jelas', () => {
  const line = kapurSays({
    state: liveReducer(
      { ...initialLiveState, status: 'listening' },
      { type: 'concept', concept_id: 'forward-pass', status: 'explained', t: 20 },
    ),
    concepts: BACKPROP_CONCEPTS,
    started: true,
    elapsed: 90,
    topic: 'Backpropagation',
  })
  expect(line.mood).toBe('listen')
  const done = kapurSays({
    state: { ...initialLiveState, status: 'idle', concepts: { 'forward-pass': 'explained' } },
    concepts: BACKPROP_CONCEPTS,
    started: true,
    elapsed: 90,
    topic: 'Backpropagation',
  })
  expect(done).toEqual({
    mood: 'happy',
    text: 'Sesi selesai! 1 dari 5 konsep jelas, tapi Loss function belum dibahas.',
  })
})

test('pilihan Empur tersimpan dan terbaca kembali', () => {
  setKapurPrefs({ tone: 'mint', arms: false })
  const seen: KapurPrefs[] = []
  function Probe() {
    seen.push(useKapurPrefs())
    return null
  }
  renderToStaticMarkup(createElement(Probe))
  expect(seen.at(-1)).toEqual({ tone: 'mint', arms: false })
  setKapurPrefs({ tone: 'jingga', arms: true })
})
