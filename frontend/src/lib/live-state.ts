import type { ConceptStatus, ServerMessage, StatusMessage } from '../types/server-message'

// offset: panjang teks confirmed saat jeda dilaporkan, untuk menandai jeda di transkrip.
export type Pause = { start: number; duration: number; offset: number }

export type LiveState = {
  status: StatusMessage['state']
  confirmed: string
  partial: string
  latencyMs: number | null
  concepts: Record<string, ConceptStatus>
  conceptEvents: { id: string; status: ConceptStatus; t: number }[]
  wpm: number
  fillerCount: number
  // Satu entri per filler baru, pada waktu pesan fluency yang melaporkannya.
  fillerTicks: number[]
  pauses: Pause[]
}

export type LiveAction = ServerMessage | { type: 'reset' }

export const initialLiveState: LiveState = {
  status: 'idle',
  confirmed: '',
  partial: '',
  latencyMs: null,
  concepts: {},
  conceptEvents: [],
  wpm: 0,
  fillerCount: 0,
  fillerTicks: [],
  pauses: [],
}

export function liveReducer(state: LiveState, action: LiveAction): LiveState {
  switch (action.type) {
    case 'reset':
      return initialLiveState
    case 'status':
      return { ...state, status: action.state }
    case 'transcript':
      return {
        ...state,
        confirmed: [state.confirmed, action.confirmed].filter(Boolean).join(' '),
        partial: action.partial,
        latencyMs: action.latency_ms,
      }
    case 'concept': {
      const current = state.concepts[action.concept_id]
      // Status hanya naik: konsep yang sudah dijelaskan tidak turun lagi jadi disebut.
      if (current === 'explained' || current === action.status) return state
      return {
        ...state,
        concepts: { ...state.concepts, [action.concept_id]: action.status },
        conceptEvents: [...state.conceptEvents, { id: action.concept_id, status: action.status, t: action.t }],
      }
    }
    case 'fluency': {
      const added = Math.max(0, action.filler_count - state.fillerCount)
      return {
        ...state,
        wpm: action.wpm,
        fillerCount: action.filler_count,
        fillerTicks: added ? [...state.fillerTicks, ...Array<number>(added).fill(action.t)] : state.fillerTicks,
        pauses: action.long_pause
          ? [...state.pauses, { ...action.long_pause, offset: state.confirmed.length }]
          : state.pauses,
      }
    }
  }
}
