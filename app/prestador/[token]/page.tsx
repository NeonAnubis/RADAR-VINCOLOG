import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint, DbTimelineEvent } from '@/lib/types'
import ProviderPortalView from './ProviderPortalView'

export default async function ProviderPortalPage({ params }: { params: { token: string } }) {
  const supabase = createClient()

  const { data: oit } = await supabase
    .from('oits')
    .select('*, providers(name, vehicle_plate)')
    .eq('provider_link_token', params.token)
    .single()
  if (!oit) notFound()

  const o = oit as DbOit
  const finalized = o.status === 'finalizado'

  if (finalized) {
    return <ProviderPortalView token={params.token} o={o} collectionPoints={[]} deliveryPoints={[]} timeline={[]} finalized />
  }

  const [{ data: cps }, { data: dps }, { data: tl }] = await Promise.all([
    supabase.from('collection_points').select('*').eq('oit_id', o.id).order('sequence'),
    supabase.from('delivery_points').select('*').eq('oit_id', o.id).order('sequence'),
    supabase.from('timeline_events').select('*').eq('oit_id', o.id).order('created_at', { ascending: false }),
  ])

  return (
    <ProviderPortalView
      token={params.token}
      o={o}
      collectionPoints={(cps ?? []) as DbCollectionPoint[]}
      deliveryPoints={(dps ?? []) as DbDeliveryPoint[]}
      timeline={(tl ?? []) as DbTimelineEvent[]}
      finalized={false}
    />
  )
}
