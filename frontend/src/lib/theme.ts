import { useState } from 'react'

export type Theme = 'light' | 'dark'

// Tema awal dipasang di index.html sebelum render supaya tidak berkedip.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )
  const choose = (next: Theme) => {
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Penyimpanan diblokir: tema tetap berlaku untuk sesi ini.
    }
    setTheme(next)
  }
  return [theme, choose] as const
}
