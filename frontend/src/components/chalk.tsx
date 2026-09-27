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
// Tanda baru di dalam kotak di-mount ulang lewat key, jadi goresannya tergambar saat status naik.
// bare: hanya tanda di dalam kotak, untuk garis waktu.
export function ChalkMark({
  status,
  bare = false,
  className = '',
}: {
  status: MarkStatus
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
