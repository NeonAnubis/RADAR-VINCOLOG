'use client'

import { FileText, Send, CheckCircle, XCircle, TrendingUp, Briefcase } from 'lucide-react'
import { fmtCurrency } from '@/lib/utils/format'
import { SERVICE_LEVELS } from '@/lib/types'
import { useT } from '@/lib/i18n/I18nProvider'
import type { ServiceLevel } from '@/lib/types'

interface Props {
  totals: {
    cadastrados: number
    propostas_enviadas: number
    aprovadas: number
    recusadas: number
    valor_proposto: number
    valor_aprovado: number
  }
  taxa: number
  totalCount: number
  byLevel: Record<ServiceLevel, number>
}

export default function CommercialDashboardView({ totals, taxa, totalCount, byLevel }: Props) {
  const t = useT()
  const cards = [
    { tkey: 'totalBudgets',      value: totals.cadastrados,        icon: FileText,     color: 'bg-blue-500/25 text-blue-300' },
    { tkey: 'proposalsSent',     value: totals.propostas_enviadas, icon: Send,         color: 'bg-violet-500/25 text-violet-300' },
    { tkey: 'proposalsApproved', value: totals.aprovadas,          icon: CheckCircle,  color: 'bg-emerald-500/25 text-emerald-300' },
    { tkey: 'proposalsRejected', value: totals.recusadas,          icon: XCircle,      color: 'bg-red-500/25 text-red-300' },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('dashboards.commercial.title')}</h1>
        <p className="text-blue-400 mt-0.5 text-sm">{t('dashboards.commercial.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ tkey, value, icon: Icon, color }) => (
          <div key={tkey} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">{t(`dashboards.commercial.${tkey}`)}</p>
                <p className="text-3xl font-extrabold text-white mt-1">{value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">{t('dashboards.commercial.conversionRate')}</h2>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-4xl font-extrabold text-white">{taxa}%</p>
          <p className="text-xs text-blue-400 mt-1">{t('dashboards.commercial.conversionSub', { approved: totals.aprovadas, total: totalCount })}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">{t('dashboards.commercial.totalProposed')}</h2>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{fmtCurrency(totals.valor_proposto)}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">{t('dashboards.commercial.totalApproved')}</h2>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{fmtCurrency(totals.valor_aprovado)}</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-bold text-white mb-4">{t('dashboards.commercial.productsByLevel')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(SERVICE_LEVELS).map(([key, meta]) => (
            <div key={key} className="rounded-xl p-4" style={{ background: `${meta.color}1a`, border: `1px solid ${meta.color}55` }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.color }}>{meta.short}</p>
              <p className="text-3xl font-extrabold text-white mt-1">{byLevel[key as ServiceLevel]}</p>
              <p className="text-[10px] text-blue-400 mt-1">{t(`serviceLevels.${key}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
