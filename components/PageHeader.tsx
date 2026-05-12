'use client'

import { useT } from '@/lib/i18n/I18nProvider'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Translation key for the title — e.g. "dashboard.title" */
  titleKey: string
  /** Translation key for the subtitle — or pass `subtitle` directly for dynamic strings */
  subtitleKey?: string
  /** Pre-resolved subtitle (overrides subtitleKey) — useful when interpolation already happened on server */
  subtitle?: string
  /** Variables for interpolation inside title/subtitle */
  vars?: Record<string, string | number>
  /** Action buttons rendered on the right */
  actions?: ReactNode
}

export default function PageHeader({ titleKey, subtitleKey, subtitle, vars, actions }: PageHeaderProps) {
  const t = useT()
  const resolvedSubtitle = subtitle ?? (subtitleKey ? t(subtitleKey, vars) : undefined)
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {t(titleKey, vars)}
        </h1>
        {resolvedSubtitle && (
          <p className="mt-0.5 text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>{resolvedSubtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}
