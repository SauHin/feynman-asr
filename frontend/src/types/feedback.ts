// Skema output Gemini, PLAN.md 7.3.

// Panggilan 1: ekstraksi konsep. id ditambahkan oleh backend.
export type Concept = {
  id: string
  name: string
  aliases: string[]
  description: string
}

// Panggilan 2: analisis penjelasan.
export type CoverageStatus = 'not_covered' | 'mentioned' | 'explained_correct' | 'explained_incorrect'

export type Feedback = {
  concept_coverage: { concept_id: string; status: CoverageStatus; evidence: string[] }[]
  factual_errors: { statement: string; correction: string }[]
  unexplained_jargon: { term: string; evidence: string }[]
  strengths: string[]
  improvements: string[]
  simplicity_note: string
}

// Metrik kelancaran lokal (PLAN 7.1), dihitung di laptop setelah Stop. Waktu dalam detik.
// next_concept_id: konsep yang dijelaskan tepat setelah jeda, untuk lokasi seperti "sebelum chain rule".
export type FluencyReport = {
  duration: number
  wpm: number
  filler_count: number
  long_pauses: { start: number; duration: number; next_concept_id?: string }[]
}
