import { Link } from 'react-router'
import { AppBar } from '../components/app-bar'
import { LaptopIcon } from '../components/chalk'
import { Kapur } from '../components/kapur'
import { StatusIcon } from '../components/marks'
import { MARK_LABEL } from '../lib/format'

const STEPS = ['Siapkan topik', 'Jelaskan 2–5 menit', 'Baca feedback', 'Jelaskan ulang'] as const
const STEP_COLORS: [string, string][] = [
  ['#FFE27A', '#FF9F43'],
  ['#9FDBFF', '#4B7BFF'],
  ['#FFC1D3', '#FF5A8A'],
  ['#B8F5D6', '#12B886'],
]

export default function HomeScreen() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar title="Feynman Speech Coach" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-14 px-5 pb-14 pt-6 md:px-8">
        <section aria-labelledby="judul-beranda" className="grid items-center gap-36 md:grid-cols-2 md:gap-14">
          <div>
            <h2 id="judul-beranda" className="text-[2.6rem] font-bold leading-[1.05] tracking-[-0.02em] md:text-[3.6rem]">
              Belajar dengan menjelaskan
            </h2>
            <p className="mt-5 max-w-[26rem] text-lg leading-relaxed text-ink-2 md:text-xl">
              Jelaskan satu topik kuliah dengan suaramu. Empur mendengarkan, lalu memberi feedback.
            </p>
            <Link to="/setup" className="btn btn-go mt-9 w-full max-w-72 text-lg">
              Mulai sesi
            </Link>
            <p className="mt-4 flex items-start gap-2 text-sm leading-snug text-ink-3">
              <LaptopIcon className="size-5 shrink-0" />
              Suaramu tetap di laptop. Hanya teks yang dikirim ke Gemini.
            </p>
          </div>
          <AgendaPreview />
        </section>

        <ol aria-label="Satu sesi, empat tahap" className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-col items-center gap-3 rounded-[22px] bg-card px-4 py-5 text-center">
              <StepIcon i={i} className="size-12" />
              <p className="font-semibold leading-snug">
                <span className="mr-1.5 text-ink-3">
                  <span className="sr-only">Tahap </span>
                  {i + 1}
                </span>
                {s}
              </p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  )
}

// Contoh agenda, supaya user pertama langsung melihat apa yang dilakukan Empur saat sesi.
// Status dibedakan lewat ikon dan label, bukan warna saja.
const SAMPLE = [
  { name: 'Forward pass', status: 'explained' },
  { name: 'Loss function', status: 'mentioned' },
  { name: 'Chain rule', status: 'none' },
] as const

function AgendaPreview() {
  return (
    <figure className="relative md:ml-10 lg:ml-24 xl:ml-32">
      {/* Layar sempit: Empur berdiri di sudut kiri atas kartu, kakinya masuk sedikit ke kartu, di samping
          keterangan. Dari 1024px: Empur berdiri di samping kiri kartu, sejajar dasar kartu, dengan balon
          di atas kepalanya, jadi ia tetap di tengah layar dan tidak naik ke dekat bilah atas. */}
      <div className="absolute -left-2 -top-[9.5rem] z-10 flex items-start gap-1 md:-left-10 lg:-bottom-6 lg:-left-32 lg:top-auto xl:-left-40 lg:flex-col-reverse lg:items-center lg:gap-1">
        <Kapur mood="wave" className="h-48 w-40 shrink-0 lg:h-40 lg:w-32 xl:h-48 xl:w-40" />
        <p className="bubble mt-8 whitespace-nowrap rounded-2xl border border-line bg-surface px-4 py-2 font-medium shadow-[0_10px_30px_-18px_rgba(0,0,0,0.5)] lg:mt-0">
          Halo, aku Empur!
        </p>
      </div>
      <div className="rounded-[28px] border border-line bg-surface p-5 shadow-[0_24px_60px_-36px_rgba(22,22,29,0.35)] md:p-7 lg:px-5 xl:px-7">
        <figcaption className="text-right text-sm font-medium text-ink-3">Contoh agenda</figcaption>
        <ul className="mt-3 flex flex-col gap-2.5">
          {SAMPLE.map((c) => (
            <li key={c.name} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3.5">
              <StatusIcon status={c.status} />
              <span className="text-lg font-semibold">{c.name}</span>
              <span className="ml-auto text-sm text-ink-3">{MARK_LABEL[c.status]}</span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}

// Ikon tahap: bentuk datar bergradasi, tanpa garis luar, sama dengan gaya Empur.
function StepIcon({ i, className = '' }: { i: number; className?: string }) {
  const [a, b] = STEP_COLORS[i]
  const id = `step-${i}`
  const g = `url(#${id})`
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      {i === 0 && (
        <>
          <rect x="9" y="5" width="22" height="30" rx="5" fill={g} />
          <rect x="14" y="13" width="12" height="3" rx="1.5" fill="#fff" opacity="0.85" />
          <rect x="14" y="19" width="12" height="3" rx="1.5" fill="#fff" opacity="0.85" />
          <rect x="14" y="25" width="7" height="3" rx="1.5" fill="#fff" opacity="0.85" />
        </>
      )}
      {i === 1 && (
        <>
          <rect x="14" y="4" width="12" height="21" rx="6" fill={g} />
          <path d="M9 19a11 11 0 0 0 22 0" fill="none" stroke={b} strokeWidth="3.4" strokeLinecap="round" />
          <rect x="18.3" y="29" width="3.4" height="7" rx="1.7" fill={b} />
        </>
      )}
      {i === 2 && (
        <>
          <rect x="5" y="9" width="30" height="22" rx="5" fill={g} />
          <path d="M7 12l13 10 13-10" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {i === 3 && (
        <>
          <path d="M29 14a11 11 0 1 0 2 9" fill="none" stroke={g} strokeWidth="5" strokeLinecap="round" />
          <path d="M24 7l8 1-2 8Z" fill={b} />
        </>
      )}
    </svg>
  )
}
