import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { AppBar } from '../components/app-bar'
import { LaptopIcon } from '../components/chalk'
import { ClassroomWall } from '../components/classroom'
import { Kapur } from '../components/kapur'

const INKED = { stroke: 'currentColor', strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

const STEPS: { title: string; fill: string; doodle: ReactNode }[] = [
  {
    title: 'Siapkan topik',
    fill: 'bg-chalk-yellow',
    doodle: (
      <>
        <path d="M11 6h13l7 7v20a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill="#fff" {...INKED} />
        <path d="M24 6v7h7M14 20h12M14 25h12M14 30h7" fill="none" {...INKED} strokeWidth="2.6" />
      </>
    ),
  },
  {
    title: 'Jelaskan 2–5 menit',
    fill: 'bg-chalk-blue',
    doodle: (
      <>
        <rect x="14.5" y="5" width="11" height="19" rx="5.5" fill="#fff" {...INKED} />
        <path d="M9.5 19a10.5 10.5 0 0 0 21 0M20 29.5v5M14.5 34.5h11" fill="none" {...INKED} />
      </>
    ),
  },
  {
    title: 'Baca catatan',
    fill: 'bg-chalk-pink',
    doodle: (
      <>
        <rect x="6" y="10" width="28" height="21" rx="3.5" fill="#fff" {...INKED} />
        <path d="M7.5 12.5 20 22l12.5-9.5" fill="none" {...INKED} />
      </>
    ),
  },
  {
    title: 'Jelaskan ulang',
    fill: 'bg-chalk-mint',
    doodle: (
      <path
        d="M30 17a10.5 10.5 0 0 0-19-3.5M10 23a10.5 10.5 0 0 0 19 3.5M10.5 7v7h7M29.5 33v-7h-7"
        fill="none"
        {...INKED}
      />
    ),
  },
]

export default function HomeScreen() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar title="Feynman Speech Coach" subtitle="Latihan menjelaskan dengan metode Feynman" />

      <main className="relative flex flex-1 flex-col px-4 pb-16 pt-6 md:px-8">
        <ClassroomWall />
        <div className="relative z-10 mx-auto my-auto w-full max-w-[40rem]">
          <NotebookPage />
          <StepPath />
        </div>
      </main>
    </div>
  )
}

// Selembar halaman buku catatan: kertas kotak-kotak, garis margin koral, jilid spiral di tepi atas,
// dan sampul biru yang mengintip di sisi dan bawah.
function NotebookPage() {
  return (
    <section aria-labelledby="judul-beranda" className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-x-2 -bottom-4 top-3 rounded-[26px] border-[3px] border-outline bg-chalk-blue shadow-[0_6px_0_rgba(0,0,0,0.15)] dark:bg-[#7fb8dc]"
      />
      <div className="paper-grid relative rounded-[20px] border-[3px] border-outline pb-9 pl-14 pr-6 pt-12 text-paper-ink md:pl-20 md:pr-12">
        <span aria-hidden="true" className="absolute inset-y-0 left-9 w-[2.5px] bg-paper-margin md:left-12" />
        <Spiral />
        <h2 id="judul-beranda" className="font-display text-[2.6rem] font-semibold leading-[1.05] md:text-5xl">
          Belajar dengan <span className="highlight">menjelaskan</span>
        </h2>
        <p className="mt-4 max-w-[36ch] text-lg font-medium leading-relaxed">
          Jelaskan satu topik kuliah dengan suaramu. Si Kapur mendengarkan, lalu memberi catatan.
        </p>
        <Link to="/setup" className="btn btn-go mt-7 px-10 text-xl">
          Mulai sesi
        </Link>
        <p className="mt-5 flex items-start gap-2 text-sm leading-snug text-paper-ink-2">
          <LaptopIcon className="size-5 shrink-0" />
          Suaramu tetap di laptop. Hanya teks yang dikirim ke Gemini.
        </p>
      </div>
    </section>
  )
}

// Cincin spiral melintasi tepi atas halaman.
function Spiral() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 -top-5 flex justify-between md:inset-x-12">
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          className={`relative block h-10 w-4 rounded-full border-[3px] border-outline bg-[#dfe7ee] ${i % 2 ? 'max-sm:hidden' : ''}`}
        >
          <span className="absolute left-1/2 top-1 size-1.5 -translate-x-1/2 rounded-full bg-outline" />
          <span className="absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-outline" />
        </span>
      ))}
    </div>
  )
}

// Jalur empat tahap seperti jalur pelajaran: ubin bulat bernomor yang disambung garis putus-putus.
// Vertikal di layar sempit, mendatar dari 768px.
function StepPath() {
  return (
    <div className="relative mt-14 flex flex-col gap-6 md:flex-row md:items-end xl:block">
      <Greeter />
      <ol aria-label="Satu sesi, empat tahap" className="relative grid flex-1 gap-5 md:grid-cols-4 md:gap-2">
        {/* Garis jalur melewati pusat ubin pertama sampai terakhir */}
        <span
          aria-hidden="true"
          className="absolute bottom-8 left-8 top-8 border-l-[3px] border-dashed border-outline md:bottom-auto dark:border-ink-2/60 md:left-[12.5%] md:right-[12.5%] md:border-l-0 md:border-t-[3px]"
        />
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative flex items-center gap-4 md:flex-col md:gap-3 md:text-center">
            <span
              aria-hidden="true"
              className={`relative grid size-16 shrink-0 place-items-center rounded-full border-[3px] border-outline text-outline shadow-[0_4px_0_var(--outline)] ${s.fill}`}
            >
              <svg viewBox="0 0 40 40" className="size-10">
                {s.doodle}
              </svg>
              <span className="absolute -left-1.5 -top-1.5 grid size-6 place-items-center rounded-full border-[2.5px] border-outline bg-white font-display text-sm font-semibold text-paper-ink">
                {i + 1}
              </span>
            </span>
            <span className="font-display text-lg font-semibold leading-tight">
              <span className="sr-only">Tahap {i + 1}: </span>
              {s.title}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

// Si Kapur menyapa di awal jalur. Dari 1280px ia berdiri di dinding kiri, dengan balon di atas kepalanya.
function Greeter() {
  return (
    <div className="flex items-end gap-2 xl:absolute xl:-left-52 xl:bottom-0 xl:w-44 xl:flex-col-reverse xl:items-center xl:gap-3">
      <Kapur mood="wave" className="h-28 w-20 shrink-0 xl:h-40 xl:w-32" />
      <p className="bubble relative mb-10 whitespace-nowrap rounded-2xl border-[3px] border-outline bg-white px-4 py-2.5 font-display text-lg leading-snug text-paper-ink xl:mb-0">
        Halo, aku Kapur!
        <span
          aria-hidden="true"
          className="absolute -left-[11px] bottom-3 size-4 rotate-45 border-b-[3px] border-l-[3px] border-outline bg-white xl:-bottom-[11px] xl:left-1/2 xl:-translate-x-1/2 xl:-rotate-45"
        />
      </p>
    </div>
  )
}
