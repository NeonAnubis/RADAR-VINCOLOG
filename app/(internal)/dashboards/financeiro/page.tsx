import Link from 'next/link'
import { DollarSign, TrendingUp, AlertTriangle, Clock, CheckCircle, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { fmtCurrency } from '@/lib/utils/format'
import { OitStatusBadge } from '@/components/StatusBadge'

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
  const saldosPendentes = all.filter(o => !['finalizado'].includes(o.status) && (o.balance_amount ?? 0) > 0).length
  const margemBaixa = all.filter(o => o.margin_percentage !== null && (o.margin_percentage ?? 0) < 5 && o.status !== 'finalizado').length

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Financeiro / Auditoria</h1>
        <p className="text-blue-400 mt-0.5 text-sm">Margens, adiantamentos e auditoria por OIT</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Valor Vendido"        value={fmtCurrency(valorVendido)}  icon={Briefcase}    color="bg-blue-500/25 text-blue-300" />
        <Metric label="Custo Contratado"     value={fmtCurrency(custoContratado)} icon={DollarSign} color="bg-violet-500/25 text-violet-300" />
        <Metric label="Margem Bruta"         value={fmtCurrency(margemTotal)}   icon={TrendingUp}    color={margemTotal >= 0 ? "bg-emerald-500/25 text-emerald-300" : "bg-red-500/25 text-red-300"} />
        <Metric label="Margem %"             value={`${margemPct.toFixed(1)}%`}  icon={TrendingUp}    color="bg-amber-500/25 text-amber-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Alert title="Adiantamentos pendentes" count={adiantamentosPendentes} icon={Clock}   color="amber" />
        <Alert title="Saldos pendentes"        count={saldosPendentes}        icon={Clock}   color="amber" />
        <Alert title="Margem abaixo de 5%"     count={margemBaixa}            icon={AlertTriangle} color="red" />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-bold text-white">OITs com auditoria financeira</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['OIT','Cliente','Status','Valor Vendido','Custo','Margem','Margem %',''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-4 py-3 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map(o => (
                <tr key={o.id} className="glass-hover transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-4 py-3"><span className="font-mono text-sm font-bold text-white">{o.number}</span></td>
                  <td className="px-4 py-3 text-sm text-blue-100">{o.client_name}</td>
                  <td className="px-4 py-3"><OitStatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-sm font-bold text-white">{fmtCurrency(o.vendor_value)}</td>
                  <td className="px-4 py-3 text-sm text-blue-200">{fmtCurrency(o.contracted_value)}</td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: (o.estimated_margin ?? 0) >= 0 ? '#34D399' : '#F87171' }}>
                    {fmtCurrency(o.estimated_margin)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: (o.margin_percentage ?? 0) >= 10 ? '#34D399' : (o.margin_percentage ?? 0) >= 5 ? '#FBBF24' : '#F87171' }}>
                    {o.margin_percentage !== null ? `${o.margin_percentage.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/oits/${o.id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300">Ver →</Link>
                  </td>
                </tr>
              ))}
              {all.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-blue-600 text-sm">Nenhuma OIT cadastrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-blue-300">{label}</p>
          <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function Alert({ title, count, icon: Icon, color }: { title: string; count: number; icon: React.ElementType; color: 'red' | 'amber' }) {
  const styles = color === 'red'
    ? { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', accent: '#F87171' }
    : { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', accent: '#FBBF24' }
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: styles.bg, border: `1px solid ${styles.border}` }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${styles.accent}33` }}>
        <Icon className="w-5 h-5" style={{ color: styles.accent }} />
      </div>
      <div>
        <p className="text-sm font-medium text-blue-300">{title}</p>
        <p className="text-2xl font-extrabold text-white mt-1">{count}</p>
      </div>
    </div>
  )
}
