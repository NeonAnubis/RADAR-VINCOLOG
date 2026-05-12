import { createClient } from '@/lib/supabase/server'
import ContratosListView from './ContratosListView'

export default async function ContratosPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('contracts_per_trip')
    .select('*, oits(number, client_name, status), providers(name)')
    .order('created_at', { ascending: false })

  return <ContratosListView rows={(data ?? []) as Parameters<typeof ContratosListView>[0]['rows']} />
}
