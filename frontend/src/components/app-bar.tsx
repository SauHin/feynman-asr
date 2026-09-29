import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { setKapurPrefs, TONES, useKapurPrefs, type KapurTone } from '../lib/kapur'
import { useTheme } from '../lib/theme'
import { ArrowLeftIcon, MoonIcon, SunIcon } from './chalk'
import { Kapur } from './kapur'

// Bilah atas untuk beranda, setup, dan feedback. Layar live punya bilah sendiri.
export function AppBar({
  back,
  title,
  subtitle,
  children,
}: {
  back?: { to: string; label: string }
  title: ReactNode
  subtitle?: string
  children?: ReactNode
}) {
  return (
    <header className="relative z-20 flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:gap-x-4 md:px-8 md:py-4">
      {back ? (
        <Link
          to={back.to}
          aria-label={back.label}
          className="chip grid size-10 shrink-0 place-items-center text-ink transition-colors duration-150 hover:bg-card"
        >
          <ArrowLeftIcon className="size-5" />
        </Link>
      ) : (
        <BrandMark className="size-9 shrink-0" />
      )}
      <div className="mr-auto min-w-0">
        <h1 className="text-lg font-semibold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink-3">{subtitle}</p>}
      </div>
      {children}
      {/* Kontrol tetap berkelompok di kanan, juga saat bilah terlipat di layar sempit. */}
      <div className="ml-auto flex items-center gap-2">
        <EmpurMenu />
        <ThemeToggle />
      </div>
    </header>
  )
}

// Tanda aplikasi, sama dengan favicon: kotak bergradasi warna kapur dengan centang putih.
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="brand-mark" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#FFD84D" />
          <stop offset="1" stopColor="#FF7F3F" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#brand-mark)" />
      <path d="M9.5 16.5l4.5 4.5 8.5-10" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Pilihan di dalam kontrol bersegmen: pil putih (atau abu gelap di malam hari) untuk yang aktif.
const segment = (on: boolean) =>
  `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
    on ? 'bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)] dark:bg-card-2' : 'text-ink-3 hover:text-ink'
  }`

export function ThemeToggle() {
  const [theme, setTheme] = useTheme()
  return (
    <div role="radiogroup" aria-label="Tema" className="flex gap-0.5 rounded-full bg-card p-1">
      {(['light', 'dark'] as const).map((t) => (
        <button key={t} role="radio" aria-checked={theme === t} onClick={() => setTheme(t)} className={segment(theme === t)}>
          {t === 'light' ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          <span className="max-sm:sr-only">{t === 'light' ? 'Siang' : 'Malam'}</span>
        </button>
      ))}
    </div>
  )
}

// Menu Empur: pilih warna kapur dan tampil dengan atau tanpa tangan. Popover bawaan browser menutup
// sendiri saat klik di luar atau Esc; posisinya menempel di tombol lewat anchor CSS (index.css).
export function EmpurMenu() {
  const { tone, arms } = useKapurPrefs()
  return (
    <>
      <button
        type="button"
        popoverTarget="empur-menu"
        className="empur-anchor chip flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-card"
      >
        <Swatch tone={tone} className="size-4" />
        <span className="max-sm:sr-only">Empur</span>
      </button>
      <div
        id="empur-menu"
        popover="auto"
        className="empur-menu w-72 rounded-3xl border border-line bg-surface p-4 text-ink shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-center gap-3">
          <Kapur mood="wave" className="h-20 w-16 shrink-0" />
          <p className="text-lg font-semibold">Empur</p>
        </div>
        <div role="radiogroup" aria-label="Warna Empur" className="mt-3 flex gap-1">
          {(Object.keys(TONES) as KapurTone[]).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={tone === t}
              aria-label={t}
              title={t}
              onClick={() => setKapurPrefs({ tone: t })}
              className={`grid size-8 place-items-center rounded-full border-2 ${tone === t ? 'border-ink' : 'border-transparent'}`}
            >
              <Swatch tone={t} className="size-6" checked={tone === t} />
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="Tangan Empur" className="mt-3 flex w-fit gap-0.5 rounded-full bg-card p-1">
          {[true, false].map((on) => (
            <button key={String(on)} type="button" role="radio" aria-checked={arms === on} onClick={() => setKapurPrefs({ arms: on })} className={segment(arms === on)}>
              {on ? 'Dengan tangan' : 'Tanpa tangan'}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// Lingkaran bergradasi dengan warna badan Empur. Pilihan aktif juga diberi centang, bukan warna saja.
function Swatch({ tone, checked = false, className = '' }: { tone: KapurTone; checked?: boolean; className?: string }) {
  const t = TONES[tone]
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`swatch-${tone}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={t.top} />
          <stop offset="1" stopColor={t.bot} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#swatch-${tone})`} />
      {checked && <path d="M7.5 12.5l3 3 6-7" fill="none" stroke={t.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}

// ponytail: hanya tampil di dev server; hapus setelah backend dan Gemini tersambung.
export function MockStateSwitch<T extends string>({ options }: { options: readonly { value: T; label: string }[] }) {
  const [params, setParams] = useSearchParams()
  if (!import.meta.env.DEV) return null
  const current = params.get('keadaan') ?? options[0].value
  return (
    <div role="radiogroup" aria-label="Keadaan contoh" className="flex flex-wrap items-center gap-2 text-sm text-ink-3">
      <span>Keadaan contoh:</span>
      <div className="flex flex-wrap gap-0.5 rounded-[20px] bg-card p-1 *:whitespace-nowrap">
        {options.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={current === o.value}
            onClick={() => setParams(o.value === options[0].value ? {} : { keadaan: o.value })}
            className={segment(current === o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
