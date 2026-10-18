import { useEffect, useState } from 'react'
import type { Feedback, SessionResult } from '../types/feedback'

// Satu panggilan Gemini per sesi dan per percobaan. React StrictMode menjalankan efek dua kali di dev,
// dan tanpa ini kuota gratis Gemini terpakai dua kali.
const requests = new WeakMap<SessionResult, { attempt: number; feedback: Promise<Feedback> }>()

export function requestFeedback(session: SessionResult, attempt = 0): Promise<Feedback> {
  const cached = requests.get(session)
  if (cached?.attempt === attempt) return cached.feedback
  const feedback = fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: session.topic,
      concepts: session.concepts,
      transcript: session.transcript.text,
      fluency: session.fluency,
      session_id: session.sessionId,
    }),
  }).then((r) => (r.ok ? (r.json() as Promise<Feedback>) : Promise.reject(new Error(`HTTP ${r.status}`))))
  requests.set(session, { attempt, feedback })
  return feedback
}

// Keadaan layar feedback untuk sesi asli. "gagal" berarti hanya feedback lokal yang tampil (PLAN 7.3).
export function useFeedback(session?: SessionResult) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ attempt: number; feedback: Feedback | null }>()
  useEffect(() => {
    if (!session) return
    let active = true
    requestFeedback(session, attempt).then(
      (feedback) => active && setResult({ attempt, feedback }),
      () => active && setResult({ attempt, feedback: null }),
    )
    return () => {
      active = false
    }
  }, [session, attempt])
  const done = result?.attempt === attempt ? result : undefined
  return {
    view: !done ? ('memuat' as const) : done.feedback ? ('lengkap' as const) : ('gagal' as const),
    feedback: done?.feedback ?? null,
    retry: () => setAttempt((n) => n + 1),
  }
}
