import { createContext } from 'react'
import type { Theme } from '@/lib/theme'

export interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeStore | null>(null)