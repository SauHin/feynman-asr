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
  MoonIcon,
  PauseIcon,
  SpeedIcon,
  SunIcon,
  type MarkStatus,
} from '../components/chalk'
import { ClassroomWall } from '../components/classroom'
import { Kapur } from '../components/kapur'
import { KAPUR_HAND, kapurSays } from '../lib/kapur'
import { initialLiveState, liveReducer, type LiveState } from '../lib/live-state'
import { useTheme } from '../lib/theme'
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

const decimal = (n: number) => n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

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
            <Kapur mood={line.mood} tick={reach !== null} quiet={reach !== null} className="h-40 w-32" />
          </div>
        </div>
        {!reach && (
          <p
            key={line.text}
            className="bubble relative mb-[4.5rem] max-w-[26rem] rounded-2xl border-[3px] border-outline bg-surface px-4 py-3 font-display text-[1.05rem] leading-snug text-ink"
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
          <Board
            left={agenda}
            right={
              <>
                {started ? (
                  <Transcript state={state} concepts={concepts.filter((c) => statusOf(c.id) !== 'none')} />
                ) : (
                  <Guidance />
                )}
                {kapur}
              </>
            }
          />
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
  const [theme, setTheme] = useTheme()
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

  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 md:gap-x-5 md:px-8 md:py-3">
      <Link
        to="/"
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

      <p className="chip flex items-center gap-2 px-3 py-1.5 font-display" aria-live="polite">
        <span aria-hidden="true" className={`size-3 rounded-full ${recording ? 'bg-stop' : 'bg-line-strong'}`} />
        {label}
        <span className="min-w-[2.6rem] tabular-nums text-ink-2">{clock(elapsed)}</span>
      </p>
      <p className="font-display text-ink-2">
        Latensi{' '}
        <span className="tabular-nums text-ink">
          {state.latencyMs === null ? '–' : `${decimal(state.latencyMs / 1000)} dtk`}
        </span>
      </p>
      <div role="radiogroup" aria-label="Tema" className="chip flex gap-1 p-1">
        {(['light', 'dark'] as const).map((t) => (
          <button
            key={t}
            role="radio"
            aria-checked={theme === t}
            onClick={() => setTheme(t)}
            className={`flex items-center gap-1.5 rounded-[10px] border-2 px-3 py-1 font-display text-sm transition-colors duration-150 ${
              theme === t ? 'border-outline bg-chalk-yellow text-go-ink' : 'border-transparent text-ink-2 hover:text-ink'
            }`}
          >
            {t === 'light' ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
            <span className="max-sm:sr-only">{t === 'light' ? 'Siang' : 'Malam'}</span>
          </button>
        ))}
      </div>
    </header>
  )
}

// Papan tulis sebagai benda: bingkai kayu bergaris luar, dua panel hijau yang dipisah kayu
// (agenda di kiri, penjelasan di kanan), dan baki kapur di bawah.
function Board({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="wood-grain flex flex-1 flex-col rounded-[28px] border-[3px] border-outline bg-wood p-3 shadow-[inset_0_3px_0_var(--wood-light),0_6px_0_rgba(0,0,0,0.15)] md:min-h-0">
      <div className="flex flex-1 flex-col gap-3 md:min-h-0 md:flex-row">
        <Panel className="md:w-[36%] md:max-w-[27rem] md:shrink-0">{left}</Panel>
        <Panel className="min-h-[45vh] flex-1 md:min-h-0">{right}</Panel>
      </div>
      <Tray />
    </div>
  )
}

function Panel({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`relative flex flex-col rounded-[16px] border-[3px] border-outline bg-board p-5 shadow-[inset_0_5px_0_rgba(0,0,0,0.18)] md:min-h-0 md:px-7 md:py-6 ${className}`}
    >
      <BoardHaze />
      <div className="relative flex flex-1 flex-col md:min-h-0">{children}</div>
    </div>
  )
}

// Baki kapur dengan batang kapur berwarna dan penghapus, dalam gaya yang sama dengan Si Kapur.
function Tray() {
  return (
    <div className="relative mt-3 h-4 rounded-full border-[3px] border-outline bg-wood-dark">
      <svg viewBox="0 0 156 30" aria-hidden="true" className="absolute -top-[23px] right-4 h-[30px] w-[156px] text-outline">
        <g stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round">
          <rect x="4" y="15" width="34" height="12" rx="6" fill="#9bd8ff" />
          <ellipse cx="33" cy="21" rx="4" ry="6" fill="#d4efff" />
          <rect x="44" y="15" width="28" height="12" rx="6" fill="#ffb3d1" />
          <ellipse cx="67" cy="21" rx="4" ry="6" fill="#ffe0ec" />
          <rect x="88" y="4" width="62" height="23" rx="6" fill="#e0a868" />
          <rect x="88" y="16" width="62" height="11" rx="5" fill="#3a4656" />
        </g>
        <path d="M96 9h20" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
      </svg>
    </div>
  )
}

// Bekas hapusan dan tulisan lama yang samar di permukaan papan.
function BoardHaze() {
  const id = useId()
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[13px]">
      <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="size-full">
        <filter id={id}>
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <g filter={`url(#${id})`} fill="none" stroke="#fff" strokeLinecap="round">
          <path d="M70 480C250 410 420 530 650 450" strokeWidth="80" opacity="0.055" />
          <path d="M560 110C700 60 860 140 960 80" strokeWidth="64" opacity="0.05" />
          <path d="M130 160C220 130 300 200 380 160" strokeWidth="44" opacity="0.04" />
        </g>
        <g fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.05">
          <path d="M600 520q12-14 24 0t24 0 24 0M700 505h40M760 520q10-12 20 0t20 0M600 548h120" />
          <path d="M800 180l40-40M840 180l-40-40M870 160h50" />
        </g>
      </svg>
    </div>
  )
}

function PanelTitle({ id, children, note }: { id?: string; children: ReactNode; note?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
      <div>
        <h2 id={id} className="chalk-letter font-display text-2xl font-semibold text-chalk">
          {children}
        </h2>
        <span aria-hidden="true" className="chalk-rule mt-1 block h-3 w-24" />
      </div>
      {note && <p className="text-sm text-chalk-dim">{note}</p>}
    </div>
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
    <div className="flex flex-1 flex-col justify-center gap-5 text-chalk md:min-h-0 md:overflow-y-auto">
      <div>
        <h2 className="chalk-letter font-display text-4xl font-semibold text-chalk-yellow">Sebelum mulai</h2>
        <p className="mt-3 max-w-[56ch] text-lg font-medium leading-relaxed">
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
              <span
                key={key}
                className="mx-1 inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-chalk-blue/70 px-2 align-[0.1em] font-display text-base text-chalk-blue"
              >
                <PauseIcon className="size-4" />
                jeda {decimal(seg.duration)} dtk
              </span>
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
    <footer className="sticky bottom-0 z-30 flex items-center gap-4 border-t-[3px] border-outline bg-surface px-3 py-3 md:static md:gap-6 md:px-8 md:py-4">
      {!started ? (
        <p className="mr-auto max-w-3xl text-sm leading-relaxed text-ink-2">
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
              <rect x="10" y="12" width={Math.max(0, w - 20)} height="3.5" rx="1.75" fill="#fff" opacity="0.45" />
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
