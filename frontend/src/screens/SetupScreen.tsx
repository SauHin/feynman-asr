import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { AppBar, MockStateSwitch } from '../components/app-bar'
import { CloudIcon, PencilIcon, PlusIcon, RetryIcon, TrashIcon } from '../components/chalk'
import { Kapur } from '../components/kapur'
import type { KapurMood } from '../lib/kapur'
import { useMockState } from '../lib/mock-state'
import { formatPages, parsePages } from '../lib/pages'
import { BACKPROP_CONCEPTS } from '../mocks/backprop'
import type { Concept } from '../types/feedback'

type Step = 'topic' | 'material' | 'extracting' | 'failed' | 'review'
type Material =
  | { kind: 'file'; name: string; size: number; unit?: 'Halaman' | 'Slide'; pages: string }
  | { kind: 'text'; text: string }
  | { kind: 'none' }

const MAX_CONCEPTS = 8
// ponytail: ekstraksi masih mock (selalu konsep Backpropagation); ganti ke panggilan Gemini 1 di Fase 4.
const EXTRACT_MS = 2400
const FORMATS = ['pdf', 'pptx', 'txt', 'md']

const MOOD: Record<Step, KapurMood> = {
  topic: 'wave',
  material: 'curious',
  extracting: 'think',
  failed: 'confused',
  review: 'happy',
}
// Tiga bagian di bilah kemajuan. Bagian yang sedang dikerjakan terisi sebagian.
const PROGRESS: Record<Step, number> = { topic: 0.35, material: 1.35, extracting: 2.35, failed: 2.35, review: 2.8 }
const PARTS = ['Topik', 'Materi', 'Konsep']

const scrollBehavior = (): ScrollBehavior =>
  matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

