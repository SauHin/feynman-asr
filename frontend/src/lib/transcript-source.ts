import type { ServerMessage } from '../types/server-message'

// Satu-satunya jalur data transkrip ke UI.
// Implementasi: MockTranscriptSource (Fase 0), WebSocket (Fase 1).
export interface TranscriptSource {
  // Async karena implementasi WebSocket harus menunggu izin mic dan koneksi.
  start(): Promise<void>
  stop(): void
  // Mengembalikan fungsi untuk berhenti berlangganan.
  onMessage(handler: (msg: ServerMessage) => void): () => void
}
