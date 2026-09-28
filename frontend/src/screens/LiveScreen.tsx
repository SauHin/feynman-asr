import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react'
import { Link } from 'react-router'
import {
  ChalkDefs,
  ChalkMark,
  CloseIcon,
  FillerIcon,
  PauseIcon,
  SpeedIcon,
  type MarkStatus,
} from '../components/chalk'
import { Board, PausePill, Panel, PanelTitle } from '../components/board'
import { ClassroomWall } from '../components/classroom'
import { Kapur } from '../components/kapur'
import { ThemeToggle } from '../components/app-bar'
import { clock, decimal } from '../lib/format'
import { KAPUR_HAND, kapurSays } from '../lib/kapur'
import { initialLiveState, liveReducer, type LiveState } from '../lib/live-state'
import type { TranscriptSource } from '../lib/transcript-source'
import { buildSegments, type Segment } from '../lib/transcript-segments'
import { BACKPROP_CONCEPTS, BACKPROP_TOPIC } from '../mocks/backprop'
import { MockTranscriptSource } from '../mocks/mock-transcript-source'
import type { Concept } from '../types/feedback'

const MARK_LABEL: Record<MarkStatus, string> = { none: 'belum', mentioned: 'disebut', explained: 'dijelaskan' }
// Belum dibahas paling mencolok lewat warna kuning dan kotak kosong, bukan lewat huruf tebal.
const ROW_CLASS: Record<MarkStatus, string> = {
  none: 'font-medium text-chalk-yellow',
  mentioned: 'font-medium text-chalk',
  explained: 'font-normal text-chalk-dim',
}
const MARK_CLASS: Record<MarkStatus, string> = {
  none: 'text-chalk-yellow',
  mentioned: 'text-chalk',
  explained: 'text-chalk-mint',
}
const DUST = [
  [-26, -18],
  [-8, -30],
  [14, -26],
  [28, -8],
  [-30, 4],
  [22, 12],
]

