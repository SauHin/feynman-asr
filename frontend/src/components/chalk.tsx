import type { ConceptStatus } from '../types/server-message'

export type MarkStatus = ConceptStatus | 'none'

// Filter goresan kapur: tepi sedikit kasar. Dipasang sekali per halaman.
export function ChalkDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <filter id="chalk-rough" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="4" />
        <feDisplacementMap in="SourceGraphic" scale="1.9" />
      </filter>
      {/* Huruf kapur: tepi sedikit goyah dan sesekali bintik kosong, setara kekasaran tanda kapur. */}
      <filter id="chalk-text" x="-5%" y="-15%" width="110%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="11" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 -7 5.6" result="holes" />
        <feComposite in="SourceGraphic" in2="holes" operator="in" result="speck" />
        <feDisplacementMap in="speck" in2="n" scale="1.3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

// Kotak kosong = belum, garis miring = disebut, centang = dijelaskan.
// wrong (hanya di feedback) = silang: dijelaskan, tetapi keliru.
// Tanda baru di dalam kotak di-mount ulang lewat key, jadi goresannya tergambar saat status naik.
// bare: hanya tanda di dalam kotak, untuk garis waktu.
export function ChalkMark({
  status,
  bare = false,
  className = '',
}: {
  status: MarkStatus | 'wrong'
  bare?: boolean
  className?: string
}) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g filter="url(#chalk-rough)" {...stroke}>
        {!bare && (
          <path
            strokeWidth={2.1}
            d="M6.6 7.3C11.2 6.7 20.1 7 25.5 6.8c.3 5.3-.1 13.1.3 18.5-6.8.5-13.7.1-19.3.3.4-6.6-.1-13 .1-18.3Z"
          />
        )}
        {status === 'mentioned' && (
          <path key="m" className="chalk-draw" pathLength={1} strokeWidth={2.6} d="M10.4 22.2 21.8 9.9" />
        )}
        {status === 'explained' && (
          <path key="e" className="chalk-draw" pathLength={1} strokeWidth={2.8} d="M9.6 16.9l4.6 4.8 9.6-12.3" />
        )}
        {status === 'wrong' && (
          <path key="w" className="chalk-draw" pathLength={1} strokeWidth={2.7} d="M10.8 10.6l10.6 11.2M21.6 10.4 10.6 21.9" />
        )}
      </g>
    </svg>
  )
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
