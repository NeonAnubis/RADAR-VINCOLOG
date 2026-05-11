import Link from 'next/link'
import { AlertTriangle, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OccurrenceStatusBadge } from '@/components/StatusBadge'
import { OCCURRENCE_TYPES } from '@/lib/types'
import { fmtDateTime } from '@/lib/utils/format'
import ExportButton from '@/components/ExportButton'

export default async function OcorrenciasPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('occurrences')
    .select('*, oits(number, client_name, status)')
    .order('created_at', { ascending: false })

  const all = data ?? []
  const abertas = all.filter(o => o.status === 'aberta').length
  const tratativa = all.filter(o => o.status === 'em_tratativa').length
  const resolvidas = all.filter(o => o.status === 'resolvida' || o.status === 'encerrada').length

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Ocorrências</h1>
          <p className="text-blue-400 mt-0.5 text-sm">{all.length} ocorrências registradas</p>
        </div>
        <ExportButton
          filename={`ocorrencias-${new Date().toISOString().slice(0,10)}.csv`}
          rows={all.map(o => {
            const oit = o.oits as { number: string; client_name: string; status: string } | null
            return {
              oit: oit?.number ?? '', cliente: oit?.client_name ?? '',
              tipo: OCCURRENCE_TYPES[(o.type as keyof typeof OCCURRENCE_TYPES) ?? 'outros'],
              status: o.status, descricao: o.description ?? '', impacto: o.impact ?? '',
              acao: o.action_taken ?? '', local: o.location ?? '',
              criada_em: o.created_at, encerrada_em: o.closed_at ?? '',
            }
          })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Abertas',     value: abertas,    color: '#F87171', bg: 'rgba(239,68,68,0.18)' },
          { label: 'Em Tratativa', value: tratativa, color: '#FBBF24', bg: 'rgba(245,158,11,0.18)' },
          { label: 'Resolvidas',  value: resolvidas, color: '#34D399', bg: 'rgba(52,211,153,0.18)' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
              <AlertTriangle className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">{s.value}</p>
              <p className="text-xs text-blue-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-bold text-white">Todas as Ocorrências</h2>
        </div>
        {all.length === 0 ? (
          <p className="p-10 text-center text-blue-600 text-sm">Nenhuma ocorrência registrada.</p>
        ) : (
          <div>
            {all.map(occ => {
              const oit = occ.oits as { number: string; client_name: string; status: string } | null
              return (
                <Link key={occ.id} href={oit ? `/oits/${occ.oit_id}` : '#'}
                  className="block px-5 py-4 glass-hover transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-white">{oit?.number ?? 'OIT'}</span>
                        <OccurrenceStatusBadge status={occ.status} />
                        <span className="text-xs font-bold text-red-300">{OCCURRENCE_TYPES[(occ.type as keyof typeof OCCURRENCE_TYPES) ?? 'outros']}</span>
                      </div>
                      <p className="text-sm text-blue-200 mt-1">{occ.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-blue-500">
                        <span>{oit?.client_name ?? '—'}</span>
                        {occ.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {occ.location}</span>}
                        <span>{fmtDateTime(occ.created_at)}</span>
                      </div>
                      {occ.impact && <p className="text-xs text-amber-400 mt-1">Impacto: {occ.impact}</p>}
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
