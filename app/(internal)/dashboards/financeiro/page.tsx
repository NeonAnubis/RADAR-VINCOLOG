import { createClient } from '@/lib/supabase/server'
import FinancialDashboardView from './FinancialDashboardView'

export default async function DashboardFinanceiroPage() {
  const supabase = createClient()
  const { data: oits } = await supabase
    .from('oits')
    .select('id, number, client_name, status, vendor_value, contracted_value, estimated_margin, margin_percentage, advance_amount, balance_amount, providers(name)')
    .order('created_at', { ascending: false })

  const all = oits ?? []
  const valorVendido = all.reduce((s, o) => s + (o.vendor_value ?? 0), 0)
  const custoContratado = all.reduce((s, o) => s + (o.contracted_value ?? 0), 0)
  const margemTotal = valorVendido - custoContratado
  const margemPct = valorVendido > 0 ? (margemTotal / valorVendido) * 100 : 0

  const adiantamentosPendentes = all.filter(o => !['finalizado'].includes(o.status) && (o.advance_amount ?? 0) > 0).length
  const saldosPendentes        = all.filter(o => !['finalizado'].includes(o.status) && (o.balance_amount ?? 0) > 0).length
  const margemBaixa            = all.filter(o => o.margin_percentage !== null && (o.margin_percentage ?? 0) < 5 && o.status !== 'finalizado').length

  return (
    <FinancialDashboardView
      rows={all as Parameters<typeof FinancialDashboardView>[0]['rows']}
      valorVendido={valorVendido}
      custoContratado={custoContratado}
      margemTotal={margemTotal}
      margemPct={margemPct}
      adiantamentosPendentes={adiantamentosPendentes}
      saldosPendentes={saldosPendentes}
      margemBaixa={margemBaixa}
    />
  )
}
