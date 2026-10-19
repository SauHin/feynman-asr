import type { Mark } from '../components/marks'
import type { Concept, CoverageStatus, Feedback, PreviousSession, SessionResult } from '../types/feedback'

export const COVERAGE_MARK: Record<CoverageStatus, Mark> = {
  not_covered: 'none',
  mentioned: 'mentioned',
  explained_correct: 'explained',
  explained_incorrect: 'wrong',
}

const coverageOf = (f: Feedback): Record<string, CoverageStatus> =>
  Object.fromEntries(f.concept_coverage.map((c) => [c.concept_id, c.status]))

// Yang disimpan saat user menekan "Jelasin lagi". Penilaian Gemini ikut kalau sudah ada.
export function toPrevious(session: SessionResult, feedback: Feedback | null): PreviousSession {
  const saved: PreviousSession = { liveStatus: session.liveStatus, fluency: session.fluency }
  if (feedback) saved.coverage = coverageOf(feedback)
  return saved
}

// Kedua sesi diukur dengan alat yang sama: penilaian Gemini kalau keduanya punya, kalau tidak checklist live.
// Checklist live selalu ada, jadi perbandingan tetap jalan saat Gemini gagal di salah satu sesi. Tanda live
// sama dengan layar feedback tanpa Gemini: belum atau disebut.
export function compareConcepts(
  concepts: Concept[],
  previous: PreviousSession,
  current: { liveStatus: SessionResult['liveStatus']; feedback: Feedback | null },
) {
  const now = current.feedback && coverageOf(current.feedback)
  const was = previous.coverage
  const gemini = was && now ? { was, now } : null
  const rows = concepts.map((concept) => {
    const id = concept.id
    const pair: { was: Mark; is: Mark } = gemini
      ? { was: COVERAGE_MARK[gemini.was[id] ?? 'not_covered'], is: COVERAGE_MARK[gemini.now[id] ?? 'not_covered'] }
      : { was: previous.liveStatus[id] ?? 'none', is: current.liveStatus[id] ?? 'none' }
    return { concept, ...pair }
  })
  const explained = (side: 'was' | 'is') => rows.filter((r) => r[side] === 'explained').length
  // Kenaikan konsep yang tepat hanya ada di penilaian Gemini. Checklist live tidak pernah memberi "jelas".
  return { by: gemini ? ('gemini' as const) : ('live' as const), rows, gained: explained('is') - explained('was') }
}