const size = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`

function describe(m: Material) {
  if (m.kind === 'none') return 'Tanpa materi'
  if (m.kind === 'text') return `Teks tempelan · ${m.text.length.toLocaleString('id-ID')} karakter`
  const picked = parsePages(m.pages)
  const range = !m.unit
    ? ''
    : 'pages' in picked && picked.pages.length
      ? ` · ${m.unit.toLowerCase()} ${formatPages(picked.pages)}`
      : ` · semua ${m.unit.toLowerCase()}`
  return `${m.name}${range}`
}

// Setup sebagai alur satu pertanyaan per langkah, seperti onboarding Brilliant: bilah kemajuan di atas,
// Empur di samping pertanyaan, dan jawaban sebelumnya sebagai chip yang bisa diubah.
export default function SetupScreen() {
  const failMock = useMockState(['normal', 'gagal'] as const) === 'gagal'
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('topic')
  const [topic, setTopic] = useState('')
  const [material, setMaterial] = useState<Material | null>(null)
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [found, setFound] = useState(0)
  const [editing, setEditing] = useState<string | null>(null)
  const retried = useRef(false)

  // Ekstraksi mock: gagal sekali kalau ?keadaan=gagal, lalu berhasil saat dicoba lagi.
  useEffect(() => {
    if (step !== 'extracting') return
    const id = setTimeout(() => {
      if (failMock && !retried.current) return setStep('failed')
      setConcepts(BACKPROP_CONCEPTS)
      setFound(BACKPROP_CONCEPTS.length)
      setStep('review')
    }, EXTRACT_MS)
    return () => clearTimeout(id)
  }, [step, failMock])

  // Setiap langkah baru dimulai dari atas.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: scrollBehavior() })
  }, [step])

  // Mengubah jawaban lama memulai ulang dari langkah itu.
  const rewind = (to: Step) => {
    setStep(to)
    setConcepts([])
    setEditing(null)
    if (to === 'topic') setMaterial(null)
  }
  const ready = step === 'review' && concepts.length > 0 && editing === null

  const question: Record<Step, ReactNode> = {
    topic: 'Halo! Mau menjelaskan topik apa hari ini?',
    material: 'Punya materi kuliahnya? Aku ambil konsep dari situ.',
    extracting: (
      <>
        {material?.kind === 'none' ? `Sebentar, aku susun konsep dasar ${topic} dulu` : 'Sebentar, aku baca materimu dulu'}
        <span aria-hidden="true" className="dots">
          <i />
          <i />
          <i />
        </span>
      </>
    ),
    failed: 'Aku gagal menghubungi Gemini karena batas pemakaian gratis sedang tercapai.',
    review: found
      ? `Aku menemukan ${found} konsep. Cek dulu, ya.`
      : 'Tulis konsep yang harus kamu jelaskan. Nanti aku mencentangnya di agenda.',
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar back={{ to: '/', label: 'Kembali ke beranda' }} title="Siapkan topik" subtitle="Mockup: konsep contoh, belum dari Gemini">
        <MockStateSwitch
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'gagal', label: 'Ekstraksi gagal' },
          ]}
        />
      </AppBar>

      <main className="mx-auto flex w-full max-w-[44rem] flex-1 flex-col px-5 pb-12 pt-4">
        <Progress value={PROGRESS[step]} />

        {/* Jawaban sebelumnya, ringkas dan bisa diubah. */}
        {step !== 'topic' && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Answer label="topik" onEdit={() => rewind('topic')}>
              {topic}
            </Answer>
            {material && step !== 'material' && (
              <Answer label="materi" onEdit={() => rewind('material')}>
                {describe(material)}
              </Answer>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center gap-4 md:gap-6">
          <Kapur key={step} mood={MOOD[step]} className="h-28 w-[5.6rem] shrink-0 md:h-36 md:w-28" />
          <h2 key={`q-${step}`} className="bubble text-[1.4rem] font-semibold leading-snug tracking-tight md:text-[1.75rem]">
            {question[step]}
          </h2>
        </div>

        <div className="mt-8 flex flex-1 flex-col">
          {step === 'topic' && (
            <TopicForm
              initial={topic}
              onSubmit={(t) => {
                setTopic(t)
                setStep('material')
              }}
            />
          )}

          {step === 'material' && (
            <MaterialForm
              initial={material}
              onSubmit={(m) => {
                setMaterial(m)
                retried.current = false
                setStep('extracting')
              }}
            />
          )}

          {step === 'extracting' && (
            <div className="flex flex-col gap-2.5">
              {[0, 1, 2].map((i) => (
                <span key={i} aria-hidden="true" className="h-16 animate-pulse rounded-2xl bg-card" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
              <p role="status" className="mt-3 flex items-center gap-2 text-sm text-ink-3">
                <CloudIcon className="size-5 shrink-0" />
                {material?.kind === 'none' ? 'Topikmu' : 'Teks materimu'} dikirim ke Gemini untuk mengambil konsep.
              </p>
            </div>
          )}

          {step === 'failed' && (
            <div role="alert" className="flex flex-col gap-4">
              <p className="text-lg text-ink-2">Coba lagi sebentar lagi, atau tulis konsepnya sendiri.</p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="btn btn-go"
                  onClick={() => {
                    retried.current = true
                    setStep('extracting')
                  }}
                >
                  <RetryIcon className="size-5" />
                  Coba lagi
                </button>
                <button
                  className="btn btn-plain"
                  onClick={() => {
                    setConcepts([])
                    setFound(0)
                    setEditing('new')
                    setStep('review')
                  }}
                >
                  <PencilIcon className="size-5" />
                  Tulis sendiri
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <>
              <ConceptEditor
                concepts={concepts}
                onChange={setConcepts}
                editing={editing}
                setEditing={setEditing}
                noMaterial={material?.kind === 'none' && found > 0}
              />
              <div className="mt-10 flex flex-col items-center gap-3">
                <button
                  className="btn btn-go w-full max-w-80 text-lg"
                  disabled={!ready}
                  aria-describedby={ready ? undefined : 'syarat-mulai'}
                  onClick={() => navigate('/live')}
                >
                  Mulai menjelaskan
                </button>
                {!ready && (
                  <p id="syarat-mulai" className="text-sm text-ink-3">
                    {concepts.length ? 'Selesaikan dulu konsep yang sedang diubah.' : 'Tambah minimal satu konsep.'}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {(step === 'material' || step === 'review') && (
          <p className="mt-10 text-center text-xs leading-relaxed text-ink-3">
            Materi dan daftar konsep dikirim ke Gemini. Gemini versi gratis bisa memakai data itu untuk meningkatkan
            layanan Google. Suaramu tetap diproses di laptop ini.
          </p>
        )}
      </main>
    </div>
  )
}

// Bilah kemajuan bersegmen seperti Brilliant: bagian selesai terisi penuh, bagian aktif terisi sebagian.
function Progress({ value }: { value: number }) {
  const at = Math.floor(value)
  return (
    <div role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={at + 1} aria-valuetext={`Langkah ${at + 1} dari 3: ${PARTS[at]}`} className="flex gap-1.5">
      {PARTS.map((p, i) => (
        <span key={p} className="h-2 flex-1 overflow-hidden rounded-full bg-card-2">
          <span
            className="block h-full rounded-full bg-go transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(0, Math.min(1, value - i)) * 100}%` }}
          />
        </span>
      ))}
    </div>
  )
}

