'use client'

import Link from 'next/link'
import { AlertTriangle, MapPin } from 'lucide-react'
import { OccurrenceStatusBadge } from '@/components/StatusBadge'
import { fmtDateTime } from '@/lib/utils/format'
import { useT } from '@/lib/i18n/I18nProvider'
import type { OccurrenceStatus, OccurrenceType } from '@/lib/types'

type Row = {
  id: string
  oit_id: string
  type: OccurrenceType | null
  description: string | null
  impact: string | null
  location: string | null
  status: OccurrenceStatus
  created_at: string
  oits: { number: string; client_name: string; status: string } | null
}

export default function OcorrenciasView({ rows }: { rows: Row[] }) {
  const t = useT()
  const abertas    = rows.filter(o => o.status === 'aberta').length
  const tratativa  = rows.filter(o => o.status === 'em_tratativa').length
  const resolvidas = rows.filter(o => o.status === 'resolvida' || o.status === 'encerrada').length

  const stats = [
    { tkey: 'statOpen',        value: abertas,    color: '#F87171', bg: 'rgba(239,68,68,0.18)' },
    { tkey: 'statInTreatment', value: tratativa,  color: '#FBBF24', bg: 'rgba(245,158,11,0.18)' },
    { tkey: 'statResolved',    value: resolvidas, color: '#34D399', bg: 'rgba(52,211,153,0.18)' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map(s => (
        <div key={s.tkey} className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
            <AlertTriangle className="w-5 h-5" style={{ color: s.color }} />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">{s.value}</p>
            <p className="text-xs text-blue-400 mt-0.5">{t(`occurrences.${s.tkey}`)}</p>
          </div>
        </div>
      ))}
      <div className="glass rounded-2xl overflow-hidden col-span-3">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-bold text-white">{t('occurrences.tableTitle')}</h2>
        </div>
        {rows.length === 0 ? (
          <p className="p-10 text-center text-blue-600 text-sm">{t('occurrences.noOccurrences')}</p>
        ) : (
          <div>
            {rows.map(occ => {
              const oit = occ.oits
              return (
                <Link key={occ.id} href={oit ? `/oits/${occ.oit_id}` : '#'}
                  className="block px-5 py-4 glass-hover transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-white">{oit?.number ?? 'OIT'}</span>
                        <OccurrenceStatusBadge status={occ.status} />
                        <span className="text-xs font-bold text-red-300">{t(`occurrences.types.${occ.type ?? 'outros'}`)}</span>
                      </div>
                      <p className="text-sm text-blue-200 mt-1">{occ.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-blue-500">
                        <span>{oit?.client_name ?? '—'}</span>
                        {occ.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {occ.location}</span>}
                        <span>{fmtDateTime(occ.created_at)}</span>
                      </div>
                      {occ.impact && <p className="text-xs text-amber-400 mt-1">{t('occurrences.impactLabel')} {occ.impact}</p>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
