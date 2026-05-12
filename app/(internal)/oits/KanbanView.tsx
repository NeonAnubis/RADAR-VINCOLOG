'use client'

import Link from 'next/link'
import { MapPin, AlertTriangle, Truck, Clock, FileX, PackageX, FileCheck2 } from 'lucide-react'
import { OIT_STATUSES } from '@/lib/types'
import { ServiceLevelBadge } from '@/components/StatusBadge'
import { fmtCurrency, fmtDate } from '@/lib/utils/format'
import { useT } from '@/lib/i18n/I18nProvider'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint, OitStatus } from '@/lib/types'

interface Props {
  byStatus: Record<OitStatus, DbOit[]>
  occCounts: Record<string, number>
}

export default function KanbanView({ byStatus, occCounts }: Props) {
  const t = useT()

  return (
    <>
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
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.color }}>{t(`oitStatus.${status}`)}</span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${cfg.color}33`, color: cfg.color }}>
                    {oits.length}
                  </span>
                </div>
                <div className="flex-1 p-2 space-y-2 rounded-b-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none' }}>
                  {oits.length === 0 ? (
                    <p className="text-xs text-blue-700 italic text-center py-4">{t('oits.emptyColumn')}</p>
                  ) : (
                    oits.map(oit => {
                      const cps = (oit.collection_points ?? []) as DbCollectionPoint[]
                      const dps = (oit.delivery_points ?? []) as DbDeliveryPoint[]
                      const origin = cps.length > 1 ? t('budgets.collections', { count: cps.length }) : (cps[0]?.city ?? oit.client_name?.split(' ')[0] ?? '—')
                      const dest   = dps.length > 1 ? t('budgets.deliveries', { count: dps.length }) : (dps[0]?.city ?? '—')

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
                                  <span title={t('oits.operationTab.priorityCritical')} className="text-red-400"><AlertTriangle className="w-3 h-3" /></span>
                                )}
                                {oit.priority === 'alta' && (
                                  <span title={t('oits.operationTab.priorityHigh')} className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                )}
                                {occCount > 0 && (
                                  <span title={`${occCount} ${t('oits.indicatorOpenOccurrence')}`} className="flex items-center gap-0.5 text-red-300 text-[10px] font-bold">
                                    <AlertTriangle className="w-2.5 h-2.5" /> {occCount}
                                  </span>
                                )}
                                {podPending && (
                                  <span title={t('oits.indicatorPodPending')} className="text-amber-400"><PackageX className="w-3 h-3" /></span>
                                )}
                                {noContract && (
                                  <span title={t('oits.indicatorContractPending')} className="text-amber-400"><FileX className="w-3 h-3" /></span>
                                )}
                                {hasPod && oit.status === 'finalizado' && (
                                  <span title={t('oits.indicatorPodAttached')} className="text-emerald-400"><FileCheck2 className="w-3 h-3" /></span>
                                )}
                                {noProvider && (
                                  <span title={t('oits.summary.notAllocated')} className="text-amber-400 text-[10px] font-bold">SP</span>
                                )}
                                {oit.gps_tracking_active && (
                                  <span title={t('oits.indicatorGpsActive')} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
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
        <span className="font-bold uppercase tracking-wider text-blue-300">{t('oits.indicators')}:</span>
        <span className="flex items-center gap-1"><span className="px-1 rounded text-[9px] font-bold" style={{ background: 'rgba(167,139,250,0.2)', color: '#C4B5FD' }}>A+→B+</span> {t('oits.indicatorMultiPoints')}</span>
        <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-400" /> {t('oits.indicatorOpenOccurrence')}</span>
        <span className="flex items-center gap-1"><PackageX className="w-3 h-3 text-amber-400" /> {t('oits.indicatorPodPending')}</span>
        <span className="flex items-center gap-1"><FileX className="w-3 h-3 text-amber-400" /> {t('oits.indicatorContractPending')}</span>
        <span className="flex items-center gap-1"><FileCheck2 className="w-3 h-3 text-emerald-400" /> {t('oits.indicatorPodAttached')}</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> {t('oits.indicatorGpsActive')}</span>
      </div>
    </>
  )
}