function Answer({ label, onEdit, children }: { label: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="flex max-w-full items-center gap-1 rounded-full bg-card py-1 pl-4 pr-1 text-sm">
      <p className="min-w-0 truncate">
        <span className="capitalize text-ink-3">{label}: </span>
        <span className="font-medium">{children}</span>
      </p>
      <button
        onClick={onEdit}
        aria-label={`Ubah ${label}`}
        className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-medium text-ink-2 transition-colors duration-150 hover:bg-card-2 hover:text-ink"
      >
        <PencilIcon className="size-3.5" />
        Ubah
      </button>
    </div>
  )
}

function TopicForm({ initial, onSubmit }: { initial: string; onSubmit: (topic: string) => void }) {
  const [value, setValue] = useState(initial)
  const topic = value.trim()
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (topic) onSubmit(topic)
      }}
    >
      <label htmlFor="topik" className="sr-only">
        Topik
      </label>
      <input
        id="topik"
        autoFocus
        autoComplete="off"
        maxLength={80}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Contoh: Backpropagation"
        className="field px-5 py-4 text-xl"
      />
      <p className="text-sm text-ink-3">Satu subtopik saja, supaya bisa kamu jelaskan dalam 2–5 menit.</p>
      <button className="btn btn-go mx-auto mt-8 w-full max-w-80 text-lg" disabled={!topic}>
        Lanjut
      </button>
    </form>
  )
}

// Ikon pilihan materi: bentuk datar bergradasi, sama dengan ikon tahap di beranda.
function OptionIcon({ kind, className = 'size-12' }: { kind: 'file' | 'text' | 'none'; className?: string }) {
  const [a, b] = { file: ['#9FDBFF', '#4B7BFF'], text: ['#FFE27A', '#FF9F43'], none: ['#DCC2FF', '#8B5CF6'] }[kind]
  const g = `url(#opt-${kind})`
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`opt-${kind}`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      {kind === 'file' && (
        <>
          <rect x="8" y="5" width="24" height="30" rx="5" fill={g} />
          <path d="M20 27V14M14.5 19l5.5-5.5 5.5 5.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {kind === 'text' && (
        <>
          <rect x="8" y="7" width="24" height="28" rx="5" fill={g} />
          <rect x="14" y="4" width="12" height="7" rx="3" fill={b} />
          <rect x="13" y="17" width="14" height="3" rx="1.5" fill="#fff" opacity="0.85" />
          <rect x="13" y="23" width="9" height="3" rx="1.5" fill="#fff" opacity="0.85" />
        </>
      )}
      {kind === 'none' && <path d="M20 4C22 14 26 18 36 20C26 22 22 26 20 36C18 26 14 22 4 20C14 18 18 14 20 4Z" fill={g} />}
    </svg>
  )
}

