import { useState } from 'react'
import { Kapur } from '../components/kapur'
import { MOOD_LABEL, TONES, type KapurMood, type KapurTone } from '../lib/kapur'

// Lembar pratinjau Empur: semua mood dalam setiap warna kandidat. Tangan bisa disembunyikan untuk
// menguji apakah mata saja sudah membawa ekspresi; pose mencentang hanya tampil bersama tangan.
const MOODS: KapurMood[] = ['wave', 'listen', 'happy', 'curious', 'confused', 'think', 'cheer']

export default function MascotScreen() {
  const [arms, setArms] = useState(false)
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Empur</h1>
        <button
          type="button"
          aria-pressed={arms}
          onClick={() => setArms(!arms)}
          className="rounded-full bg-white/10 px-4 py-2 font-display font-semibold"
        >
          {arms ? 'Sembunyikan tangan' : 'Tampilkan tangan'}
        </button>
      </div>
      {(Object.keys(TONES) as KapurTone[]).map((tone) => (
        <section key={tone} className="mt-10">
          <h2 className="font-display text-xl font-bold capitalize">{tone}</h2>
          <div className="mt-4 grid grid-cols-3 gap-6 sm:grid-cols-4 lg:grid-cols-8">
            {MOODS.map((mood) => (
              <figure key={mood} className="flex flex-col items-center gap-2 text-sm">
                <Kapur mood={mood} tone={tone} arms={arms} className="h-32 w-24" />
                <figcaption>{MOOD_LABEL[mood]}</figcaption>
              </figure>
            ))}
            {arms && (
              <figure className="flex flex-col items-center gap-2 text-sm">
                <Kapur mood="happy" tick quiet tone={tone} className="h-32 w-24" />
                <figcaption>mencentang</figcaption>
              </figure>
            )}
          </div>
        </section>
      ))}
    </main>
  )
}
