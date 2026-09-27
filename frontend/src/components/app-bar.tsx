import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useTheme } from '../lib/theme'
import { ArrowLeftIcon, MoonIcon, SunIcon } from './chalk'

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
