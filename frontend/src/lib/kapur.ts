import { useSyncExternalStore } from 'react'
import type { Concept } from '../types/feedback'
import type { LiveState } from './live-state'

export type KapurMood = 'wave' | 'listen' | 'happy' | 'curious' | 'confused' | 'think' | 'cheer'
export type KapurLine = { mood: KapurMood; text: string }

export const MOOD_LABEL: Record<KapurMood, string> = {
  wave: 'melambai',
  listen: 'mendengarkan',
  happy: 'senang',
  curious: 'penasaran',
  confused: 'bingung',
  think: 'berpikir',
  cheer: 'bersorak',
}

export type KapurTone = 'jingga' | 'kuning' | 'mint' | 'langit' | 'koral' | 'lilac' | 'putih'
// top dan bot: gradasi badan; cap dan capHi: tutup elips; dark: properti dan bayangan; ink: mata.
export type Tone = { top: string; bot: string; dark: string; cap: string; capHi: string; ink: string }

// Warna awal sebelum user memilih sendiri lewat menu Empur di bilah atas.
export const DEFAULT_TONE: KapurTone = 'jingga'

export const TONES: Record<KapurTone, Tone> = {
  jingga: { top: '#FFD84D', bot: '#FF7F3F', dark: '#C2410C', cap: '#FFE27A', capHi: '#FFF1B8', ink: '#2A1A0E' },
  kuning: { top: '#FFF09A', bot: '#FFC21A', dark: '#A86F00', cap: '#FFEE85', capHi: '#FFF9D1', ink: '#2B2006' },
  mint: { top: '#A7F3D0', bot: '#10B981', dark: '#047857', cap: '#BFF7DC', capHi: '#E7FFF3', ink: '#083B2A' },
  langit: { top: '#93D5FF', bot: '#4B6BFF', dark: '#2536A8', cap: '#BFE3FF', capHi: '#E6F5FF', ink: '#0F1B4D' },
  koral: { top: '#FFC1CF', bot: '#FF5A76', dark: '#BE123C', cap: '#FFCBD6', capHi: '#FFE9EE', ink: '#4A0D1C' },
  lilac: { top: '#DCC2FF', bot: '#8B5CF6', dark: '#6D28D9', cap: '#E2CCFF', capHi: '#F4ECFF', ink: '#241046' },
  putih: { top: '#FFFFFF', bot: '#C9D0E0', dark: '#7F88AE', cap: '#EEF1F7', capHi: '#FFFFFF', ink: '#1E2433' },
}

// Titik ujung tangan kanan Empur saat mencentang, dalam koordinat viewBox 120 x 150.
export const KAPUR_HAND = { x: 114, y: 77.5 }
// Tanpa tangan, Empur menulis centang dengan ujung bawah badannya, seperti kapur sungguhan.
export const KAPUR_TIP = { x: 60, y: 132 }

// Pilihan user untuk Empur (warna dan tangan), disimpan di browser dan dibagi ke semua layar.
export type KapurPrefs = { tone: KapurTone; arms: boolean }
const PREFS_KEY = 'empur'
let prefs: KapurPrefs = { tone: DEFAULT_TONE, arms: true }
try {
  const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}')
  prefs = { tone: saved.tone in TONES ? saved.tone : DEFAULT_TONE, arms: saved.arms !== false }
} catch {
  // Penyimpanan tidak tersedia atau isinya rusak: pakai bawaan.
}
const listeners = new Set<() => void>()

export function setKapurPrefs(next: Partial<KapurPrefs>) {
  prefs = { ...prefs, ...next }
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // Penyimpanan diblokir: pilihan tetap berlaku untuk sesi ini.
  }
  listeners.forEach((l) => l())
}

export function useKapurPrefs() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => prefs,
    () => prefs,
  )
}

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
    return { mood: 'wave', text: 'Halo, aku Empur! Aku akan mencentang konsep yang sudah kamu jelaskan.' }
  if (state.status === 'processing') return { mood: 'think', text: 'Sebentar, aku rapikan catatannya dulu.' }
  if (state.status === 'idle') {
    if (allExplained) return { mood: 'cheer', text: 'Mantap! Semua konsep sudah kamu jelaskan.' }
    const open = concepts.find((c) => state.concepts[c.id] !== 'explained')!
    const gap = state.concepts[open.id] === 'mentioned' ? 'baru disebut, belum dijelaskan' : 'belum dibahas'
    return {
      mood: 'happy',
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
