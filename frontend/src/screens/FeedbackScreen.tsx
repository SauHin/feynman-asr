import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AppBar, MockStateSwitch } from '../components/app-bar'
import { Board, Panel, PanelTitle, PausePill } from '../components/board'
import {
  ChalkDefs,
  ChalkMark,
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

// Gabungan nama dalam kalimat: "A", "A dan B", "A, B, dan C".
const joinId = (xs: string[]) =>
  xs.length < 2 ? (xs[0] ?? '') : xs.length === 2 ? `${xs[0]} dan ${xs[1]}` : `${xs.slice(0, -1).join(', ')}, dan ${xs.at(-1)}`

export default function FeedbackScreen() {
  const view = useMockState(STATES)
  const [, setParams] = useSearchParams()
  const concepts = BACKPROP_CONCEPTS
  const fluency = BACKPROP_FLUENCY
  const feedback = view === 'memuat' || view === 'gagal' ? null : BACKPROP_FEEDBACK
  const previous = view === 'ulang' ? BACKPROP_PREVIOUS : null

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
          <aside className="flex flex-col gap-6" aria-label="Kelancaran dan langkah berikutnya">
            <FluencyCard fluency={fluency} concepts={concepts} />
            {previous && feedback && (
              <ComparisonCard concepts={concepts} previous={previous} current={feedback} fluency={fluency} />
            )}
            <div className="flex flex-col gap-3 lg:sticky lg:top-4">
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
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                Isi surat ditulis dengan bantuan Gemini dari teks transkrip, bukan dari suaramu. Kalau ada istilah yang
                salah tulis di kutipan, itu kesalahan transkripsi, bukan kesalahanmu.
              </p>
            </div>
          </aside>
        </div>

        <TranscriptAppendix concepts={concepts} />
      </main>
    </div>
  )
}

