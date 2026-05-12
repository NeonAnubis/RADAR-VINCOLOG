'use client'

import { MapPin, Calendar, Play, Loader2, Flag, CheckCircle } from 'lucide-react'
import { OitStatusBadge } from '@/components/StatusBadge'
import { fmtDateTime, fmtDate, fmtCurrency } from '@/lib/utils/format'
import { useMoveOitStatus, useFinalizeOit } from '@/lib/hooks/use-oit-mutations'
import { useT } from '@/lib/i18n/I18nProvider'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint, OitStatus } from '@/lib/types'

const NEXT_STATUS_MAP: Partial<Record<OitStatus, { next: OitStatus; key: string }>> = {
  novos_aprovados:     { next: 'em_analise',          key: 'startAnalysis' },
  em_analise:          { next: 'em_alocacao',         key: 'findProvider' },
  em_alocacao:         { next: 'aguardando_contrato', key: 'generateContract' },
  aguardando_contrato: { next: 'prestador_alocado',   key: 'confirmAllocation' },
  prestador_alocado:   { next: 'aguardando_coleta',   key: 'waitPickup' },
  aguardando_coleta:   { next: 'em_coleta',           key: 'startPickup' },
  em_coleta:           { next: 'em_transito',         key: 'inTransit' },
  em_transito:         { next: 'em_entrega',          key: 'arrivedDestination' },
  em_entrega:          { next: 'comprovante_pendente',key: 'waitPod' },
  comprovante_pendente:{ next: 'finalizado',          key: 'finalizeOit' },
}

export default function TabResumo({ oit, collectionPoints, deliveryPoints }: {
  oit: DbOit; collectionPoints: DbCollectionPoint[]; deliveryPoints: DbDeliveryPoint[]
}) {
  const t = useT()
  const moveStatus = useMoveOitStatus(oit.id)
  const finalize   = useFinalizeOit(oit.id)
  const pending = moveStatus.isPending || finalize.isPending

  const next = NEXT_STATUS_MAP[oit.status]

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Block label={t('oits.summary.client')} value={oit.client_name ?? '—'} />
        <Block label={t('oits.summary.responsible')} value={t('oits.summary.toDefine')} />
        <Block label={t('oits.summary.valueSold')} value={fmtCurrency(oit.vendor_value)} bold />
        <Block label={t('common.status')} value={<OitStatusBadge status={oit.status} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">{t('oits.summary.pickups', { count: collectionPoints.length })}</p>
          {collectionPoints.map((p, i) => (
            <div key={p.id} className="p-2.5 rounded-lg mb-2 text-xs" style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(96,165,250,0.2)' }}>
              <p className="font-bold text-blue-300">#{i+1} {p.name ?? p.city}</p>
              <p className="text-blue-400 mt-0.5"><MapPin className="w-3 h-3 inline mr-1" />{p.full_address ?? '—'} · {p.city}/{p.uf}</p>
              {p.scheduled_date && <p className="text-blue-500 mt-0.5"><Calendar className="w-3 h-3 inline mr-1" />{fmtDate(p.scheduled_date)} {p.time_window ?? ''}</p>}
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">{t('oits.summary.deliveries', { count: deliveryPoints.length })}</p>
          {deliveryPoints.map((p, i) => (
            <div key={p.id} className="p-2.5 rounded-lg mb-2 text-xs" style={{ background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.2)' }}>
              <p className="font-bold text-emerald-300">#{i+1} {p.name ?? p.city}</p>
              <p className="text-blue-400 mt-0.5"><MapPin className="w-3 h-3 inline mr-1" />{p.full_address ?? '—'} · {p.city}/{p.uf}</p>
              {p.scheduled_date && <p className="text-blue-500 mt-0.5"><Calendar className="w-3 h-3 inline mr-1" />{fmtDate(p.scheduled_date)} {p.time_window ?? ''}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Block label={t('oits.summary.provider')} value={oit.providers?.name ?? <span className="text-amber-400">{t('oits.summary.notAllocated')}</span>} />
        <Block label={t('oits.summary.vehicle')} value={oit.providers ? `${oit.providers.vehicle_type ?? '—'} · ${oit.providers.vehicle_plate}` : '—'} />
        <Block label={t('oits.summary.driver')} value={oit.driver_name ?? '—'} />
      </div>

      <div className="flex gap-2 pt-4 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {next && oit.status !== 'finalizado' && (
          <button onClick={() => moveStatus.mutate(next.next)} disabled={pending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
            {moveStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {t(`oits.actions.${next.key}`)}
          </button>
        )}
        {oit.status === 'comprovante_pendente' && (
          <button onClick={() => { if (confirm(t('oits.actions.confirmFinalize'))) finalize.mutate() }} disabled={pending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
            <Flag className="w-4 h-4" /> {t('oits.actions.finalizeOit')}
          </button>
        )}
        {finalize.data && 'error' in finalize.data && finalize.data.error && (
          <p className="text-xs text-red-300 whitespace-pre-line p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {finalize.data.error}
          </p>
        )}
        {oit.status === 'finalizado' && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-emerald-300"
            style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <CheckCircle className="w-4 h-4" /> {t('oits.actions.finalizedBadge')}
          </div>
        )}
      </div>

      {oit.created_at && (
        <p className="text-xs text-blue-600 pt-2">
          {t('oits.summary.createdAt', { date: fmtDateTime(oit.created_at) })}
          {oit.allocated_at && <> · {t('oits.summary.allocatedAt', { date: fmtDateTime(oit.allocated_at) })}</>}
          {oit.finalized_at && <> · {t('oits.summary.finalizedAt', { date: fmtDateTime(oit.finalized_at) })}</>}
        </p>
      )}
    </div>
  )
}

function Block({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{label}</p>
      <div className={`mt-1 text-sm ${bold ? 'font-extrabold text-white' : 'text-blue-200'}`}>{value}</div>
    </div>
  )
}
