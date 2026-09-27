import type { ConceptStatus, FluencyMessage, ServerMessage, StatusMessage } from '../types/server-message'

export type LiveState = {
  status: StatusMessage['state']
  confirmed: string
  partial: string
  latencyMs: number | null
  concepts: Record<string, ConceptStatus>
  wpm: number
  fillerCount: number
  pauses: NonNullable<FluencyMessage['long_pause']>[]
}

export type LiveAction = ServerMessage | { type: 'reset' }

export const initialLiveState: LiveState = {
  status: 'idle',
  confirmed: '',
  partial: '',
  latencyMs: null,
  concepts: {},
  wpm: 0,
  fillerCount: 0,
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
    case 'concept':
      // Status hanya naik: konsep yang sudah dijelaskan tidak turun lagi jadi disebut.
      if (state.concepts[action.concept_id] === 'explained') return state
      return { ...state, concepts: { ...state.concepts, [action.concept_id]: action.status } }
    case 'fluency':
      return {
        ...state,
        wpm: action.wpm,
        fillerCount: action.filler_count,
        pauses: action.long_pause ? [...state.pauses, action.long_pause] : state.pauses,
      }
  }
}
