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
