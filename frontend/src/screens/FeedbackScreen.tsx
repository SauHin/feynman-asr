import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AppBar, MockStateSwitch } from '../components/app-bar'
import { Board, Panel, PanelTitle, PausePill } from '../components/board'
import {
  ChalkDefs,
  ChalkMark,
  ChevronIcon,
  ClockIcon,
  FillerIcon,
  PauseIcon,
  RetryIcon,
  SpeedIcon,
} from '../components/chalk'
import { ClassroomWall } from '../components/classroom'
import { Kapur } from '../components/kapur'
import { useMockState } from '../lib/mock-state'
import { clock, decimal } from '../lib/format'
import { buildSegments } from '../lib/transcript-segments'
import { BACKPROP_CONCEPTS, BACKPROP_TOPIC } from '../mocks/backprop'
import {
  BACKPROP_FEEDBACK,
  BACKPROP_FLUENCY,
  BACKPROP_LIVE_STATUS,
  BACKPROP_PREVIOUS,
  BACKPROP_TRANSCRIPT,
} from '../mocks/backprop-feedback'
import { FILLERS } from '../mocks/mock-transcript-source'
import type { Concept, CoverageStatus, Feedback, FluencyReport } from '../types/feedback'

const STATES = ['lengkap', 'memuat', 'gagal', 'ulang'] as const
type View = (typeof STATES)[number]

type Mark = 'none' | 'mentioned' | 'explained' | 'wrong'
const COVERAGE_MARK: Record<CoverageStatus, Mark> = {
  not_covered: 'none',
  mentioned: 'mentioned',
  explained_correct: 'explained',
  explained_incorrect: 'wrong',
}
// Kata yang sama dengan agenda live, ditambah tanda keempat yang hanya ada di feedback.
const MARK_TEXT: Record<Mark, string> = {
  none: 'belum',
  mentioned: 'disebut',
  explained: 'dijelaskan',
  wrong: 'dijelaskan keliru',
}
// Di atas kertas krem, tanda memakai versi pekat dari warna kapur.
const PAPER_MARK: Record<Mark, string> = {
  none: 'text-mark-none',
  mentioned: 'text-paper-ink',
  explained: 'text-mark-explained',
  wrong: 'text-mark-wrong',
}
// Di atas chip (putih siang, navy malam), tanda kembali ke warna kapur saat malam.
const CHIP_MARK: Record<Mark, string> = {
  none: 'text-mark-none dark:text-chalk-yellow',
  mentioned: 'text-ink',
  explained: 'text-mark-explained dark:text-chalk-mint',
  wrong: 'text-mark-wrong dark:text-[#ff9a8f]',
}

// Penanda <details> bawaan disembunyikan, diganti ikon chevron yang berputar saat terbuka.
const SUMMARY = 'cursor-pointer list-none [&::-webkit-details-marker]:hidden'

export default function FeedbackScreen() {
  const view = useMockState(STATES)
  const [, setParams] = useSearchParams()
  const concepts = BACKPROP_CONCEPTS
  const fluency = BACKPROP_FLUENCY
  const feedback = view === 'memuat' || view === 'gagal' ? null : BACKPROP_FEEDBACK
  const previous = view === 'ulang' ? BACKPROP_PREVIOUS : null
  const [sidebar, sidebarTop] = useStickyTop<HTMLElement>(16)

  return (
    <div className="flex min-h-dvh flex-col">
      <ChalkDefs />
      <AppBar
        back={{ to: '/', label: 'Kembali ke beranda' }}
        title={`Catatan: ${BACKPROP_TOPIC}`}
        subtitle={`Contoh, bukan hasil nyata · sesi ke-${previous ? 2 : 1}`}
      >
        <MockStateSwitch
          options={[
            { value: 'lengkap', label: 'Lengkap' },
            { value: 'memuat', label: 'Memuat' },
            { value: 'gagal', label: 'Gemini gagal' },
            { value: 'ulang', label: 'Sesi ke-2' },
          ]}
        />
      </AppBar>

      <main className="relative flex-1 px-3 pb-20 pt-2 md:px-8">
        <ClassroomWall elapsed={fluency.duration} />
        <div className="relative z-10 mx-auto grid max-w-[68rem] gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Letter
            view={view}
            concepts={concepts}
            feedback={feedback}
            previous={previous}
            onRetry={() => setParams({ keadaan: 'memuat' })}
          />
          {/* Kolom kanan ikut turun saat surat dibaca, tanpa scroll sendiri. Kalau lebih tinggi dari layar,
              kolom ini ikut tergulir bersama halaman sampai bagian bawahnya terlihat, lalu berhenti di situ. */}
          <aside
            ref={sidebar}
            style={{ top: sidebarTop }}
            className="flex flex-col gap-6 lg:sticky lg:self-start"
            aria-label="Kelancaran dan langkah berikutnya"
          >
            <FluencyCard fluency={fluency} previous={previous?.fluency} concepts={concepts} />
            {previous && feedback && <ComparisonCard concepts={concepts} previous={previous} current={feedback} />}
            <div className="flex flex-col gap-3">
              <Link to="/live" className="btn btn-go w-full text-xl">
                Jelaskan ulang
              </Link>
              <p className="text-center text-sm text-ink-2">Dengan {concepts.length} konsep yang sama.</p>
              <Link
                to="/setup"
                className="self-center rounded-lg font-display text-ink-2 underline decoration-2 underline-offset-4 hover:text-ink"
              >
                Ganti topik
              </Link>
            </div>
          </aside>
        </div>

        <TranscriptAppendix concepts={concepts} />
      </main>
    </div>
  )
}

