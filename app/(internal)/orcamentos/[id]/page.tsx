import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DbBudget, DbCollectionPoint, DbDeliveryPoint, ServiceLevel, ServiceLevelOffer } from '@/lib/types'
import BudgetDetailView from './BudgetDetailView'

export default async function BudgetDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: budget } = await supabase.from('budgets').select('*').eq('id', params.id).single()
  if (!budget) notFound()
  const b = budget as DbBudget

  const { data: cps } = await supabase.from('collection_points').select('*').eq('budget_id', params.id).order('sequence')
  const { data: dps } = await supabase.from('delivery_points').select('*').eq('budget_id', params.id).order('sequence')
  const collectionPoints = (cps ?? []) as DbCollectionPoint[]
  const deliveryPoints   = (dps ?? []) as DbDeliveryPoint[]

  // Find linked OIT if approved
  const { data: oit } = await supabase.from('oits').select('id, number').eq('budget_id', params.id).maybeSingle()

  const offered = Object.entries(b.service_levels ?? {})
    .filter(([_, cfg]) => (cfg as ServiceLevelOffer)?.offered) as [ServiceLevel, ServiceLevelOffer][]

  return (
    <BudgetDetailView
      b={b}
      collectionPoints={collectionPoints}
      deliveryPoints={deliveryPoints}
      oit={oit}
      offered={offered}
    />
  )
}
