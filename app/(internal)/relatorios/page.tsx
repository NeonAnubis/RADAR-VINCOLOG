import { createClient } from '@/lib/supabase/server'
import ReportsView from './ReportsView'

export default async function RelatoriosPage() {
  const supabase = createClient()
  const [{ data: oits }, { data: budgets }, { data: occurrences }] = await Promise.all([
    supabase.from('oits').select('id, status, vendor_value, service_level'),
    supabase.from('budgets').select('id, status, approved_value'),
    supabase.from('occurrences').select('id, status, type'),
  ])

  const oitsArr = oits ?? []
  const budgetsArr = budgets ?? []
  const totalOits = oitsArr.length
  const entregues = oitsArr.filter(o => o.status === 'finalizado').length
  const receita = oitsArr.reduce((s, o) => s + (o.vendor_value ?? 0), 0)
  const taxa = totalOits > 0 ? Math.round((entregues / totalOits) * 100) : 0
  const totalBudgets = budgetsArr.length
  const aprovados = budgetsArr.filter(b => b.status === 'aprovado').length
  const conversionRate = totalBudgets > 0 ? Math.round((aprovados / totalBudgets) * 100) : 0
  const totalOcorrencias = (occurrences ?? []).length

  return (
    <ReportsView
      totalOits={totalOits}
      taxa={taxa}
      receita={receita}
      conversionRate={conversionRate}
      totalBudgets={totalBudgets}
      aprovados={aprovados}
      totalOcorrencias={totalOcorrencias}
    />
  )
}
