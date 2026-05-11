import { createClient } from '@/lib/supabase/server'
import { fmtCurrency } from '@/lib/utils/format'
import { FileText, Send, CheckCircle, XCircle, TrendingUp, Briefcase } from 'lucide-react'
import { SERVICE_LEVELS } from '@/lib/types'
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

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Comercial</h1>
        <p className="text-blue-400 mt-0.5 text-sm">Indicadores de orçamentos e propostas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Orçamentos cadastrados" value={totals.cadastrados} icon={FileText} color="bg-blue-500/25 text-blue-300" />
        <Metric label="Propostas enviadas"     value={totals.propostas_enviadas} icon={Send} color="bg-violet-500/25 text-violet-300" />
        <Metric label="Propostas aprovadas"    value={totals.aprovadas} icon={CheckCircle} color="bg-emerald-500/25 text-emerald-300" />
        <Metric label="Propostas recusadas"    value={totals.recusadas} icon={XCircle} color="bg-red-500/25 text-red-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">Taxa de Conversão</h2>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-4xl font-extrabold text-white">{taxa}%</p>
          <p className="text-xs text-blue-400 mt-1">{totals.aprovadas} aprovadas de {all.length}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">Valor Total Proposto</h2>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{fmtCurrency(totals.valor_proposto)}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">Valor Total Aprovado</h2>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{fmtCurrency(totals.valor_aprovado)}</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-bold text-white mb-4">Produtos Vendidos por Nível de Serviço</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(SERVICE_LEVELS).map(([key, meta]) => (
            <div key={key} className="rounded-xl p-4" style={{ background: `${meta.color}1a`, border: `1px solid ${meta.color}55` }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.color }}>{meta.short}</p>
              <p className="text-3xl font-extrabold text-white mt-1">{byLevel[key as ServiceLevel]}</p>
              <p className="text-[10px] text-blue-400 mt-1">{meta.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-blue-300">{label}</p>
          <p className="text-3xl font-extrabold text-white mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
