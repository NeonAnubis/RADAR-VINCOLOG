'use client'

import Link from 'next/link'
import { DollarSign, TrendingUp, AlertTriangle, Clock, Briefcase } from 'lucide-react'
import { fmtCurrency } from '@/lib/utils/format'
import { OitStatusBadge } from '@/components/StatusBadge'
import { useT } from '@/lib/i18n/I18nProvider'
import type { OitStatus } from '@/lib/types'

type Row = {
  id: string
  number: string | null
  client_name: string | null
  status: OitStatus
  vendor_value: number | null
  contracted_value: number | null
  estimated_margin: number | null
  margin_percentage: number | null
}

interface Props {
  rows: Row[]
  valorVendido: number
  custoContratado: number
  margemTotal: number
  margemPct: number
  adiantamentosPendentes: number
  saldosPendentes: number
  margemBaixa: number
}

export default function FinancialDashboardView({
  rows, valorVendido, custoContratado, margemTotal, margemPct,
  adiantamentosPendentes, saldosPendentes, margemBaixa,
}: Props) {
  const t = useT()
  const metrics = [
    { tkey: 'soldValue',       v: fmtCurrency(valorVendido),       icon: Briefcase,   color: 'bg-blue-500/25 text-blue-300' },
    { tkey: 'contractedCost',  v: fmtCurrency(custoContratado),    icon: DollarSign,  color: 'bg-violet-500/25 text-violet-300' },
    { tkey: 'grossMargin',     v: fmtCurrency(margemTotal),        icon: TrendingUp,  color: margemTotal >= 0 ? 'bg-emerald-500/25 text-emerald-300' : 'bg-red-500/25 text-red-300' },
    { tkey: 'marginPct',       v: `${margemPct.toFixed(1)}%`,      icon: TrendingUp,  color: 'bg-amber-500/25 text-amber-300' },
  ]
  const alerts = [
    { tkey: 'pendingAdvance', count: adiantamentosPendentes, icon: Clock,         color: 'amber' as const },
    { tkey: 'pendingBalance', count: saldosPendentes,        icon: Clock,         color: 'amber' as const },
    { tkey: 'lowMargin',      count: margemBaixa,            icon: AlertTriangle, color: 'red'   as const },
  ]
  const headers = ['oit', 'client', 'status', 'sold', 'cost', 'margin', 'marginPct'] as const

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('dashboards.financial.title')}</h1>
        <p className="text-blue-400 mt-0.5 text-sm">{t('dashboards.financial.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ tkey, v, icon: Icon, color }) => (
          <div key={tkey} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">{t(`dashboards.financial.${tkey}`)}</p>
                <p className="text-2xl font-extrabold text-white mt-1">{v}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {alerts.map(({ tkey, count, icon: Icon, color }) => {
          const styles = color === 'red'
            ? { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', accent: '#F87171' }
            : { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', accent: '#FBBF24' }
          return (
            <div key={tkey} className="rounded-2xl p-5 flex items-center gap-4" style={{ background: styles.bg, border: `1px solid ${styles.border}` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${styles.accent}33` }}>
                <Icon className="w-5 h-5" style={{ color: styles.accent }} />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-300">{t(`dashboards.financial.${tkey}`)}</p>
                <p className="text-2xl font-extrabold text-white mt-1">{count}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-bold text-white">{t('dashboards.financial.tableTitle')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {headers.map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-4 py-3 uppercase tracking-widest">{t(`dashboards.financial.columns.${h}`)}</th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(o => (
                <tr key={o.id} className="glass-hover transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-4 py-3"><span className="font-mono text-sm font-bold text-white">{o.number}</span></td>
                  <td className="px-4 py-3 text-sm text-blue-100">{o.client_name}</td>
                  <td className="px-4 py-3"><OitStatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-sm font-bold text-white">{fmtCurrency(o.vendor_value)}</td>
                  <td className="px-4 py-3 text-sm text-blue-200">{fmtCurrency(o.contracted_value)}</td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: (o.estimated_margin ?? 0) >= 0 ? '#34D399' : '#F87171' }}>
                    {fmtCurrency(o.estimated_margin)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: (o.margin_percentage ?? 0) >= 10 ? '#34D399' : (o.margin_percentage ?? 0) >= 5 ? '#FBBF24' : '#F87171' }}>
                    {o.margin_percentage !== null ? `${o.margin_percentage.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/oits/${o.id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300">{t('common.view')} →</Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-blue-600 text-sm">{t('dashboards.financial.tableEmpty')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