function MaterialForm({ initial, onSubmit }: { initial: Material | null; onSubmit: (m: Material) => void }) {
  const [mode, setMode] = useState<Material['kind'] | null>(initial?.kind ?? null)
  const [file, setFile] = useState<Extract<Material, { kind: 'file' }> | null>(initial?.kind === 'file' ? initial : null)
  const [text, setText] = useState(initial?.kind === 'text' ? initial.text : '')
  // Setiap penolakan menambah hitungan, supaya getaran zona terulang untuk percobaan berikutnya.
  const [error, setError] = useState<{ text: string; n: number } | null>(null)
  const input = useRef<HTMLInputElement>(null)
  // Tombol lanjut tetap terlihat setelah file dipilih atau kolom teks dibuka.
  const submit = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    submit.current?.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() })
  }, [mode, file?.name])

  const pick = (f: File | undefined) => {
    if (!f) return
    const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
    if (!FORMATS.includes(ext))
      return setError({ text: 'Format ini belum didukung. Pakai PDF, PPTX, TXT, atau MD.', n: (error?.n ?? 0) + 1 })
    setError(null)
    setMode('file')
    setFile({
      kind: 'file',
      name: f.name,
      size: f.size,
      unit: ext === 'pdf' ? 'Halaman' : ext === 'pptx' ? 'Slide' : undefined,
      pages: '',
    })
  }
  const picked = file ? parsePages(file.pages) : null
  const badRange = !!picked && 'error' in picked
  const options = [
    { kind: 'file', label: 'Unggah file' },
    { kind: 'text', label: 'Tempel teks' },
    { kind: 'none', label: 'Tanpa materi' },
  ] as const
  const canSubmit = mode === 'none' || (mode === 'file' && !!file && !badRange) || (mode === 'text' && !!text.trim())

  return (
    <div className="flex flex-col gap-4">
      {/* Kartu pilihan seperti Brilliant: abu muda, pilihan aktif bergradasi lembut dan bercentang. */}
      <div className="grid grid-cols-3 gap-2.5 md:gap-3">
        {options.map((o) => {
          const on = mode === o.kind
          return (
            <button
              key={o.kind}
              aria-pressed={on}
              onClick={() => setMode(o.kind)}
              className={`relative flex flex-col items-center gap-3 rounded-[22px] px-2 py-5 text-center font-semibold transition-colors duration-150 md:py-6 ${
                on
                  ? 'bg-gradient-to-b from-[#ECEBFF] to-[#B8E9DA] text-ink dark:from-[#2B2F58] dark:to-[#154A3C]'
                  : 'bg-card text-ink-2 hover:bg-card-2 hover:text-ink'
              }`}
            >
              {on && (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute right-3 top-3 size-5">
                  <circle cx="12" cy="12" r="11" fill="#22C55E" />
                  <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <OptionIcon kind={o.kind} />
              {o.label}
            </button>
          )
        })}
      </div>
      <input
        ref={input}
        type="file"
        accept=".pdf,.pptx,.txt,.md"
        className="sr-only"
        tabIndex={-1}
        aria-label="Pilih file materi"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {mode === 'none' && <p className="text-sm text-ink-3">Tanpa materi, konsep diambil dari pengetahuan umum Gemini.</p>}
      {!mode && <p className="text-sm text-ink-3">Pilih salah satu.</p>}

      {mode === 'file' && !file && <DropZone onPick={pick} onBrowse={() => input.current?.click()} error={error} />}

      {mode === 'file' && file && (
        <div className="bubble flex flex-col gap-3 rounded-2xl bg-card px-4 py-3.5">
          <div className="flex items-center gap-3">
            <OptionIcon kind="file" className="size-10 shrink-0" />
            <p className="min-w-0 flex-1">
              <span className="block truncate text-lg font-medium">{file.name}</span>
              <span className="text-sm tabular-nums text-ink-3">{size(file.size)}</span>
            </p>
            <button
              className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors duration-150 hover:bg-card-2 hover:text-ink"
              onClick={() => input.current?.click()}
            >
              Ganti
            </button>
            <IconButton label={`Hapus ${file.name}`} onClick={() => setFile(null)}>
              <TrashIcon className="size-[1.1rem]" />
            </IconButton>
          </div>
          {file.unit && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="halaman" className="text-sm font-semibold">
                {file.unit} yang dipakai
              </label>
              <input
                id="halaman"
                autoComplete="off"
                value={file.pages}
                onChange={(e) => setFile({ ...file, pages: e.target.value })}
                placeholder={`Semua ${file.unit.toLowerCase()}`}
                aria-describedby="halaman-info"
                aria-invalid={badRange}
                className={`field py-2 tabular-nums ${badRange ? 'border-stop' : ''}`}
              />
              <p id="halaman-info" aria-live="polite" className={`text-sm ${badRange ? 'font-medium text-stop' : 'text-ink-3'}`}>
                {picked && 'error' in picked
                  ? picked.error
                  : picked && picked.pages.length
                    ? `${picked.pages.length} ${file.unit.toLowerCase()} dipilih: ${formatPages(picked.pages)}`
                    : 'Contoh: 1-5, 8, 11-13. Kosongkan untuk memakai semua.'}
              </p>
            </div>
          )}
        </div>
      )}

      {mode === 'text' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="teks" className="sr-only">
            Teks materi
          </label>
          <textarea
            id="teks"
            autoFocus
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tempel ringkasan atau catatan kuliahmu di sini."
            className="field resize-y leading-relaxed"
          />
          <p className="text-right text-sm tabular-nums text-ink-3">{text.length.toLocaleString('id-ID')} karakter</p>
        </div>
      )}

      <button
        ref={submit}
        className="btn btn-go mx-auto mt-6 w-full max-w-80 text-lg"
        disabled={!canSubmit}
        onClick={() =>
          onSubmit(mode === 'file' && file ? file : mode === 'text' ? { kind: 'text', text: text.trim() } : { kind: 'none' })
        }
      >
        {mode === 'none' ? 'Lanjut tanpa materi' : 'Ambil konsep'}
      </button>
    </div>
  )
}

