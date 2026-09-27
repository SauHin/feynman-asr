// Dinding kelas di sekitar papan, dalam satu gaya dengan Si Kapur: garis luar currentColor
// (text-outline) setebal kira-kira 3px di layar, isian datar, dan satu bayangan per benda.
// Siang dan malam berbeda lewat benda: jendela berganti langit, dan lampu menyala di malam hari.

const INKED = { stroke: 'currentColor', strokeWidth: 2.8, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

// elapsed: waktu sesi untuk jam dinding. Tanpa sesi, jam menunjukkan waktu sekarang.
export function ClassroomWall({ elapsed }: { elapsed?: number }) {
  const d = new Date()
  const clockTime = elapsed ?? d.getMinutes() * 60 + d.getSeconds()
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-outline">
      {/* Cahaya hangat lampu di malam hari */}
      <div className="absolute right-[1%] top-6 hidden h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(255,210,122,0.25),transparent)] dark:block" />

      {/* Dinding bawah dan list kayu setinggi baki kapur */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-[#d3e7f8] dark:bg-[#1a2b3d]" />
      <div className="absolute inset-x-0 bottom-8 h-4 border-y-[3px] border-outline bg-wood" />

      {/* Hiasan hanya tampil kalau ada dinding di samping papan (lebar 1340px ke atas).
          Dinding kiri hanya berisi jam, supaya ada ruang kosong untuk Si Kapur saat mencentang. */}
      <div className="absolute left-[max(0.75rem,calc((100%-68rem)/2-7.25rem))] top-5 hidden w-24 flex-col items-center min-[1340px]:flex">
        <WallClock elapsed={clockTime} />
      </div>
      <div className="absolute right-[max(0.75rem,calc((100%-68rem)/2-7.75rem))] top-0 hidden w-28 flex-col items-center gap-3 min-[1340px]:flex">
        <PendantLamp />
        <ClassWindow />
        <PinnedNotes />
      </div>
    </div>
  )
}

// Jarum detik dan menit mengikuti waktu sesi.
function WallClock({ elapsed }: { elapsed: number }) {
  const sec = (elapsed % 60) * 6
  const min = ((elapsed / 60) % 60) * 6
  return (
    <svg viewBox="0 0 84 84" className="size-21">
      <circle cx="42" cy="44" r="37" fill="rgba(0,0,0,0.12)" />
      <circle cx="42" cy="40" r="37" className="fill-wood" {...INKED} />
      <circle cx="42" cy="40" r="29" fill="#ffffff" {...INKED} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x="40.8" y="14.5" width="2.4" height={i % 3 ? 4 : 7} rx="1.2" fill="#44586c" transform={`rotate(${i * 30} 42 40)`} />
      ))}
      <rect x="40.2" y="21" width="3.6" height="20" rx="1.8" fill="#2a2a33" transform={`rotate(${min} 42 40)`} />
      <rect x="41.2" y="16" width="1.6" height="27" rx="0.8" fill="#ff7a6e" transform={`rotate(${sec} 42 40)`} />
      <circle cx="42" cy="40" r="3.4" fill="#ff7a6e" {...INKED} strokeWidth="2" />
    </svg>
  )
}

// Dua catatan tertempel: coretan jaringan saraf dan bintang, tanpa teks.
function PinnedNotes() {
  return (
    <svg viewBox="0 0 96 132" className="w-24">
      <g transform="rotate(-6 46 46)">
        <rect x="12" y="16" width="70" height="66" rx="6" fill="rgba(0,0,0,0.12)" transform="translate(0 4)" />
        <rect x="12" y="16" width="70" height="66" rx="6" fill="#fff6c4" {...INKED} />
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5">
          <path d="M30 36 47 30M30 36 47 48M30 60 47 30M30 60 47 48M47 30 64 42M47 48 64 42M47 48 64 62M30 60 47 64M47 64 64 62" />
        </g>
        <g {...INKED} strokeWidth="2">
          <circle cx="30" cy="36" r="4.5" fill="#9bd8ff" />
          <circle cx="30" cy="60" r="4.5" fill="#9bd8ff" />
          <circle cx="47" cy="30" r="4.5" fill="#9bd8ff" />
          <circle cx="47" cy="48" r="4.5" fill="#9bd8ff" />
          <circle cx="47" cy="64" r="4.5" fill="#9bd8ff" />
          <circle cx="64" cy="42" r="4.5" fill="#ffb3d1" />
          <circle cx="64" cy="62" r="4.5" fill="#ffb3d1" />
        </g>
        <circle cx="47" cy="17" r="5" fill="#ff7a6e" {...INKED} strokeWidth="2.2" />
      </g>
      <g transform="rotate(5 50 104)">
        <rect x="26" y="86" width="50" height="42" rx="6" fill="#ffd9e6" {...INKED} />
        <path d="M51 96l3.5 7 7.5 1-5.5 5 1.5 7.5-7-3.8-7 3.8 1.5-7.5-5.5-5 7.5-1Z" fill="#ffe27a" {...INKED} strokeWidth="2" />
        <circle cx="51" cy="87" r="4" fill="#9ee8c0" {...INKED} strokeWidth="2" />
      </g>
    </svg>
  )
}

function PendantLamp() {
  return (
    <svg viewBox="0 0 80 72" className="w-18">
      <path d="M40 0v30" {...INKED} />
      {/* Bohlam: mati di siang hari, menyala di malam hari */}
      <circle cx="40" cy="54" r="7" className="fill-[#e3ebf2] dark:fill-[#ffe27a]" {...INKED} strokeWidth="2.4" />
      <path d="M20 52c0-13 9-22 20-22s20 9 20 22Z" className="fill-wood" {...INKED} />
      <path d="M26 44c2-5 6-8 10-9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

function ClassWindow() {
  return (
    <svg viewBox="0 0 112 144" className="w-28">
      <rect x="6" y="10" width="100" height="126" rx="12" fill="rgba(0,0,0,0.12)" />
      <rect x="6" y="4" width="100" height="126" rx="12" className="fill-wood" {...INKED} />
      <rect x="15" y="13" width="82" height="106" rx="7" className="fill-[#9bd8ff] dark:fill-[#0b1b2e]" {...INKED} />
      {/* Siang: matahari dan awan */}
      <g className="dark:hidden">
        <circle cx="74" cy="38" r="11" fill="#ffe27a" {...INKED} strokeWidth="2.4" />
        <path d="M26 84a9 9 0 0 1 16-6 11 11 0 0 1 20 3 7 7 0 0 1 2 14H30a8 8 0 0 1-4-11Z" fill="#fff" {...INKED} strokeWidth="2.4" />
      </g>
      {/* Malam: bulan sabit dan bintang */}
      <g className="hidden dark:inline">
        <path d="M78 26a13 13 0 1 0 8 23 10 10 0 1 1-8-23Z" fill="#fff3c4" {...INKED} strokeWidth="2.4" />
        <g fill="#fff3c4">
          <circle cx="30" cy="30" r="1.8" />
          <circle cx="44" cy="58" r="1.4" />
          <circle cx="26" cy="92" r="1.6" />
          <circle cx="70" cy="96" r="1.2" />
          <circle cx="56" cy="24" r="1.1" />
        </g>
      </g>
      <path d="M56 13v106M15 66h82" {...INKED} />
      <rect x="0" y="118" width="112" height="14" rx="6" className="fill-wood" {...INKED} />
    </svg>
  )
}