// Jarak atas untuk kolom sticky. Kalau kolom muat di layar, ia menempel di atas.
// Kalau lebih tinggi dari layar, jaraknya negatif, jadi kolom menempel dengan bagian bawahnya terlihat.
function useStickyTop<T extends HTMLElement>(gap: number) {
  const ref = useRef<T>(null)
  const [top, setTop] = useState(gap)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setTop(Math.min(gap, window.innerHeight - el.offsetHeight - gap))
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    update()
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [gap])
  return [ref, top] as const
}

// Surat dari Si Kapur, di selembar kertas yang disobek dari buku catatan.
// Urutannya: ringkasan, yang perlu diperbaiki, yang sudah bagus, lalu rincian.
function Letter({
  view,
  concepts,
  feedback,
  previous,
  onRetry,
}: {
  view: View
  concepts: Concept[]
  feedback: Feedback | null
  previous: typeof BACKPROP_PREVIOUS | null
  onRetry: () => void
}) {
  const coverage = feedback?.concept_coverage
  const markOf = (id: string): Mark => {
    const c = coverage?.find((x) => x.concept_id === id)
    if (c) return COVERAGE_MARK[c.status]
    const live = BACKPROP_LIVE_STATUS[id]
    return live ?? 'none'
  }
  const mood = view === 'gagal' ? 'confused' : view === 'memuat' ? 'think' : 'proud'

  return (
    <article className="relative rounded-[20px] border-[3px] border-outline bg-paper px-6 pb-10 pt-10 text-paper-ink shadow-[0_6px_0_rgba(0,0,0,0.15)] md:px-12">
      {/* Si Kapur berdiri di tepi kiri surat: bangga, sedang menulis, atau bingung. */}
      {/* Posisinya agak turun supaya tidak menabrak jam dinding di pojok kiri atas. */}
      <Kapur mood={mood} className="absolute -left-28 top-48 z-20 hidden h-40 w-32 xl:block" />
      {/* Lubang spiral: halaman ini disobek dari buku catatan di beranda. */}
      <div aria-hidden="true" className="absolute inset-x-6 top-4 flex justify-between md:inset-x-12">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="size-3 rounded-full border-2 border-outline bg-wall" />
        ))}
      </div>

      <Greeting view={view} onRetry={onRetry} />
      {feedback && <Score marks={concepts.map((c) => markOf(c.id))} feedback={feedback} previous={previous} />}

      {view === 'memuat' && (
        <>
          <Section title="Yang perlu diperbaiki dulu" hl="var(--color-chalk-yellow)">
            <Writing label="Empur sedang menulis bagian ini" />
          </Section>
          <Section title="Yang sudah bagus" hl="var(--color-chalk-mint)">
            <Writing label="Empur sedang menulis bagian ini" />
          </Section>
        </>
      )}

      {feedback && (
        <>
          <Section title="Yang perlu diperbaiki dulu" hl="var(--color-chalk-yellow)">
            <ol className="flex flex-col gap-3 text-lg leading-relaxed">
              {feedback.improvements.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-[2.5px] border-outline bg-chalk-yellow font-display text-base font-semibold">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </Section>
          <Section title="Yang sudah bagus" hl="var(--color-chalk-mint)">
            <ul className="flex flex-col gap-3 text-lg leading-relaxed">
              {feedback.strengths.map((s) => (
                <li key={s} className="flex gap-3">
                  <Star className="mt-1 size-6 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}

      {view !== 'gagal' && <Divider label="Rincian" />}

      <Section title="Cakupan konsep" hl="var(--color-chalk-blue)">
        <p className="max-w-[60ch] text-paper-ink-2">
          {feedback
            ? 'Diperiksa ulang oleh Gemini dari teks transkrip. Istilah yang salah tulis di kutipan adalah kesalahan transkripsi, bukan kesalahanmu.'
            : view === 'memuat'
              ? 'Ini hasil checklist live. Gemini sedang memeriksanya ulang.'
              : 'Belum diperiksa Gemini, jadi anggap hasil checklist live ini sebagai perkiraan.'}
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {concepts.map((c) => {
            const mark = markOf(c.id)
            const evidence = coverage?.find((x) => x.concept_id === c.id)?.evidence ?? []
            const name = (
              <>
                <span className="font-display text-xl font-semibold">{c.name}</span>
                <span className="text-paper-ink-2">{MARK_TEXT[mark]}</span>
              </>
            )
            return (
              <li key={c.id} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3">
                <ChalkMark status={mark} className={`size-9 ${PAPER_MARK[mark]}`} />
                {evidence.length > 0 ? (
                  // Kutipan konsep yang sudah benar dilipat. Yang baru disebut atau keliru langsung terbuka.
                  <details open={mark !== 'explained'} className="group pt-1">
                    <summary className={`flex flex-wrap items-baseline gap-x-2 rounded-lg ${SUMMARY}`}>
                      {name}
                      <span className="ml-auto flex items-center gap-1 self-center font-display text-sm text-paper-ink-2">
                        kutipan
                        <ChevronIcon className="size-4 transition-transform group-open:rotate-90" />
                      </span>
                    </summary>
                    {evidence.map((e) => (
                      <Quote key={e}>{e}</Quote>
                    ))}
                  </details>
                ) : (
                  <p className="flex flex-wrap items-baseline gap-x-2 pt-1">{name}</p>
                )}
              </li>
            )
          })}
        </ul>
      </Section>

      {view === 'memuat' && (
        <Section title="Isi dan istilah" hl="var(--color-chalk-pink)">
          <Writing label="Kesalahan isi, istilah, dan catatan kesederhanaan menyusul" />
        </Section>
      )}

      {feedback && (
        <>
          {feedback.factual_errors.length > 0 && (
            <Section title="Yang keliru" hl="var(--color-chalk-pink)">
              <div className="flex flex-col gap-7">
                {feedback.factual_errors.map((e) => (
                  <div key={e.statement} className="flex flex-col gap-3">
                    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3">
                      <ChalkMark status="wrong" className={`size-9 ${PAPER_MARK.wrong}`} />
                      <div className="pt-1">
                        <p className="text-paper-ink-2">Kalimatmu</p>
                        <Quote>{e.statement}</Quote>
                      </div>
                    </div>
                    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3">
                      <ChalkMark status="explained" className={`size-9 ${PAPER_MARK.explained}`} />
                      <div className="pt-1">
                        <p className="text-paper-ink-2">Yang benar</p>
                        <p className="mt-1 max-w-[60ch] text-lg leading-relaxed">{e.correction}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {feedback.unexplained_jargon.length > 0 && (
            <Section title="Istilah yang belum kamu jelaskan" hl="var(--color-chalk-yellow)">
              <ul className="flex flex-col gap-3">
                {feedback.unexplained_jargon.map((j) => (
                  <li key={j.term} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="rounded-xl border-[2.5px] border-outline bg-white px-3 py-0.5 font-display text-lg font-semibold">
                      {j.term}
                    </span>
                    <span className="text-paper-ink-2">
                      <span className="sr-only">Kutipan dari transkripmu: </span>“{j.evidence}”
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Seberapa sederhana?" hl="var(--color-chalk-blue)">
            <p className="max-w-[62ch] text-lg leading-relaxed">{feedback.simplicity_note}</p>
          </Section>
        </>
      )}

      {/* Penutup dengan tanda tangan Si Kapur */}
      <div className="mt-12 flex items-end gap-4">
        <Kapur mood={mood} className="-mb-3 h-32 w-24 shrink-0" />
        <div className="pb-1">
          <p className="max-w-[44ch] text-lg leading-relaxed">
            {view === 'gagal'
              ? 'Transkripmu aman di laptop ini. Coba lagi sebentar lagi, ya.'
              : view === 'memuat'
                ? 'Tunggu sebentar, suratnya belum selesai.'
                : 'Semangat! Saat menjelaskan ulang, mulai dari catatan nomor 1, ya.'}
          </p>
          <p className="mt-3 text-paper-ink-2">Salam kapur,</p>
          <p className="font-display text-2xl font-semibold">Empur</p>
          <svg viewBox="0 0 120 16" aria-hidden="true" className="mt-0.5 h-4 w-28 text-outline">
            <path d="M3 10c12-8 20 4 30-2s16-6 22 0 18 2 26-3 20-1 36 1" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </article>
  )
}

function Greeting({ view, onRetry }: { view: View; onRetry: () => void }) {
  if (view === 'memuat')
    return (
      <div className="mt-6" role="status">
        <h2 className="font-display text-[2rem] font-semibold leading-tight">Aku masih menulis catatannya.</h2>
        <p className="mt-3 max-w-[58ch] text-lg leading-relaxed">
          Kelancaran dan checklist live sudah siap. Gemini sedang menganalisis isi transkripmu.
        </p>
      </div>
    )
  if (view === 'gagal')
    return (
      <div className="mt-6" role="alert">
        <h2 className="font-display text-[2rem] font-semibold leading-tight">Maaf, catatan isinya belum bisa aku tulis.</h2>
        <p className="mt-3 max-w-[58ch] text-lg leading-relaxed">
          Batas pemakaian gratis Gemini sedang tercapai. Checklist live, kelancaran, dan transkrip tetap ada.
        </p>
        <button className="btn btn-plain mt-5" onClick={onRetry}>
          <RetryIcon className="size-5" />
          Coba lagi
        </button>
      </div>
    )
  return (
    <h2 className="mt-6 font-display text-[2rem] font-semibold leading-tight">Hai, ini catatanku untuk penjelasanmu.</h2>
  )
}

// Ringkasan satu lirikan: jumlah konsep yang benar, deretan tandanya, dan kenaikan dari sesi pertama.
function Score({
  marks,
  feedback,
  previous,
}: {
  marks: Mark[]
  feedback: Feedback
  previous: typeof BACKPROP_PREVIOUS | null
}) {
  const correct = feedback.concept_coverage.filter((c) => c.status === 'explained_correct').length
  const gained = previous
    ? correct - Object.values(previous.coverage).filter((s) => s === 'explained_correct').length
    : 0
  return (
    <div className="mt-5 flex w-fit max-w-full flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border-[3px] border-outline bg-white px-5 py-4 shadow-[0_4px_0_var(--outline)]">
      <p className="flex items-center gap-3">
        <span aria-hidden="true" className="font-display text-5xl font-semibold leading-none tabular-nums">
          {correct}
          <span className="text-2xl text-paper-ink-2">/{marks.length}</span>
        </span>
        <span className="font-display text-lg font-semibold leading-tight">
          <span className="sr-only">
            {correct} dari {marks.length}
          </span>{' '}
          konsep dijelaskan
          <br />
          dengan benar
        </span>
      </p>
      <span aria-hidden="true" className="flex gap-0.5">
        {marks.map((m, i) => (
          <ChalkMark key={i} status={m} className={`size-8 ${PAPER_MARK[m]}`} />
        ))}
      </span>
      {gained > 0 && (
        <p className="rounded-full border-2 border-outline bg-chalk-mint px-3 py-0.5 font-display font-semibold text-go-ink">
          +{gained} dari sesi pertama
        </p>
      )}
    </div>
  )
}

// Pemisah antara ringkasan (atas) dan rincian (bawah), supaya tujuh judul tidak terbaca sama penting.
function Divider({ label }: { label: string }) {
  return (
    <div className="mt-12 flex items-center gap-3 text-paper-ink-2" role="presentation">
      <span className="h-0 flex-1 border-t-[2.5px] border-dashed border-paper-ink/25" />
      <span className="font-display text-sm">{label}</span>
      <span className="h-0 flex-1 border-t-[2.5px] border-dashed border-paper-ink/25" />
    </div>
  )
}

function Section({ title, hl, children }: { title: string; hl: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h3 className="font-display text-[1.45rem] font-semibold leading-tight">
        <span className="highlight" style={{ '--hl': hl } as CSSProperties}>
          {title}
        </span>
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  )
}

// Kutipan transkrip sebagai potongan kertas yang ditempel selotip biru.
function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="relative mt-2.5 max-w-[60ch] rounded-lg border-2 border-outline bg-white px-4 py-2.5 text-[1.05rem] leading-snug text-paper-ink shadow-[0_3px_0_rgba(0,0,0,0.08)]">
      <span
        aria-hidden="true"
        className="absolute -right-3 -top-2.5 h-4 w-10 rotate-[14deg] rounded-sm border-2 border-outline bg-chalk-blue/80"
      />
      <span className="sr-only">Kutipan dari transkripmu: </span>“{children}”
    </blockquote>
  )
}

// Bagian yang masih ditulis: tiga titik dan garis tulisan samar.
function Writing({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-display text-lg text-paper-ink-2">
        {label}
        <span aria-hidden="true" className="dots">
          <i />
          <i />
          <i />
        </span>
      </p>
      <svg viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true" className="h-6 w-full max-w-[26rem] text-paper-ink/35">
        <path
          className="scribble"
          pathLength={1}
          d="M4 14c18-9 30 8 48 0s28-10 44-2 26 9 44 0 30-9 46-1 28 8 46 0 30-10 48-2 28 9 46 1 34-8 58-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="mx-1 inline size-4 shrink-0 align-[-0.15em] text-ink-2">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Star({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`text-outline ${className}`}>
      <path
        d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.5l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8Z"
        fill="#ffe27a"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Empat ubin angka: angka besar di atas, label di bawah, semua rata kiri supaya angkanya segaris.
// Di sesi ke-2, angka sesi sebelumnya ditulis kecil di ubin yang sama.
function FluencyCard({
  fluency,
  previous,
  concepts,
}: {
  fluency: FluencyReport
  previous?: FluencyReport
  concepts: Concept[]
}) {
  const longest = fluency.long_pauses.reduce<FluencyReport['long_pauses'][number] | undefined>(
    (a, p) => (!a || p.duration > a.duration ? p : a),
    undefined,
  )
  const beforeConcept = concepts.find((c) => c.id === longest?.next_concept_id)?.name
  const tiles = [
    { Icon: ClockIcon, label: 'durasi', value: clock(fluency.duration), was: previous && clock(previous.duration) },
    { Icon: SpeedIcon, label: 'kata/menit', value: fluency.wpm, was: previous?.wpm },
    { Icon: PauseIcon, label: 'jeda panjang', value: fluency.long_pauses.length, was: previous?.long_pauses.length },
    { Icon: FillerIcon, label: 'filler', value: fluency.filler_count, was: previous?.filler_count },
  ]
  return (
    <section aria-labelledby="kelancaran-title" className="chip px-5 pb-5 pt-4">
      <h2 id="kelancaran-title" className="font-display text-xl font-semibold">
        Kelancaran
      </h2>
      <p className="text-sm text-ink-2">Dihitung di laptopmu.</p>
      <dl className="mt-4 grid grid-cols-2 gap-2.5">
        {tiles.map(({ Icon, label, value, was }) => (
          <div key={label} className="flex flex-col rounded-xl bg-wall px-3 pb-2.5 pt-3">
            <dt className="order-1 mt-1.5 flex items-center gap-1.5 text-sm leading-tight text-ink-2">
              <Icon className="size-4 shrink-0" />
              {label}
            </dt>
            <dd className="font-display text-[2rem] font-semibold leading-none tabular-nums">{value}</dd>
            {was !== undefined && <dd className="order-2 mt-0.5 text-xs text-ink-2">sebelumnya {was}</dd>}
          </div>
        ))}
      </dl>
      <ul className="mt-3 flex flex-col gap-1 text-sm leading-snug text-ink-2">
        {longest && (
          <li>
            Jeda terlama {decimal(longest.duration)} dtk{beforeConcept && `, sebelum ${beforeConcept}`}.
          </li>
        )}
        <li>Filler hanya indikasi: “jadi” juga bisa kata biasa.</li>
      </ul>
    </section>
  )
}

function ComparisonCard({
  concepts,
  previous,
  current,
}: {
  concepts: Concept[]
  previous: typeof BACKPROP_PREVIOUS
  current: Feedback
}) {
  const now = (id: string) => current.concept_coverage.find((c) => c.concept_id === id)?.status ?? 'not_covered'
  return (
    <section aria-labelledby="banding-title" className="chip px-5 pb-5 pt-4">
      <h2 id="banding-title" className="font-display text-xl font-semibold">
        Dibanding sesi pertama
      </h2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {concepts.map((c) => {
          const was = COVERAGE_MARK[previous.coverage[c.id] ?? 'not_covered']
          const is = COVERAGE_MARK[now(c.id)]
          return (
            <li key={c.id}>
              <p className="font-display leading-tight">{c.name}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-sm text-ink-2">
                <span className="sr-only">sebelumnya</span>
                <ChalkMark status={was} className={`size-5 shrink-0 ${CHIP_MARK[was]}`} />
                {MARK_TEXT[was]}
                <Arrow />
                <span className="sr-only">sekarang</span>
                <ChalkMark status={is} className={`size-5 shrink-0 ${CHIP_MARK[is]}`} />
                <span className="font-semibold text-ink">{MARK_TEXT[is]}</span>
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// Lampiran: transkrip lengkap di papan, dengan istilah konsep, filler, dan jeda panjang ditandai.
// Dilipat secara bawaan supaya halaman feedback tidak terlalu panjang.
function TranscriptAppendix({ concepts }: { concepts: Concept[] }) {
  const segments = useMemo(
    () =>
      buildSegments(
        BACKPROP_TRANSCRIPT.text,
        BACKPROP_TRANSCRIPT.pauses,
        concepts.map((c) => ({ id: c.id, terms: [c.name, ...c.aliases] })),
        [...FILLERS],
      ),
    [concepts],
  )
  return (
    // Lampiran selebar halaman, bukan tombol lepas di bawah surat.
    <details className="group relative z-10 mx-auto mt-10 max-w-[68rem]">
      <summary
        className={`chip flex items-center gap-4 px-5 py-3.5 text-ink transition-transform duration-100 active:translate-y-0.5 ${SUMMARY}`}
      >
        <span className="min-w-0">
          <span className="block font-display text-lg font-semibold leading-tight">
            <span className="group-open:hidden">Lihat transkrip lengkap</span>
            <span className="hidden group-open:inline">Tutup transkrip</span>
          </span>
          <span className="block text-sm text-ink-2">Lampiran: semua ucapanmu, dengan jeda dan filler ditandai.</span>
        </span>
        <ChevronIcon className="ml-auto size-5 shrink-0 transition-transform group-open:rotate-90" />
      </summary>
      <section aria-labelledby="transkrip-title" className="mt-6">
        <Board>
          <Panel>
            <PanelTitle id="transkrip-title" note="Hasil Whisper di laptopmu.">
              Transkrip lengkap
            </PanelTitle>
            <p className="mt-5 max-w-[68ch] text-[1.2rem] font-medium leading-[1.8] text-chalk">
              {segments.map((seg, i) =>
                seg.kind === 'pause' ? (
                  <PausePill key={i} duration={seg.duration} />
                ) : (
                  <span key={i} className={seg.conceptId ? 'chalk-term' : seg.filler ? 'chalk-filler' : undefined}>
                    {seg.text}
                  </span>
                ),
              )}
            </p>
            <ul aria-label="Arti tanda" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-display text-chalk-dim">
              <li>
                <span className="chalk-term text-chalk">istilah</span> konsep
              </li>
              <li>
                <span className="chalk-filler text-chalk">filler</span> (indikasi)
              </li>
              <li className="flex items-center">
                <PausePill />
                panjang, 2 detik atau lebih
              </li>
            </ul>
          </Panel>
        </Board>
      </section>
    </details>
  )
}
