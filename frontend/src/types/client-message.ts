import type { Concept } from './feedback'

// Pesan teks dari klien ke /ws/transcribe. Audio dikirim terpisah sebagai pesan biner (PCM int16 16 kHz).
// start: dikirim sebelum audio. Backend memakai nama dan alias konsep sebagai hotwords Whisper (PLAN 8.5 E2).
export type StartMessage = { type: 'start'; concepts: Concept[] }
export type StopMessage = { type: 'stop' }
export type ClientMessage = StartMessage | StopMessage
