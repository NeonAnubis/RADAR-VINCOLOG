'use client'

import { MapPin, Truck, CheckCircle, Clock, AlertTriangle, Phone, Camera, FileText } from 'lucide-react'
import { fmtDateTime, fmtDate } from '@/lib/utils/format'
import { useT } from '@/lib/i18n/I18nProvider'
import { SERVICE_LEVELS } from '@/lib/types'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint, DbTimelineEvent, DbOccurrence, ServiceLevel } from '@/lib/types'

type Visibility = {
  showFullTimeline: boolean
  showPhotos: boolean
  showOccurrences: boolean
  showFinalReport: boolean
  showPredictionUpdates: boolean
  showDetailedRoute: boolean
}

interface Props {
  o: DbOit
  vis: Visibility
  collectionPoints: DbCollectionPoint[]
  deliveryPoints: DbDeliveryPoint[]
  timeline: DbTimelineEvent[]
  occurrences: DbOccurrence[]
  statusColor: string
}

export default function TrackingView({ o, vis, collectionPoints, deliveryPoints, timeline, occurrences, statusColor }: Props) {
  const t = useT()
  const levelMeta = SERVICE_LEVELS[o.service_level as ServiceLevel]
  const levelLabel = t(`serviceLevels.${o.service_level}`)
  const statusLabel = t(`oitStatus.${o.status}`)

  return (
    <div className="min-h-screen" style={{ background: '#020C1F', backgroundImage: 'radial-gradient(ellipse 100% 60% at 10% 0%,rgba(12,35,120,0.5) 0%,transparent 60%),radial-gradient(ellipse 70% 50% at 90% 100%,rgba(5,16,60,0.4) 0%,transparent 60%)' }}>
      <div className="py-3 px-4" style={{ background: 'rgba(2,8,30,0.9)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
            <Truck className="w-3 h-3 text-white" />
          </div>
          <span className="text-white text-sm font-extrabold tracking-wide">RADAR</span>
          <span className="text-blue-400 text-[9px] font-bold tracking-[0.25em] uppercase">VINCOLOG</span>
          <span className="text-blue-600 text-xs ml-auto">{t('tracking.headerLabel')}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4 pb-8">
        <div className="text-center pt-2">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">OIT</p>
          <p className="text-2xl font-extrabold text-white font-mono mt-0.5">{o.number}</p>
          <p className="text-sm text-blue-400 mt-0.5">{o.client_name}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
            style={{ background: `${levelMeta.color}1a`, border: `1px solid ${levelMeta.color}55` }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: levelMeta.color }}>{levelLabel}</span>
          </div>
        </div>

        {/* Status hero */}
        <div className="rounded-2xl p-5"
          style={{ background: `${statusColor}1a`, border: `1px solid ${statusColor}55` }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: `${statusColor}22`, border: `1px solid ${statusColor}44`, boxShadow: `0 0 20px ${statusColor}33` }}>
              <Truck className="w-7 h-7" style={{ color: statusColor }} />
            </div>
            <div>
              <p className="text-lg font-extrabold" style={{ color: statusColor }}>{statusLabel}</p>
              <p className="text-sm text-blue-300 mt-0.5">{t('tracking.currentStatus')}</p>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {t('tracking.route')}</h3>
          <div className="space-y-3">
            {collectionPoints.map((p, i) => (
              <div key={p.id} className="flex items-start gap-3">
                <div className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#38BDF8', boxShadow: '0 0 6px rgba(56,189,248,0.5)' }} />
                <div>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{t('tracking.pickup', { n: i+1 })}</p>
                  <p className="text-sm text-blue-200">{vis.showDetailedRoute ? p.full_address : p.city ?? '—'}</p>
                  <p className="text-sm font-bold text-white">{p.city}/{p.uf}</p>
                  {vis.showPredictionUpdates && p.scheduled_date && <p className="text-[11px] text-blue-500 mt-0.5">{fmtDate(p.scheduled_date)} {p.time_window ?? ''}</p>}
                </div>
              </div>
            ))}
            <div className="ml-1 w-px h-5 bg-blue-900" />
            {deliveryPoints.map((p, i) => (
              <div key={p.id} className="flex items-start gap-3">
                <div className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#34D399', boxShadow: '0 0 6px rgba(52,211,153,0.5)' }} />
                <div>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{t('tracking.delivery', { n: i+1 })}</p>
                  <p className="text-sm text-blue-200">{vis.showDetailedRoute ? p.full_address : p.city ?? '—'}</p>
                  <p className="text-sm font-bold text-white">{p.city}/{p.uf}</p>
                  {vis.showPredictionUpdates && p.scheduled_date && <p className="text-[11px] text-blue-500 mt-0.5">{fmtDate(p.scheduled_date)} {p.time_window ?? ''}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Driver/Vehicle */}
        {o.providers && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <h3 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2"><Truck className="w-3.5 h-3.5" /> {t('tracking.driver')}</h3>
            <p className="text-sm font-bold text-white">{o.providers.name}</p>
            <p className="text-xs text-blue-400 mt-0.5">{o.providers.vehicle_type} · {o.providers.vehicle_plate}</p>
          </div>
        )}

        {/* Timeline */}
        {vis.showFullTimeline && timeline.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t('tracking.updates')}</h3>
            <div className="space-y-3">
              {timeline.map(ev => (
                <div key={ev.id} className="flex gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#60A5FA' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-blue-200">{ev.event_type.replace(/_/g, ' ')}</p>
                    {ev.description && <p className="text-xs text-blue-400 mt-0.5">{ev.description}</p>}
                    <p className="text-[11px] text-blue-600 mt-0.5">{fmtDateTime(ev.created_at)}</p>
                    {vis.showPhotos && ev.attachments && ev.attachments.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {ev.attachments.map((a, i) => (
                          <a key={i} href={a.url} target="_blank" className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400">
                            <Camera className="w-3 h-3" /> {t('tracking.photoLabel', { n: i+1 })}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Occurrences (always visible if marked client-visible) */}
        {occurrences.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <h3 className="text-xs font-bold text-red-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider"><AlertTriangle className="w-3.5 h-3.5" /> {t('tracking.occurrenceList')}</h3>
            {occurrences.map(occ => (
              <div key={occ.id} className="mb-2 last:mb-0">
                <p className="text-sm font-bold text-red-300">{occ.description}</p>
                {occ.impact && <p className="text-[11px] text-amber-400 mt-0.5">{t('tracking.impactLabel')} {occ.impact}</p>}
                {occ.action_taken && <p className="text-[11px] text-blue-400 mt-0.5">{t('tracking.actionLabel')} {occ.action_taken}</p>}
                {occ.new_estimate && <p className="text-[11px] text-blue-500 mt-0.5">{t('tracking.newEstimateLabel')} {fmtDateTime(occ.new_estimate)}</p>}
              </div>
            ))}
          </div>
        )}

        {/* POD */}
        {o.status === 'finalizado' && deliveryPoints.some(d => d.pod_recipient) && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <h3 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2 uppercase tracking-wider"><CheckCircle className="w-3.5 h-3.5" /> {t('tracking.delivered')}</h3>
            {deliveryPoints.filter(d => d.pod_recipient).map(d => (
              <div key={d.id} className="mb-2">
                <p className="text-sm text-blue-200">{t('tracking.receivedBy')} <strong className="text-white">{d.pod_recipient}</strong></p>
                {d.delivered_at && <p className="text-xs text-blue-500 mt-0.5">{fmtDateTime(d.delivered_at)}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Final report for Prime */}
        {vis.showFinalReport && o.status === 'finalizado' && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <h3 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-2 uppercase tracking-wider"><FileText className="w-3.5 h-3.5" /> {t('tracking.primeReport')}</h3>
            <p className="text-xs text-blue-300">{t('tracking.primeReportDesc')}</p>
          </div>
        )}

        {/* Contact */}
        <div className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <p className="text-xs text-blue-500">{t('tracking.questionsTitle')}</p>
            <p className="text-sm font-bold text-white mt-0.5">{t('tracking.contactVincolog')}</p>
          </div>
          <a href="https://wa.me/5511999999999"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'rgba(22,163,74,0.35)', border: '1px solid rgba(34,197,94,0.4)' }}>
            <Phone className="w-4 h-4 text-green-400" /> WhatsApp
          </a>
        </div>

        <p className="text-center text-[11px] text-blue-700 pb-2">
          {t('tracking.footerLine', { level: levelLabel })}
        </p>
      </div>
    </div>
  )
}
