import { useEffect, useReducer, useState } from 'react'
import { Link } from 'react-router'
import { initialLiveState, liveReducer } from '../lib/live-state'
import type { TranscriptSource } from '../lib/transcript-source'
import { BACKPROP_CONCEPTS, BACKPROP_TOPIC } from '../mocks/backprop'
import { MockTranscriptSource } from '../mocks/mock-transcript-source'

// Label teks, bukan hanya warna (CLAUDE.md).
const CONCEPT_LABEL = { none: 'Belum', mentioned: 'Disebut', explained: 'Dijelaskan' }
const STATUS_LABEL = { idle: 'Tidak aktif', listening: 'Mendengarkan', processing: 'Memproses' }

const num = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 1 })

export default function LiveScreen() {
  // ponytail: sumber dan konsep masih mock; Fase 1 ganti ke WebSocket, Fase 4 ke daftar konsep dari setup.
  const [source] = useState<TranscriptSource>(() => new MockTranscriptSource())
  const [state, dispatch] = useReducer(liveReducer, initialLiveState)

  useEffect(() => {
    const off = source.onMessage(dispatch)
    return () => {
      off()
      source.stop()
    }
  }, [source])

  const start = () => {
    dispatch({ type: 'reset' })
    void source.start()
  }
  const lastPause = state.pauses.at(-1)

  return (
    <main>
      <h1>Menjelaskan: {BACKPROP_TOPIC}</h1>

      <button onClick={start} disabled={state.status !== 'idle'}>
        Mulai
      </button>
      <button onClick={() => source.stop()} disabled={state.status !== 'listening'}>
        Berhenti
      </button>

      <section>
        <h2>Indikator</h2>
        <ul>
          <li>Status: {STATUS_LABEL[state.status]}</li>
          <li>Latency: {state.latencyMs === null ? '–' : `${state.latencyMs} ms`}</li>
          <li>Kecepatan bicara: {state.wpm} kata/menit</li>
          <li>Filler: {state.fillerCount}</li>
          <li>
            Jeda panjang: {state.pauses.length}
            {lastPause && ` (terakhir ${num(lastPause.duration)} detik, mulai detik ${num(lastPause.start)})`}
          </li>
        </ul>
      </section>

      <section>
        <h2>Checklist konsep</h2>
        <ul>
          {BACKPROP_CONCEPTS.map((c) => (
            <li key={c.id}>
              {c.name}: {CONCEPT_LABEL[state.concepts[c.id] ?? 'none']}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Transkrip</h2>
        <p>
          {state.confirmed} <i>{state.partial}</i>
        </p>
      </section>

      {state.status === 'idle' && state.confirmed && <Link to="/feedback">Lihat feedback</Link>}
    </main>
  )
}
