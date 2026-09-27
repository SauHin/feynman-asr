import { useId, type ReactNode } from 'react'
import { decimal } from '../lib/format'
import { PauseIcon } from './chalk'

// Papan tulis sebagai benda: bingkai kayu bergaris luar berisi panel hijau, dan baki kapur di bawah.
export function Board({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`wood-grain flex flex-col rounded-[28px] border-[3px] border-outline bg-wood p-3 shadow-[inset_0_3px_0_var(--wood-light),0_6px_0_rgba(0,0,0,0.15)] ${className}`}
    >
      {children}
      <Tray />
    </div>
  )
}

export function Panel({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`relative flex flex-col rounded-[16px] border-[3px] border-outline bg-board p-5 shadow-[inset_0_5px_0_rgba(0,0,0,0.18)] md:min-h-0 md:px-7 md:py-6 ${className}`}
    >
      <BoardHaze />
      <div className="relative flex flex-1 flex-col md:min-h-0">{children}</div>
    </div>
  )
}

export function PanelTitle({ id, children, note }: { id?: string; children: ReactNode; note?: string }) {
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

// Jeda panjang di dalam kalimat transkrip. Tanpa durasi: contoh untuk legenda.
export function PausePill({ duration }: { duration?: number }) {
  return (
    <span className="mx-1 inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-chalk-blue/70 px-2 align-[0.1em] font-display text-base text-chalk-blue">
      <PauseIcon className="size-4" />
      {duration === undefined ? 'jeda' : `jeda ${decimal(duration)} dtk`}
    </span>
  )
}
