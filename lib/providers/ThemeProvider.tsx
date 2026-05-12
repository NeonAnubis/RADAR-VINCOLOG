'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeCtx {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

const Ctx = createContext<ThemeCtx>({ theme: 'dark', setTheme: () => {}, toggle: () => {} })
export const THEME_STORAGE_KEY = 'radar-theme'

/** Read current data-theme off <html> so we hydrate to whatever the early-init script applied. */
function readInitial(): Theme {
  if (typeof document === 'undefined') return 'dark'
  const v = document.documentElement.getAttribute('data-theme')
  return v === 'light' ? 'light' : 'dark'
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  // Adopt the value already set on <html> by the early-init script (avoids flash + hydration fight)
  useEffect(() => { setThemeState(readInitial()) }, [])

  // Whenever state changes, mirror to <html data-theme> + localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(THEME_STORAGE_KEY, theme) } catch {}
  }, [theme])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])
  const toggle   = useCallback(() => setThemeState(prev => (prev === 'dark' ? 'light' : 'dark')), [])

  return <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>
}

export function useTheme() {
  return useContext(Ctx)
}
