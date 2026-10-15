import type { Concept } from '../types/feedback'

// Isi permintaan ekstraksi konsep (PLAN 7.3 panggilan 1). Materi opsional: file dengan halaman pilihan,
// atau teks yang ditempel.
export type ConceptRequest = { topic: string; file?: File; pages?: number[]; text?: string }

// material: materinya tidak bisa dipakai, dan message berisi pesan backend untuk user.
// gemini: Gemini gagal setelah dicoba ulang. server: backend lokal tidak menjawab.
export class ConceptError extends Error {
  kind: 'material' | 'gemini' | 'server'
  constructor(kind: ConceptError['kind'], message = '') {
    super(message)
    this.kind = kind
  }
}

// Satu panggilan Gemini per permintaan dan per percobaan, seperti feedback-request: React StrictMode
// menjalankan efek dua kali di dev, dan tanpa ini kuota gratis Gemini terpakai dua kali.
const requests = new WeakMap<ConceptRequest, { attempt: number; concepts: Promise<Concept[]> }>()

export function requestConcepts(req: ConceptRequest, attempt = 0): Promise<Concept[]> {
  const cached = requests.get(req)
  if (cached?.attempt === attempt) return cached.concepts
  const body = new FormData()
  body.set('topic', req.topic)
  if (req.file) body.set('file', req.file)
  if (req.pages?.length) body.set('pages', req.pages.join(','))
  if (req.text) body.set('text', req.text)
  const concepts = fetch('/api/concepts', { method: 'POST', body }).then(
    async (r) => {
      if (r.ok) return (await r.json()) as Concept[]
      const detail = await r.json().then((j: { detail?: unknown }) => j.detail, () => undefined)
      // FastAPI membalas validasi form dengan detail berupa list, bukan kalimat untuk user.
      const message = typeof detail === 'string' ? detail : ''
      // Proxy Vite juga membalas 502 saat backend mati, tapi tanpa body JSON dari FastAPI.
      const kind = r.status === 422 ? 'material' : r.status === 502 && detail !== undefined ? 'gemini' : 'server'
      throw new ConceptError(kind, message)
    },
    () => Promise.reject(new ConceptError('server')),
  )
  requests.set(req, { attempt, concepts })
  return concepts
}
