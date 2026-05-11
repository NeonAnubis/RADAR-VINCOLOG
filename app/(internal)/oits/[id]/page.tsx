import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OitStatusBadge, ServiceLevelBadge } from '@/components/StatusBadge'
import { OIT_STATUSES } from '@/lib/types'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint, DbContractPerTrip, DbTimelineEvent, DbOccurrence, DbGpsPosition } from '@/lib/types'
import OitTabs from './OitTabs'

export default async function OitDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: oitData } = await supabase
    .from('oits')
    .select('*, providers(*)')
    .eq('id', params.id)
    .single()
  if (!oitData) notFound()
  const oit = oitData as DbOit

  const [
    { data: cps },
    { data: dps },
    { data: contract },
    { data: timeline },
    { data: occurrences },
    { data: allProviders },
    { data: budget },
    { data: gpsPositions },
  ] = await Promise.all([
    supabase.from('collection_points').select('*').eq('oit_id', params.id).order('sequence'),
    supabase.from('delivery_points').select('*').eq('oit_id', params.id).order('sequence'),
    supabase.from('contracts_per_trip').select('*').eq('oit_id', params.id).maybeSingle(),
    supabase.from('timeline_events').select('*').eq('oit_id', params.id).order('created_at', { ascending: true }),
    supabase.from('occurrences').select('*').eq('oit_id', params.id).order('created_at', { ascending: false }),
    supabase.from('providers').select('*').eq('status', 'ativo').order('name'),
    oitData.budget_id ? supabase.from('budgets').select('*').eq('id', oitData.budget_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('gps_positions').select('*').eq('oit_id', params.id).order('recorded_at', { ascending: false }).limit(500),
  ])

  const collectionPoints = (cps ?? []) as DbCollectionPoint[]
  const deliveryPoints   = (dps ?? []) as DbDeliveryPoint[]
  const tripContract     = contract as DbContractPerTrip | null
  const timelineEvents   = (timeline ?? []) as DbTimelineEvent[]
  const oitOccurrences   = (occurrences ?? []) as DbOccurrence[]

  const trackingUrl = `/rastreamento/${oit.client_link_token}`
  const providerUrl = `/prestador/${oit.provider_link_token}`

  const currentStatusCfg = OIT_STATUSES[oit.status]

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/oits" className="p-2 rounded-xl text-blue-400 hover:text-white glass"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white font-mono">{oit.number}</h1>
              <OitStatusBadge status={oit.status} />
              <ServiceLevelBadge level={oit.service_level} />
            </div>
            <p className="text-sm text-blue-400 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> {collectionPoints.length}× coleta(s) → {deliveryPoints.length}× entrega(s) · {oit.client_name}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Link href={trackingUrl} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-300 hover:text-white glass">
            <ExternalLink className="w-4 h-4" /> Link Cliente
          </Link>
          <Link href={providerUrl} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-300 hover:text-white glass">
            <ExternalLink className="w-4 h-4" /> Modo Prestador
          </Link>
        </div>
      </div>

      {/* Status flow indicator */}
      <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <span className="text-xs text-blue-500 font-bold mr-1 whitespace-nowrap">Fluxo:</span>
        {(Object.keys(OIT_STATUSES) as Array<keyof typeof OIT_STATUSES>)
          .filter(s => s !== 'ocorrencia')
          .sort((a, b) => OIT_STATUSES[a].order - OIT_STATUSES[b].order)
          .map((s, i, arr) => {
            const cfg = OIT_STATUSES[s]
            const isCurrent = oit.status === s
            const isPast = OIT_STATUSES[oit.status].order > cfg.order
            return (
              <div key={s} className="flex items-center gap-1 flex-shrink-0">
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${isCurrent ? 'border' : ''}`}
                  style={isCurrent ? { background: `${cfg.color}33`, color: cfg.color, borderColor: cfg.color }
                    : isPast ? { color: '#34D399' }
                    : { color: '#1E3A5F' }}>
                  {cfg.label}
                </div>
                {i < arr.length - 1 && <span className="text-blue-900 text-[10px]">›</span>}
              </div>
            )
          })}
        {oit.status === 'ocorrencia' && (
          <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
            <span className="text-xs font-bold text-red-300">{currentStatusCfg.label}</span>
          </div>
        )}
      </div>

      <OitTabs
        oit={oit}
        collectionPoints={collectionPoints}
        deliveryPoints={deliveryPoints}
        contract={tripContract}
        timeline={timelineEvents}
        occurrences={oitOccurrences}
        availableProviders={allProviders ?? []}
        budget={budget}
        gpsPositions={(gpsPositions ?? []) as DbGpsPosition[]}
      />
    </div>
  )
}
