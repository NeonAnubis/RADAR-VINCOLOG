'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useT } from '@/lib/i18n/I18nProvider'

export default function NewFromBudgetLink() {
  const t = useT()
  return (
    <Link href="/orcamentos" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold btn-glass-primary">
      <Plus className="w-4 h-4" /> {t('oits.newFromBudget')}
    </Link>
  )
}
