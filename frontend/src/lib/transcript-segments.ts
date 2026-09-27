import type { Pause } from './live-state'

export type Segment =
  | { kind: 'text'; text: string; conceptId?: string; filler?: boolean }
  | { kind: 'pause'; duration: number }

export type ConceptTerms = { id: string; terms: string[] }

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Pecah teks confirmed menjadi potongan teks, penanda jeda, dan istilah konsep.
// Istilah hanya ditandai untuk konsep yang dikirim lewat `concepts` (yang sudah disebut).
// `fillers` (opsional, untuk transkrip di feedback) ditandai sebagai potongan filler.
export function buildSegments(
  confirmed: string,
  pauses: Pause[],
  concepts: ConceptTerms[],
  fillers: string[] = [],
): Segment[] {
  const byTerm = new Map<string, string>()
  for (const c of concepts) for (const term of c.terms) byTerm.set(term.toLowerCase(), c.id)
  const fillerSet = new Set(fillers.map((f) => f.toLowerCase()))
  // Istilah terpanjang dulu, supaya "loss function" menang atas "loss".
  const alternatives = [...new Set([...byTerm.keys(), ...fillerSet])].sort((a, b) => b.length - a.length).map(escape)
  const termRe = alternatives.length
    ? new RegExp(`(?<![\\p{L}\\p{N}])(${alternatives.join('|')})(?![\\p{L}\\p{N}])`, 'giu')
    : null

  const splitTerms = (text: string): Segment[] => {
    if (!termRe) return [{ kind: 'text', text }]
    const out: Segment[] = []
    let last = 0
    for (const m of text.matchAll(termRe)) {
      if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) })
      const id = byTerm.get(m[0].toLowerCase())
      out.push(id ? { kind: 'text', text: m[0], conceptId: id } : { kind: 'text', text: m[0], filler: true })
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
