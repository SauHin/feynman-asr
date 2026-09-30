// Pilihan halaman atau slide gaya dialog cetak: "1-5, 8, 11-13". Kosong berarti semua.
export function parsePages(spec: string): { pages: number[] } | { error: string } {
  const parts = spec
    .replace(/\s*[-–]\s*/g, '-')
    .split(/[,;\s]+/)
    .filter(Boolean)
  const pages = new Set<number>()
  for (const p of parts) {
    const m = p.match(/^(\d+)(?:-(\d+))?$/)
    if (!m) return { error: `"${p}" bukan nomor atau rentang.` }
    const a = Number(m[1])
    const b = m[2] ? Number(m[2]) : a
    if (a < 1) return { error: 'Mulai dari 1, ya.' }
    if (a > b) return { error: `${a}–${b}: angka awal harus lebih kecil.` }
    // ponytail: batas 2000 menjaga loop tetap kecil; jumlah halaman asli baru diketahui di backend.
    if (b > 2000) return { error: 'Nomornya kebesaran.' }
    for (let i = a; i <= b; i++) pages.add(i)
  }
  return { pages: [...pages].sort((x, y) => x - y) }
}

// Kebalikan parsePages untuk ringkasan: [1, 2, 3, 5] menjadi "1–3, 5".
export function formatPages(pages: number[]) {
  const out: string[] = []
  for (let i = 0; i < pages.length; i++) {
    let j = i
    while (j + 1 < pages.length && pages[j + 1] === pages[j] + 1) j++
    out.push(j > i ? `${pages[i]}–${pages[j]}` : `${pages[i]}`)
    i = j
  }
  return out.join(', ')
}
