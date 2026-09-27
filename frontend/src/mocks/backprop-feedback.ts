// Feedback contoh untuk sesi mock Backpropagation. Naskah buatan untuk mockup UI, bukan hasil Gemini
// atau data user, dan harus selalu dilabeli sebagai contoh (PRODUCT.md, Evidence on Hand).
import type { Pause } from '../lib/live-state'
import type { CoverageStatus, Feedback, FluencyReport } from '../types/feedback'
import type { ConceptStatus } from '../types/server-message'
import { BACKPROP_SCRIPT } from './backprop'
import { FILLERS } from './mock-transcript-source'

// Transkrip final dari naskah: token "{cen|chain}" menjadi "chain", jeda >= 2 detik di posisinya.
function finalTranscript() {
  let text = ''
  const pauses: Pause[] = []
  BACKPROP_SCRIPT.forEach((u, i) => {
    const prev = BACKPROP_SCRIPT[i - 1]
    if (prev && u.start - prev.end >= 2)
      pauses.push({ start: prev.end, duration: u.start - prev.end, offset: text.length })
    text += (text ? ' ' : '') + u.text.replace(/\{[^|}]+\|([^}]+)\}/g, '$1')
  })
  return { text, pauses }
}
export const BACKPROP_TRANSCRIPT = finalTranscript()

// Metrik akhir dihitung dari transkrip final, seperti backend setelah Stop.
// Kecepatan dihitung tanpa jeda, filler memakai heuristik leksikal yang sama dengan mock live.
const words = BACKPROP_TRANSCRIPT.text.split(/\s+/)
const spoken = BACKPROP_SCRIPT.reduce((s, u) => s + (u.end - u.start), 0)

export const BACKPROP_FLUENCY: FluencyReport = {
  duration: BACKPROP_SCRIPT.at(-1)!.end,
  wpm: Math.round((words.length / spoken) * 60),
  filler_count: words.filter((w) => FILLERS.has(w.toLowerCase().replace(/[^\p{L}]/gu, ''))).length,
  long_pauses: BACKPROP_TRANSCRIPT.pauses.map((p) => ({
    start: p.start,
    duration: p.duration,
    next_concept_id: 'chain-rule',
  })),
}

// Status akhir checklist live, dipakai saat analisis Gemini belum ada atau gagal.
export const BACKPROP_LIVE_STATUS: Record<string, ConceptStatus> = Object.fromEntries(
  BACKPROP_SCRIPT.flatMap((u) => u.concepts ?? []).map((c) => [c.id, c.status]),
)

export const BACKPROP_FEEDBACK: Feedback = {
  concept_coverage: [
    {
      concept_id: 'forward-pass',
      status: 'explained_correct',
      evidence: ['input masuk ke network, dihitung layer demi layer sampai keluar prediksi.'],
    },
    {
      concept_id: 'loss-function',
      status: 'explained_correct',
      evidence: ['Loss itu angka yang ngukur seberapa jauh prediksi dari jawaban yang benar.'],
    },
    {
      concept_id: 'chain-rule',
      status: 'explained_correct',
      evidence: [
        'Chain rule itu turunan fungsi gabungan sama dengan hasil kali turunan tiap bagiannya, jadi error dirambatkan mundur dari output ke layer sebelumnya.',
      ],
    },
    {
      concept_id: 'gradient-descent',
      status: 'explained_correct',
      evidence: ['Gradient itu nunjukin arah loss naik, jadi weight digeser ke arah sebaliknya supaya loss turun.'],
    },
    {
      concept_id: 'learning-rate',
      status: 'mentioned',
      evidence: ['Besarnya langkah diatur pakai learning rate.'],
    },
  ],
  factual_errors: [
    {
      statement: 'backpropagation itu algoritma buat melatih neural network.',
      correction:
        'Backpropagation menghitung gradient loss terhadap setiap weight. Yang mengubah weight adalah gradient descent, dengan memakai gradient itu.',
    },
  ],
  unexplained_jargon: [
    { term: 'weight', evidence: 'Jadi tiap weight dapet gradient-nya sendiri' },
    { term: 'label', evidence: 'prediksinya dibandingin sama label pakai loss function' },
  ],
  strengths: [
    'Alurnya runtut: forward pass, loss, chain rule, lalu gradient descent. Pendengar bisa mengikuti urutannya.',
    'Loss kamu jelaskan dengan bahasa sehari-hari: seberapa jauh prediksi dari jawaban yang benar.',
    'Chain rule kamu jelaskan dengan kalimatmu sendiri, bukan hanya disebut.',
  ],
  improvements: [
    'Jelaskan learning rate: apa yang terjadi kalau langkahnya terlalu besar atau terlalu kecil.',
    'Luruskan kalimat pembuka. Backpropagation menghitung gradient, sedangkan yang mengubah weight adalah gradient descent.',
    'Beri arti weight dan label sebelum kamu memakainya.',
  ],
  simplicity_note:
    'Teman yang belum belajar machine learning bisa mengikuti bagian forward pass dan loss. Bagian chain rule masih padat. Coba beri contoh dua fungsi kecil yang digabung, lalu tunjukkan cara turunannya dikalikan.',
}

// Sesi pertama yang dibandingkan saat keadaan "ulang".
export const BACKPROP_PREVIOUS: { coverage: Record<string, CoverageStatus>; fluency: FluencyReport } = {
  coverage: {
    'forward-pass': 'explained_correct',
    'loss-function': 'mentioned',
    'chain-rule': 'not_covered',
    'gradient-descent': 'explained_incorrect',
    'learning-rate': 'not_covered',
  },
  fluency: {
    duration: 74,
    wpm: 88,
    filler_count: 11,
    long_pauses: [
      { start: 12, duration: 3.1, next_concept_id: 'loss-function' },
      { start: 30, duration: 4.6, next_concept_id: 'gradient-descent' },
      { start: 52, duration: 2.4 },
    ],
  },
}