// Lama Si Kapur berada di baris agenda saat mencentang, sebelum kembali ke baki.
const WRITE_SECONDS = 1.3


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

  // Si Kapur pergi ke baris yang statusnya baru naik, mencentangnya dengan tangan, lalu kembali ke baki.
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({})
  const kapurRef = useRef<HTMLDivElement>(null)
  const lastEvent = state.conceptEvents.at(-1)
  const writing = lastEvent && state.status === 'listening' && elapsed - lastEvent.t < WRITE_SECONDS ? lastEvent : null
  const [reach, setReach] = useState<{ x: number; y: number } | null>(null)
  useLayoutEffect(() => {
    const row = writing ? rowRefs.current[writing.id] : null
    const rest = kapurRef.current
    if (!row || !rest || matchMedia('(prefers-reduced-motion: reduce)').matches) return setReach(null)
    const r = row.getBoundingClientRect()
    const k = rest.getBoundingClientRect()
    // Ujung tangan menyentuh sisi kiri kotak tanda. Badannya berdiri di dinding kiri kolom kotak,
    // jadi kotak konsep lain tetap terlihat. Kalau dinding kiri terlalu sempit, ia mencentang dari baki.
    const targetX = r.left + 6
    const bodyLeft = targetX - (k.width * (KAPUR_HAND.x - 26)) / 120
    if (bodyLeft < 8) return setReach(null)
    const handX = k.left + (k.width * KAPUR_HAND.x) / 120
    const handY = k.top + (k.height * KAPUR_HAND.y) / 150
    setReach({ x: targetX - handX, y: r.top + r.height / 2 - handY })
  }, [writing])

  const agenda = (
    <>
      <Agenda
        concepts={concepts}
        statusOf={statusOf}
        rowRef={(id, el) => {
          rowRefs.current[id] = el
        }}
      />
      <Legend className="mt-6 text-sm md:mt-auto" />
    </>
  )

  // Si Kapur berdiri di baki kapur di bawah panel penjelasan: kakinya turun melewati tepi bawah papan.
  const kapur = (
    <>
      <div className="relative z-20 mt-4 flex shrink-0 items-end gap-2 md:-mb-[52px]">
        <div ref={kapurRef} className="relative shrink-0">
          {/* Bayangan tetap di baki saat Si Kapur pergi mencentang. */}
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-1/2 h-3 w-20 -translate-x-1/2 rounded-full bg-black/20"
          />
          <div
            className="kapur-actor"
            style={reach ? { transform: `translate(${reach.x}px, ${reach.y}px) rotate(-4deg)` } : undefined}
          >
            <Kapur mood={line.mood} tick={reach !== null} quiet={reach !== null} className="h-28 w-[5.6rem] md:h-40 md:w-32" />
          </div>
        </div>
        {!reach && (
          <p
            key={line.text}
            className="bubble relative mb-12 max-w-[26rem] md:mb-[4.5rem] rounded-2xl border-[3px] border-outline bg-surface px-4 py-3 font-display text-[1.05rem] leading-snug text-ink"
          >
            {line.text}
            <span
              aria-hidden="true"
              className="absolute -left-[11px] bottom-4 size-4 rotate-45 border-b-[3px] border-l-[3px] border-outline bg-surface"
            />
          </p>
        )}
      </div>
    </>
  )

  return (
    <div className="flex min-h-dvh flex-col md:h-dvh">
      <ChalkDefs />
      <TopBar state={state} concepts={concepts} elapsed={elapsed} sessionDone={sessionDone} />

      <div className="relative flex flex-1 flex-col px-3 pb-4 md:min-h-0 md:px-8 md:pb-5">
        <ClassroomWall elapsed={elapsed} />
        <div className="relative z-10 mx-auto flex w-full max-w-[68rem] flex-1 flex-col md:min-h-0 2xl:max-w-[80rem]">
          <Board className="flex-1 md:min-h-0">
            <div className="flex flex-1 flex-col gap-3 md:min-h-0 md:flex-row">
              <Panel className="md:w-[36%] md:max-w-[27rem] md:shrink-0">{agenda}</Panel>
              <Panel className="min-h-[45vh] flex-1 md:min-h-0">
                {started ? (
                  <Transcript state={state} concepts={concepts.filter((c) => statusOf(c.id) !== 'none')} />
                ) : (
                  <Guidance />
                )}
                {kapur}
              </Panel>
            </div>
          </Board>
        </div>
      </div>

      <Footer
        state={state}
        started={started}
        sessionDone={sessionDone}
        onStart={start}
        onStop={() => source.stop()}
      />
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
      [{ transform: 'scale(1)' }, { transform: 'scale(1.02, 1.18)', offset: 0.4 }, { transform: 'scale(1)' }],
      { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    )
  }, [explained])
  const recording = state.status === 'listening'
  const label = recording ? 'Merekam' : state.status === 'processing' ? 'Memproses' : sessionDone ? 'Selesai' : 'Siap'
  const latency = state.latencyMs === null ? '–' : `${decimal(state.latencyMs / 1000)} dtk`

  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 md:gap-x-5 md:px-8 md:py-3">
      <Link
        to="/setup"
        aria-label="Ganti topik"
        className="chip grid size-11 place-items-center text-ink transition-transform duration-100 active:translate-y-0.5"
      >
        <CloseIcon className="size-5" />
      </Link>
      <div className="mr-auto md:mr-0">
        <h1 className="font-display text-2xl font-semibold leading-none">{BACKPROP_TOPIC}</h1>
        <p className="mt-1 text-sm text-ink-2">Sesi contoh, bukan suaramu</p>
      </div>

      <div className="order-last w-full min-w-0 xl:order-none xl:mx-4 xl:w-auto xl:flex-1 xl:basis-0">
        <ProgressTrack
          ref={barRef}
          total={concepts.length}
          explained={explained}
          mentioned={mentioned}
          label={`${explained} dari ${concepts.length} konsep dijelaskan`}
        />
        <p className="mt-0.5 font-display text-sm text-ink-2">
          {explained} dari {concepts.length} konsep dijelaskan
          {mentioned > 0 && ` · ${mentioned} baru disebut`}
        </p>
      </div>

      {/* Status rekaman dan latensi dalam satu chip, supaya bilah atas tidak penuh elemen lepas. */}
      <div className="chip flex items-center gap-3 px-3 py-1.5 font-display">
        <p className="flex items-center gap-2" aria-live="polite">
          <span aria-hidden="true" className={`size-3 rounded-full ${recording ? 'bg-stop' : 'bg-line-strong'}`} />
          {/* Lebar chip tetap di semua status, supaya progress bar di sampingnya tidak ikut melebar dan menyempit. */}
          <FixedWidth options={STATUS_LABELS} value={label} />
          <span className="min-w-[2.6rem] tabular-nums text-ink-2">{clock(elapsed)}</span>
        </p>
        <span aria-hidden="true" className="h-5 w-0.5 rounded-full bg-line-strong" />
        <p className="flex items-baseline gap-1 text-sm text-ink-2">
          Latensi
          <FixedWidth options={['0,0 dtk']} value={latency} className="tabular-nums text-ink" />
        </p>
      </div>
      <ThemeToggle />
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
    <section
      aria-labelledby="agenda-title"
      className="flex flex-col md:min-h-0"
      // Tanda dan debu menunggu tangan Si Kapur tiba di baris.
      style={{ '--draw-delay': '380ms' } as CSSProperties}
    >
      <PanelTitle id="agenda-title">Agenda</PanelTitle>
      <p className="mt-2 text-sm text-chalk-dim">Perkiraan langsung, diperiksa lagi setelah sesi.</p>
      {/* ponytail: 5-6 konsep muat di 1366x768; daftar yang lebih panjang menggulir di dalam agenda. */}
      <ol className="-mx-3 mt-4 flex flex-col gap-3 px-3 md:min-h-0 md:overflow-y-auto">
        {concepts.map((c) => {
          const s = statusOf(c.id)
          return (
            <li key={c.id} ref={(el) => rowRef(c.id, el)} className="relative flex items-center gap-3">
              <ChalkMark status={s} className={`size-9 shrink-0 ${MARK_CLASS[s]}`} />
              <p className="flex flex-wrap items-baseline gap-x-2 leading-tight">
                <span className={`font-display text-[1.45rem] ${ROW_CLASS[s]}`}>{c.name}</span>
                <span className="text-sm text-chalk-dim">{MARK_LABEL[s]}</span>
              </p>
              {s === 'explained' && (
                <span aria-hidden="true" className="dust absolute left-4 top-1/2">
                  {DUST.map(([dx, dy], i) => (
                    <i key={i} style={{ '--dx': `${dx}px`, '--dy': `${dy}px` } as CSSProperties} />
                  ))}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Legend({ className = '' }: { className?: string }) {
  return (
    <ul aria-label="Arti tanda" className={`flex flex-wrap gap-x-5 gap-y-2 font-display text-chalk-dim ${className}`}>
      {(['none', 'mentioned', 'explained'] as const).map((s) => (
        <li key={s} className="flex items-center gap-2">
          <ChalkMark status={s} className={`size-6 ${MARK_CLASS[s]}`} />
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
    'Sesekali lirik agenda. Kotak kosong berarti konsep itu belum kamu bahas.',
  ]
  return (
    // Judul memakai gaya yang sama dengan Agenda dan Penjelasanmu, dan sejajar di atas panel.
    <div className="flex flex-1 flex-col gap-5 text-chalk md:min-h-0 md:overflow-y-auto">
      <div>
        <PanelTitle>Sebelum mulai</PanelTitle>
        <p className="mt-4 max-w-[56ch] text-lg font-medium leading-relaxed">
          Di sini kamu berlatih dengan metode Feynman: jelaskan {BACKPROP_TOPIC} dengan suaramu sendiri, seolah ke
          teman yang belum paham.
        </p>
      </div>
      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-[1.05rem] font-medium leading-snug">
            <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-chalk-dim font-display font-semibold text-chalk-yellow">
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
  // Key memakai posisi karakter, supaya garis bawah yang sudah ada tidak digambar ulang
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
      <PanelTitle note="Teks samar masih bisa berubah.">Penjelasanmu</PanelTitle>
      <div ref={ref} className="mt-4 flex-1 md:overflow-y-auto md:pr-2">
        <p className="max-w-[68ch] text-[1.25rem] font-medium leading-[1.7] text-chalk">
          {empty && <span className="text-chalk-dim">Mendengarkan… mulai jelaskan kapan saja.</span>}
          {segments.map(({ seg, key }) =>
            seg.kind === 'pause' ? (
              <PausePill key={key} duration={seg.duration} />
            ) : (
              <span key={key} className={seg.conceptId ? 'chalk-term' : undefined}>
                {seg.text}
              </span>
            ),
          )}{' '}
          {state.partial && <span className="text-chalk-dim">{state.partial}</span>}
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
    // Di layar sempit, footer baru menempel di bawah setelah sesi mulai. Sebelum itu teks privasinya panjang,
    // jadi footer ikut mengalir di akhir halaman supaya tidak menutupi separuh layar.
    <footer
      className={`z-30 flex items-center gap-4 border-t-[3px] border-outline bg-surface px-3 py-3 md:static md:gap-6 md:px-8 md:py-4 ${started ? 'sticky bottom-0' : 'relative'}`}
    >
      {!started ? (
        <p className="mr-auto max-w-[60rem] text-sm leading-relaxed text-ink-2">
          Suaramu diproses di laptop ini dan tidak dikirim ke mana pun. Setelah kamu berhenti, teks transkrip, daftar
          konsep, metrik kelancaran, dan materi yang kamu upload dikirim ke Gemini untuk feedback. Gemini versi gratis
          bisa memakai data itu untuk meningkatkan layanan Google. Untuk sekarang, aplikasi memutar sesi contoh sekitar
          90 detik.
        </p>
      ) : (
        <dl className="mr-auto flex gap-1.5 md:gap-3">
          <Stat icon={<SpeedIcon className="size-5" />} value={state.wpm} label="kata/menit" />
          <Stat icon={<FillerIcon className="size-5" />} value={state.fillerCount} label="filler" />
          <Stat icon={<PauseIcon className="size-5" />} value={state.pauses.length} label="jeda panjang" />
        </dl>
      )}
      <div className="flex shrink-0 gap-3">
        {!started && (
          <button className="btn btn-go px-10 text-xl" onClick={onStart}>
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

// Bar progres sebagai satu bentuk: jalur dan satu lingkaran per konsep berbagi satu garis luar,
// dan warnanya mengalir masuk ke lingkaran. Warnanya sama dengan agenda: mint = dijelaskan (centang),
// kapur putih = baru disebut (garis miring), kosong = belum. Lingkaran menghitung jumlah, bukan baris agenda.
function ProgressTrack({
  ref,
  total,
  explained,
  mentioned,
  label,
}: {
  ref: Ref<HTMLDivElement>
  total: number
  explained: number
  mentioned: number
  label: string
}) {
  const clip = useId()
  const box = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const H = 36
  // Lingkaran 1,6 kali setengah tinggi jalur, supaya tiap lingkaran terbaca sebagai titik sendiri.
  const R = 15
  const grow = { transformOrigin: '0 0', transition: 'transform 500ms ease-out' }
  // Lingkaran di tengah tiap segmen, jadi kedua ujung bar tetap berupa jalur, bukan lingkaran.
  const nodeX = (i: number) => 4 + ((w - 8) * (i + 0.5)) / total
  const reach = (n: number) => (n <= 0 ? 0 : n >= total ? w : nodeX(n - 1) + R)
  const shapes = (
    <>
      <rect x="4" y="9" width={Math.max(0, w - 8)} height="18" rx="9" />
      {Array.from({ length: total }, (_, i) => (
        <circle key={i} cx={nodeX(i)} cy={H / 2} r={R} />
      ))}
    </>
  )

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-label="Konsep yang sudah dijelaskan"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={explained}
      aria-valuetext={label}
    >
      <div ref={box} className="relative h-9 text-outline">
        {w > 0 && (
          <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} aria-hidden="true" className="absolute inset-0 overflow-visible">
            <clipPath id={clip}>{shapes}</clipPath>
            {/* Garis luar gabungan: bentuk yang sama digambar dengan stroke tebal, lalu diisi di atasnya. */}
            <g fill="currentColor" stroke="currentColor" strokeWidth="6" strokeLinejoin="round">
              {shapes}
            </g>
            <g className="fill-track">{shapes}</g>
            <g clipPath={`url(#${clip})`}>
              {/* Isi bergeser lewat scaleX dari tepi kiri, bukan animasi lebar. */}
              <rect
                x="0"
                y="0"
                width={w}
                height={H}
                fill="#f4f7f0"
                style={{ ...grow, transform: `scaleX(${reach(explained + mentioned) / w})` }}
              />
              {/* Mint lebih pekat di mode siang supaya kontras dengan jalur yang pucat. */}
              <rect
                x="0"
                y="0"
                width={w}
                height={H}
                className="fill-[#5ccb94] dark:fill-[#9ee8c0]"
                style={{ ...grow, transform: `scaleX(${reach(explained) / w})` }}
              />
            </g>
            {Array.from({ length: total }, (_, i) => {
              const cx = nodeX(i)
              const done = explained >= i + 1
              const partly = !done && explained + mentioned >= i + 1
              return done ? (
                <path
                  key={i}
                  d={`M${cx - 5.5} ${H / 2 + 0.5}l3.8 3.8 7.2-8`}
                  fill="none"
                  stroke="#0e3b22"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : partly ? (
                <path
                  key={i}
                  d={`M${cx - 4.5} ${H / 2 + 5}l9-10`}
                  fill="none"
                  stroke="#1e2b3a"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              ) : (
                // Cincin dalam, supaya lingkaran kosong tetap bisa dihitung.
                <circle
                  key={i}
                  cx={cx}
                  cy={H / 2}
                  r="7"
                  fill="none"
                  strokeWidth="2"
                  className="stroke-current opacity-35 dark:stroke-chalk-dim dark:opacity-80"
                />
              )
            })}
          </svg>
        )}
      </div>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="chip flex items-center gap-1.5 px-2 py-1 md:gap-2 md:px-3 md:py-1.5">
      <span className="text-ink-2">{icon}</span>
      <dt className="order-2 text-sm text-ink-2 max-sm:sr-only">{label}</dt>
      <dd className="order-1 font-display text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
