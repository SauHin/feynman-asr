import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionResult } from '../types/feedback'
import { requestFeedback } from './feedback-request'

const session = (): SessionResult => ({
  topic: 'Backpropagation',
  concepts: [],
  transcript: { text: 'jadi chain rule itu', pauses: [] },
  fluency: { duration: 10, wpm: 120, filler_count: 0, long_pauses: [] },
  liveStatus: {},
})

describe('requestFeedback', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('memanggil backend sekali per sesi dan percobaan', async () => {
    const fetch = vi.fn(() => Promise.resolve(new Response('{"strengths": []}')))
    vi.stubGlobal('fetch', fetch)
    const s = session()
    await requestFeedback(s)
    await requestFeedback(s) // efek kedua StrictMode
    expect(fetch).toHaveBeenCalledTimes(1)
    await requestFeedback(s, 1) // tombol "Coba lagi"
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(JSON.parse((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as string).transcript).toBe(
      'jadi chain rule itu',
    )
  })

  it('gagal saat backend membalas error, supaya layar menampilkan feedback lokal', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{}', { status: 502 }))))
    await expect(requestFeedback(session())).rejects.toThrow('HTTP 502')
  })
})
