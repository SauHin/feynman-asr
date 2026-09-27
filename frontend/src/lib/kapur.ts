import type { Concept } from '../types/feedback'
import type { LiveState } from './live-state'

export type KapurMood = 'wave' | 'listen' | 'happy' | 'curious' | 'confused' | 'think' | 'cheer' | 'proud'
export type KapurLine = { mood: KapurMood; text: string }

// Titik ujung tangan kanan Si Kapur saat mencentang, dalam koordinat viewBox 120 x 150.
export const KAPUR_HAND = { x: 119, y: 79 }

// Reaksi terhadap event terakhir bertahan selama ini (detik waktu sesi).
const RECENT_SECONDS = 5

const decimal = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 1 })

// Apa yang dikatakan Si Kapur sekarang. Event paling baru (jeda atau konsep) menang.
export function kapurSays(input: {
  state: LiveState
  concepts: Concept[]
  started: boolean
  elapsed: number
  topic: string
}): KapurLine {
  const { state, concepts, started, elapsed } = input
  const name = (id: string) => concepts.find((c) => c.id === id)?.name ?? id
  const explained = concepts.filter((c) => state.concepts[c.id] === 'explained').length
  const allExplained = concepts.length > 0 && explained === concepts.length

  if (!started)
    return { mood: 'wave', text: 'Halo, aku Kapur! Aku akan mencentang konsep yang sudah kamu jelaskan.' }
  if (state.status === 'processing') return { mood: 'think', text: 'Sebentar, aku rapikan catatannya dulu.' }
  if (state.status === 'idle') {
    if (allExplained) return { mood: 'cheer', text: 'Mantap! Semua konsep sudah kamu jelaskan.' }
    const open = concepts.find((c) => state.concepts[c.id] !== 'explained')!
    const gap = state.concepts[open.id] === 'mentioned' ? 'baru disebut, belum dijelaskan' : 'belum dibahas'
    return {
      mood: 'proud',
      text: `Sesi selesai! ${explained} dari ${concepts.length} konsep jelas, tapi ${open.name} ${gap}.`,
    }
  }
  if (allExplained) return { mood: 'cheer', text: 'Mantap! Semua konsep sudah kamu jelaskan.' }

  const lastEvent = state.conceptEvents.at(-1)
  const lastPause = state.pauses.at(-1)
  const pauseEnd = lastPause ? lastPause.start + lastPause.duration : -Infinity
  const eventT = lastEvent?.t ?? -Infinity

  if (lastPause && pauseEnd >= eventT && elapsed - pauseEnd < RECENT_SECONDS)
    return {
      mood: 'confused',
      text: `Kamu diam ${decimal(lastPause.duration)} detik. Tarik napas, lalu lanjut ke konsep berikutnya.`,
    }
  if (lastEvent && elapsed - lastEvent.t < RECENT_SECONDS)
    return lastEvent.status === 'explained'
      ? { mood: 'happy', text: `Yes! ${name(lastEvent.id)} sudah jelas.` }
      : { mood: 'curious', text: `${name(lastEvent.id)}? Jelaskan lebih lanjut, dong.` }

  if (!state.confirmed && !state.partial) return { mood: 'listen', text: 'Aku mendengarkan. Mulai jelaskan kapan saja.' }
  const uncovered = concepts.find((c) => !state.concepts[c.id])
  if (uncovered) return { mood: 'listen', text: `Aku menyimak. Yang belum dibahas: ${uncovered.name}.` }
  const onlyMentioned = concepts.find((c) => state.concepts[c.id] === 'mentioned')
  return {
    mood: 'listen',
    text: onlyMentioned ? `Aku menyimak. ${onlyMentioned.name} baru disebut, belum dijelaskan.` : 'Aku menyimak.',
  }
}