// Zona tarik-lepas untuk file materi. Diklik atau ditekan Enter: membuka pemilih file. Tiga keadaan:
// siap (ada file diseret di jendela), di atas zona, dan ditolak (format salah, zona bergetar).
function DropZone({
  onPick,
  onBrowse,
  error,
}: {
  onPick: (f: File | undefined) => void
  onBrowse: () => void
  error: { text: string; n: number } | null
}) {
  const [over, setOver] = useState(false)
  const [dragging, setDragging] = useState(false)

  // File yang dilepas di luar zona tidak boleh membuka file itu di tab ini.
  useEffect(() => {
    let depth = 0
    const hasFile = (e: DragEvent) => !!e.dataTransfer?.types.includes('Files')
    const enter = (e: DragEvent) => {
      if (!hasFile(e)) return
      depth++
      setDragging(true)
    }
    const leave = (e: DragEvent) => {
      if (!hasFile(e)) return
      depth = Math.max(0, depth - 1)
      if (depth === 0) setDragging(false)
    }
    const stop = (e: DragEvent) => {
      if (!hasFile(e)) return
      e.preventDefault()
      if (e.type === 'drop') {
        depth = 0
        setDragging(false)
        setOver(false)
      }
    }
    window.addEventListener('dragenter', enter)
    window.addEventListener('dragleave', leave)
    window.addEventListener('dragover', stop)
    window.addEventListener('drop', stop)
    return () => {
      window.removeEventListener('dragenter', enter)
      window.removeEventListener('dragleave', leave)
      window.removeEventListener('dragover', stop)
      window.removeEventListener('drop', stop)
    }
  }, [])

  const state = over ? 'over' : dragging ? 'ready' : 'idle'
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        key={error?.n ?? 0}
        onClick={onBrowse}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          setDragging(false)
          onPick(e.dataTransfer.files[0])
        }}
        aria-describedby="format-materi"
        className={`group flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-[scale,background-color,border-color] duration-200 ease-out ${
          state === 'over'
            ? 'scale-[1.02] border-go bg-go/10'
            : state === 'ready'
              ? 'drop-ready border-focus bg-focus/5'
              : error
                ? 'drop-shake border-stop bg-stop/5'
                : 'border-line bg-card/50 hover:border-ink-3 hover:bg-card'
        }`}
      >
        <span className={`transition-transform duration-200 ease-out ${state === 'over' ? '-translate-y-2 scale-110' : 'group-hover:-translate-y-1'}`}>
          <OptionIcon kind="file" className="size-14" />
        </span>
        <span className="text-lg font-semibold">
          {state === 'over' ? 'Lepaskan file di sini' : state === 'ready' ? 'Seret ke sini' : 'Tarik file ke sini'}
        </span>
        <span className="text-sm text-ink-3">
          atau <span className="font-medium text-ink underline decoration-2 underline-offset-4">klik untuk memilih file</span>
        </span>
      </button>
      {error ? (
        <p id="format-materi" role="alert" className="text-sm font-medium text-stop">
          {error.text}
        </p>
      ) : (
        <p id="format-materi" className="text-sm text-ink-3">
          PDF, PPTX, TXT, atau MD.
        </p>
      )}
    </div>
  )
}

