import { createClient } from '@/lib/supabase/server'
import { OIT_STATUSES } from '@/lib/types'
import type { DbOit, OitStatus } from '@/lib/types'
import ExportButton from '@/components/ExportButton'
import PageHeader from '@/components/PageHeader'
import KanbanView from './KanbanView'
import NewFromBudgetLink from './NewFromBudgetLink'

export default async function OitsPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('oits')
    .select('*, providers(name, vehicle_plate), collection_points(city, uf), delivery_points(city, uf, pod_url, pod_recipient)')
    .order('created_at', { ascending: false })

  // Fetch occurrence counts in one batch
  const { data: occMap } = await supabase
    .from('occurrences')
    .select('oit_id')
    .in('status', ['aberta','em_tratativa'])
  const occCounts: Record<string, number> = {}
  ;(occMap ?? []).forEach(o => { occCounts[o.oit_id] = (occCounts[o.oit_id] ?? 0) + 1 })

  const all = (data ?? []) as DbOit[]
  const byStatus: Record<OitStatus, DbOit[]> = {} as Record<OitStatus, DbOit[]>
  ;(Object.keys(OIT_STATUSES) as OitStatus[]).forEach(s => { byStatus[s] = [] })
  all.forEach(oit => { byStatus[oit.status]?.push(oit) })

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        titleKey="oits.title"
        subtitleKey="oits.subtitle"
        vars={{ count: all.length }}
        actions={
          <>
            <ExportButton
              filename={`oits-${new Date().toISOString().slice(0,10)}.csv`}
              rows={all.map(o => ({
                numero: o.number, cliente: o.client_name, status: OIT_STATUSES[o.status].label,
                nivel: o.service_level, prioridade: o.priority,
                prestador: o.providers?.name ?? '', placa: o.providers?.vehicle_plate ?? '',
                valor_vendido: o.vendor_value ?? 0, custo: o.contracted_value ?? 0,
                margem: o.estimated_margin ?? 0, margem_pct: o.margin_percentage ?? 0,
                criado_em: o.created_at, finalizado_em: o.finalized_at ?? '',
              }))}
            />
            <NewFromBudgetLink />
          </>
        }
      />

      <KanbanView byStatus={byStatus} occCounts={occCounts} />
    </div>
  )
}
