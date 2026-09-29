import { useMemo, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AppBar, MockStateSwitch } from '../components/app-bar'
import { ChevronIcon, ClockIcon, FillerIcon, PauseIcon, RetryIcon, SpeedIcon } from '../components/chalk'
import { Kapur } from '../components/kapur'
import { PauseChip, StatusIcon, type Mark } from '../components/marks'
import { clock, decimal } from '../lib/format'
import { useMockState } from '../lib/mock-state'
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

// Penanda <details> bawaan disembunyikan, diganti ikon chevron yang berputar saat terbuka.
const SUMMARY = 'cursor-pointer list-none [&::-webkit-details-marker]:hidden'

// Feedback dalam gaya terang dan bersih, dengan rasa layar "Lesson complete" Brilliant: Empur besar di
// tengah, ringkasan sebagai kartu angka, isi dalam kartu putih, dan tombol lanjut di bilah bawah.
// Urutannya: ringkasan, yang perlu diperbaiki, yang sudah bagus, lalu rincian.
export default function FeedbackScreen() {
  const view = useMockState(STATES)
  const [, setParams] = useSearchParams()
  const concepts = BACKPROP_CONCEPTS
  const fluency = BACKPROP_FLUENCY
  const feedback = view === 'memuat' || view === 'gagal' ? null : BACKPROP_FEEDBACK
  const previous = view === 'ulang' ? BACKPROP_PREVIOUS : null
  const coverage = feedback?.concept_coverage
  const markOf = (id: string): Mark => {
    const c = coverage?.find((x) => x.concept_id === id)
    if (c) return COVERAGE_MARK[c.status]
    return BACKPROP_LIVE_STATUS[id] ?? 'none'
  }
  const mood = view === 'gagal' ? 'confused' : view === 'memuat' ? 'think' : 'happy'

  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar
        back={{ to: '/', label: 'Kembali ke beranda' }}
        title={`Feedback: ${BACKPROP_TOPIC}`}
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

      <main className="mx-auto flex w-full max-w-[54rem] flex-1 flex-col gap-5 px-4 pb-12 pt-2 md:px-8">
        <Hero view={view} mood={mood} onRetry={() => setParams({ keadaan: 'memuat' })} />

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <ScoreCard marks={concepts.map((c) => markOf(c.id))} feedback={feedback} previous={previous} />
          <FluencyTiles fluency={fluency} previous={previous?.fluency} concepts={concepts} />
        </div>

        {view === 'memuat' && (
          <>
            <Card title="Yang perlu diperbaiki dulu">
              <Writing />
            </Card>
            <Card title="Yang sudah bagus">
              <Writing />
            </Card>
          </>
        )}

        {feedback && (
          <>
            <Card title="Yang perlu diperbaiki dulu">
              <ol className="flex flex-col gap-3">
                {feedback.improvements.map((s, i) => (
                  <li key={s} className="flex gap-3 text-[1.05rem] leading-relaxed">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#FFF1C9] text-sm font-semibold tabular-nums text-[#7A5200] dark:bg-[#3a2f10] dark:text-[#FFD98A]">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </Card>
            <Card title="Yang sudah bagus">
              <ul className="flex flex-col gap-3">
                {feedback.strengths.map((s) => (
                  <li key={s} className="flex gap-3 text-[1.05rem] leading-relaxed">
                    <Sparkle className="mt-0.5 size-7 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}

        {previous && feedback && <ComparisonCard concepts={concepts} previous={previous} current={feedback} />}

        {view !== 'gagal' && (
          <div className="mt-4 flex items-center gap-3 text-sm text-ink-3" role="presentation">
            <span className="h-px flex-1 bg-line" />
            Rincian
            <span className="h-px flex-1 bg-line" />
          </div>
        )}

        <Card
          title="Cakupan konsep"
          note={
            feedback
              ? 'Diperiksa ulang oleh Gemini dari teks transkrip. Istilah yang salah tulis di kutipan adalah kesalahan transkripsi, bukan kesalahanmu.'
              : view === 'memuat'
                ? 'Ini hasil checklist live. Gemini sedang memeriksanya ulang.'
                : 'Belum diperiksa Gemini, jadi anggap hasil checklist live ini sebagai perkiraan.'
          }
        >
          <ul className="flex flex-col gap-2">
            {concepts.map((c) => {
              const mark = markOf(c.id)
              const evidence = coverage?.find((x) => x.concept_id === c.id)?.evidence ?? []
              const row = (
                <>
                  <span className="min-w-0 flex-1 text-[1.1rem] font-semibold leading-snug">{c.name}</span>
                  <span className="shrink-0 text-sm text-ink-3">{MARK_TEXT[mark]}</span>
                  <StatusIcon status={mark} />
                </>
              )
              return (
                <li key={c.id} className="rounded-2xl bg-card">
                  {evidence.length > 0 ? (
                    // Kutipan konsep yang sudah benar dilipat. Yang baru disebut atau keliru langsung terbuka.
                    <details open={mark !== 'explained'} className="group">
                      <summary className={`flex items-center gap-3 rounded-2xl py-3 pl-2 pr-3 ${SUMMARY}`}>
                        <ChevronIcon className="size-4 shrink-0 text-ink-3 transition-transform group-open:rotate-90" />
                        {row}
                      </summary>
                      <div className="flex flex-col gap-2 px-4 pb-4 pl-8">
                        {evidence.map((e) => (
                          <Quote key={e}>{e}</Quote>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <p className="flex items-center gap-3 py-3 pl-8 pr-3">{row}</p>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>

        {view === 'memuat' && (
          <Card title="Isi dan istilah">
            <Writing label="Kesalahan isi, istilah, dan kesederhanaan menyusul" />
          </Card>
        )}

        {feedback && (
          <>
            {feedback.factual_errors.length > 0 && (
              <Card title="Yang keliru">
                <div className="flex flex-col gap-6">
                  {feedback.factual_errors.map((e) => (
                    <div key={e.statement} className="flex flex-col gap-3">
                      <div className="flex gap-3">
                        <StatusIcon status="wrong" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-ink-3">Kalimatmu</p>
                          <Quote>{e.statement}</Quote>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <StatusIcon status="explained" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-ink-3">Yang benar</p>
                          <p className="mt-1 text-[1.05rem] leading-relaxed">{e.correction}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {feedback.unexplained_jargon.length > 0 && (
              <Card title="Istilah yang belum kamu jelaskan">
                <ul className="flex flex-col gap-3">
                  {feedback.unexplained_jargon.map((j) => (
                    <li key={j.term} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="rounded-full bg-card px-3.5 py-1 font-semibold">{j.term}</span>
                      <span className="text-ink-2">
                        <span className="sr-only">Kutipan dari transkripmu: </span>“{j.evidence}”
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card title="Seberapa sederhana?">
              <p className="text-[1.05rem] leading-relaxed">{feedback.simplicity_note}</p>
            </Card>
          </>
        )}

        {/* Penutup dengan tanda tangan Empur. */}
        <div className="mt-4 flex items-end gap-4">
          <Kapur mood={mood} className="h-32 w-[6.4rem] shrink-0" />
          <div className="pb-3">
            <p className="text-[1.05rem] leading-relaxed">
              {view === 'gagal'
                ? 'Transkripmu aman di laptop ini. Coba lagi sebentar lagi, ya.'
                : view === 'memuat'
                  ? 'Tunggu sebentar, feedback-nya belum selesai.'
                  : 'Semangat! Saat menjelaskan ulang, mulai dari poin nomor 1, ya.'}
            </p>
            <p className="mt-2 text-sm text-ink-3">Salam kapur,</p>
            <p className="text-lg font-semibold">Empur</p>
          </div>
        </div>

        <TranscriptAppendix concepts={concepts} />
      </main>

      {/* Tombol lanjut selalu terjangkau, seperti tombol Continue di Brilliant. */}
      <footer className="sticky bottom-0 z-30 flex flex-col gap-3 border-t border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:gap-4 md:px-8 md:py-4">
        <p className="mr-auto text-sm text-ink-3 max-sm:hidden">Jelaskan ulang dengan {concepts.length} konsep yang sama.</p>
        <div className="flex gap-3 *:whitespace-nowrap max-sm:*:flex-1 max-sm:*:px-4">
          <Link to="/setup" className="btn btn-plain">
            Ganti topik
          </Link>
          <Link to="/live" className="btn btn-go px-8">
            Jelaskan ulang
          </Link>
        </div>
      </footer>
    </div>
  )
}

// Empur besar di tengah dengan lingkaran lembut di belakangnya, lalu sapaan per keadaan.
function Hero({ view, mood, onRetry }: { view: View; mood: 'happy' | 'think' | 'confused'; onRetry: () => void }) {
  return (
    <section className="flex flex-col items-center pt-2 text-center">
      <div className="relative grid place-items-center">
        <span aria-hidden="true" className="absolute size-44 rounded-full bg-gradient-to-b from-[#FFF1C9] to-[#FFE0CC] dark:from-[#2e2616] dark:to-[#2b1d17]" />
        <Kapur mood={mood} className="relative h-48 w-[9.6rem]" />
      </div>
      {view === 'memuat' ? (
        <div role="status" className="mt-4">
          <h2 className="text-[1.9rem] font-bold leading-tight tracking-tight">Aku masih menulis feedback-nya.</h2>
          <p className="mt-2 text-ink-2">Kelancaran dan checklist live sudah siap. Gemini sedang menganalisis isi transkripmu.</p>
        </div>
      ) : view === 'gagal' ? (
        <div role="alert" className="mt-4 flex flex-col items-center">
          <h2 className="text-[1.9rem] font-bold leading-tight tracking-tight">Maaf, feedback isinya belum bisa aku tulis.</h2>
          <p className="mt-2 text-ink-2">Batas pemakaian gratis Gemini sedang tercapai. Checklist live, kelancaran, dan transkrip tetap ada.</p>
          <button className="btn btn-plain mt-5" onClick={onRetry}>
            <RetryIcon className="size-5" />
            Coba lagi
          </button>
        </div>
      ) : (
        <h2 className="mt-4 text-[1.9rem] font-bold leading-tight tracking-tight">Hai, ini feedback-ku untuk penjelasanmu.</h2>
      )}
    </section>
  )
}

// Ringkasan satu lirikan: jumlah konsep yang benar, deretan tandanya, dan kenaikan dari sesi pertama.
// Sebelum Gemini selesai, angkanya dari checklist live dan diberi label perkiraan.
function ScoreCard({
  marks,
  feedback,
  previous,
}: {
  marks: Mark[]
  feedback: Feedback | null
  previous: typeof BACKPROP_PREVIOUS | null
}) {
  const correct = marks.filter((m) => m === 'explained').length
  const gained = previous && feedback
    ? correct - Object.values(previous.coverage).filter((s) => s === 'explained_correct').length
    : 0
  return (
    <section className="flex flex-col justify-between gap-4 rounded-[24px] bg-gradient-to-b from-card to-done/15 p-5">
      <div>
        <p className="text-5xl font-bold leading-none tabular-nums tracking-tight">
          {correct}
          <span className="text-2xl text-ink-3">/{marks.length}</span>
        </p>
        <p className="mt-2 font-medium leading-snug">
          konsep dijelaskan dengan benar
          {!feedback && <span className="text-ink-3"> (perkiraan live)</span>}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span aria-hidden="true" className="flex gap-1">
          {marks.map((m, i) => (
            <StatusIcon key={i} status={m} className="size-6" />
          ))}
        </span>
        {gained > 0 && (
          <span className="rounded-full bg-done px-3 py-0.5 text-sm font-semibold text-white">+{gained} dari sesi pertama</span>
        )}
      </div>
    </section>
  )
}

// Empat kartu angka: angka besar di atas, label di bawah, semua rata kiri supaya angkanya segaris.
// Di sesi ke-2, angka sesi sebelumnya ditulis kecil di kartu yang sama.
function FluencyTiles({ fluency, previous, concepts }: { fluency: FluencyReport; previous?: FluencyReport; concepts: Concept[] }) {
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
    <section aria-labelledby="kelancaran-title" className="flex flex-col gap-2">
      <h2 id="kelancaran-title" className="sr-only">
        Kelancaran, dihitung di laptopmu
      </h2>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2">
        {tiles.map(({ Icon, label, value, was }) => (
          <div key={label} className="flex flex-col rounded-[20px] bg-card px-4 pb-3 pt-3.5">
            <dd className="text-[1.9rem] font-bold leading-none tabular-nums tracking-tight">{value}</dd>
            <dt className="order-1 mt-1.5 flex items-center gap-1.5 text-sm text-ink-3">
              <Icon className="size-4 shrink-0" />
              {label}
            </dt>
            {was !== undefined && <dd className="order-2 text-xs text-ink-3">sebelumnya {was}</dd>}
          </div>
        ))}
      </dl>
      <p className="px-1 text-xs leading-relaxed text-ink-3">
        Dihitung di laptopmu.
        {longest && ` Jeda terlama ${decimal(longest.duration)} dtk${beforeConcept ? `, sebelum ${beforeConcept}` : ''}.`} Filler
        hanya indikasi: “jadi” juga bisa kata biasa.
      </p>
    </section>
  )
}

function Card({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-line bg-surface p-5 md:p-7">
      <h3 className="text-xl font-semibold leading-tight">{title}</h3>
      {note && <p className="mt-1.5 text-sm leading-relaxed text-ink-3">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

// Kutipan transkrip: kartu kecil dengan garis biru di kiri.
function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="mt-1 rounded-r-xl border-l-4 border-[#9DB6FF] bg-surface px-4 py-2.5 leading-snug text-ink-2 dark:border-[#3656C9]">
      <span className="sr-only">Kutipan dari transkripmu: </span>“{children}”
    </blockquote>
  )
}

// Bagian yang masih ditulis: tiga titik dan baris abu yang berdenyut.
function Writing({ label = 'Empur sedang menulis bagian ini' }: { label?: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-ink-3">
        {label}
        <span aria-hidden="true" className="dots">
          <i />
          <i />
          <i />
        </span>
      </p>
      {[100, 88, 64].map((w, i) => (
        <span key={w} aria-hidden="true" className="h-3.5 animate-pulse rounded-full bg-card" style={{ width: `${w}%`, animationDelay: `${i * 150}ms` }} />
      ))}
    </div>
  )
}

function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="feedback-sparkle" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#FFE27A" />
          <stop offset="1" stopColor="#FF9F43" />
        </linearGradient>
      </defs>
      <path d="M12 2C13 8 16 11 22 12C16 13 13 16 12 22C11 16 8 13 2 12C8 11 11 8 12 2Z" fill="url(#feedback-sparkle)" />
    </svg>
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
    <Card title="Dibanding sesi pertama">
      <ul className="grid gap-2 sm:grid-cols-2">
        {concepts.map((c) => {
          const was = COVERAGE_MARK[previous.coverage[c.id] ?? 'not_covered']
          const is = COVERAGE_MARK[now(c.id)]
          return (
            <li key={c.id} className="rounded-2xl bg-card px-4 py-3">
              <p className="font-semibold leading-tight">{c.name}</p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-sm text-ink-3">
                <span className="sr-only">sebelumnya</span>
                <StatusIcon status={was} className="size-5" />
                {MARK_TEXT[was]}
                <svg viewBox="0 0 16 16" aria-hidden="true" className="mx-0.5 size-4 shrink-0">
                  <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="sr-only">sekarang</span>
                <StatusIcon status={is} className="size-5" />
                <span className="font-semibold text-ink">{MARK_TEXT[is]}</span>
              </p>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

// Lampiran: transkrip lengkap dengan istilah konsep, filler, dan jeda panjang ditandai.
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
    <details className="group mt-2 rounded-[28px] bg-card">
      <summary className={`flex items-center gap-4 rounded-[28px] px-5 py-4 md:px-7 ${SUMMARY}`}>
        <span className="min-w-0">
          <span className="block text-lg font-semibold leading-tight">
            <span className="group-open:hidden">Lihat transkrip lengkap</span>
            <span className="hidden group-open:inline">Tutup transkrip</span>
          </span>
          <span className="block text-sm text-ink-3">Semua ucapanmu, dengan jeda dan filler ditandai.</span>
        </span>
        <ChevronIcon className="ml-auto size-5 shrink-0 text-ink-3 transition-transform group-open:rotate-90" />
      </summary>
      <section aria-labelledby="transkrip-title" className="px-2 pb-2">
        <div className="rounded-[22px] bg-surface p-5 md:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h2 id="transkrip-title" className="text-lg font-semibold">
              Transkrip lengkap
            </h2>
            <p className="text-sm text-ink-3">Hasil Whisper di laptopmu.</p>
          </div>
          <p className="mt-4 text-[1.15rem] leading-[1.8]">
            {segments.map((seg, i) =>
              seg.kind === 'pause' ? (
                <PauseChip key={i} duration={seg.duration} />
              ) : (
                <span key={i} className={seg.conceptId ? 'term-mark' : seg.filler ? 'chalk-filler' : undefined}>
                  {seg.text}
                </span>
              ),
            )}
          </p>
          <ul aria-label="Arti tanda" className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-3">
            <li>
              <span className="term-mark text-ink">istilah</span> konsep
            </li>
            <li>
              <span className="chalk-filler text-ink">filler</span> (indikasi)
            </li>
            <li className="flex items-center">
              <PauseChip />
              panjang, 2 detik atau lebih
            </li>
          </ul>
        </div>
      </section>
    </details>
  )
}
