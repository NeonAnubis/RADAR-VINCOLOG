import { createClient } from '@/lib/supabase/server'
import DashboardView from './DashboardView'
import type { DbOit, OitStatus } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = createClient()

  const [
    { data: oits },
    { data: budgets },
    { data: occurrences },
    { count: activeProviders },
    { count: dormantProviders },
  ] = await Promise.all([
    supabase.from('oits').select('*, providers(name, vehicle_plate)').order('created_at', { ascending: false }).limit(50),
    supabase.from('budgets').select('id, status, approved_value, approved_at, created_at'),
    supabase.from('occurrences').select('id, oit_id, type, description, status, created_at').eq('status', 'aberta').limit(5),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status', 'adormecido'),
  ])

  const allOits = (oits ?? []) as DbOit[]
  const todayStr = new Date().toISOString().slice(0, 10)

  const todayOits        = allOits.filter(o => o.created_at.startsWith(todayStr))
  const activeStatuses: OitStatus[] = ['em_alocacao','aguardando_contrato','prestador_alocado','aguardando_coleta','em_coleta','em_transito','em_entrega','comprovante_pendente']
  const activeOits       = allOits.filter(o => activeStatuses.includes(o.status))
  const finalizedToday   = allOits.filter(o => o.status === 'finalizado' && (o.finalized_at?.startsWith(todayStr) ?? false)).length
  const openOccurrences  = (occurrences ?? []).length

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const weekRevenue = (budgets ?? []).filter(b => b.approved_at && b.approved_at >= weekAgo).reduce((s, b) => s + (b.approved_value ?? 0), 0)
  const pendingProposals = (budgets ?? []).filter(b => b.status === 'proposta_enviada' || b.status === 'proposta_gerada').length

  return (
    <DashboardView
      allOits={allOits}
      activeOits={activeOits}
      todayOits={todayOits}
      finalizedToday={finalizedToday}
      openOccurrences={openOccurrences}
      weekRevenue={weekRevenue}
      pendingProposals={pendingProposals}
      activeProviders={activeProviders ?? 0}
      dormantProviders={dormantProviders ?? 0}
    />
  )
}
