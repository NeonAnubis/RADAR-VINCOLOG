'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { MapPin, Truck, User, Calendar, Play, Loader2, Flag, CheckCircle } from 'lucide-react'
import { moveOitStatus, finalizeOit } from '@/lib/actions/oits'
import { OitStatusBadge } from '@/components/StatusBadge'
import { fmtDateTime, fmtDate, fmtCurrency } from '@/lib/utils/format'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint, OitStatus } from '@/lib/types'

export default function TabResumo({ oit, collectionPoints, deliveryPoints }: {
  oit: DbOit; collectionPoints: DbCollectionPoint[]; deliveryPoints: DbDeliveryPoint[]
}) {
  const [pending, start] = useTransition()

  const NEXT_STATUS: Partial<Record<OitStatus, { next: OitStatus; label: string }>> = {
    novos_aprovados:     { next: 'em_analise',          label: 'Iniciar análise' },
    em_analise:          { next: 'em_alocacao',         label: 'Buscar prestador' },
    em_alocacao:         { next: 'aguardando_contrato', label: 'Gerar contrato' },
    aguardando_contrato: { next: 'prestador_alocado',   label: 'Confirmar alocação' },
    prestador_alocado:   { next: 'aguardando_coleta',   label: 'Aguardar coleta' },
    aguardando_coleta:   { next: 'em_coleta',           label: 'Iniciar coleta' },
    em_coleta:           { next: 'em_transito',         label: 'Em trânsito' },
    em_transito:         { next: 'em_entrega',          label: 'Chegou no destino' },
    em_entrega:          { next: 'comprovante_pendente',label: 'Aguardar POD' },
    comprovante_pendente:{ next: 'finalizado',          label: 'Finalizar OIT' },
  }
  const next = NEXT_STATUS[oit.status]

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Block label="Cliente" value={oit.client_name ?? '—'} />
        <Block label="Responsável" value="A definir" />
        <Block label="Valor Vendido" value={fmtCurrency(oit.vendor_value)} bold />
        <Block label="Status" value={<OitStatusBadge status={oit.status} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Coletas ({collectionPoints.length})</p>
          {collectionPoints.map((p, i) => (
            <div key={p.id} className="p-2.5 rounded-lg mb-2 text-xs" style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(96,165,250,0.2)' }}>
              <p className="font-bold text-blue-300">#{i+1} {p.name ?? p.city}</p>
              <p className="text-blue-400 mt-0.5"><MapPin className="w-3 h-3 inline mr-1" />{p.full_address ?? '—'} · {p.city}/{p.uf}</p>
              {p.scheduled_date && <p className="text-blue-500 mt-0.5"><Calendar className="w-3 h-3 inline mr-1" />{fmtDate(p.scheduled_date)} {p.time_window ?? ''}</p>}
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Entregas ({deliveryPoints.length})</p>
          {deliveryPoints.map((p, i) => (
            <div key={p.id} className="p-2.5 rounded-lg mb-2 text-xs" style={{ background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.2)' }}>
              <p className="font-bold text-emerald-300">#{i+1} {p.name ?? p.city}</p>
              <p className="text-blue-400 mt-0.5"><MapPin className="w-3 h-3 inline mr-1" />{p.full_address ?? '—'} · {p.city}/{p.uf}</p>
              {p.scheduled_date && <p className="text-blue-500 mt-0.5"><Calendar className="w-3 h-3 inline mr-1" />{fmtDate(p.scheduled_date)} {p.time_window ?? ''}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Block label="Prestador" value={oit.providers?.name ?? <span className="text-amber-400">Não alocado</span>} />
        <Block label="Veículo" value={oit.providers ? `${oit.providers.vehicle_type ?? '—'} · ${oit.providers.vehicle_plate}` : '—'} />
        <Block label="Motorista" value={oit.driver_name ?? '—'} />
      </div>

      <div className="flex gap-2 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {next && oit.status !== 'finalizado' && (
          <button onClick={() => start(async () => { await moveOitStatus(oit.id, next.next) })} disabled={pending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {next.label}
          </button>
        )}
        {oit.status === 'comprovante_pendente' && (
          <button onClick={() => { if (confirm('Finalizar a OIT?')) start(async () => { await finalizeOit(oit.id) }) }} disabled={pending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
            <Flag className="w-4 h-4" /> Finalizar OIT
          </button>
        )}
        {oit.status === 'finalizado' && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-emerald-300"
            style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <CheckCircle className="w-4 h-4" /> OIT Finalizada · Prestador desvinculado
          </div>
        )}
      </div>

      {oit.created_at && (
        <p className="text-xs text-blue-600 pt-2">
          Criado em {fmtDateTime(oit.created_at)}
          {oit.allocated_at && <> · Alocado em {fmtDateTime(oit.allocated_at)}</>}
          {oit.finalized_at && <> · Finalizado em {fmtDateTime(oit.finalized_at)}</>}
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
