'use client'

import { MapPin, Truck, Clock } from 'lucide-react'
import { fmtDate, fmtDateTime } from '@/lib/utils/format'
import { OitStatusBadge } from '@/components/StatusBadge'
import { useT } from '@/lib/i18n/I18nProvider'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint, DbTimelineEvent } from '@/lib/types'
import ProviderActions from './ProviderActions'
import GpsTracker from './GpsTracker'

interface Props {
  token: string
  o: DbOit
  collectionPoints: DbCollectionPoint[]
  deliveryPoints: DbDeliveryPoint[]
  timeline: DbTimelineEvent[]
  finalized: boolean
}

export default function ProviderPortalView({ token, o, collectionPoints, deliveryPoints, timeline, finalized }: Props) {
  const t = useT()

  if (finalized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <Truck className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h1 className="text-xl font-extrabold text-white">{t('providerPortal.tripFinalized')}</h1>
          <p className="text-sm text-blue-400 mt-2">{t('providerPortal.tripClosedHelp')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#020C1F', backgroundImage: 'radial-gradient(ellipse 100% 60% at 10% 0%,rgba(12,35,120,0.5) 0%,transparent 60%)' }}>
      <div className="py-3 px-4" style={{ background: 'rgba(2,8,30,0.9)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
            <Truck className="w-3 h-3 text-white" />
          </div>
          <span className="text-white text-sm font-extrabold tracking-wide">RADAR</span>
          <span className="text-blue-400 text-[9px] font-bold tracking-[0.25em] uppercase">VINCOLOG</span>
          <span className="text-blue-600 text-xs ml-auto">{t('providerPortal.header')}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-12 space-y-4">
        <div className="text-center pt-2">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{t('providerPortal.yourTrip')}</p>
          <p className="text-2xl font-extrabold text-white font-mono mt-0.5">{o.number}</p>
          <p className="text-sm text-blue-400 mt-0.5">{o.client_name}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <OitStatusBadge status={o.status} />
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> {t('providerPortal.routeSummary', { c: collectionPoints.length, d: deliveryPoints.length })}
          </p>
          {collectionPoints.map((p, i) => (
            <div key={p.id} className="text-xs mb-2 last:mb-0">
              <p className="font-bold text-blue-300">{t('tracking.pickup', { n: i+1 })}</p>
              <p className="text-blue-200">{p.full_address}</p>
              <p className="text-blue-500">{p.city}/{p.uf} {p.scheduled_date && `· ${fmtDate(p.scheduled_date)} ${p.time_window ?? ''}`}</p>
              {p.contact_name && <p className="text-blue-500">📞 {p.contact_name} — {p.phone ?? ''}</p>}
            </div>
          ))}
          <div className="my-2 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          {deliveryPoints.map((p, i) => (
            <div key={p.id} className="text-xs mb-2 last:mb-0">
              <p className="font-bold text-emerald-300">{t('tracking.delivery', { n: i+1 })}</p>
              <p className="text-blue-200">{p.full_address}</p>
              <p className="text-blue-500">{p.city}/{p.uf} {p.scheduled_date && `· ${fmtDate(p.scheduled_date)} ${p.time_window ?? ''}`}</p>
              {p.contact_name && <p className="text-blue-500">📞 {p.contact_name} — {p.phone ?? ''}</p>}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-4 text-xs">
          <p className="text-blue-500 font-bold uppercase tracking-wider mb-1">{t('providerPortal.cargo')}</p>
          <p className="text-blue-200">{o.cargo_description ?? '—'}</p>
          <p className="text-blue-400 mt-1">{o.cargo_weight ?? '—'} · {o.cargo_volumes ?? '—'} {t('providerPortal.volumes')}</p>
        </div>

        <GpsTracker token={token} initiallyActive={o.gps_tracking_active} />

        <ProviderActions token={token} oit={o} />

        <div className="glass rounded-2xl p-4">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {t('providerPortal.yourUpdates')}
          </p>
          {timeline.length === 0 ? (
            <p className="text-xs text-blue-600 text-center py-4">{t('providerPortal.noUpdates')}</p>
          ) : (
            <div className="space-y-2.5">
              {timeline.slice(0, 10).map(ev => (
                <div key={ev.id} className="text-xs pb-2.5 border-b border-white/5 last:border-0">
                  <p className="font-bold text-blue-200">{ev.event_type.replace(/_/g, ' ')}</p>
                  {ev.description && <p className="text-blue-400 mt-0.5">{ev.description}</p>}
                  <p className="text-blue-600 mt-0.5">{fmtDateTime(ev.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-blue-700 pb-2">
          {t('providerPortal.footer')}
        </p>
      </div>
    </div>
  )
}
