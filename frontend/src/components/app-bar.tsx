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
    <header className="relative z-20 flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 md:gap-x-5 md:px-8 md:py-3">
      {back ? (
        <Link
          to={back.to}
          aria-label={back.label}
          className="chip grid size-11 shrink-0 place-items-center text-ink transition-transform duration-100 active:translate-y-0.5"
        >
          <ArrowLeftIcon className="size-5" />
        </Link>
      ) : (
        <BrandMark className="size-11 shrink-0" />
      )}
      <div className="mr-auto min-w-0">
        <h1 className="font-display text-2xl font-semibold leading-none">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-2">{subtitle}</p>}
      </div>
      {children}
      <EmpurMenu />
      <ThemeToggle />
    </header>
  )
}

// Papan kecil dengan centang kapur, sama dengan favicon.
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={`text-outline ${className}`}>
      <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="#245A45" stroke="currentColor" strokeWidth="3" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          stroke="#F4F7F0"
          strokeWidth="2.2"
          d="M8.6 9.3C12.6 8.8 19.6 9 23.4 8.8c.3 4.5 0 10.6.3 14.6-5.6.4-11.3.1-15.6.3.4-5.4-.1-10.3.1-14.4Z"
        />
        <path stroke="#9EE8C0" strokeWidth="3" d="M11.6 16.6l3.6 3.8 6.6-8.8" />
      </g>
    </svg>
  )
}

export function ThemeToggle() {
  const [theme, setTheme] = useTheme()
  return (
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
  )
}

// Menu Empur: pilih warna kapur dan tampil dengan atau tanpa tangan. Popover bawaan browser menutup
// sendiri saat klik di luar atau Esc; posisinya menempel di tombol lewat anchor CSS (index.css).
export function EmpurMenu() {
  const { tone, arms } = useKapurPrefs()
  const option = (on: boolean) =>
    `rounded-[10px] border-2 px-3 py-1 font-display text-sm transition-colors duration-150 ${
      on ? 'border-outline bg-chalk-yellow text-go-ink' : 'border-transparent text-ink-2 hover:text-ink'
    }`
  return (
    <>
      <button
        type="button"
        popoverTarget="empur-menu"
        className="empur-anchor chip flex items-center gap-1.5 px-3 py-1.5 font-display text-sm text-ink"
      >
        <Swatch tone={tone} className="size-4" />
        <span className="max-sm:sr-only">Empur</span>
      </button>
      <div
        id="empur-menu"
        popover="auto"
        className="empur-menu w-72 rounded-2xl border-[3px] border-outline bg-surface p-4 text-ink"
      >
        <div className="flex items-center gap-3">
          <Kapur mood="wave" className="h-20 w-16 shrink-0" />
          <p className="font-display text-lg font-semibold">Empur</p>
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
              className={`grid size-8 place-items-center rounded-full border-2 ${tone === t ? 'border-outline' : 'border-transparent'}`}
            >
              <Swatch tone={t} className="size-6" checked={tone === t} />
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="Tangan Empur" className="chip mt-3 flex w-fit gap-1 p-1">
          {[true, false].map((on) => (
            <button key={String(on)} type="button" role="radio" aria-checked={arms === on} onClick={() => setKapurPrefs({ arms: on })} className={option(arms === on)}>
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
    <div role="radiogroup" aria-label="Keadaan contoh" className="flex flex-wrap items-center gap-1.5 text-sm text-ink-2">
      <span className="mr-1">Keadaan contoh:</span>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={current === o.value}
          onClick={() => setParams(o.value === options[0].value ? {} : { keadaan: o.value })}
          className={`rounded-full border-2 px-2.5 py-0.5 font-display transition-colors duration-150 ${
            current === o.value ? 'border-outline bg-surface text-ink' : 'border-dashed border-line-strong hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
