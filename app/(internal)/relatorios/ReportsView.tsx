'use client'

import Link from 'next/link'
import { BarChart2, TrendingUp, Package, CheckCircle, AlertTriangle, Briefcase } from 'lucide-react'
import { fmtCurrency } from '@/lib/utils/format'
import { useT } from '@/lib/i18n/I18nProvider'

interface Props {
  totalOits: number
  taxa: number
  receita: number
  conversionRate: number
  totalBudgets: number
  aprovados: number
  totalOcorrencias: number
}

export default function ReportsView({ totalOits, taxa, receita, conversionRate, totalBudgets, aprovados, totalOcorrencias }: Props) {
  const t = useT()
  const cards = [
    { tkey: 'totalOits',       value: totalOits,            icon: Package,     bg: 'rgba(59,130,246,0.18)',  color: 'text-blue-300' },
    { tkey: 'deliveryRate',    value: `${taxa}%`,           icon: CheckCircle, bg: 'rgba(52,211,153,0.18)',  color: 'text-emerald-300' },
    { tkey: 'totalRevenue',    value: fmtCurrency(receita), icon: TrendingUp,  bg: 'rgba(167,139,250,0.18)', color: 'text-violet-300' },
    { tkey: 'conversionRate',  value: `${conversionRate}%`, icon: Briefcase,   bg: 'rgba(245,158,11,0.18)',  color: 'text-amber-300' },
  ]

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('reports.title')}</h1>
        <p className="text-blue-400 mt-0.5 text-sm">{t('reports.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ tkey, value, icon: Icon, bg, color }) => (
          <div key={tkey} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">{t(`reports.${tkey}`)}</p>
                <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link href="/dashboards/comercial" className="glass glass-hover rounded-2xl p-5">
          <Briefcase className="w-5 h-5 text-cyan-400 mb-3" />
          <h3 className="font-bold text-white">{t('reports.commercial')}</h3>
          <p className="text-xs text-blue-400 mt-1">{t('reports.commercialSub', { count: totalBudgets, approved: aprovados })}</p>
        </Link>
        <Link href="/dashboards/financeiro" className="glass glass-hover rounded-2xl p-5">
          <TrendingUp className="w-5 h-5 text-amber-400 mb-3" />
          <h3 className="font-bold text-white">{t('reports.financial')}</h3>
          <p className="text-xs text-blue-400 mt-1">{t('reports.financialSub', { revenue: fmtCurrency(receita) })}</p>
        </Link>
        <Link href="/dashboards/prestadores" className="glass glass-hover rounded-2xl p-5">
          <BarChart2 className="w-5 h-5 text-violet-400 mb-3" />
          <h3 className="font-bold text-white">{t('reports.providers')}</h3>
          <p className="text-xs text-blue-400 mt-1">{t('reports.providersSub')}</p>
        </Link>
      </div>

      <div className="glass rounded-2xl p-5 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <div>
          <p className="text-sm font-bold text-white">{t('reports.occurrencesRegistered', { count: totalOcorrencias })}</p>
          <Link href="/ocorrencias" className="text-xs text-blue-400 hover:text-blue-300">{t('reports.viewDetails')}</Link>
        </div>
      </div>
    </div>
  )
}
