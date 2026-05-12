import { createClient } from '@/lib/supabase/server'
import { OCCURRENCE_TYPES } from '@/lib/types'
import ExportButton from '@/components/ExportButton'
import PageHeader from '@/components/PageHeader'
import OcorrenciasView from './OcorrenciasView'

export default async function OcorrenciasPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('occurrences')
    .select('*, oits(number, client_name, status)')
    .order('created_at', { ascending: false })

  const all = data ?? []

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        titleKey="occurrences.title"
        subtitleKey="occurrences.registered"
        vars={{ count: all.length }}
        actions={
          <ExportButton
            filename={`ocorrencias-${new Date().toISOString().slice(0,10)}.csv`}
            rows={all.map(o => {
              const oit = o.oits as { number: string; client_name: string; status: string } | null
              return {
                oit: oit?.number ?? '', cliente: oit?.client_name ?? '',
                tipo: OCCURRENCE_TYPES[(o.type as keyof typeof OCCURRENCE_TYPES) ?? 'outros'],
                status: o.status, descricao: o.description ?? '', impacto: o.impact ?? '',
                acao: o.action_taken ?? '', local: o.location ?? '',
                criada_em: o.created_at, encerrada_em: o.closed_at ?? '',
              }
            })}
          />
        }
      />

      <OcorrenciasView rows={all as Parameters<typeof OcorrenciasView>[0]['rows']} />
    </div>
  )
}
