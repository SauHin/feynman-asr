// Checklist live hanya punya satu status selain belum: konsep sudah dibahas (nama atau aliasnya disebut).
export type ConceptStatus = 'mentioned'

// confirmed: kata yang baru confirmed di pesan ini, ditambahkan ke teks sebelumnya.
// partial: seluruh kata yang belum confirmed, menggantikan partial sebelumnya.
// t: waktu audio dalam detik sejak sesi mulai.
export type TranscriptMessage = {
  type: 'transcript'
  confirmed: string
  partial: string
  t: number
  latency_ms: number
  // Untuk evaluasi (eval/replay.py), UI tidak memakainya: kata beserta waktu audionya [mulai, akhir, teks]
  // dalam detik sejak sesi mulai, dan total waktu inference sesi sejauh ini.
  words?: { confirmed: [number, number, string][]; partial: [number, number, string][] }
  compute_s?: number
}

export type ConceptMessage = {
  type: 'concept'
  concept_id: string
  status: ConceptStatus
  t: number
}

export type FluencyMessage = {
  type: 'fluency'
  wpm: number
  filler_count: number
  long_pause?: { start: number; duration: number }
  t: number
}

// session_id: hanya di pesan listening, dan hanya kalau backend menyimpan sesi (config.SESSION_SAVE). Dikirim balik
// saat meminta feedback, supaya feedback tercatat di sesi yang sama.
export type StatusMessage = {
  type: 'status'
  state: 'listening' | 'processing' | 'idle'
  session_id?: string
}

export type ServerMessage = TranscriptMessage | ConceptMessage | FluencyMessage | StatusMessage
