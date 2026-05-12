import { createClient } from '@/lib/supabase/server'
import ExportButton from '@/components/ExportButton'
import PageHeader from '@/components/PageHeader'
import OrcamentosListView from './OrcamentosListView'
import NewBudgetLink from './NewBudgetLink'
import { BUDGET_STATUSES } from '@/lib/types'
import type { BudgetStatus } from '@/lib/types'

export default async function OrcamentosPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('budgets')
    .select('*, collection_points(city, uf), delivery_points(city, uf)')
    .order('created_at', { ascending: false })

  const all = data ?? []
  const counts = {
    all: all.length,
    cadastrado: all.filter(b => b.status === 'cadastrado').length,
    proposta_gerada: all.filter(b => b.status === 'proposta_gerada').length,
    proposta_enviada: all.filter(b => b.status === 'proposta_enviada').length,
    aprovado: all.filter(b => b.status === 'aprovado').length,
    recusado: all.filter(b => b.status === 'recusado').length,
  }

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        titleKey="budgets.title"
        subtitleKey="budgets.registered"
        vars={{ count: all.length }}
        actions={
          <>
            <ExportButton
              filename={`orcamentos-${new Date().toISOString().slice(0,10)}.csv`}
              rows={all.map(b => ({
                numero: b.number, cliente: b.client_name, status: BUDGET_STATUSES[b.status as BudgetStatus].label,
                origem_demanda: b.origin_source ?? '', valor_aprovado: b.approved_value ?? 0,
                nivel_aprovado: b.approved_level ?? '', criado_em: b.created_at,
                aprovado_em: b.approved_at ?? '',
              }))}
            />
            <NewBudgetLink />
          </>
        }
      />

      <OrcamentosListView rows={all} counts={counts} />
    </div>
  )
}
