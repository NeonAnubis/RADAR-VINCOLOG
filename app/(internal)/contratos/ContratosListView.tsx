'use client'

import Link from 'next/link'
import { FileSignature, CheckCircle, Clock, Archive, Eye, ExternalLink } from 'lucide-react'
import { fmtDateTime, fmtCurrency } from '@/lib/utils/format'
import { useT } from '@/lib/i18n/I18nProvider'

const STATUS_COLORS: Record<string, string> = {
  nao_gerado: '#94A3B8', gerado: '#60A5FA', enviado: '#A78BFA',
  aceito: '#34D399', assinado_anexado: '#34D399',
  pendente: '#FBBF24', cancelado: '#F87171',
}

type Row = {
  id: string
  oit_id: string
  contract_value: number | null
  advance_amount: number | null
  status: string
  accepted_at: string | null
  signed_pdf_url: string | null
  oits: { number: string; client_name: string } | null
  providers: { name: string } | null
}

export default function ContratosListView({ rows }: { rows: Row[] }) {
  const t = useT()
  const aceitos = rows.filter(c => ['aceito','assinado_anexado'].includes(c.status)).length
  const pendentes = rows.filter(c => ['nao_gerado','gerado','enviado','pendente'].includes(c.status)).length
  const cancelados = rows.filter(c => c.status === 'cancelado').length

  const stats = [
    { tkey: 'acceptedSigned', v: aceitos,    icon: CheckCircle, color: 'text-emerald-300', bg: 'rgba(52,211,153,0.18)' },
    { tkey: 'pending',        v: pendentes,  icon: Clock,        color: 'text-amber-300',   bg: 'rgba(245,158,11,0.18)' },
    { tkey: 'cancelled',      v: cancelados, icon: Archive,      color: 'text-red-400',     bg: 'rgba(239,68,68,0.15)' },
  ]
  const headers = ['oit', 'client', 'provider', 'value', 'advance', 'status', 'acceptedAt'] as const

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('contracts.title')}</h1>
        <p className="text-blue-400 mt-0.5 text-sm">{t('contracts.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ tkey, v, icon: Icon, color, bg }) => (
          <div key={tkey} className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">{v}</p>
              <p className="text-xs text-blue-400 mt-0.5">{t(`contracts.${tkey}`)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-bold text-white">{t('contracts.tableTitle')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {headers.map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-5 py-3 uppercase tracking-widest">{t(`contracts.columns.${h}`)}</th>
                ))}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(c => {
                const color = STATUS_COLORS[c.status] ?? '#94A3B8'
                const oit = c.oits
                const prov = c.providers
                return (
                  <tr key={c.id} className="glass-hover transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileSignature className="w-4 h-4 text-blue-500" />
                        <Link href={`/oits/${c.oit_id}`} className="font-mono text-xs font-bold text-blue-400 hover:text-blue-300">
                          {oit?.number ?? '—'}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-blue-100">{oit?.client_name ?? '—'}</td>
                    <td className="px-4 py-4 text-sm font-medium text-blue-100">{prov?.name ?? '—'}</td>
                    <td className="px-4 py-4 text-sm font-extrabold text-white">{fmtCurrency(c.contract_value)}</td>
                    <td className="px-4 py-4 text-sm text-blue-300">{fmtCurrency(c.advance_amount)}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border"
                        style={{ background: `${color}22`, color, borderColor: `${color}55` }}>
                        {t(`contracts.statusLabels.${c.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-blue-500 whitespace-nowrap">{c.accepted_at ? fmtDateTime(c.accepted_at) : '—'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {c.signed_pdf_url && (
                          <a href={c.signed_pdf_url} target="_blank" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> {t('contracts.view')}
                          </a>
                        )}
                        <Link href={`/oits/${c.oit_id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-blue-600 text-sm">{t('contracts.empty')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
