import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router'
import { EmpurMenu, ThemeToggle } from '../components/app-bar'
import { CloseIcon, FillerIcon, PauseIcon, SpeedIcon, type MarkStatus } from '../components/chalk'
import { Kapur } from '../components/kapur'
import { PauseChip, StatusIcon } from '../components/marks'
import { clock, decimal, MARK_LABEL } from '../lib/format'
import { KAPUR_HAND, KAPUR_TIP, kapurSays, useKapurPrefs } from '../lib/kapur'
import { initialLiveState, liveReducer, type LiveState } from '../lib/live-state'
import type { TranscriptSource } from '../lib/transcript-source'
import { buildSegments, type Segment } from '../lib/transcript-segments'
import { BACKPROP_CONCEPTS, BACKPROP_TOPIC } from '../mocks/backprop'
import { MockTranscriptSource } from '../mocks/mock-transcript-source'
import type { Concept } from '../types/feedback'

const DUST = [
  [-26, -18],
  [-8, -30],
  [14, -26],
  [28, -8],
  [-30, 4],
  [22, 12],
]

// Lama Empur berada di baris agenda saat mencentang, sebelum kembali ke tempatnya.
const WRITE_SECONDS = 1.3
// Ujung tangan saat Empur dicerminkan untuk mencentang dari kanan.
const HAND_MIRRORED = { x: 120 - KAPUR_HAND.x, y: KAPUR_HAND.y }
const origin = (p: { x: number; y: number }) => `${(p.x / 120) * 100}% ${(p.y / 150) * 100}%`

