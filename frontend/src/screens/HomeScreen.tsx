import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { AppBar } from '../components/app-bar'
import { CloudIcon, LaptopIcon, MicIcon } from '../components/chalk'
import { ClassroomWall } from '../components/classroom'
import { Kapur } from '../components/kapur'

const INKED = { stroke: 'currentColor', strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

const STEPS: { title: string; text: string; fill: string; doodle: ReactNode }[] = [
  {
    title: 'Siapkan topik',
    text: 'Tulis topiknya, unggah slide atau PDF kuliah kalau ada, lalu cek daftar konsepnya.',
    fill: 'bg-chalk-yellow',
    doodle: (
      <>
        <path d="M11 6h13l7 7v20a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill="#fff" {...INKED} />
        <path d="M24 6v7h7M14 20h12M14 25h12M14 30h7" fill="none" {...INKED} strokeWidth="2.6" />
      </>
    ),
  },
  {
    title: 'Jelaskan',
    text: 'Bicara 2–5 menit. Si Kapur mencentang konsep yang sudah kamu jelaskan.',
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
    text: 'Lihat konsep yang terlewat, kalimat yang keliru, dan bagian yang tersendat.',
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
    text: 'Coba lagi dengan daftar konsep yang sama, lalu bandingkan hasilnya.',
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

      <main className="relative flex flex-1 flex-col px-3 pb-14 pt-1 md:px-8 md:pb-7">
        <ClassroomWall />
        <Notebook />
      </main>
    </div>
  )
}

// Buku catatan terbuka: dua halaman kertas kotak-kotak dengan jilid spiral, di atas sampul biru.
function Notebook() {
  return (
    <div className="relative z-10 mx-auto my-auto w-full max-w-[64rem]">
      {/* Sampul yang mengintip di sisi dan bawah halaman */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-2 -bottom-4 top-3 hidden rounded-[26px] border-[3px] border-outline bg-chalk-blue shadow-[0_6px_0_rgba(0,0,0,0.15)] md:block dark:bg-[#7fb8dc]"
      />
      <div className="relative grid gap-5 md:grid-cols-2 md:gap-0">
        <Page side="left">
          <LeftPage />
        </Page>
        <Page side="right">
          <RightPage />
        </Page>
        <Spiral />
      </div>
    </div>
  )
}

function Page({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  const round = side === 'left' ? 'md:rounded-r-none md:border-r-0' : 'md:rounded-l-none md:border-l-0'
  return (
    <section
      className={`paper-grid relative flex flex-col rounded-[20px] border-[3px] border-outline py-7 pl-12 pr-5 text-paper-ink md:pl-[4.25rem] max-md:shadow-[0_6px_0_rgba(0,0,0,0.15)] md:py-7 md:pr-8 ${round}`}
    >
      {/* Garis margin koral */}
      <span aria-hidden="true" className="absolute inset-y-0 left-8 w-[2.5px] bg-paper-margin md:left-[3rem]" />
      {/* Lipatan tengah: pita datar yang sedikit lebih gelap di sisi jilid */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 hidden w-5 bg-black/[0.05] md:block ${side === 'left' ? 'right-0' : 'left-0'}`}
      />
      {children}
    </section>
  )
}

// Cincin spiral melintasi lipatan tengah. Hanya di layar lebar, saat dua halaman berdampingan.
function Spiral() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-5 left-1/2 hidden -translate-x-1/2 flex-col justify-between md:flex"
    >
      {Array.from({ length: 11 }, (_, i) => (
        <span key={i} className="relative block h-4 w-11 rounded-full border-[3px] border-outline bg-[#dfe7ee]">
          <span className="absolute left-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-outline" />
          <span className="absolute right-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-outline" />
        </span>
      ))}
    </div>
  )
}

function LeftPage() {
  return (
    <>
      <h2 className="font-display text-[2.6rem] font-semibold leading-[1.05] md:text-5xl">
        Belajar dengan <span className="highlight">menjelaskan</span>
      </h2>
      <p className="mt-4 max-w-[40ch] text-lg font-medium leading-relaxed">
        Di sini kamu berlatih menjelaskan satu topik kuliah dengan suaramu sendiri, seolah ke teman yang belum paham.
        Si Kapur mendengarkan, mencentang konsep yang sudah kamu jelaskan, lalu menulis catatan tentang yang terlewat,
        yang keliru, dan bagian yang tersendat.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link to="/setup" className="btn btn-go px-10 text-xl">
          Mulai sesi
        </Link>
        <p className="flex max-w-[15rem] items-center gap-2 text-sm leading-snug text-paper-ink-2">
          <MicIcon className="size-5 shrink-0" />
          Siapkan mikrofon dan ruangan yang cukup tenang.
        </p>
      </div>

      <div className="mt-8 flex items-end gap-2 md:mt-auto md:pt-4">
        {/* Di layar lebar Si Kapur bertengger di tepi luar buku, melewati garis luarnya. */}
        <Kapur
          mood="wave"
          className="-mb-2 h-28 w-20 shrink-0 md:absolute md:-bottom-3 md:-left-[5.5rem] md:z-20 md:mb-0 md:h-44 md:w-36"
        />
        <p className="bubble relative mb-12 max-w-[20rem] md:mb-16 rounded-2xl border-[3px] border-outline bg-white px-4 py-3 font-display text-[1.05rem] leading-snug text-paper-ink">
          Halo, aku Kapur! Kata Feynman, kalau bisa menjelaskan dengan sederhana, berarti kamu paham.
          <span
            aria-hidden="true"
            className="absolute -left-[11px] bottom-4 size-4 rotate-45 border-b-[3px] border-l-[3px] border-outline bg-white"
          />
        </p>
      </div>
    </>
  )
}

function RightPage() {
  return (
    <>
      <h2 className="font-display text-2xl font-semibold md:text-[1.7rem]">Satu sesi, empat tahap</h2>
      <ol className="mt-4 flex flex-col gap-3.5">
        {STEPS.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[3.25rem_1fr] gap-4">
            <span
              aria-hidden="true"
              className={`relative grid size-13 place-items-center rounded-2xl border-[3px] border-outline text-outline shadow-[0_3px_0_var(--outline)] ${s.fill}`}
            >
              <svg viewBox="0 0 40 40" className="size-9">
                {s.doodle}
              </svg>
              <span className="absolute -left-2.5 -top-2.5 grid size-6 place-items-center rounded-full border-[2.5px] border-outline bg-white font-display text-sm font-semibold text-paper-ink">
                {i + 1}
              </span>
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold leading-tight">
                <span className="sr-only">Tahap {i + 1}: </span>
                {s.title}
              </h3>
              <p className="mt-0.5 text-[0.98rem] leading-snug text-paper-ink-2">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Catatan tempel: apa yang tetap lokal dan apa yang dikirim ke Gemini */}
      <aside
        aria-labelledby="privasi-title"
        className="relative mt-6 -rotate-1 rounded-lg border-[3px] border-outline bg-[#fff6c4] px-4 pb-3.5 pt-4 shadow-[0_4px_0_rgba(0,0,0,0.12)] dark:bg-[#ece2b3]"
      >
        <span
          aria-hidden="true"
          className="absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2 rounded-sm border-2 border-outline bg-chalk-blue/80"
        />
        <h3 id="privasi-title" className="font-display text-lg font-semibold">
          Apa yang keluar dari laptopmu?
        </h3>
        <dl className="mt-1.5 flex flex-col gap-1.5 text-[0.95rem] leading-snug">
          <div className="flex gap-2.5">
            <dt className="flex shrink-0 items-start gap-1.5 pt-px font-display font-semibold">
              <LaptopIcon className="size-5" />
              <span className="sr-only">Tetap di laptopmu:</span>
            </dt>
            <dd>
              <strong className="font-bold">Suaramu tetap di laptop.</strong> Transkripsi, jeda, dan filler dihitung di
              sini.
            </dd>
          </div>
          <div className="flex gap-2.5">
            <dt className="flex shrink-0 items-start gap-1.5 pt-px font-display font-semibold">
              <CloudIcon className="size-5" />
              <span className="sr-only">Dikirim ke Gemini:</span>
            </dt>
            <dd>
              <strong className="font-bold">Hanya teks yang dikirim ke Gemini:</strong> transkrip, daftar konsep, dan
              materi. Gemini versi gratis bisa memakai teks itu untuk meningkatkan layanan Google.
            </dd>
          </div>
        </dl>
      </aside>
    </>
  )
}
