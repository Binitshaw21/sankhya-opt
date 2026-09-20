import { useContext } from 'react'
import { ThemeContext } from './theme-context'

export function useTheme() {
  const store = useContext(ThemeContext)
  if (!store) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return store
}