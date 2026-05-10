import Link from 'next/link'
import { Plus, MapPin, Search, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OrderStatusBadge } from '@/components/StatusBadge'
import { fmtDateTime, fmtCurrency } from '@/lib/utils/format'
import { DbOrder } from '@/lib/types'

export default async function PedidosPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, providers(name, vehicle_plate)')
    .order('created_at', { ascending: false })

  const all = (data ?? []) as DbOrder[]

  const counts = {
    all:       all.length,
    criado:    all.filter(o => o.status === 'criado').length,
    aceito:    all.filter(o => o.status === 'aceito').length,
    alocado:   all.filter(o => ['alocado','radar_ativo'].includes(o.status)).length,
    em_rota:   all.filter(o => o.status === 'em_rota').length,
    entregue:  all.filter(o => o.status === 'entregue').length,
    ocorrencia:all.filter(o => o.status === 'ocorrencia').length,
    finalizado:all.filter(o => o.status === 'finalizado').length,
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Pedidos</h1>
          <p className="text-blue-400 mt-0.5 text-sm">{all.length} pedidos cadastrados</p>
        </div>
        <Link href="/pedidos/novo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 18px rgba(59,130,246,0.4)' }}>
          <Plus className="w-4 h-4" /> Novo Pedido
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
          <input type="text" readOnly placeholder="Buscar por protocolo, cliente ou cidade..."
            className="glass-input pl-9" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-blue-300 glass">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Todos',      count: counts.all,        active: true },
          { label: 'Criado',     count: counts.criado },
          { label: 'Aceito',     count: counts.aceito },
          { label: 'Alocado',    count: counts.alocado },
          { label: 'Em Rota',    count: counts.em_rota },
          { label: 'Entregues',  count: counts.entregue },
          { label: 'Ocorrência', count: counts.ocorrencia },
          { label: 'Finalizado', count: counts.finalizado },
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
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Protocolo','Cliente','Rota','Prestador','Status','Criado em','Valor',''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-5 py-3 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map(o => (
                <tr key={o.id} className="glass-hover transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-5 py-4"><span className="font-mono text-sm font-bold text-white">{o.protocol}</span></td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-blue-100">{o.client_name}</p>
                    <p className="text-xs text-blue-500">{o.client_phone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-xs text-blue-300">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      {o.origin_city} <span className="text-blue-600">→</span> {o.destination_city}
                    </div>
                    <p className="text-xs text-blue-500 mt-0.5">{o.cargo_weight}</p>
                  </td>
                  <td className="px-4 py-4">
                    {o.providers?.name
                      ? <div><p className="text-sm text-blue-100">{o.providers.name.split(' ').slice(0,2).join(' ')}</p><p className="text-xs text-blue-500">{o.providers.vehicle_plate}</p></div>
                      : <span className="text-xs font-semibold text-amber-400">Não alocado</span>}
                  </td>
                  <td className="px-4 py-4"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-4 py-4 text-xs text-blue-400 whitespace-nowrap">{fmtDateTime(o.created_at)}</td>
                  <td className="px-4 py-4"><span className="text-sm font-bold text-white">{fmtCurrency(o.frete_value)}</span></td>
                  <td className="px-4 py-4">
                    <Link href={`/pedidos/${o.id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300">Ver →</Link>
                  </td>
                </tr>
              ))}
              {all.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-blue-600 text-sm">Nenhum pedido cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
