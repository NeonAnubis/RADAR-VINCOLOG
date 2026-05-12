'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import en from './messages/en.json'
import pt from './messages/pt.json'

export type Locale = 'pt' | 'en'

type Messages = typeof pt
const BUNDLES: Record<Locale, Messages> = { pt, en }

interface I18nCtx {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (path: string, vars?: Record<string, string | number>) => string
}

const Ctx = createContext<I18nCtx>({
  locale: 'pt',
  setLocale: () => {},
  t: (k) => k,
})

export const LOCALE_STORAGE_KEY = 'radar-locale'

/** Get nested value from JSON by dotted path "a.b.c" with safe fallback */
function getByPath(obj: unknown, path: string): string | undefined {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj) as string | undefined
}

/** Read current lang from <html> so we hydrate to whatever the early-init script applied. */
function readInitial(): Locale {
  if (typeof document === 'undefined') return 'pt'
  const lang = document.documentElement.lang
  return lang === 'en' ? 'en' : 'pt'
}

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt')

  // Adopt whatever the early-init script wrote to <html lang>
  useEffect(() => { setLocaleState(readInitial()) }, [])

  // Mirror state changes to <html lang> + localStorage
  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en'
    try { localStorage.setItem(LOCALE_STORAGE_KEY, locale) } catch {}
  }, [locale])

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])

  const t = useCallback((path: string, vars?: Record<string, string | number>) => {
    const bundle = BUNDLES[locale]
    let val = getByPath(bundle, path)
    if (val === undefined) val = getByPath(BUNDLES.pt, path) // fallback
    if (val === undefined) return path
    if (!vars) return val
    return Object.entries(vars).reduce((acc, [k, v]) =>
      acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)), val)
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  return useContext(Ctx)
}

/** Convenience hook — returns just the `t` function */
export function useT() {
  return useContext(Ctx).t
}
