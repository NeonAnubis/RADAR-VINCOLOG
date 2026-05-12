import { createClient } from '@/lib/supabase/server'
import PrestadoresListView from './PrestadoresListView'
import type { DbProvider } from '@/lib/types'

export default async function PrestadoresPage() {
  const supabase = createClient()
  const { data } = await supabase.from('providers').select('*').order('name')
  const all = (data ?? []) as DbProvider[]

  const ativos      = all.filter(p => p.status === 'ativo')
  const adormecidos = all.filter(p => p.status === 'adormecido')

  return <PrestadoresListView all={all} ativos={ativos} adormecidos={adormecidos} />
}
