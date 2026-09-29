import type { ConceptStatus } from '../types/server-message'

export type MarkStatus = ConceptStatus | 'none'

// Ikon garis untuk kontrol UI (tombol, label statistik), mengikuti warna teks.
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function SunIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
    </svg>
  )
}

export function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.6}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function SpeedIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.2}>
      <path d="M4 16a8 8 0 1 1 16 0" />
      <path d="M12 16l4.2-5" />
      <circle cx="12" cy="16" r="1.4" fill="currentColor" />
    </svg>
  )
}

export function FillerIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.2}>
      <path d="M4 18.5V6.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8.5Z" />
      <path d="M8 10.5q1.3-1.8 2.6 0t2.6 0 2.6 0" />
    </svg>
  )
}

export function PauseIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.2}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 8.8v6.4M14 8.8v6.4" />
    </svg>
  )
}

export function MoonIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={1.8}>
      <path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z" />
    </svg>
  )
}

export function ArrowLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.6}>
      <path d="M19 12H5.5M11 5.5 4.5 12l6.5 6.5" />
    </svg>
  )
}

export function ChevronIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.6}>
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </svg>
  )
}

export function PencilIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.2}>
      <path d="M4.5 19.5l1-4.5L16 4.5a2.1 2.1 0 0 1 3 3L8.5 18Z" />
      <path d="M14 6.5l3 3" />
    </svg>
  )
}

export function TrashIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.2}>
      <path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l1 12.5h9l1-12.5M10.2 10.5v6M13.8 10.5v6" />
    </svg>
  )
}

export function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.6}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function UploadIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.2}>
      <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z" />
      <path d="M14 3.5v5h5M12 17v-6M9.3 13.5 12 10.8l2.7 2.7" />
    </svg>
  )
}

export function ClipboardIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.2}>
      <path d="M8.5 5.5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-11a2 2 0 0 0-2-2h-1.5" />
      <rect x="8.5" y="3.5" width="7" height="4" rx="1.5" />
      <path d="M8.5 12h7M8.5 15.5h5" />
    </svg>
  )
}

export function SkipIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.4}>
      <path d="M5 6.5 11 12l-6 5.5M12.5 6.5l6 5.5-6 5.5" />
    </svg>
  )
}

export function LaptopIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.2}>
      <rect x="5" y="5" width="14" height="10" rx="1.5" />
      <path d="M2.5 18.5h19" />
    </svg>
  )
}

export function CloudIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.2}>
      <path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.3A3.9 3.9 0 0 1 17 18.5Z" />
    </svg>
  )
}

export function RetryIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.4}>
      <path d="M19 12a7 7 0 1 1-2.1-5M19 4.5V9h-4.5" />
    </svg>
  )
}

export function ClockIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke} strokeWidth={2.2}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}
