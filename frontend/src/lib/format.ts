export const decimal = (n: number) => n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// Nama status konsep di agenda dan legenda.
export const MARK_LABEL = { none: 'belum', mentioned: 'disebut', explained: 'dijelaskan' } as const
