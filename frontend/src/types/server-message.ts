export type ConceptStatus = 'mentioned' | 'explained'

// confirmed: kata yang baru confirmed di pesan ini, ditambahkan ke teks sebelumnya.
// partial: seluruh kata yang belum confirmed, menggantikan partial sebelumnya.
// t: waktu audio dalam detik sejak sesi mulai.
export type TranscriptMessage = {
  type: 'transcript'
  confirmed: string
  partial: string
  t: number
  latency_ms: number
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

export type StatusMessage = {
  type: 'status'
  state: 'listening' | 'processing' | 'idle'
}

export type ServerMessage = TranscriptMessage | ConceptMessage | FluencyMessage | StatusMessage
