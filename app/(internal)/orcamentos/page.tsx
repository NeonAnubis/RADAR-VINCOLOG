import Link from 'next/link'
import { Plus, MapPin, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BudgetStatusBadge } from '@/components/StatusBadge'
import { fmtDateTime, fmtCurrency } from '@/lib/utils/format'
import ExportButton from '@/components/ExportButton'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Orçamentos</h1>
          <p className="text-blue-400 mt-0.5 text-sm">{all.length} orçamentos cadastrados</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            filename={`orcamentos-${new Date().toISOString().slice(0,10)}.csv`}
            rows={all.map(b => ({
              numero: b.number, cliente: b.client_name, status: BUDGET_STATUSES[b.status as BudgetStatus].label,
              origem_demanda: b.origin_source ?? '', valor_aprovado: b.approved_value ?? 0,
              nivel_aprovado: b.approved_level ?? '', criado_em: b.created_at,
              aprovado_em: b.approved_at ?? '',
            }))}
          />
          <Link href="/orcamentos/novo"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',boxShadow:'0 4px 18px rgba(59,130,246,0.4)' }}>
            <Plus className="w-4 h-4" /> Novo Orçamento
          </Link>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
          <input readOnly placeholder="Buscar por número, cliente ou cidade..." className="glass-input pl-9" />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Todos',     count: counts.all,              active: true },
          { label: 'Cadastrado', count: counts.cadastrado },
          { label: 'Proposta Gerada', count: counts.proposta_gerada },
          { label: 'Proposta Enviada', count: counts.proposta_enviada },
          { label: 'Aprovado',  count: counts.aprovado },
          { label: 'Recusado',  count: counts.recusado },
        ].map(tab => (
          <button key={tab.label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${tab.active ? 'text-white' : 'text-blue-400 hover:text-blue-200 glass'}`}
            style={tab.active ? { background: 'linear-gradient(135deg,rgba(59,130,246,0.4),rgba(37,99,235,0.3))', border: '1px solid rgba(96,165,250,0.3)' } : {}}>
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab.active ? 'bg-blue-400/30 text-blue-200' : 'bg-white/10 text-blue-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Nº Orçamento','Cliente','Rota','Carga','Valor Aprovado','Status','Criado em',''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-5 py-3 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map(b => {
                const collectCities = (b.collection_points as Array<{city:string|null}> ?? []).map(c => c.city).filter(Boolean)
                const deliverCities = (b.delivery_points as Array<{city:string|null}> ?? []).map(d => d.city).filter(Boolean)
                return (
                  <tr key={b.id} className="glass-hover transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-5 py-4"><span className="font-mono text-sm font-bold text-white">{b.number}</span></td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-blue-100">{b.client_name ?? '—'}</p>
                      <p className="text-xs text-blue-500">{b.client_contact_phone ?? ''}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-xs text-blue-300">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        <span>{collectCities.length > 1 ? `${collectCities.length} coletas` : (collectCities[0] ?? '—')}</span>
                        <span className="text-blue-600">→</span>
                        <span>{deliverCities.length > 1 ? `${deliverCities.length} entregas` : (deliverCities[0] ?? '—')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-blue-400 max-w-[180px] truncate">{b.cargo_description ?? '—'}</td>
                    <td className="px-4 py-4"><span className="text-sm font-bold text-white">{fmtCurrency(b.approved_value)}</span></td>
                    <td className="px-4 py-4"><BudgetStatusBadge status={b.status} /></td>
                    <td className="px-4 py-4 text-xs text-blue-400 whitespace-nowrap">{fmtDateTime(b.created_at)}</td>
                    <td className="px-4 py-4">
                      <Link href={`/orcamentos/${b.id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300">Ver →</Link>
                    </td>
                  </tr>
                )
              })}
              {all.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-blue-600 text-sm">Nenhum orçamento cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