function ConceptEditor({
  concepts,
  onChange,
  editing,
  setEditing,
  noMaterial,
}: {
  concepts: Concept[]
  onChange: (next: Concept[]) => void
  editing: string | null
  setEditing: (id: string | null) => void
  noMaterial: boolean
}) {
  // Baris muncul satu per satu hanya saat daftar pertama kali tampil.
  const [touched, setTouched] = useState(false)
  const [removed, setRemoved] = useState<{ concept: Concept; index: number } | null>(null)
  const full = concepts.length >= MAX_CONCEPTS

  const save = (c: Concept) => {
    setTouched(true)
    setRemoved(null)
    onChange(concepts.some((x) => x.id === c.id) ? concepts.map((x) => (x.id === c.id ? c : x)) : [...concepts, c])
    setEditing(null)
  }

  return (
    <section aria-labelledby="daftar-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 id="daftar-title" className="text-lg font-semibold">
          Daftar konsep
        </h3>
        <p className="text-sm tabular-nums text-ink-3">
          {concepts.length} dari maksimal {MAX_CONCEPTS}
        </p>
      </div>

      {noMaterial && (
        <p className="mt-3 rounded-2xl bg-[#FFF4D6] px-4 py-3 text-sm leading-relaxed text-[#6B4A00] dark:bg-[#33290f] dark:text-[#FFD98A]">
          Konsep ini dari pengetahuan umum Gemini, bukan dari materimu. Cocokkan dengan catatan kuliahmu.
        </p>
      )}

      <ol className="mt-4 flex flex-col gap-2.5">
        {concepts.map((c, i) =>
          editing === c.id ? (
            <li key={c.id}>
              <ConceptForm initial={c} onSave={save} onCancel={() => setEditing(null)} />
            </li>
          ) : (
            <li
              key={c.id}
              className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-x-3 rounded-2xl bg-card px-4 py-3.5 ${touched ? '' : 'write-in'}`}
              style={{ '--i': i } as CSSProperties}
            >
              <span className="mt-0.5 grid size-7 place-items-center rounded-full bg-surface text-sm font-semibold tabular-nums text-ink-2">
                {i + 1}
              </span>
              <div>
                <p className="text-lg font-semibold leading-snug">{c.name}</p>
                {c.aliases.length > 0 && <p className="text-sm text-ink-3">juga: {c.aliases.join(', ')}</p>}
                {c.description && <p className="mt-1 max-w-[56ch] text-[0.95rem] leading-snug text-ink-2">{c.description}</p>}
              </div>
              <div className="flex gap-0.5">
                <IconButton label={`Ubah ${c.name}`} disabled={editing !== null} onClick={() => setEditing(c.id)}>
                  <PencilIcon className="size-[1.1rem]" />
                </IconButton>
                <IconButton
                  label={`Hapus ${c.name}`}
                  disabled={editing !== null}
                  onClick={() => {
                    setTouched(true)
                    setRemoved({ concept: c, index: i })
                    onChange(concepts.filter((x) => x.id !== c.id))
                  }}
                >
                  <TrashIcon className="size-[1.1rem]" />
                </IconButton>
              </div>
            </li>
          ),
        )}
        {editing === 'new' && (
          <li>
            <ConceptForm
              initial={{ id: crypto.randomUUID(), name: '', aliases: [], description: '' }}
              onSave={save}
              onCancel={() => setEditing(null)}
            />
          </li>
        )}
      </ol>

      {removed && (
        <p role="status" className="mt-3 flex flex-wrap items-center gap-x-3 text-sm text-ink-2">
          {removed.concept.name} dihapus.
          <button
            className="font-semibold text-ink underline decoration-2 underline-offset-4"
            onClick={() => {
              const next = [...concepts]
              next.splice(removed.index, 0, removed.concept)
              onChange(next)
              setRemoved(null)
            }}
          >
            Batalkan
          </button>
        </p>
      )}

      {editing !== 'new' && (
        <button
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-3.5 font-semibold text-ink-2 transition-colors duration-150 hover:border-ink-3 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          disabled={full || editing !== null}
          onClick={() => setEditing('new')}
        >
          <PlusIcon className="size-5" />
          Tambah konsep
        </button>
      )}
      <p className="mt-4 text-sm leading-relaxed text-ink-3">
        {full ? 'Sudah 8 konsep. Hapus satu dulu sebelum menambah, supaya agenda tetap terbaca sekilas. ' : ''}
        Empur mencentang konsep ini di layar live. Nama dan alias juga membantu Whisper mengenali istilahnya.
      </p>
    </section>
  )
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full text-ink-3 transition-colors duration-150 hover:bg-card-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function ConceptForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Concept
  onSave: (c: Concept) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial.name)
  const [aliases, setAliases] = useState(initial.aliases.join(', '))
  const [description, setDescription] = useState(initial.description)
  const isNew = !initial.name
  const form = useRef<HTMLFormElement>(null)
  useEffect(() => {
    form.current?.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() })
  }, [])
  return (
    <form
      ref={form}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 shadow-[0_24px_60px_-36px_rgba(22,22,29,0.35)]"
      onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim()) return
        onSave({
          ...initial,
          name: name.trim(),
          aliases: aliases
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean),
          description: description.trim(),
        })
      }}
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}
    >
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Nama konsep
        <input
          autoFocus
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Learning rate"
          className="field font-normal"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        <span>
          Alias <span className="font-normal text-ink-3">(pisahkan dengan koma)</span>
        </span>
        <input
          value={aliases}
          onChange={(e) => setAliases(e.target.value)}
          placeholder="Contoh: laju belajar, step size"
          className="field font-normal"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Deskripsi singkat
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Satu atau dua kalimat. Dipakai untuk menilai apakah konsep ini sudah kamu jelaskan."
          className="field resize-y font-normal leading-snug"
        />
      </label>
      <div className="flex justify-end gap-2.5 pt-1">
        <button type="button" className="btn btn-plain" onClick={onCancel}>
          Batal
        </button>
        <button className="btn btn-go" disabled={!name.trim()}>
          {isNew ? 'Tambah' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
