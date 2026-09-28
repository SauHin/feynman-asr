import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { AppBar, MockStateSwitch } from '../components/app-bar'
import { Board, Panel } from '../components/board'
import {
  ChalkDefs,
  ChalkMark,
  ClipboardIcon,
  CloudIcon,
  PencilIcon,
  PlusIcon,
  RetryIcon,
  SkipIcon,
  TrashIcon,
  UploadIcon,
} from '../components/chalk'
import { ClassroomWall } from '../components/classroom'
import { Kapur } from '../components/kapur'
import type { KapurMood } from '../lib/kapur'
import { useMockState } from '../lib/mock-state'
import { BACKPROP_CONCEPTS } from '../mocks/backprop'
import type { Concept } from '../types/feedback'

type Step = 'topic' | 'material' | 'extracting' | 'failed' | 'review'
type Material =
  | { kind: 'file'; name: string; size: number; unit?: 'Halaman' | 'Slide'; from: string; to: string }
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

const scrollBehavior = (): ScrollBehavior =>
  matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

const size = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`

function describe(m: Material) {
  if (m.kind === 'none') return 'Tanpa materi'
  if (m.kind === 'text') return `Teks tempelan · ${m.text.length.toLocaleString('id-ID')} karakter`
  const range = !m.unit
    ? ''
    : m.from || m.to
      ? ` · ${m.unit.toLowerCase()} ${m.from || 1}–${m.to || 'akhir'}`
      : ` · semua ${m.unit.toLowerCase()}`
  return `${m.name}${range}`
}

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

  // Giliran terbaru selalu terlihat: pertanyaan terbaru di bawah bersama isiannya,
  // kecuali daftar konsep, yang dibaca dari atas.
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scroller.current
      ?.querySelector('ol > li:last-child')
      ?.scrollIntoView({ block: step === 'review' ? 'start' : 'end', behavior: scrollBehavior() })
  }, [step])

  // Mengubah jawaban lama memulai ulang dari giliran itu.
  const rewind = (to: Step) => {
    setStep(to)
    setConcepts([])
    setEditing(null)
    if (to === 'topic') setMaterial(null)
  }
  const ready = step === 'review' && concepts.length > 0 && editing === null

  return (
    <div className="flex min-h-dvh flex-col md:h-dvh">
      <ChalkDefs />
      <AppBar
        back={{ to: '/', label: 'Kembali ke beranda' }}
        title="Siapkan topik"
        subtitle="Mockup: konsep contoh, belum dari Gemini"
      >
        <MockStateSwitch
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'gagal', label: 'Ekstraksi gagal' },
          ]}
        />
      </AppBar>

      <div className="relative flex flex-1 flex-col px-3 pb-4 md:min-h-0 md:px-8 md:pb-5">
        <ClassroomWall />
        <div className="relative z-10 mx-auto flex w-full max-w-[68rem] flex-1 flex-col md:min-h-0 2xl:max-w-[80rem]">
          <Board className="flex-1 md:min-h-0">
            <Panel className="flex-1 md:min-h-0">
              {/* Percakapan menempel di bawah, dekat Si Kapur di baki: giliran terbaru selalu paling bawah. */}
              <div ref={scroller} className="-mx-2 flex flex-1 flex-col px-2 md:overflow-y-auto">
                <ol className="mx-auto mt-auto flex w-full max-w-[46rem] flex-col gap-7 pb-4">
                  <Turn mood={MOOD.topic} current={step === 'topic'} says="Halo! Mau menjelaskan topik apa hari ini?">
                    {step === 'topic' ? (
                      <TopicForm
                        initial={topic}
                        onSubmit={(t) => {
                          setTopic(t)
                          setStep('material')
                        }}
                      />
                    ) : (
                      <Answer onEdit={() => rewind('topic')} label="topik">
                        {topic}
                      </Answer>
                    )}
                  </Turn>

                  {step !== 'topic' && (
                    <Turn
                      mood={MOOD.material}
                      current={step === 'material'}
                      says="Punya materi kuliahnya? Kalau ada, aku ambil konsep dari situ, jadi daftarnya sesuai dengan kuliahmu."
                    >
                      {step === 'material' ? (
                        <MaterialForm
                          initial={material}
                          onSubmit={(m) => {
                            setMaterial(m)
                            retried.current = false
                            setStep('extracting')
                          }}
                        />
                      ) : (
                        material && (
                          <Answer onEdit={() => rewind('material')} label="materi">
                            {describe(material)}
                          </Answer>
                        )
                      )}
                    </Turn>
                  )}

                  {step === 'extracting' && (
                    <Turn
                      mood={MOOD.extracting}
                      current
                      says={
                        <>
                          {material?.kind === 'none'
                            ? `Sebentar, aku susun konsep dasar ${topic} dulu`
                            : 'Sebentar, aku baca materimu dulu'}
                          <span aria-hidden="true" className="dots">
                            <i />
                            <i />
                            <i />
                          </span>
                        </>
                      }
                    >
                      <p role="status" className="flex items-center gap-2 self-start text-chalk-dim">
                        <CloudIcon className="size-5 shrink-0" />
                        {material?.kind === 'none' ? 'Topikmu' : 'Teks materimu'} dikirim ke Gemini untuk mengambil
                        konsep.
                      </p>
                    </Turn>
                  )}

                  {step === 'failed' && (
                    <Turn
                      mood={MOOD.failed}
                      current
                      says="Aku gagal menghubungi Gemini karena batas pemakaian gratis sedang tercapai. Coba lagi sebentar lagi, atau tulis konsepnya sendiri."
                    >
                      <div role="alert" className="flex flex-wrap justify-end gap-3">
                        <button
                          className="btn btn-plain"
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
                    </Turn>
                  )}

                  {step === 'review' && (
                    <Turn
                      mood={MOOD.review}
                      current
                      wide
                      says={
                        found
                          ? `Aku menemukan ${found} konsep. Cek dulu, ya: ubah yang kurang pas, hapus yang tidak perlu, atau tambah yang terlewat.`
                          : 'Tulis konsep yang harus kamu jelaskan. Nanti aku mencentangnya di agenda.'
                      }
                    >
                      <ConceptEditor
                        concepts={concepts}
                        onChange={setConcepts}
                        editing={editing}
                        setEditing={setEditing}
                        noMaterial={material?.kind === 'none' && found > 0}
                      />
                    </Turn>
                  )}
                </ol>
              </div>

              {/* Si Kapur berdiri di baki kapur, di sisi kiri percakapan. */}
              <div className="absolute -bottom-[52px] left-0 z-20 hidden xl:block">
                <span aria-hidden="true" className="absolute bottom-2 left-1/2 h-3 w-20 -translate-x-1/2 rounded-full bg-black/20" />
                <Kapur mood={MOOD[step]} className="relative h-40 w-32" />
              </div>
            </Panel>
          </Board>
        </div>
      </div>

      <footer className="relative z-30 flex flex-wrap items-center gap-x-6 gap-y-3 border-t-[3px] border-outline bg-surface px-3 py-3 md:px-8 md:py-4">
        <p className="mr-auto max-w-3xl text-sm leading-relaxed text-ink-2">
          Materi dan daftar konsep dikirim ke Gemini untuk mengambil konsep. Gemini versi gratis bisa memakai data itu
          untuk meningkatkan layanan Google. Suaramu nanti tetap diproses di laptop ini.
        </p>
        <div className="flex items-center gap-4">
          {!ready && (
            <p id="syarat-mulai" className="max-w-[17rem] text-right text-sm leading-snug text-ink-2">
              Aktif setelah daftar konsep kamu cek.
            </p>
          )}
          <button
            className="btn btn-go shrink-0 px-8 text-xl"
            disabled={!ready}
            aria-describedby={ready ? undefined : 'syarat-mulai'}
            onClick={() => navigate('/live')}
          >
            Mulai menjelaskan
          </button>
        </div>
      </footer>
    </div>
  )
}

// Satu giliran: pertanyaan Si Kapur, lalu jawaban user di kanan.
function Turn({
  mood,
  current,
  says,
  wide = false,
  children,
}: {
  mood: KapurMood
  current: boolean
  says: ReactNode
  wide?: boolean
  children?: ReactNode
}) {
  return (
    <li className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        {/* Di layar sempit Si Kapur tidak muat di baki, jadi ia muncul di samping pertanyaan terbaru. */}
        {current && <Kapur mood={mood} className="h-20 w-16 shrink-0 xl:hidden" />}
        <p
          className={`bubble relative max-w-[34rem] rounded-2xl border-[3px] border-outline bg-surface px-4 py-3 font-display text-[1.1rem] leading-snug text-ink ${
            current ? 'mb-6 xl:mb-0' : 'opacity-90'
          }`}
        >
          {says}
          <span
            aria-hidden="true"
            className="absolute -left-[11px] bottom-4 size-4 rotate-45 border-b-[3px] border-l-[3px] border-outline bg-surface"
          />
        </p>
      </div>
      {children && <div className={`flex flex-col ${wide ? '' : 'items-end'}`}>{children}</div>}
    </li>
  )
}

function Answer({ label, onEdit, children }: { label: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="chip flex max-w-[34rem] items-center gap-4 py-2 pl-4 pr-2 text-ink">
      <p className="min-w-0 break-words font-display text-lg">
        <span className="sr-only">Jawabanmu: </span>
        {children}
      </p>
      <button
        onClick={onEdit}
        aria-label={`Ubah ${label}`}
        className="flex shrink-0 items-center gap-1 rounded-xl px-2 py-1 font-display text-sm text-ink-2 hover:bg-wall hover:text-ink"
      >
        <PencilIcon className="size-4" />
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
      className="flex w-full max-w-[34rem] flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (topic) onSubmit(topic)
      }}
    >
      <label htmlFor="topik" className="sr-only">
        Topik
      </label>
      <div className="flex gap-2">
        <input
          id="topik"
          autoFocus
          autoComplete="off"
          maxLength={80}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Contoh: Backpropagation"
          className="field min-w-0 flex-1"
        />
        <button className="btn btn-go shrink-0" disabled={!topic}>
          Lanjut
        </button>
      </div>
      <p className="text-sm text-chalk-dim">Satu subtopik saja, supaya bisa kamu jelaskan dalam 2–5 menit.</p>
    </form>
  )
}

function MaterialForm({ initial, onSubmit }: { initial: Material | null; onSubmit: (m: Material) => void }) {
  const [mode, setMode] = useState<'file' | 'text' | null>(
    initial?.kind === 'file' || initial?.kind === 'text' ? initial.kind : null,
  )
  const [file, setFile] = useState<Extract<Material, { kind: 'file' }> | null>(
    initial?.kind === 'file' ? initial : null,
  )
  const [text, setText] = useState(initial?.kind === 'text' ? initial.text : '')
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)
  // Tombol Ambil konsep tetap terlihat setelah file dipilih atau kolom teks dibuka.
  const submit = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    submit.current?.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() })
  }, [mode, file?.name])

  const pick = (f: File | undefined) => {
    if (!f) return
    const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
    if (!FORMATS.includes(ext)) return setError('Format ini belum didukung. Pakai PDF, PPTX, TXT, atau MD.')
    setError('')
    setMode('file')
    setFile({
      kind: 'file',
      name: f.name,
      size: f.size,
      unit: ext === 'pdf' ? 'Halaman' : ext === 'pptx' ? 'Slide' : undefined,
      from: '',
      to: '',
    })
  }
  const badRange = !!file?.from && !!file.to && Number(file.from) > Number(file.to)
  const choice = (active: boolean) => `btn btn-plain ${active ? 'bg-chalk-yellow text-go-ink' : ''}`

  return (
    <div className="flex w-full max-w-[38rem] flex-col items-end gap-3">
      <div className="flex flex-wrap justify-end gap-2.5">
        <button className={choice(mode === 'file')} aria-pressed={mode === 'file'} onClick={() => input.current?.click()}>
          <UploadIcon className="size-5" />
          Unggah file
        </button>
        <button className={choice(mode === 'text')} aria-pressed={mode === 'text'} onClick={() => setMode('text')}>
          <ClipboardIcon className="size-5" />
          Tempel teks
        </button>
        <button className="btn btn-plain" onClick={() => onSubmit({ kind: 'none' })}>
          <SkipIcon className="size-5" />
          Tanpa materi
        </button>
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
      {error ? (
        <p role="alert" className="text-sm text-chalk-yellow">
          {error}
        </p>
      ) : (
        !mode && (
          <p className="text-right text-sm text-chalk-dim">
            PDF, PPTX, TXT, atau MD. Tanpa materi, konsep diambil dari pengetahuan umum Gemini.
          </p>
        )
      )}

      {mode === 'file' && file && (
        <div className="chip flex w-full flex-col gap-3 px-4 py-3 text-ink">
          <p className="flex items-center gap-2.5">
            <UploadIcon className="size-6 shrink-0 text-ink-2" />
            <span className="min-w-0 flex-1 truncate font-display text-lg">{file.name}</span>
            <span className="shrink-0 text-sm tabular-nums text-ink-2">{size(file.size)}</span>
          </p>
          {file.unit && (
            <fieldset className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <legend className="sr-only">Rentang {file.unit.toLowerCase()} yang dipakai</legend>
              <label htmlFor="dari" className="font-display">
                {file.unit}
              </label>
              <input
                id="dari"
                inputMode="numeric"
                placeholder="1"
                value={file.from}
                onChange={(e) => setFile({ ...file, from: e.target.value.replace(/\D/g, '') })}
                className="field w-20 py-1.5 text-center tabular-nums"
              />
              <label htmlFor="sampai" className="font-display">
                sampai
              </label>
              <input
                id="sampai"
                inputMode="numeric"
                placeholder="akhir"
                value={file.to}
                onChange={(e) => setFile({ ...file, to: e.target.value.replace(/\D/g, '') })}
                className="field w-24 py-1.5 text-center tabular-nums"
              />
              <span className={`w-full text-sm ${badRange ? 'font-semibold text-mark-wrong dark:text-[#ff9a8f]' : 'text-ink-2'}`}>
                {badRange
                  ? `${file.unit} awal harus lebih kecil dari ${file.unit.toLowerCase()} akhir.`
                  : `Kosongkan untuk memakai semua ${file.unit.toLowerCase()}.`}
              </span>
            </fieldset>
          )}
        </div>
      )}

      {mode === 'text' && (
        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="teks" className="sr-only">
            Teks materi
          </label>
          <textarea
            id="teks"
            autoFocus
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tempel ringkasan atau catatan kuliahmu di sini."
            className="field resize-y leading-relaxed"
          />
          <p className="text-right text-sm tabular-nums text-chalk-dim">{text.length.toLocaleString('id-ID')} karakter</p>
        </div>
      )}

      {((mode === 'file' && file) || mode === 'text') && (
        <button
          ref={submit}
          className="btn btn-go"
          disabled={mode === 'file' ? badRange : !text.trim()}
          onClick={() => onSubmit(mode === 'file' && file ? file : { kind: 'text', text: text.trim() })}
        >
          Ambil konsep
        </button>
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
  // Baris tertulis satu per satu hanya saat daftar pertama kali muncul.
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
    <section aria-labelledby="daftar-title" className="mt-2 w-full">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <h2 id="daftar-title" className="chalk-letter font-display text-2xl font-semibold text-chalk">
          Daftar konsep
        </h2>
        <p className="text-sm tabular-nums text-chalk-dim">
          {concepts.length} dari maksimal {MAX_CONCEPTS}
        </p>
      </div>
      <span aria-hidden="true" className="chalk-rule mt-1 block h-3 w-24" />

      {noMaterial && (
        <p className="mt-4 rounded-xl border-2 border-chalk-yellow/70 px-3.5 py-2.5 text-chalk-yellow">
          Konsep ini dari pengetahuan umum Gemini, bukan dari materimu. Cocokkan dengan catatan kuliahmu.
        </p>
      )}

      <ol className="mt-5 flex flex-col gap-4">
        {concepts.map((c, i) =>
          editing === c.id ? (
            <li key={c.id}>
              <ConceptForm initial={c} onSave={save} onCancel={() => setEditing(null)} />
            </li>
          ) : (
            <li
              key={c.id}
              className={`grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto] ${touched ? '' : 'write-in'}`}
              style={{ '--i': i } as CSSProperties}
            >
              <ChalkMark status="none" className="size-9 text-chalk-yellow" />
              <div className="pt-0.5">
                <p className="font-display text-[1.35rem] font-medium leading-tight text-chalk-yellow">{c.name}</p>
                {c.aliases.length > 0 && <p className="mt-0.5 text-sm text-chalk-dim">juga: {c.aliases.join(', ')}</p>}
                {c.description && <p className="mt-1 max-w-[56ch] leading-snug text-chalk">{c.description}</p>}
              </div>
              <div className="col-start-2 mt-2 flex gap-1.5 sm:col-start-auto sm:mt-0">
                <ChalkButton label={`Ubah ${c.name}`} disabled={editing !== null} onClick={() => setEditing(c.id)}>
                  <PencilIcon className="size-5" />
                </ChalkButton>
                <ChalkButton
                  label={`Hapus ${c.name}`}
                  disabled={editing !== null}
                  onClick={() => {
                    setTouched(true)
                    setRemoved({ concept: c, index: i })
                    onChange(concepts.filter((x) => x.id !== c.id))
                  }}
                >
                  <TrashIcon className="size-5" />
                </ChalkButton>
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
        <p role="status" className="mt-4 flex flex-wrap items-center gap-x-3 text-chalk-dim">
          {removed.concept.name} dihapus.
          <button
            className="rounded-lg font-display text-chalk underline decoration-2 underline-offset-4"
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
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-[2.5px] border-dashed border-chalk-dim/70 py-3 font-display text-lg text-chalk transition-colors duration-150 hover:border-chalk hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={full || editing !== null}
          onClick={() => setEditing('new')}
        >
          <PlusIcon className="size-5" />
          Tambah konsep
        </button>
      )}
      <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-chalk-dim">
        {full
          ? 'Sudah 8 konsep. Supaya agenda tetap terbaca dalam satu lirikan, hapus satu dulu sebelum menambah. '
          : ''}
        Di layar live, Empur mencentang kotak ini saat kamu menyebut dan menjelaskan konsepnya. Nama dan alias juga
        membantu Whisper mengenali istilahnya.
      </p>
    </section>
  )
}

function ChalkButton({
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
      className="grid size-10 place-items-center rounded-xl border-2 border-chalk-dim/50 text-chalk-dim transition-colors duration-150 hover:border-chalk hover:text-chalk disabled:cursor-not-allowed disabled:opacity-40"
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
      className="flex flex-col gap-3 rounded-2xl border-[3px] border-outline bg-surface p-4 text-ink shadow-[0_4px_0_var(--outline)]"
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
      <label className="flex flex-col gap-1 font-display">
        Nama konsep
        <input
          autoFocus
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Learning rate"
          className="field font-sans"
        />
      </label>
      <label className="flex flex-col gap-1 font-display">
        <span>
          Alias <span className="font-sans text-sm text-ink-2">(pisahkan dengan koma)</span>
        </span>
        <input
          value={aliases}
          onChange={(e) => setAliases(e.target.value)}
          placeholder="Contoh: laju belajar, step size"
          className="field font-sans"
        />
      </label>
      <label className="flex flex-col gap-1 font-display">
        Deskripsi singkat
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Satu atau dua kalimat. Dipakai untuk menilai apakah konsep ini sudah kamu jelaskan."
          className="field resize-y font-sans leading-snug"
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
