import type { Mark } from '../components/marks'

export const decimal = (n: number) => n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// Status konsep di agenda live dan contoh agenda di beranda. Hanya dua status, dan konsep yang sudah dibahas
// memakai centang. Layar feedback punya empat tanda sendiri dari penilaian Gemini.
export const MARK_LABEL = { none: 'belum', mentioned: 'dibahas' } as const
export type LiveStatus = keyof typeof MARK_LABEL
export const LIVE_MARK: Record<LiveStatus, Mark> = { none: 'none', mentioned: 'explained' }
