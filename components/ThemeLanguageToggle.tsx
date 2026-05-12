'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/providers/ThemeProvider'
import { useI18n, type Locale } from '@/lib/i18n/I18nProvider'

/**
 * Compact segmented control for theme + language.
 * Each segment shows BOTH options side-by-side with the active one highlighted —
 * one click sets the chosen value (no guesswork about what the button does).
 */
export default function ThemeLanguageToggle() {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale } = useI18n()

  return (
    <div className="flex items-center gap-1.5 px-1">
      {/* Theme segmented switch */}
      <div
        role="group"
        aria-label="Theme"
        className="flex flex-1 p-0.5 rounded-full"
        style={{ background: 'var(--glass-sm-bg)', border: '1px solid var(--glass-sm-border)' }}
      >
        <SegBtn active={theme === 'dark'} onClick={() => setTheme('dark')} ariaLabel="Dark theme">
          <Moon className="w-3.5 h-3.5" />
        </SegBtn>
        <SegBtn active={theme === 'light'} onClick={() => setTheme('light')} ariaLabel="Light theme">
          <Sun className="w-3.5 h-3.5" />
        </SegBtn>
      </div>

      {/* Language segmented switch */}
      <div
        role="group"
        aria-label="Language"
        className="flex flex-1 p-0.5 rounded-full"
        style={{ background: 'var(--glass-sm-bg)', border: '1px solid var(--glass-sm-border)' }}
      >
        <SegBtn active={locale === 'pt'} onClick={() => setLocale('pt' as Locale)} ariaLabel="Português">
          <span className="text-[10px] font-extrabold tracking-wide">PT</span>
        </SegBtn>
        <SegBtn active={locale === 'en'} onClick={() => setLocale('en' as Locale)} ariaLabel="English">
          <span className="text-[10px] font-extrabold tracking-wide">EN</span>
        </SegBtn>
      </div>
    </div>
  )
}

function SegBtn({
  active, onClick, ariaLabel, children,
}: {
  active: boolean
  onClick: () => void
  ariaLabel: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className="flex-1 flex items-center justify-center h-7 rounded-full transition-all duration-200"
      style={
        active
          ? {
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              color: '#FFFFFF',
              boxShadow: '0 2px 10px rgba(59,130,246,0.45)',
            }
          : {
              background: 'transparent',
              color: 'var(--text-muted)',
            }
      }
    >
      {children}
    </button>
  )
}
