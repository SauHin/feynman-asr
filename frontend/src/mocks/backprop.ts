import type { Concept } from '../types/feedback'
import type { ConceptStatus } from '../types/server-message'

export type Utterance = {
  start: number
  end: number
  // Token "{cen|chain}" tampil sebagai "cen" saat partial dan "chain" saat confirmed.
  text: string
  // Dikirim setelah kata terakhir kalimat ini confirmed.
  concepts?: { id: string; status: ConceptStatus }[]
}

export const BACKPROP_TOPIC = 'Backpropagation'

export const BACKPROP_CONCEPTS: Concept[] = [
  {
    id: 'forward-pass',
    name: 'Forward pass',
    aliases: ['propagasi maju'],
    description: 'Input dialirkan lapis demi lapis melalui jaringan sampai menghasilkan prediksi.',
  },
  {
    id: 'loss-function',
    name: 'Loss function',
    aliases: ['fungsi loss', 'loss'],
    description: 'Fungsi yang mengukur seberapa jauh prediksi dari label yang benar.',
  },
  {
    id: 'chain-rule',
    name: 'Chain rule',
    aliases: ['aturan rantai'],
    description: 'Turunan fungsi komposisi adalah hasil kali turunan tiap bagiannya; dipakai untuk merambatkan error mundur.',
  },
  {
    id: 'gradient-descent',
    name: 'Gradient descent',
    aliases: ['gradient', 'gradien'],
    description: 'Weight digeser berlawanan arah gradient agar loss turun.',
  },
  {
    id: 'learning-rate',
    name: 'Learning rate',
    aliases: ['laju belajar'],
    description: 'Besar langkah perubahan weight pada setiap update.',
  },
]

// Satu-satunya jeda >= 2 detik ada di 37–41. learning-rate sengaja hanya disebut.
export const BACKPROP_SCRIPT: Utterance[] = [
  { start: 1, end: 7, text: 'Oke, jadi eee backpropagation itu algoritma buat melatih neural network.' },
  {
    start: 8, end: 11, text: 'Pertama ada forward pass,',
    concepts: [{ id: 'forward-pass', status: 'mentioned' }],
  },
  {
    start: 11.5, end: 19, text: 'input masuk ke network, dihitung layer demi layer sampai keluar prediksi.',
    concepts: [{ id: 'forward-pass', status: 'explained' }],
  },
  {
    start: 20, end: 25, text: 'Terus prediksinya dibandingin sama label pakai loss function, gitu.',
    concepts: [{ id: 'loss-function', status: 'mentioned' }],
  },
  {
    start: 26, end: 33, text: 'Loss itu angka yang ngukur seberapa jauh prediksi dari jawaban yang benar.',
    concepts: [{ id: 'loss-function', status: 'explained' }],
  },
  { start: 34, end: 37, text: 'Nah, eee, habis itu...' },
  {
    start: 41, end: 46, text: 'kita pakai {cen|chain} {rul|rule} buat ngitung gradient.',
    concepts: [
      { id: 'chain-rule', status: 'mentioned' },
      { id: 'gradient-descent', status: 'mentioned' },
    ],
  },
  {
    start: 46.5, end: 56,
    text: 'Chain rule itu turunan fungsi gabungan sama dengan hasil kali turunan tiap bagiannya, jadi error dirambatkan mundur dari output ke layer sebelumnya.',
    concepts: [{ id: 'chain-rule', status: 'explained' }],
  },
  { start: 57, end: 64, text: 'Jadi tiap weight dapet gradient-nya sendiri, eee, gitu.' },
  {
    start: 64.5, end: 78,
    text: 'Gradient itu nunjukin arah loss naik, jadi weight digeser ke arah sebaliknya supaya loss turun. Itu namanya gradient descent.',
    concepts: [{ id: 'gradient-descent', status: 'explained' }],
  },
  {
    start: 79, end: 86, text: 'Besarnya langkah diatur pakai learning rate.',
    concepts: [{ id: 'learning-rate', status: 'mentioned' }],
  },
  { start: 86.5, end: 90, text: 'Ya kurang lebih gitu sih.' },
]
