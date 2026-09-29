import { useState } from 'react'
import { Kapur } from '../components/kapur'
import { MOOD_LABEL, TONES, type KapurMood, type KapurTone } from '../lib/kapur'

// Lembar pratinjau Empur: panggung untuk menguji perpindahan antar-mood, lalu semua mood dalam setiap
// warna kandidat. Tangan bisa disembunyikan untuk menguji apakah mata saja sudah membawa ekspresi; pose
// mencentang hanya tampil bersama tangan.
const MOODS: KapurMood[] = ['wave', 'listen', 'happy', 'curious', 'confused', 'think', 'cheer']

export default function MascotScreen() {
  const [arms, setArms] = useState(false)
  const [stage, setStage] = useState<KapurMood | 'tick'>('wave')
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
      <section className="mt-8 flex flex-col items-center gap-6 rounded-[28px] bg-card p-6 sm:flex-row">
        <Kapur
          mood={stage === 'tick' ? 'happy' : stage}
          tick={stage === 'tick'}
          quiet={stage === 'tick'}
          arms={arms}
          className="h-48 w-40 shrink-0"
        />
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          {[...MOODS, 'tick' as const].map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={stage === m}
              onClick={() => setStage(m)}
              className="rounded-full bg-surface px-4 py-2 font-medium aria-pressed:bg-go aria-pressed:text-white"
            >
              {m === 'tick' ? 'mencentang' : MOOD_LABEL[m]}
            </button>
          ))}
        </div>
      </section>
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
