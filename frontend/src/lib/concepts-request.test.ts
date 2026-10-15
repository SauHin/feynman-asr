import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConceptError, requestConcepts } from './concepts-request'

describe('requestConcepts', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('memanggil backend sekali per permintaan dan percobaan', async () => {
    const fetch = vi.fn(() => Promise.resolve(new Response('[]')))
    vi.stubGlobal('fetch', fetch)
    const req = { topic: 'Backpropagation', file: new File(['x'], 'kuliah.pdf'), pages: [1, 2, 5] }
    await requestConcepts(req)
    await requestConcepts(req) // efek kedua StrictMode
    expect(fetch).toHaveBeenCalledTimes(1)
    await requestConcepts(req, 1) // tombol "Coba lagi"
    expect(fetch).toHaveBeenCalledTimes(2)
    const body = (fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as FormData
    expect(body.get('pages')).toBe('1,2,5')
    expect((body.get('file') as File).name).toBe('kuliah.pdf')
  })

  it.each([
    [new Response('{"detail": "Materinya cuma punya 3 halaman."}', { status: 422 }), 'material', 'Materinya cuma punya 3 halaman.'],
    [new Response('{"detail": [{"loc": ["body", "topic"]}]}', { status: 422 }), 'material', ''],
    [new Response('{"detail": "Ekstraksi konsep gagal."}', { status: 502 }), 'gemini', 'Ekstraksi konsep gagal.'],
    [new Response('', { status: 502 }), 'server', ''], // proxy Vite saat backend mati
  ])('membedakan penyebab gagal (%#)', async (response, kind, message) => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(response)))
    await expect(requestConcepts({ topic: 'x' })).rejects.toEqual(new ConceptError(kind as ConceptError['kind'], message))
  })

  it('menganggap backend mati kalau fetch gagal', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))))
    await expect(requestConcepts({ topic: 'x' })).rejects.toMatchObject({ kind: 'server' })
  })
})
