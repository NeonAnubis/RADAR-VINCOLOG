import { createClient } from '@/lib/supabase/server'
import ProvidersDashboardView from './ProvidersDashboardView'
import type { DbProvider } from '@/lib/types'

export default async function DashboardPrestadoresPage() {
  const supabase = createClient()
  const { data: providers } = await supabase.from('providers').select('*').order('total_fretes', { ascending: false })
  const all = (providers ?? []) as DbProvider[]

  const ativos      = all.filter(p => p.status === 'ativo').length
  const adormecidos = all.filter(p => p.status === 'adormecido').length
  const totalFretes = all.reduce((s, p) => s + (p.total_fretes ?? 0), 0)

  const byType: Record<string, number> = {}
  all.forEach(p => { if (p.vehicle_type) byType[p.vehicle_type] = (byType[p.vehicle_type] ?? 0) + 1 })

  return <ProvidersDashboardView all={all} ativos={ativos} adormecidos={adormecidos} totalFretes={totalFretes} byType={byType} />
}
