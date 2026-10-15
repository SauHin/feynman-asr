import type { ClientMessage } from '../types/client-message'
import type { Concept } from '../types/feedback'
import type { ServerMessage } from '../types/server-message'
import type { TranscriptSource } from './transcript-source'

// Worklet mengumpulkan sampel mic menjadi potongan PCM int16 100 ms (1600 sampel di 16 kHz).
const WORKLET = `
registerProcessor('pcm-chunker', class extends AudioWorkletProcessor {
  buf = new Int16Array(1600)
  n = 0
  process([input]) {
    for (const s of input[0] ?? []) {
      this.buf[this.n++] = Math.max(-1, Math.min(1, s)) * 0x7fff
      if (this.n === this.buf.length) {
        this.port.postMessage(this.buf.buffer, [this.buf.buffer])
        this.buf = new Int16Array(1600)
        this.n = 0
      }
    }
    return true
  }
})`

// Sumber transkrip dari backend lokal (backend/app.py) lewat /ws/transcribe, diteruskan oleh proxy Vite.
export class WebSocketTranscriptSource implements TranscriptSource {
  private handlers = new Set<(msg: ServerMessage) => void>()
  private ws: WebSocket | null = null
  private mic: MediaStream | null = null
  private ctx: AudioContext | null = null

  // Gagal dengan DOMException NotAllowedError/NotFoundError dari mic, atau Error biasa bila server mati.
  async start(concepts: Concept[]) {
    this.close()
    try {
      const ws = await this.connect()
      this.send(ws, { type: 'start', concepts })
      // PLAN 8.3: pemrosesan suara browser dimatikan, supaya audionya sama dengan rekaman eksperimen.
      this.mic = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      // shortcut: browser me-resample mic ke 16 kHz lewat AudioContext. Firefox menolak ini;
      // pindahkan resample ke worklet bila Firefox perlu didukung.
      this.ctx = new AudioContext({ sampleRate: 16000 })
      const url = URL.createObjectURL(new Blob([WORKLET], { type: 'text/javascript' }))
      await this.ctx.audioWorklet.addModule(url)
      URL.revokeObjectURL(url)
      await this.ctx.resume()
      const chunker = new AudioWorkletNode(this.ctx, 'pcm-chunker')
      chunker.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(e.data)
      }
      // Keluaran worklet hening. Disambung ke speaker supaya browser tetap menjalankannya.
      this.ctx.createMediaStreamSource(this.mic).connect(chunker).connect(this.ctx.destination)
    } catch (err) {
      this.close()
      throw err
    }
  }

  // Server membalas "processing", transkrip akhir, lalu "idle", kemudian menutup koneksi.
  stop() {
    this.releaseAudio()
    if (this.ws?.readyState === WebSocket.OPEN) this.send(this.ws, { type: 'stop' })
  }

  onMessage(handler: (msg: ServerMessage) => void) {
    this.handlers.add(handler)
    return () => {
      this.handlers.delete(handler)
    }
  }

  private connect() {
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/transcribe`)
    ws.binaryType = 'arraybuffer'
    this.ws = ws
    ws.onmessage = (e: MessageEvent<string>) => this.emit(JSON.parse(e.data) as ServerMessage)
    return new Promise<WebSocket>((resolve, reject) => {
      ws.onerror = () => reject(new Error('Server ASR tidak bisa dihubungi'))
      ws.onopen = () => {
        // Koneksi putus di tengah sesi: sesi dianggap selesai, supaya UI tidak tertahan di "Merekam".
        ws.onclose = () => {
          if (this.ws !== ws) return
          this.close()
          this.emit({ type: 'status', state: 'idle' })
        }
        resolve(ws)
      }
    })
  }

  private close() {
    this.releaseAudio()
    const ws = this.ws
    this.ws = null
    ws?.close()
  }

  private releaseAudio() {
    this.mic?.getTracks().forEach((t) => t.stop())
    this.mic = null
    void this.ctx?.close()
    this.ctx = null
  }

  private send(ws: WebSocket, msg: ClientMessage) {
    ws.send(JSON.stringify(msg))
  }

  private emit(msg: ServerMessage) {
    this.handlers.forEach((h) => h(msg))
  }
}
