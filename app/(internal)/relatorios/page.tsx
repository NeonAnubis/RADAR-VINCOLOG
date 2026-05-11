import { BarChart2, TrendingUp, Package, CheckCircle, AlertTriangle, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { fmtCurrency } from '@/lib/utils/format'
import Link from 'next/link'

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
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Relatórios</h1>
        <p className="text-blue-400 mt-0.5 text-sm">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de OITs',       value: totalOits,                 icon: Package,      bg: 'rgba(59,130,246,0.18)',  color: 'text-blue-300' },
          { label: 'Taxa de Entrega',     value: `${taxa}%`,                icon: CheckCircle,  bg: 'rgba(52,211,153,0.18)', color: 'text-emerald-300' },
          { label: 'Receita Total',       value: fmtCurrency(receita),      icon: TrendingUp,   bg: 'rgba(167,139,250,0.18)',color: 'text-violet-300' },
          { label: 'Taxa Conversão Comercial', value: `${conversionRate}%`, icon: Briefcase,    bg: 'rgba(245,158,11,0.18)', color: 'text-amber-300' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">{label}</p>
                <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link href="/dashboards/comercial" className="glass glass-hover rounded-2xl p-5">
          <Briefcase className="w-5 h-5 text-cyan-400 mb-3" />
          <h3 className="font-bold text-white">Comercial</h3>
          <p className="text-xs text-blue-400 mt-1">{totalBudgets} orçamentos · {aprovados} aprovados</p>
        </Link>
        <Link href="/dashboards/financeiro" className="glass glass-hover rounded-2xl p-5">
          <TrendingUp className="w-5 h-5 text-amber-400 mb-3" />
          <h3 className="font-bold text-white">Financeiro</h3>
          <p className="text-xs text-blue-400 mt-1">{fmtCurrency(receita)} em receita</p>
        </Link>
        <Link href="/dashboards/prestadores" className="glass glass-hover rounded-2xl p-5">
          <BarChart2 className="w-5 h-5 text-violet-400 mb-3" />
          <h3 className="font-bold text-white">Prestadores</h3>
          <p className="text-xs text-blue-400 mt-1">Ver estatísticas e ranking</p>
        </Link>
      </div>

      <div className="glass rounded-2xl p-5 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <div>
          <p className="text-sm font-bold text-white">{totalOcorrencias} ocorrências registradas no sistema</p>
          <Link href="/ocorrencias" className="text-xs text-blue-400 hover:text-blue-300">Ver detalhes →</Link>
        </div>
      </div>
    </div>
  )
}
