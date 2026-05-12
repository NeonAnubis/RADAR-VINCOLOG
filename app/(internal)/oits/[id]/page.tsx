import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint, DbContractPerTrip, DbTimelineEvent, DbOccurrence, DbGpsPosition } from '@/lib/types'
import OitTabs from './OitTabs'
import OitDetailHeader from './OitDetailHeader'

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

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <OitDetailHeader oit={oit} collectionCount={collectionPoints.length} deliveryCount={deliveryPoints.length} />

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
