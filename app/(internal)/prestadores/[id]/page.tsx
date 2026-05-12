import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProviderDetailView from './ProviderDetailView'

export default async function ProviderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: provider } = await supabase.from('providers').select('*').eq('id', params.id).single()
  if (!provider) notFound()

  const { data: oits } = await supabase
    .from('oits')
    .select('id, number, status, client_name, vendor_value, created_at, collection_points(city), delivery_points(city)')
    .eq('provider_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <ProviderDetailView
      provider={provider as Parameters<typeof ProviderDetailView>[0]['provider']}
      oits={(oits ?? []) as Parameters<typeof ProviderDetailView>[0]['oits']}
    />
  )
}
