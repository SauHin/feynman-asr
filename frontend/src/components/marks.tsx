import { decimal } from '../lib/format'
import type { MarkStatus } from './chalk'

// Tanda status konsep dalam gaya datar yang sama dengan Empur. Setiap status punya bentuk sendiri,
// jadi tidak dibedakan lewat warna saja: cincin kosong, setengah terisi, centang, dan silang.
export type Mark = MarkStatus | 'wrong'

// `draw`: centang menggambar dirinya sendiri (kelas chalk-draw, jeda lewat --draw-delay).
export function StatusIcon({ status, draw = false, className = 'size-7' }: { status: Mark; draw?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" data-mark className={`shrink-0 ${className}`}>
      {status === 'explained' && (
        <>
          <circle cx="12" cy="12" r="11" fill="#22C55E" />
          <path
            d="M7 12.5l3.2 3.2L17 9"
            pathLength={1}
            className={draw ? 'chalk-draw' : undefined}
            fill="none"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {status === 'mentioned' && (
        <>
          <circle cx="12" cy="12" r="10" fill="none" stroke="#FFB020" strokeWidth="2.4" />
          <path d="M12 2a10 10 0 0 1 0 20Z" fill="#FFB020" />
        </>
      )}
      {status === 'wrong' && (
        <>
          <circle cx="12" cy="12" r="11" fill="#F04438" />
          <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}
      {status === 'none' && (
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2.4" className="text-ink-3" />
      )}
    </svg>
  )
}

// Jeda panjang di dalam kalimat transkrip. Tanpa durasi: contoh untuk legenda.
export function PauseChip({ duration }: { duration?: number }) {
  return (
    <span className="mx-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#E8EEFF] px-2.5 py-0.5 align-[0.08em] text-[0.9rem] font-medium text-[#3656C9] dark:bg-[#1c2748] dark:text-[#9DB6FF]">
      <svg viewBox="0 0 12 14" aria-hidden="true" className="h-3 w-2.5 shrink-0">
        <path d="M3.5 2.5v9M8.5 2.5v9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      {duration === undefined ? 'jeda' : `jeda ${decimal(duration)} dtk`}
    </span>
  )
}
