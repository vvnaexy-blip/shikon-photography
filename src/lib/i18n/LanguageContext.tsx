'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  type Locale,
  type Translations,
  DEFAULT_LOCALE,
  LOCALE_DIR,
  TRANSLATIONS,
} from './translations'

const LS_KEY = 'shiko_locale'

interface LanguageContextValue {
  locale: Locale
  t: Translations
  setLocale: (l: Locale) => void
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  // Load saved preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY) as Locale | null
      if (saved && saved in TRANSLATIONS) {
        setLocaleState(saved)
      }
    } catch {
      // localStorage unavailable (SSR / private browsing)
    }
  }, [])

  // Update <html> dir attribute whenever locale changes
  useEffect(() => {
    const dir = LOCALE_DIR[locale]
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', locale)
  }, [locale])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(LS_KEY, l)
    } catch {
      // ignore
    }
  }, [])

  return (
    <LanguageContext.Provider
      value={{
        locale,
        t: TRANSLATIONS[locale],
        setLocale,
        dir: LOCALE_DIR[locale],
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