// Layar live dalam gaya terang dan bersih (rasa Brilliant): agenda di kartu abu muda, penjelasan di
// kartu putih besar, Empur di pojok kiri bawah kartu penjelasan dengan balon di sampingnya.
export default function LiveScreen() {
  // ponytail: sumber dan konsep masih mock; Fase 1 ganti ke WebSocket, Fase 4 ke daftar konsep dari setup.
  const [source] = useState<TranscriptSource>(() => new MockTranscriptSource())
  const concepts = BACKPROP_CONCEPTS
  const [state, dispatch] = useReducer(liveReducer, initialLiveState)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(0)

  useEffect(() => {
    const off = source.onMessage(dispatch)
    return () => {
      off()
      source.stop()
    }
  }, [source])

  // Timer memakai jam dinding, supaya tetap berjalan saat user diam.
  useEffect(() => {
    if (state.status !== 'listening') return
    const id = setInterval(() => setNow(performance.now()), 250)
    return () => clearInterval(id)
  }, [state.status])

  const start = () => {
    dispatch({ type: 'reset' })
    const t = performance.now()
    setStartedAt(t)
    setNow(t)
    void source.start()
  }
  const started = startedAt !== null
  const elapsed = started ? Math.max(0, (now - startedAt) / 1000) : 0
  const sessionDone = state.status === 'idle' && started
  const statusOf = (id: string): MarkStatus => state.concepts[id] ?? 'none'
  const line = kapurSays({ state, concepts, started, elapsed, topic: BACKPROP_TOPIC })

  // Empur pergi ke baris yang statusnya baru naik, mencentangnya, lalu kembali. Tanda ada di ujung kanan
  // baris, jadi Empur berdiri di kanannya menghadap kiri (dicerminkan) dan nama konsep tetap terlihat.
  // Dengan tangan: ujung tangan menyentuh tanda. Tanpa tangan: Empur miring ke kanan dan menulis centang
  // dengan ujung bawahnya.
  const { arms } = useKapurPrefs()
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({})
  const kapurRef = useRef<HTMLDivElement>(null)
  const lastEvent = state.conceptEvents.at(-1)
  const writing = lastEvent && state.status === 'listening' && elapsed - lastEvent.t < WRITE_SECONDS ? lastEvent : null
  const [reach, setReach] = useState<{ x: number; y: number } | null>(null)
  useLayoutEffect(() => {
    const mark = writing ? rowRefs.current[writing.id]?.querySelector('[data-mark]') : null
    const rest = kapurRef.current
    if (!mark || !rest || matchMedia('(prefers-reduced-motion: reduce)').matches) return setReach(null)
    const m = mark.getBoundingClientRect()
    const k = rest.getBoundingClientRect()
    // Kalau ruang di kanan tanda terlalu sempit, ia tidak pergi. Saat dicerminkan, ujung tangan ada di
    // x = 120 - KAPUR_HAND.x dan badan menjorok sampai x = 106 (cermin dari tepi kiri, 14). Tanpa tangan,
    // badan yang miring menjorok 74 satuan viewBox ke kanan dari ujung bawahnya.
    const point = arms ? HAND_MIRRORED : KAPUR_TIP
    const targetX = arms ? m.right - 2 : m.left + m.width / 2
    const bodyRight = targetX + (k.width * (arms ? 106 - HAND_MIRRORED.x : 74)) / 120
    if (bodyRight > window.innerWidth - 8) return setReach(null)
    const px = k.left + (k.width * point.x) / 120
    const py = k.top + (k.height * point.y) / 150
    setReach({ x: targetX - px, y: m.top + m.height / 2 - py })
  }, [writing, arms])

  return (
    <div className="flex min-h-dvh flex-col md:h-dvh">
      <TopBar state={state} concepts={concepts} elapsed={elapsed} sessionDone={sessionDone} />

      <main className="mx-auto flex w-full max-w-[80rem] flex-1 flex-col gap-4 px-4 pb-4 md:min-h-0 md:flex-row md:gap-5 md:px-8 md:pb-5">
        <section
          aria-labelledby="agenda-title"
          className="flex flex-col rounded-[28px] bg-card p-5 md:min-h-0 md:w-[34%] md:max-w-[26rem] md:shrink-0 md:p-6"
          // Tanda dan debu menunggu Empur tiba di baris.
          style={{ '--draw-delay': '380ms' } as CSSProperties}
        >
          <Agenda
            concepts={concepts}
            statusOf={statusOf}
            rowRef={(id, el) => {
              rowRefs.current[id] = el
            }}
          />
          <Legend className="mt-5 md:mt-auto md:pt-5" />
        </section>

        <section className="relative flex min-h-[45vh] flex-1 flex-col rounded-[28px] border border-line bg-surface p-5 md:min-h-0 md:p-7">
          {started ? <Transcript state={state} concepts={concepts.filter((c) => statusOf(c.id) !== 'none')} /> : <Guidance />}

          {/* Empur di pojok kiri bawah kartu, dengan balon di sampingnya. */}
          <div className="relative z-20 mt-4 flex shrink-0 items-end gap-2">
            <div ref={kapurRef} className="relative shrink-0">
              {/* Bayangan tetap di tempat saat Empur pergi mencentang. */}
              <span aria-hidden="true" className="absolute bottom-3 left-1/2 h-2.5 w-16 -translate-x-1/2 rounded-full bg-ink/10" />
              <div
                className={`kapur-actor ${reach && !arms ? 'kapur-scribble' : ''}`}
                style={{
                  transformOrigin: origin(arms ? HAND_MIRRORED : KAPUR_TIP),
                  transform: reach ? `translate(${reach.x}px, ${reach.y}px) rotate(${arms ? 4 : 28}deg)` : undefined,
                }}
              >
                {/* Dicerminkan hanya saat mencentang dengan tangan, supaya tangan penunjuk mengarah ke kiri. */}
                <div style={{ transform: reach && arms ? 'scaleX(-1)' : undefined }}>
                  <Kapur mood={line.mood} tick={reach !== null} quiet={reach !== null} className="h-28 w-[5.6rem] md:h-40 md:w-32" />
                </div>
              </div>
            </div>
            {!reach && (
              <p
                key={line.text}
                className="bubble relative mb-10 max-w-[26rem] rounded-2xl border border-line bg-surface px-4 py-3 font-medium leading-snug shadow-[0_12px_32px_-18px_rgba(0,0,0,0.4)] md:mb-16"
              >
                {line.text}
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer state={state} started={started} sessionDone={sessionDone} onStart={start} onStop={() => source.stop()} />
    </div>
  )
}

function TopBar({
  state,
  concepts,
  elapsed,
  sessionDone,
}: {
  state: LiveState
  concepts: Concept[]
  elapsed: number
  sessionDone: boolean
}) {
  const explained = concepts.filter((c) => state.concepts[c.id] === 'explained').length
  const mentioned = concepts.filter((c) => state.concepts[c.id] === 'mentioned').length

  // Bar memantul saat satu konsep lagi dijelaskan. Tanpa remount, jadi isi bar tetap bergeser halus.
  const barRef = useRef<HTMLDivElement>(null)
  const shown = useRef(explained)
  useEffect(() => {
    const grew = explained > shown.current
    shown.current = explained
    if (!grew || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    barRef.current?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.01, 1.4)', offset: 0.4 }, { transform: 'scale(1)' }],
      { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    )
  }, [explained])
  const recording = state.status === 'listening'
  const label = recording ? 'Merekam' : state.status === 'processing' ? 'Memproses' : sessionDone ? 'Selesai' : 'Siap'
  const latency = state.latencyMs === null ? '–' : `${decimal(state.latencyMs / 1000)} dtk`
  const summary = `${explained} dari ${concepts.length} konsep dijelaskan`

  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 md:gap-x-5 md:px-8 md:py-4">
      <Link
        to="/setup"
        aria-label="Ganti topik"
        className="chip grid size-10 shrink-0 place-items-center text-ink transition-colors duration-150 hover:bg-card"
      >
        <CloseIcon className="size-5" />
      </Link>
      <div className="mr-auto md:mr-0">
        <h1 className="text-lg font-semibold leading-tight tracking-tight">{BACKPROP_TOPIC}</h1>
        <p className="text-sm text-ink-3">Sesi contoh, bukan suaramu</p>
      </div>

      {/* Bilah kemajuan bersegmen seperti Brilliant: satu bagian per konsep. Hijau penuh = dijelaskan,
          kuning setengah = baru disebut. Bagian menghitung jumlah, bukan baris agenda. */}
      <div className="order-last w-full min-w-0 xl:order-none xl:mx-4 xl:w-auto xl:flex-1 xl:basis-0">
        <div
          ref={barRef}
          role="progressbar"
          aria-label="Konsep yang sudah dijelaskan"
          aria-valuemin={0}
          aria-valuemax={concepts.length}
          aria-valuenow={explained}
          aria-valuetext={summary}
          className="flex gap-1.5"
        >
          {concepts.map((c, i) => (
            <span key={c.id} className="h-2.5 flex-1 overflow-hidden rounded-full bg-card-2">
              <span
                className={`block h-full rounded-full transition-[width,background-color] duration-500 ease-out ${i < explained ? 'bg-go' : 'bg-[#FFB020]'}`}
                style={{ width: i < explained ? '100%' : i < explained + mentioned ? '50%' : '0%' }}
              />
            </span>
          ))}
        </div>
        <p className="mt-1.5 text-sm text-ink-3">
          {summary}
          {mentioned > 0 && ` · ${mentioned} baru disebut`}
        </p>
      </div>

      {/* Status rekaman, waktu, dan latensi dalam satu pil. */}
      <div className="flex items-center gap-3 rounded-full bg-card px-4 py-2 text-sm">
        <p className="flex items-center gap-2 font-medium" aria-live="polite">
          <span aria-hidden="true" className={`size-2.5 rounded-full ${recording ? 'animate-pulse bg-stop' : 'bg-ink-3/50'}`} />
          {/* Lebar tetap di semua status, supaya bilah kemajuan di sampingnya tidak ikut bergeser. */}
          <FixedWidth options={STATUS_LABELS} value={label} />
          <span className="min-w-[2.6rem] tabular-nums text-ink-2">{clock(elapsed)}</span>
        </p>
        <span aria-hidden="true" className="h-4 w-px bg-line" />
        <p className="flex items-baseline gap-1 text-ink-3">
          Latensi
          <FixedWidth options={['0,0 dtk']} value={latency} className="font-medium tabular-nums text-ink" />
        </p>
      </div>
      <div className="flex items-center gap-2">
        <EmpurMenu />
        <ThemeToggle />
      </div>
    </header>
  )
}

const STATUS_LABELS = ['Siap', 'Merekam', 'Memproses', 'Selesai']

// Semua kemungkinan teks ditumpuk di satu sel grid dan hanya satu yang terlihat,
// jadi lebarnya selalu selebar teks terpanjang.
function FixedWidth({ options, value, className = '' }: { options: string[]; value: string; className?: string }) {
  return (
    <span className={`grid ${className}`}>
      {[value, ...options.filter((o) => o !== value)].map((o, i) => (
        <span key={o} aria-hidden={i > 0 || undefined} className={`[grid-area:1/1] ${i > 0 ? 'invisible' : ''}`}>
          {o}
        </span>
      ))}
    </span>
  )
}

function Agenda({
  concepts,
  statusOf,
  rowRef,
}: {
  concepts: Concept[]
  statusOf: (id: string) => MarkStatus
  rowRef: (id: string, el: HTMLLIElement | null) => void
}) {
  return (
    <div className="flex flex-col md:min-h-0">
      <h2 id="agenda-title" className="text-lg font-semibold">
        Agenda
      </h2>
      <p className="mt-0.5 text-sm text-ink-3">Perkiraan langsung, diperiksa lagi setelah sesi.</p>
      {/* ponytail: 5-6 konsep muat di 1366x768; daftar yang lebih panjang menggulir di dalam agenda. */}
      <ol className="-mx-2 mt-4 flex flex-col gap-2 px-2 py-1 md:min-h-0 md:overflow-y-auto md:overflow-x-hidden">
        {concepts.map((c) => {
          const s = statusOf(c.id)
          return (
            <li key={c.id} ref={(el) => rowRef(c.id, el)} className="relative flex items-center gap-3 rounded-2xl bg-surface py-3 pl-4 pr-3">
              {/* Yang belum dibahas paling tegas; yang sudah dijelaskan meredup. */}
              <span className={`min-w-0 flex-1 text-[1.1rem] leading-snug ${s === 'explained' ? 'font-medium text-ink-3' : 'font-semibold'}`}>
                {c.name}
              </span>
              <span className="shrink-0 text-sm text-ink-3">{MARK_LABEL[s]}</span>
              <StatusIcon key={s} status={s} draw={s === 'explained'} />
              {s === 'explained' && (
                <span aria-hidden="true" className="dust absolute right-6 top-1/2">
                  {DUST.map(([dx, dy], i) => (
                    <i key={i} style={{ '--dx': `${dx}px`, '--dy': `${dy}px` } as CSSProperties} />
                  ))}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Legend({ className = '' }: { className?: string }) {
  return (
    <ul aria-label="Arti tanda" className={`flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2 ${className}`}>
      {(['none', 'mentioned', 'explained'] as const).map((s) => (
        <li key={s} className="flex items-center gap-2">
          <StatusIcon status={s} className="size-5" />
          {MARK_LABEL[s]}
        </li>
      ))}
    </ul>
  )
}

function Guidance() {
  const steps = [
    'Tekan Mulai. Kalau browser meminta izin mikrofon, izinkan.',
    'Bicara seperti biasa. Kamu tidak perlu terus melihat layar.',
    'Sesekali lirik agenda. Cincin kosong berarti konsep itu belum kamu bahas.',
  ]
  return (
    <div className="flex flex-1 flex-col gap-6 md:min-h-0 md:overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold">Sebelum mulai</h2>
        <p className="mt-2 text-[1.2rem] leading-relaxed text-ink-2">
          Jelaskan {BACKPROP_TOPIC} dengan suaramu sendiri, seolah ke teman yang belum paham.
        </p>
      </div>
      {/* Mengisi lebar kartu: bertumpuk di layar sempit, tiga kolom dari 1024px. */}
      <ol className="grid gap-2.5 lg:grid-cols-3 lg:gap-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl bg-card px-4 py-3.5 leading-snug lg:flex-col lg:px-5 lg:py-5">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface text-sm font-semibold tabular-nums text-ink-2">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Transcript({ state, concepts }: { state: LiveState; concepts: Concept[] }) {
  const ref = useRef<HTMLDivElement>(null)
  // Key memakai posisi karakter, supaya sorotan yang sudah ada tidak digambar ulang
  // saat istilah baru memecah teks sebelumnya.
  const segments = useMemo(
    () =>
      buildSegments(
        state.confirmed,
        state.pauses,
        concepts.map((c) => ({ id: c.id, terms: [c.name, ...c.aliases] })),
      ).reduce<{ pos: number; items: { seg: Segment; key: string }[] }>(
        ({ pos, items }, seg) => ({
          pos: pos + (seg.kind === 'text' ? seg.text.length : 0),
          items: [...items, { seg, key: `${seg.kind === 'pause' ? 'p' : 't'}${pos}` }],
        }),
        { pos: 0, items: [] },
      ).items,
    [state.confirmed, state.pauses, concepts],
  )

  // Ikuti teks terbaru, kecuali user sedang menggulir ke atas.
  useEffect(() => {
    const el = ref.current
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 120) el.scrollTop = el.scrollHeight
  }, [state.confirmed, state.partial])

  const empty = !state.confirmed && !state.partial
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 className="text-lg font-semibold">Penjelasanmu</h2>
        <p className="text-sm text-ink-3">Teks samar masih bisa berubah.</p>
      </div>
      <div ref={ref} className="mt-4 flex-1 md:overflow-y-auto md:pr-2">
        <p className="max-w-[64ch] text-[1.3rem] leading-[1.7]">
          {empty && <span className="text-ink-3">Mendengarkan… mulai jelaskan kapan saja.</span>}
          {segments.map(({ seg, key }) =>
            seg.kind === 'pause' ? (
              <PauseChip key={key} duration={seg.duration} />
            ) : (
              <span key={key} className={seg.conceptId ? 'term-mark' : undefined}>
                {seg.text}
              </span>
            ),
          )}{' '}
          {state.partial && <span className="text-ink-3">{state.partial}</span>}
        </p>
      </div>
    </>
  )
}

function Footer({
  state,
  started,
  sessionDone,
  onStart,
  onStop,
}: {
  state: LiveState
  started: boolean
  sessionDone: boolean
  onStart: () => void
  onStop: () => void
}) {
  return (
    // Di layar sempit, footer baru menempel di bawah setelah sesi mulai. Sebelum itu ia mengalir di akhir
    // halaman, supaya teks privasinya tidak menutupi separuh layar.
    <footer
      className={`z-30 flex flex-col gap-3 border-t border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:gap-4 md:static md:gap-6 md:px-8 md:py-4 ${started ? 'sticky bottom-0' : 'relative'}`}
    >
      {!started ? (
        <p className="mr-auto max-w-[56rem] text-sm leading-relaxed text-ink-3">
          Suaramu diproses di laptop ini. Setelah kamu berhenti, transkrip, daftar konsep, metrik, dan materimu dikirim
          ke Gemini untuk feedback, dan Gemini versi gratis bisa memakai data itu. Untuk sekarang, aplikasi memutar sesi
          contoh sekitar 90 detik.
        </p>
      ) : (
        <dl className="mr-auto flex gap-2 md:gap-3">
          <Stat icon={<SpeedIcon className="size-5" />} value={state.wpm} label="kata/menit" />
          <Stat icon={<FillerIcon className="size-5" />} value={state.fillerCount} label="filler" />
          <Stat icon={<PauseIcon className="size-5" />} value={state.pauses.length} label="jeda panjang" />
        </dl>
      )}
      {/* Di layar sempit tombol melebar penuh di bawah teks atau statistik. */}
      <div className="flex shrink-0 gap-3 max-sm:*:flex-1">
        {!started && (
          <button className="btn btn-go px-12 text-lg" onClick={onStart}>
            Mulai
          </button>
        )}
        {state.status === 'listening' && (
          <button className="btn btn-stop px-8" onClick={onStop}>
            Berhenti
          </button>
        )}
        {state.status === 'processing' && (
          <button className="btn btn-stop px-8" disabled>
            Memproses…
          </button>
        )}
        {sessionDone && (
          <>
            <button className="btn btn-plain hidden sm:inline-flex" onClick={onStart}>
              Ulangi dari awal
            </button>
            <Link className="btn btn-go" to="/feedback">
              Lihat feedback
            </Link>
          </>
        )}
      </div>
    </footer>
  )
}

function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 md:px-4">
      <span className="text-ink-3">{icon}</span>
      <dt className="order-2 text-sm text-ink-3 max-sm:sr-only">{label}</dt>
      <dd className="order-1 text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
