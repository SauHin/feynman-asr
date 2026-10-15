import { afterEach, expect, test, vi } from 'vitest'
import type { ServerMessage } from '../types/server-message'
import { WebSocketTranscriptSource } from './ws-transcript-source'

// WebSocket palsu yang dikendalikan tes. Mic dan AudioContext tidak tersedia di Node, jadi tes ini
// hanya mencakup jalur koneksi: server mati, dan mic ditolak setelah koneksi terbuka.
class FakeSocket {
  static last: FakeSocket
  static OPEN = 1
  readyState = 0
  binaryType = ''
  sent: unknown[] = []
  onopen?: () => void
  onerror?: () => void
  onclose?: () => void
  onmessage?: (e: { data: string }) => void
  url: string
  constructor(url: string) {
    this.url = url
    FakeSocket.last = this
  }
  send(data: unknown) {
    this.sent.push(data)
  }
  close() {
    this.readyState = 3
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

function setup() {
  vi.stubGlobal('WebSocket', FakeSocket)
  vi.stubGlobal('location', { protocol: 'http:', host: 'localhost:5173' })
  const src = new WebSocketTranscriptSource()
  const msgs: ServerMessage[] = []
  src.onMessage((m) => msgs.push(m))
  return { src, msgs }
}

const CONCEPTS = [{ id: 'chain-rule', name: 'Chain rule', aliases: ['aturan rantai'], description: '' }]

test('start gagal dengan Error biasa saat server tidak bisa dihubungi', async () => {
  const { src } = setup()
  const started = src.start(CONCEPTS)
  FakeSocket.last.onerror?.()
  await expect(started).rejects.toThrow('Server ASR')
  expect(FakeSocket.last.url).toBe('ws://localhost:5173/ws/transcribe')
})

test('daftar konsep dikirim sebelum audio, pesan server diteruskan, dan koneksi ditutup saat mic ditolak', async () => {
  // Mic ditolak setelah koneksi terbuka, supaya start berhenti sebelum butuh AudioContext.
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: () => Promise.reject(new DOMException('', 'NotAllowedError')) } })
  const { src, msgs } = setup()
  const started = src.start(CONCEPTS)
  const ws = FakeSocket.last
  ws.onmessage?.({ data: JSON.stringify({ type: 'status', state: 'listening' }) })
  ws.readyState = 1
  ws.onopen?.()
  await expect(started).rejects.toMatchObject({ name: 'NotAllowedError' })
  expect(ws.sent).toEqual([JSON.stringify({ type: 'start', concepts: CONCEPTS })])
  expect(msgs).toEqual([{ type: 'status', state: 'listening' }])
  expect(ws.readyState).toBe(3) // koneksi ditutup saat mic ditolak
})
