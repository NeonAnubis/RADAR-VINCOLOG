import { BarChart2, TrendingUp, Package, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { fmtCurrency } from '@/lib/utils/format'

export default async function RelatoriosPage() {
  const supabase = createClient()
  const { data: orders } = await supabase.from('orders').select('id,status,frete_value')

  const all       = orders ?? []
  const total     = all.length
  const entregues = all.filter(o => ['entregue','finalizado'].includes(o.status)).length
  const receita   = all.reduce((s, o) => s + (o.frete_value ?? 0), 0)
  const taxa      = total ? Math.round((entregues / total) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Relatórios</h1>
        <p className="text-blue-400 mt-0.5 text-sm">Visão geral de desempenho operacional</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total de fretes',  value: total,                 icon: Package,    bg:'rgba(59,130,246,0.18)',  color:'text-blue-300' },
          { label:'Taxa de entrega',  value: `${taxa}%`,            icon: CheckCircle, bg:'rgba(52,211,153,0.18)', color:'text-emerald-300' },
          { label:'Receita total',    value: fmtCurrency(receita),  icon: TrendingUp,  bg:'rgba(167,139,250,0.18)',color:'text-violet-300' },
          { label:'Média por frete',  value: total ? fmtCurrency(Math.round(receita/total)) : '—', icon: BarChart2, bg:'rgba(245,158,11,0.18)', color:'text-amber-300' },
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

      <div className="glass rounded-2xl p-10 flex items-center justify-center">
        <div className="text-center">
          <BarChart2 className="w-12 h-12 text-blue-800 mx-auto mb-3" />
          <p className="text-blue-500 text-sm">Gráficos e relatórios detalhados disponíveis após 30 dias de operação.</p>
        </div>
      </div>
    </div>
  )
}
