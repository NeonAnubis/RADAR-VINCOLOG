import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OIT_STATUSES } from '@/lib/types'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint, DbTimelineEvent, DbOccurrence, ServiceLevel } from '@/lib/types'
import TrackingView from './TrackingView'

// Visibility per service level (from spec section 15.4)
const VISIBILITY: Record<ServiceLevel, {
  showFullTimeline: boolean
  showPhotos: boolean
  showOccurrences: boolean
  showFinalReport: boolean
  showPredictionUpdates: boolean
  showDetailedRoute: boolean
}> = {
  essencial:          { showFullTimeline: false, showPhotos: false, showOccurrences: true,  showFinalReport: false, showPredictionUpdates: false, showDetailedRoute: false },
  assistido_basico:   { showFullTimeline: true,  showPhotos: false, showOccurrences: true,  showFinalReport: false, showPredictionUpdates: true,  showDetailedRoute: true },
  assistido_completo: { showFullTimeline: true,  showPhotos: true,  showOccurrences: true,  showFinalReport: false, showPredictionUpdates: true,  showDetailedRoute: true },
  prime_critico:      { showFullTimeline: true,  showPhotos: true,  showOccurrences: true,  showFinalReport: true,  showPredictionUpdates: true,  showDetailedRoute: true },
}

export default async function TrackingPage({ params }: { params: { token: string } }) {
  const supabase = createClient()

  const { data: oit } = await supabase
    .from('oits')
    .select('*, providers(name,vehicle_type,vehicle_plate,phone)')
    .eq('client_link_token', params.token)
    .single()
  if (!oit) notFound()

  const o = oit as DbOit
  const vis = VISIBILITY[o.service_level]

  const [{ data: cps }, { data: dps }, { data: tl }, { data: occ }] = await Promise.all([
    supabase.from('collection_points').select('*').eq('oit_id', o.id).order('sequence'),
    supabase.from('delivery_points').select('*').eq('oit_id', o.id).order('sequence'),
    supabase.from('timeline_events').select('*').eq('oit_id', o.id).eq('visible_to_client', true).order('created_at', { ascending: true }),
    supabase.from('occurrences').select('*').eq('oit_id', o.id).eq('visible_to_client', true).order('created_at', { ascending: false }),
  ])

  return (
    <TrackingView
      o={o}
      vis={vis}
      collectionPoints={(cps ?? []) as DbCollectionPoint[]}
      deliveryPoints={(dps ?? []) as DbDeliveryPoint[]}
      timeline={(tl ?? []) as DbTimelineEvent[]}
      occurrences={(occ ?? []) as DbOccurrence[]}
      statusColor={OIT_STATUSES[o.status].color}
    />
  )
}
