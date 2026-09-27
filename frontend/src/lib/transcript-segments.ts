import type { Pause } from './live-state'

export type Segment =
  | { kind: 'text'; text: string; conceptId?: string }
  | { kind: 'pause'; duration: number }

export type ConceptTerms = { id: string; terms: string[] }

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Pecah teks confirmed menjadi potongan teks, penanda jeda, dan istilah konsep.
// Istilah hanya ditandai untuk konsep yang dikirim lewat `concepts` (yang sudah disebut).
export function buildSegments(confirmed: string, pauses: Pause[], concepts: ConceptTerms[]): Segment[] {
  const byTerm = new Map<string, string>()
  for (const c of concepts) for (const term of c.terms) byTerm.set(term.toLowerCase(), c.id)
  // Istilah terpanjang dulu, supaya "loss function" menang atas "loss".
  const alternatives = [...byTerm.keys()].sort((a, b) => b.length - a.length).map(escape)
  const termRe = alternatives.length
    ? new RegExp(`(?<![\\p{L}\\p{N}])(${alternatives.join('|')})(?![\\p{L}\\p{N}])`, 'giu')
    : null

  const splitTerms = (text: string): Segment[] => {
    if (!termRe) return [{ kind: 'text', text }]
    const out: Segment[] = []
    let last = 0
    for (const m of text.matchAll(termRe)) {
      if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) })
      out.push({ kind: 'text', text: m[0], conceptId: byTerm.get(m[0].toLowerCase()) })
      last = m.index + m[0].length
    }
    if (last < text.length) out.push({ kind: 'text', text: text.slice(last) })
    return out
  }

  const out: Segment[] = []
  let last = 0
  for (const p of [...pauses].sort((a, b) => a.offset - b.offset)) {
    const at = Math.min(p.offset, confirmed.length)
    if (at > last) out.push(...splitTerms(confirmed.slice(last, at)))
    out.push({ kind: 'pause', duration: p.duration })
    last = at
  }
  if (last < confirmed.length) out.push(...splitTerms(confirmed.slice(last)))
  return out
}