// Surat dari Si Kapur, di selembar kertas yang disobek dari buku catatan.
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

  return (
    <article className="relative rounded-[20px] border-[3px] border-outline bg-paper px-6 pb-10 pt-10 text-paper-ink shadow-[0_6px_0_rgba(0,0,0,0.15)] md:px-12">
      {/* Si Kapur berdiri di tepi kiri surat: bangga, sedang menulis, atau bingung. */}
      <Kapur
        mood={view === 'gagal' ? 'confused' : view === 'memuat' ? 'think' : 'proud'}
        className="absolute -left-28 top-24 z-20 hidden h-40 w-32 xl:block"
      />
      {/* Lubang spiral: halaman ini disobek dari buku catatan di beranda. */}
      <div aria-hidden="true" className="absolute inset-x-6 top-4 flex justify-between md:inset-x-12">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="size-3 rounded-full border-2 border-outline bg-wall" />
        ))}
      </div>

      <Greeting view={view} concepts={concepts} feedback={feedback} previous={previous} onRetry={onRetry} />

      {view === 'memuat' && (
        <>
          <Section title="Yang sudah bagus" hl="var(--color-chalk-mint)">
            <Writing label="Si Kapur sedang menulis bagian ini" />
          </Section>
          <Section title="Yang perlu diperbaiki dulu" hl="var(--color-chalk-yellow)">
            <Writing label="Si Kapur sedang menulis bagian ini" />
          </Section>
        </>
      )}

      {feedback && (
        <>
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
        </>
      )}

      <Section title="Cakupan konsep" hl="var(--color-chalk-blue)">
        <p className="text-paper-ink-2">
          {feedback
            ? 'Checklist live sudah diperiksa ulang oleh Gemini. Setiap penilaian disertai kutipan dari transkripmu.'
            : view === 'memuat'
              ? 'Ini hasil checklist live. Gemini sedang memeriksanya ulang.'
              : 'Belum diperiksa Gemini. Ini hasil checklist live, jadi anggap sebagai perkiraan.'}
        </p>
        <ul className="mt-5 flex flex-col gap-5">
          {concepts.map((c) => {
            const mark = markOf(c.id)
            const evidence = coverage?.find((x) => x.concept_id === c.id)?.evidence ?? []
            return (
              <li key={c.id} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3">
                <ChalkMark status={mark} className={`size-9 ${PAPER_MARK[mark]}`} />
                <div className="pt-1">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-xl font-semibold">{c.name}</span>
                    <span className="text-paper-ink-2">{MARK_TEXT[mark]}</span>
                  </p>
                  {evidence.map((e) => (
                    <Quote key={e}>{e}</Quote>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
        <ul aria-label="Arti tanda" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-paper-ink-2">
          {(['none', 'mentioned', 'explained', 'wrong'] as const).map((m) => (
            <li key={m} className="flex items-center gap-1.5">
              <ChalkMark status={m} className={`size-6 ${PAPER_MARK[m]}`} />
              {MARK_TEXT[m]}
            </li>
          ))}
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
                  <div key={e.statement} className="flex flex-col gap-4">
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
              <ul className="flex flex-col gap-5">
                {feedback.unexplained_jargon.map((j) => (
                  <li key={j.term}>
                    <span className="inline-block rounded-xl border-[2.5px] border-outline bg-white px-3 py-0.5 font-display text-lg font-semibold">
                      {j.term}
                    </span>
                    <Quote>{j.evidence}</Quote>
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
        <Kapur mood={view === 'gagal' ? 'confused' : view === 'memuat' ? 'think' : 'proud'} className="-mb-3 h-32 w-24 shrink-0" />
        <div className="pb-1">
          <p className="max-w-[44ch] text-lg leading-relaxed">
            {view === 'gagal'
              ? 'Transkripmu aman di laptop ini. Coba lagi sebentar lagi, ya.'
              : view === 'memuat'
                ? 'Tunggu sebentar, suratnya belum selesai.'
                : 'Semangat! Saat menjelaskan ulang, mulai dari catatan nomor 1, ya.'}
          </p>
          <p className="mt-3 text-paper-ink-2">Salam kapur,</p>
          <p className="font-display text-2xl font-semibold">Si Kapur</p>
          <svg viewBox="0 0 120 16" aria-hidden="true" className="mt-0.5 h-4 w-28 text-outline">
            <path d="M3 10c12-8 20 4 30-2s16-6 22 0 18 2 26-3 20-1 36 1" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </article>
  )
}

function Greeting({
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
  if (view === 'memuat')
    return (
      <div className="mt-6" role="status">
        <h2 className="font-display text-[2rem] font-semibold leading-tight">Aku masih menulis catatannya.</h2>
        <p className="mt-3 max-w-[58ch] text-lg leading-relaxed">
          Kelancaran dan checklist live sudah siap karena dihitung di laptopmu. Analisis isinya sedang dikerjakan Gemini
          dari teks transkrip.
        </p>
      </div>
    )
  if (view === 'gagal' || !feedback)
    return (
      <div className="mt-6" role="alert">
        <h2 className="font-display text-[2rem] font-semibold leading-tight">Maaf, catatan isinya belum bisa aku tulis.</h2>
        <p className="mt-3 max-w-[58ch] text-lg leading-relaxed">
          Gemini tidak membalas karena batas pemakaian gratis sedang tercapai. Yang di bawah ini tetap ada karena
          dihitung di laptopmu: checklist live, kelancaran, dan transkrip.
        </p>
        <button className="btn btn-plain mt-5" onClick={onRetry}>
          <RetryIcon className="size-5" />
          Coba lagi
        </button>
      </div>
    )

  const cov = feedback.concept_coverage
  const n = concepts.length
  const correct = cov.filter((c) => c.status === 'explained_correct').length
  const name = (id: string) => concepts.find((c) => c.id === id)?.name ?? id
  const mentioned = cov.filter((c) => c.status === 'mentioned').map((c) => name(c.concept_id))
  const wrong = cov.filter((c) => c.status === 'explained_incorrect').map((c) => name(c.concept_id))
  const missed = concepts.filter((c) => !cov.some((x) => x.concept_id === c.id && x.status !== 'not_covered'))
  const errors = feedback.factual_errors.length
  const before = previous ? Object.values(previous.coverage).filter((s) => s === 'explained_correct').length : 0

  const sentences = [
    previous && correct > before && `Dibanding sesi pertama, ${correct - before} konsep lagi kamu jelaskan dengan benar.`,
    `${correct} dari ${n} konsep sudah kamu jelaskan dengan benar.`,
    mentioned.length > 0 && `${joinId(mentioned)} baru disebut, belum dijelaskan.`,
    wrong.length > 0 && `Penjelasan ${joinId(wrong)} masih keliru.`,
    missed.length > 0 && `${joinId(missed.map((c) => c.name))} belum dibahas.`,
    errors > 0 && `Ada ${errors === 1 ? 'satu' : errors} kalimat yang perlu diluruskan.`,
    'Mulai dari catatan nomor 1 di bawah.',
  ].filter(Boolean)

  return (
    <div className="mt-6">
      <h2 className="font-display text-[2rem] font-semibold leading-tight">Hai, ini catatanku untuk penjelasanmu.</h2>
      <p className="mt-3 max-w-[58ch] text-lg leading-relaxed">{sentences.join(' ')}</p>
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

function FluencyCard({ fluency, concepts }: { fluency: FluencyReport; concepts: Concept[] }) {
  const perMinute = fluency.filler_count / (fluency.duration / 60)
  const name = (id?: string) => concepts.find((c) => c.id === id)?.name
  return (
    <section aria-labelledby="kelancaran-title" className="chip px-5 pb-5 pt-4">
      <h2 id="kelancaran-title" className="font-display text-xl font-semibold">
        Kelancaran
      </h2>
      <p className="text-sm text-ink-2">Dihitung di laptopmu dari suara dan transkrip.</p>
      <dl className="mt-4 flex flex-col gap-4">
        <Metric icon={<ClockIcon className="size-5" />} label="Durasi" value={clock(fluency.duration)} />
        <Metric
          icon={<SpeedIcon className="size-5" />}
          label="Kecepatan"
          value={String(fluency.wpm)}
          unit="kata/menit"
          note="Dihitung tanpa jeda panjang."
        />
        <Metric
          icon={<PauseIcon className="size-5" />}
          label="Jeda panjang"
          value={String(fluency.long_pauses.length)}
          note={fluency.long_pauses
            .map(
              (p) =>
                `${decimal(p.duration)} dtk di ${clock(p.start)}${name(p.next_concept_id) ? `, sebelum ${name(p.next_concept_id)}` : ''}.`,
            )
            .join(' ')}
        />
        <Metric
          icon={<FillerIcon className="size-5" />}
          label="Filler"
          value={String(fluency.filler_count)}
          unit={`${decimal(perMinute)} per menit`}
          note="Indikasi saja. Kata seperti “jadi” juga bisa kata biasa."
        />
      </dl>
    </section>
  )
}

function Metric({
  icon,
  label,
  value,
  unit,
  note,
}: {
  icon: ReactNode
  label: string
  value: string
  unit?: string
  note?: string
}) {
  return (
    <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2.5">
      <span className="pt-0.5 text-ink-2">{icon}</span>
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-display text-ink-2">{label}</dt>
          <dd className="text-right">
            <span className="font-display text-xl font-semibold tabular-nums">{value}</span>
            {unit && <span className="ml-1 text-sm text-ink-2">{unit}</span>}
          </dd>
        </div>
        {note && <dd className="mt-0.5 text-sm leading-snug text-ink-2">{note}</dd>}
      </div>
    </div>
  )
}

function ComparisonCard({
  concepts,
  previous,
  current,
  fluency,
}: {
  concepts: Concept[]
  previous: typeof BACKPROP_PREVIOUS
  current: Feedback
  fluency: FluencyReport
}) {
  const now = (id: string) => current.concept_coverage.find((c) => c.concept_id === id)?.status ?? 'not_covered'
  const rows: [string, number | string, number | string][] = [
    ['Filler', previous.fluency.filler_count, fluency.filler_count],
    ['Jeda panjang', previous.fluency.long_pauses.length, fluency.long_pauses.length],
    ['Kata/menit', previous.fluency.wpm, fluency.wpm],
  ]
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
      <dl className="mt-4 flex flex-col gap-1.5 border-t-2 border-dashed border-line-strong pt-3">
        {rows.map(([label, a, b]) => (
          <div key={label} className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-2">{label}</dt>
            <dd className="font-display tabular-nums">
              <span className="text-ink-2">{a}</span>
              <span className="sr-only"> menjadi </span>
              <Arrow />
              <span className="font-semibold">{b}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

// Lampiran: transkrip lengkap di papan, dengan istilah konsep, filler, dan jeda panjang ditandai.
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
    <section aria-labelledby="transkrip-title" className="relative z-10 mx-auto mt-14 max-w-[68rem]">
      <Board>
        <Panel>
          <PanelTitle id="transkrip-title" note="Hasil Whisper di laptopmu.">
            Lampiran: transkrip lengkap
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
  )
}
