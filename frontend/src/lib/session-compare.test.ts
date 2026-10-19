import { describe, expect, test } from 'vitest'
import type { Concept, CoverageStatus, Feedback, SessionResult } from '../types/feedback'
import { compareConcepts, toPrevious } from './session-compare'

const concepts: Concept[] = ['loss', 'chain', 'lr'].map((id) => ({ id, name: id, aliases: [], description: '' }))

const feedback = (coverage: Record<string, CoverageStatus>): Feedback => ({
  concept_coverage: Object.entries(coverage).map(([concept_id, status]) => ({ concept_id, status, evidence: [] })),
  factual_errors: [],
  unexplained_jargon: [],
  strengths: [],
  improvements: [],
  simplicity_note: '',
})

const session = (liveStatus: SessionResult['liveStatus']): SessionResult => ({
  topic: 'Backpropagation',
  concepts,
  transcript: { text: '', pauses: [] },
  fluency: { duration: 60, wpm: 100, filler_count: 8, long_pauses: [{ start: 5, duration: 3 }] },
  liveStatus,
})

describe('toPrevious', () => {
  test('menyimpan checklist live, kelancaran, dan penilaian Gemini', () => {
    const s = session({ loss: 'mentioned' })
    const p = toPrevious(s, feedback({ loss: 'explained_correct', chain: 'not_covered' }))
    expect(p).toEqual({
      liveStatus: { loss: 'mentioned' },
      fluency: s.fluency,
      coverage: { loss: 'explained_correct', chain: 'not_covered' },
    })
  })

  test('tanpa feedback Gemini, coverage kosong', () => {
    expect(toPrevious(session({}), null)).not.toHaveProperty('coverage')
  })

  test('hasilnya bisa disalin history.state, jadi tetap ada setelah pindah layar', () => {
    const p = toPrevious(session({ loss: 'mentioned' }), feedback({ loss: 'mentioned' }))
    expect(structuredClone(p)).toEqual(p)
  })
})

describe('compareConcepts', () => {
  test('dua sesi dinilai Gemini: pakai penilaian Gemini dan hitung kenaikan konsep yang tepat', () => {
    const previous = toPrevious(session({ loss: 'mentioned' }), feedback({ loss: 'mentioned', chain: 'explained_incorrect' }))
    const c = compareConcepts(concepts, previous, {
      liveStatus: { loss: 'mentioned', chain: 'mentioned' },
      feedback: feedback({ loss: 'explained_correct', chain: 'explained_correct', lr: 'mentioned' }),
    })
    expect(c.by).toBe('gemini')
    expect(c.rows.map(({ was, is }) => [was, is])).toEqual([
      ['mentioned', 'explained'],
      ['wrong', 'explained'],
      ['none', 'mentioned'], // lr tidak ada di penilaian lama, dianggap belum
    ])
    expect(c.gained).toBe(2)
  })

  test('Gemini gagal di sesi pertama: kedua sesi pakai checklist live', () => {
    const previous = toPrevious(session({ loss: 'mentioned' }), null)
    const c = compareConcepts(concepts, previous, {
      liveStatus: { loss: 'mentioned', chain: 'mentioned' },
      feedback: feedback({ loss: 'explained_correct', chain: 'explained_correct' }),
    })
    expect(c.by).toBe('live')
    expect(c.rows.map(({ was, is }) => [was, is])).toEqual([
      ['mentioned', 'mentioned'],
      ['none', 'mentioned'],
      ['none', 'none'],
    ])
    expect(c.gained).toBe(0)
  })

  test('Gemini gagal di sesi kedua: kedua sesi pakai checklist live', () => {
    const previous = toPrevious(session({}), feedback({ loss: 'explained_correct' }))
    const c = compareConcepts(concepts, previous, { liveStatus: { lr: 'mentioned' }, feedback: null })
    expect(c.by).toBe('live')
    expect(c.rows.map(({ was, is }) => [was, is])).toEqual([
      ['none', 'none'],
      ['none', 'none'],
      ['none', 'mentioned'],
    ])
  })
})
