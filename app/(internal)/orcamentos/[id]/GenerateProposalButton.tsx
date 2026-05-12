'use client'

import { useState, useTransition } from 'react'
import { FileText, Loader2, Send } from 'lucide-react'
import { generateProposalPdf } from '@/lib/utils/proposal-pdf'
import { setProposalUrl, markProposalSent } from '@/lib/actions/budgets'
import { useT } from '@/lib/i18n/I18nProvider'
import type { DbBudget, DbCollectionPoint, DbDeliveryPoint } from '@/lib/types'

export default function GenerateProposalButton({ budget, collectionPoints, deliveryPoints }: {
  budget: DbBudget; collectionPoints: DbCollectionPoint[]; deliveryPoints: DbDeliveryPoint[]
}) {
  const t = useT()
  const [loading, setLoading] = useState(false)
  const [pending, start] = useTransition()

  async function handleGenerate() {
    setLoading(true)
    try {
      await generateProposalPdf({ budget, collectionPoints, deliveryPoints })
      await setProposalUrl(budget.id, `proposta-${budget.number}.pdf`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleGenerate} disabled={loading}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        {loading ? t('budgetDetail.generating') : t('budgetDetail.generateProposal')}
      </button>
      {budget.proposal_pdf_url && (
        <button onClick={() => start(async () => { await markProposalSent(budget.id) })} disabled={pending}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-blue-300 hover:text-white glass">
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {t('budgetDetail.markSent')}
        </button>
      )}
    </div>
  )
}
