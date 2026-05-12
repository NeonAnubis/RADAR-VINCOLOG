import { createClient } from '@/lib/supabase/server'
import CommercialDashboardView from './CommercialDashboardView'
import type { ServiceLevel } from '@/lib/types'

export default async function DashboardComercialPage() {
  const supabase = createClient()
  const { data: budgets } = await supabase.from('budgets').select('id, number, status, approved_value, approved_level, client_name, created_at, approved_at')
  const all = budgets ?? []

  const totals = {
    cadastrados: all.length,
    propostas_enviadas: all.filter(b => b.status === 'proposta_enviada').length,
    aprovadas: all.filter(b => b.status === 'aprovado').length,
    recusadas: all.filter(b => b.status === 'recusado').length,
    valor_proposto: all.filter(b => b.status === 'proposta_enviada').reduce((s, b) => s + (b.approved_value ?? 0), 0),
    valor_aprovado: all.filter(b => b.status === 'aprovado').reduce((s, b) => s + (b.approved_value ?? 0), 0),
  }
  const taxa = all.length > 0 ? Math.round((totals.aprovadas / all.length) * 100) : 0

  const byLevel: Record<ServiceLevel, number> = {
    essencial: all.filter(b => b.approved_level === 'essencial').length,
    assistido_basico: all.filter(b => b.approved_level === 'assistido_basico').length,
    assistido_completo: all.filter(b => b.approved_level === 'assistido_completo').length,
    prime_critico: all.filter(b => b.approved_level === 'prime_critico').length,
  }

  return <CommercialDashboardView totals={totals} taxa={taxa} totalCount={all.length} byLevel={byLevel} />
}
