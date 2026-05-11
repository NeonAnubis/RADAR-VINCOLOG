import Link from 'next/link'
import { Plus, MapPin, AlertTriangle, Truck, Clock, FileX, PackageX, FileCheck2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OIT_STATUSES } from '@/lib/types'
import { ServiceLevelBadge } from '@/components/StatusBadge'
import { fmtCurrency, fmtDate } from '@/lib/utils/format'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint, OitStatus } from '@/lib/types'
import ExportButton from '@/components/ExportButton'

export default async function OitsPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('oits')
    .select('*, providers(name, vehicle_plate), collection_points(city, uf), delivery_points(city, uf, pod_url, pod_recipient)')
    .order('created_at', { ascending: false })

  // Fetch occurrence counts in one batch
  const { data: occMap } = await supabase
    .from('occurrences')
    .select('oit_id')
    .in('status', ['aberta','em_tratativa'])
  const occCounts: Record<string, number> = {}
  ;(occMap ?? []).forEach(o => { occCounts[o.oit_id] = (occCounts[o.oit_id] ?? 0) + 1 })

  const all = (data ?? []) as DbOit[]
  const byStatus: Record<OitStatus, DbOit[]> = {} as Record<OitStatus, DbOit[]>
  ;(Object.keys(OIT_STATUSES) as OitStatus[]).forEach(s => { byStatus[s] = [] })
  all.forEach(oit => { byStatus[oit.status]?.push(oit) })

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Torre de Controle</h1>
          <p className="text-blue-400 mt-0.5 text-sm">{all.length} OITs · Kanban operacional</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            filename={`oits-${new Date().toISOString().slice(0,10)}.csv`}
            rows={all.map(o => ({
              numero: o.number, cliente: o.client_name, status: OIT_STATUSES[o.status].label,
              nivel: o.service_level, prioridade: o.priority,
              prestador: o.providers?.name ?? '', placa: o.providers?.vehicle_plate ?? '',
              valor_vendido: o.vendor_value ?? 0, custo: o.contracted_value ?? 0,
              margem: o.estimated_margin ?? 0, margem_pct: o.margin_percentage ?? 0,
              criado_em: o.created_at, finalizado_em: o.finalized_at ?? '',
            }))}
          />
          <Link href="/orcamentos" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
            <Plus className="w-4 h-4" /> Novo a partir de Orçamento
          </Link>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin" style={{ minHeight: '70vh' }}>
        {(Object.keys(OIT_STATUSES) as OitStatus[])
          .sort((a, b) => OIT_STATUSES[a].order - OIT_STATUSES[b].order)
          .map(status => {
            const cfg = OIT_STATUSES[status]
            const oits = byStatus[status]
            return (
              <div key={status} className="flex-shrink-0 w-72 flex flex-col">
                <div className="px-3 py-2 rounded-t-xl flex items-center justify-between"
                  style={{ background: `${cfg.color}22`, borderTop: `2px solid ${cfg.color}`, borderLeft: `1px solid ${cfg.color}33`, borderRight: `1px solid ${cfg.color}33` }}>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${cfg.color}33`, color: cfg.color }}>
                    {oits.length}
                  </span>
                </div>
                <div className="flex-1 p-2 space-y-2 rounded-b-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none' }}>
                  {oits.length === 0 ? (
                    <p className="text-xs text-blue-700 italic text-center py-4">Vazio</p>
                  ) : (
                    oits.map(oit => {
                      const cps = (oit.collection_points ?? []) as DbCollectionPoint[]
                      const dps = (oit.delivery_points ?? []) as DbDeliveryPoint[]
                      const origin = cps.length > 1 ? `${cps.length} coletas` : (cps[0]?.city ?? oit.client_name?.split(' ')[0] ?? '—')
                      const dest   = dps.length > 1 ? `${dps.length} entregas` : (dps[0]?.city ?? '—')

                      // Indicators
                      const occCount = occCounts[oit.id] ?? 0
                      const hasMultiPoints = cps.length > 1 || dps.length > 1
                      const hasPod = dps.some(d => d.pod_url || d.pod_recipient)
                      const podPending = oit.status === 'comprovante_pendente' && !hasPod
                      const noProvider = !oit.provider_id && ['em_alocacao','aguardando_contrato'].includes(oit.status)
                      const noContract = oit.provider_id && !oit.signed_contract_url && oit.status === 'aguardando_contrato'

                      return (
                        <Link key={oit.id} href={`/oits/${oit.id}`}>
                          <div className="glass-sm rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-colors space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-white">{oit.number}</span>
                              <ServiceLevelBadge level={oit.service_level} />
                            </div>

                            <p className="text-xs text-blue-200 truncate">{oit.client_name ?? '—'}</p>

                            <div className="flex items-center gap-1 text-[11px] text-blue-400">
                              <MapPin className="w-3 h-3" /> {origin} → {dest}
                              {hasMultiPoints && (
                                <span className="ml-1 px-1 rounded text-[9px] font-bold"
                                  style={{ background: 'rgba(167,139,250,0.2)', color: '#C4B5FD' }}>A+→B+</span>
                              )}
                            </div>

                            {oit.providers && (
                              <div className="flex items-center gap-1 text-[11px] text-blue-400">
                                <Truck className="w-3 h-3" /> {oit.providers.name.split(' ')[0]} · {oit.providers.vehicle_plate}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                              <span className="text-[10px] text-blue-500">{fmtCurrency(oit.vendor_value)}</span>
                              <div className="flex items-center gap-1">
                                {oit.priority === 'critica' && (
                                  <span title="Crítica" className="text-red-400"><AlertTriangle className="w-3 h-3" /></span>
                                )}
                                {oit.priority === 'alta' && (
                                  <span title="Alta" className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                )}
                                {occCount > 0 && (
                                  <span title={`${occCount} ocorrência(s)`} className="flex items-center gap-0.5 text-red-300 text-[10px] font-bold">
                                    <AlertTriangle className="w-2.5 h-2.5" /> {occCount}
                                  </span>
                                )}
                                {podPending && (
                                  <span title="Comprovante pendente" className="text-amber-400"><PackageX className="w-3 h-3" /></span>
                                )}
                                {noContract && (
                                  <span title="Contrato pendente" className="text-amber-400"><FileX className="w-3 h-3" /></span>
                                )}
                                {hasPod && oit.status === 'finalizado' && (
                                  <span title="POD anexado" className="text-emerald-400"><FileCheck2 className="w-3 h-3" /></span>
                                )}
                                {noProvider && (
                                  <span title="Sem prestador" className="text-amber-400 text-[10px] font-bold">SP</span>
                                )}
                                {oit.gps_tracking_active && (
                                  <span title="GPS ativo" className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                )}
                              </div>
                            </div>

                            {oit.next_action_deadline && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-400">
                                <Clock className="w-2.5 h-2.5" /> {fmtDate(oit.next_action_deadline)}
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
      </div>

      {/* Indicators legend */}
      <div className="glass-sm rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap text-[11px] text-blue-400">
        <span className="font-bold uppercase tracking-wider text-blue-300">Legenda:</span>
        <span className="flex items-center gap-1"><span className="px-1 rounded text-[9px] font-bold" style={{ background: 'rgba(167,139,250,0.2)', color: '#C4B5FD' }}>A+→B+</span> múltiplos pontos</span>
        <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-400" /> ocorrência aberta</span>
        <span className="flex items-center gap-1"><PackageX className="w-3 h-3 text-amber-400" /> comprovante pendente</span>
        <span className="flex items-center gap-1"><FileX className="w-3 h-3 text-amber-400" /> contrato pendente</span>
        <span className="flex items-center gap-1"><FileCheck2 className="w-3 h-3 text-emerald-400" /> POD anexado</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> GPS ativo</span>
      </div>
    </div>
  )
}
