'use client'

import Link from 'next/link'
import { MapPin, Search } from 'lucide-react'
import { BudgetStatusBadge } from '@/components/StatusBadge'
import { fmtDateTime, fmtCurrency } from '@/lib/utils/format'
import { useT } from '@/lib/i18n/I18nProvider'

type Row = {
  id: string
  number: string | null
  client_name: string | null
  client_contact_phone?: string | null
  cargo_description?: string | null
  approved_value: number | null
  status: string
  created_at: string
  collection_points?: Array<{ city: string | null }>
  delivery_points?: Array<{ city: string | null }>
}

interface Props {
  rows: Row[]
  counts: {
    all: number; cadastrado: number; proposta_gerada: number;
    proposta_enviada: number; aprovado: number; recusado: number;
  }
}

export default function OrcamentosListView({ rows, counts }: Props) {
  const t = useT()
  const tabs = [
    { key: 'all',              tkey: 'filterAll',              count: counts.all,              active: true },
    { key: 'cadastrado',       tkey: 'filterRegistered',       count: counts.cadastrado },
    { key: 'proposta_gerada',  tkey: 'filterProposalGenerated', count: counts.proposta_gerada },
    { key: 'proposta_enviada', tkey: 'filterProposalSent',     count: counts.proposta_enviada },
    { key: 'aprovado',         tkey: 'filterApproved',         count: counts.aprovado },
    { key: 'recusado',         tkey: 'filterRejected',         count: counts.recusado },
  ]
  const headers = ['number', 'client', 'route', 'cargo', 'approvedValue', 'status', 'createdAt'] as const

  return (
    <>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
          <input readOnly placeholder={t('budgets.searchPlaceholder')} className="glass-input pl-9" />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.key}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${tab.active ? 'text-white' : 'text-blue-400 hover:text-blue-200 glass'}`}
            style={tab.active ? { background: 'linear-gradient(135deg,rgba(59,130,246,0.4),rgba(37,99,235,0.3))', border: '1px solid rgba(96,165,250,0.3)' } : {}}>
            {t(`budgets.${tab.tkey}`)}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab.active ? 'bg-blue-400/30 text-blue-200' : 'bg-white/10 text-blue-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {headers.map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-5 py-3 uppercase tracking-widest">{t(`budgets.columns.${h}`)}</th>
                ))}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(b => {
                const collectCities = (b.collection_points ?? []).map(c => c.city).filter(Boolean) as string[]
                const deliverCities = (b.delivery_points ?? []).map(d => d.city).filter(Boolean) as string[]
                return (
                  <tr key={b.id} className="glass-hover transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-5 py-4"><span className="font-mono text-sm font-bold text-white">{b.number}</span></td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-blue-100">{b.client_name ?? '—'}</p>
                      <p className="text-xs text-blue-500">{b.client_contact_phone ?? ''}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-xs text-blue-300">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        <span>{collectCities.length > 1 ? t('budgets.collections', { count: collectCities.length }) : (collectCities[0] ?? '—')}</span>
                        <span className="text-blue-600">→</span>
                        <span>{deliverCities.length > 1 ? t('budgets.deliveries', { count: deliverCities.length }) : (deliverCities[0] ?? '—')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-blue-400 max-w-[180px] truncate">{b.cargo_description ?? '—'}</td>
                    <td className="px-4 py-4"><span className="text-sm font-bold text-white">{fmtCurrency(b.approved_value)}</span></td>
                    <td className="px-4 py-4"><BudgetStatusBadge status={b.status as Parameters<typeof BudgetStatusBadge>[0]['status']} /></td>
                    <td className="px-4 py-4 text-xs text-blue-400 whitespace-nowrap">{fmtDateTime(b.created_at)}</td>
                    <td className="px-4 py-4">
                      <Link href={`/orcamentos/${b.id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300">{t('common.view')} →</Link>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-blue-600 text-sm">{t('budgets.noBudgets')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
