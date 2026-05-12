'use client'

import Link from 'next/link'
import { DollarSign, TrendingUp, Clock } from 'lucide-react'
import { OitStatusBadge } from '@/components/StatusBadge'
import { fmtCurrency } from '@/lib/utils/format'
import { useT } from '@/lib/i18n/I18nProvider'
import type { OitStatus } from '@/lib/types'

type Row = {
  id: string
  number: string | null
  client_name: string | null
  status: OitStatus
  vendor_value: number | null
  contracted_value: number | null
  advance_amount: number | null
  balance_amount: number | null
  estimated_margin: number | null
  margin_percentage: number | null
  providers?: { name: string } | null
}

export default function FinanceiroView({ oits }: { oits: Row[] }) {
  const t = useT()

  const totalReceita    = oits.reduce((s, o) => s + (o.vendor_value ?? 0), 0)
  const totalContratado = oits.reduce((s, o) => s + (o.contracted_value ?? 0), 0)
  const totalAdiantado  = oits.reduce((s, o) => s + (o.advance_amount ?? 0), 0)
  const totalSaldo      = oits.reduce((s, o) => s + (o.balance_amount ?? 0), 0)
  const pendentePgto    = oits.filter(o => o.status !== 'finalizado' && (o.balance_amount ?? 0) > 0).length

  const cards = [
    { tkey: 'totalRevenue', v: fmtCurrency(totalReceita),    icon: DollarSign, accent: 'bg-blue-500/25 text-blue-300' },
    { tkey: 'totalCost',    v: fmtCurrency(totalContratado), icon: TrendingUp, accent: 'bg-violet-500/25 text-violet-300' },
    { tkey: 'totalAdvance', v: fmtCurrency(totalAdiantado),  icon: TrendingUp, accent: 'bg-cyan-500/25 text-cyan-300' },
    { tkey: 'totalBalance', v: fmtCurrency(totalSaldo),      icon: Clock,      accent: 'bg-amber-500/25 text-amber-300' },
  ]
  const headers = ['oit', 'client', 'provider', 'status', 'sold', 'cost', 'advance', 'balance', 'margin', 'marginPct'] as const

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('finance.title')}</h1>
        <p className="text-blue-400 mt-0.5 text-sm">{t('finance.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ tkey, v, icon: Icon, accent }) => (
          <div key={tkey} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">{t(`finance.${tkey}`)}</p>
                <p className="text-2xl font-extrabold text-white mt-1 tracking-tight">{v}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="font-bold text-white">{t('finance.tableTitle')}</h2>
            <p className="text-xs text-blue-400 mt-0.5">{t('finance.tableSubtitle', { count: pendentePgto })}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {headers.map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-4 py-3 uppercase tracking-widest">{t(`finance.columns.${h}`)}</th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {oits.map(o => (
                <tr key={o.id} className="glass-hover transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-4 py-3"><span className="font-mono text-sm font-bold text-white">{o.number}</span></td>
                  <td className="px-4 py-3 text-sm text-blue-100">{o.client_name}</td>
                  <td className="px-4 py-3 text-sm text-blue-300">{o.providers?.name?.split(' ').slice(0,2).join(' ') ?? '—'}</td>
                  <td className="px-4 py-3"><OitStatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-sm font-bold text-white">{fmtCurrency(o.vendor_value)}</td>
                  <td className="px-4 py-3 text-sm text-blue-300">{fmtCurrency(o.contracted_value)}</td>
                  <td className="px-4 py-3 text-sm text-blue-300">{fmtCurrency(o.advance_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${(o.balance_amount ?? 0) > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                      {fmtCurrency(o.balance_amount)}
                    </span>
                  </td>
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
              {oits.length === 0 && (
                <tr><td colSpan={11} className="text-center py-10 text-blue-600 text-sm">{t('finance.noTerms')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
