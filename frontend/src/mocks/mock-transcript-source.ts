import type { TranscriptSource } from '../lib/transcript-source'
import type { ServerMessage } from '../types/server-message'
import { BACKPROP_SCRIPT, type Utterance } from './backprop'

// Tiru perilaku backend: server mengirim update tiap 1 detik (interval inference),
// kata tampil sebagai partial lalu confirmed setelah LocalAgreement.
const PARTIAL_DELAY = 0.5
const CONFIRM_DELAY = 2
const PAUSE_THRESHOLD = 2
const FLUENCY_EVERY = 5
const STOP_FLUSH_MS = 500
// Heuristik leksikal seperti backend: "jadi" sebagai kata sambung ikut terhitung (PLAN 7.1).
export const FILLERS = new Set(['eee', 'jadi', 'gitu'])

// flush: teks final dari partial saat ini, dikirim sebagai confirmed bila stop() dipanggil.
export type ScheduledMessage = { at: number; msg: ServerMessage; flush?: string }

export function buildSchedule(script: Utterance[]): ScheduledMessage[] {
  const words = script.flatMap((u) => {
    const tokens = u.text.split(' ')
    const step = (u.end - u.start) / tokens.length
    return tokens.map((tok, i) => {
      const m = tok.match(/^\{(.+)\|(.+)\}(.*)$/)
      const end = u.start + step * (i + 1)
      return {
        partial: m ? m[1] + m[3] : tok,
        final: m ? m[2] + m[3] : tok,
        partialAt: end + PARTIAL_DELAY,
        confirmAt: end + CONFIRM_DELAY,
      }
    })
  })
  const pauses = script
    .slice(1)
    .map((u, i) => ({ start: script[i].end, duration: u.start - script[i].end }))
    .filter((p) => p.duration >= PAUSE_THRESHOLD)
  const isFiller = (w: string) => FILLERS.has(w.toLowerCase().replace(/[^\p{L}]/gu, ''))
  const inTick = (x: number, t: number) => x > t - 1 && x <= t

  const out: ScheduledMessage[] = [{ at: 0, msg: { type: 'status', state: 'listening' } }]
  const lastTick = Math.ceil(words[words.length - 1].confirmAt)
  let prevPartial = ''
  let confirmedCount = 0
  let fillerCount = 0

  for (let t = 1; t <= lastTick; t++) {
    const newly = words.filter((w) => inTick(w.confirmAt, t))
    const pending = words.filter((w) => w.partialAt <= t && w.confirmAt > t)
    const partial = pending.map((w) => w.partial).join(' ')
    if (newly.length || partial !== prevPartial) {
      out.push({
        at: t,
        msg: {
          type: 'transcript',
          confirmed: newly.map((w) => w.final).join(' '),
          partial,
          t,
          latency_ms: 400 + ((t * 137) % 500),
        },
        flush: pending.map((w) => w.final).join(' '),
      })
    }
    prevPartial = partial
    confirmedCount += newly.length
    fillerCount += newly.filter((w) => isFiller(w.final)).length

    for (const u of script) {
      if (!inTick(u.end + CONFIRM_DELAY, t)) continue
      for (const c of u.concepts ?? []) {
        out.push({ at: t, msg: { type: 'concept', concept_id: c.id, status: c.status, t } })
      }
    }

    const pause = pauses.find((p) => inTick(p.start + p.duration, t))
    if (pause || t % FLUENCY_EVERY === 0) {
      // Speech rate dihitung tanpa jeda.
      const spoken = script.reduce((s, u) => s + Math.max(0, Math.min(u.end, t) - u.start), 0)
      out.push({
        at: t,
        msg: {
          type: 'fluency',
          wpm: spoken ? Math.round((confirmedCount / spoken) * 60) : 0,
          filler_count: fillerCount,
          ...(pause && { long_pause: pause }),
          t,
        },
      })
    }
  }
  return out
}

const BACKPROP_SCHEDULE = buildSchedule(BACKPROP_SCRIPT)

export class MockTranscriptSource implements TranscriptSource {
  private handlers = new Set<(msg: ServerMessage) => void>()
  private timers: ReturnType<typeof setTimeout>[] = []
  private pending = { text: '', t: 0 }

  async start() {
    this.clearTimers()
    this.pending = { text: '', t: 0 }
    this.timers = BACKPROP_SCHEDULE.map(({ at, msg, flush }) =>
      setTimeout(() => {
        if (flush !== undefined) this.pending = { text: flush, t: at }
        this.emit(msg)
      }, at * 1000),
    )
  }

  // Tiru flush backend: sisa partial jadi confirmed, lalu sesi selesai.
  stop() {
    this.clearTimers()
    const { text, t } = this.pending
    this.pending = { text: '', t: 0 }
    this.emit({ type: 'status', state: 'processing' })
    this.timers.push(
      setTimeout(() => {
        if (text) this.emit({ type: 'transcript', confirmed: text, partial: '', t, latency_ms: STOP_FLUSH_MS })
        this.emit({ type: 'status', state: 'idle' })
      }, STOP_FLUSH_MS),
    )
  }

  onMessage(handler: (msg: ServerMessage) => void) {
    this.handlers.add(handler)
    return () => {
      this.handlers.delete(handler)
    }
  }

  private emit(msg: ServerMessage) {
    this.handlers.forEach((h) => h(msg))
  }

  private clearTimers() {
    this.timers.forEach(clearTimeout)
    this.timers = []
  }
}
