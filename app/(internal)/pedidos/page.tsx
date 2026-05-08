import Link from 'next/link'
import { Plus, MapPin, Search, Filter } from 'lucide-react'
import { mockOrders } from '@/lib/mockData'
import { OrderStatusBadge } from '@/components/StatusBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function PedidosPage() {
  const all = [...mockOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const counts = {
    all: all.length,
    aguardando: all.filter(o => o.status === 'aguardando').length,
    em_rota: all.filter(o => o.status === 'em_rota').length,
    entregue: all.filter(o => o.status === 'entregue').length,
    ocorrencia: all.filter(o => o.status === 'ocorrencia').length,
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Pedidos</h1>
          <p className="text-blue-400 mt-0.5 text-sm">{all.length} pedidos cadastrados</p>
        </div>
        <Link href="/pedidos/novo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 18px rgba(59,130,246,0.4)' }}>
          <Plus className="w-4 h-4" />
          Novo Pedido
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
          <input
            type="text" readOnly
            placeholder="Buscar por protocolo, cliente ou cidade..."
            className="glass-input pl-9"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-blue-300 hover:text-white glass transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Todos', count: counts.all, active: true },
          { label: 'Aguardando', count: counts.aguardando },
          { label: 'Em Rota', count: counts.em_rota },
          { label: 'Entregues', count: counts.entregue },
          { label: 'Ocorrências', count: counts.ocorrencia },
        ].map(tab => (
          <button key={tab.label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              tab.active
                ? 'text-white'
                : 'text-blue-400 hover:text-blue-200 glass'
            }`}
            style={tab.active ? {
              background: 'linear-gradient(135deg,rgba(59,130,246,0.4),rgba(37,99,235,0.3))',
              border: '1px solid rgba(96,165,250,0.3)',
            } : {}}>
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab.active ? 'bg-blue-400/30 text-blue-200' : 'bg-white/10 text-blue-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Protocolo', 'Cliente', 'Rota', 'Prestador', 'Status', 'Criado em', 'Valor', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-5 py-3 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map(order => (
                <tr key={order.id} className="transition-colors glass-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-bold text-white">{order.protocol}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-blue-100">{order.clientName}</p>
                    <p className="text-xs text-blue-500">{order.clientPhone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-xs text-blue-300">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      {order.originCity} <span className="text-blue-600">→</span> {order.destinationCity}
                    </div>
                    <p className="text-xs text-blue-500 mt-0.5">{order.cargoWeight}</p>
                  </td>
                  <td className="px-4 py-4">
                    {order.providerName ? (
                      <div>
                        <p className="text-sm text-blue-100">{order.providerName.split(' ').slice(0,2).join(' ')}</p>
                        <p className="text-xs text-blue-500">{order.vehiclePlate}</p>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-amber-400">Não alocado</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <OrderStatusBadge status={order.status} />
                    {order.status === 'ocorrencia' && order.notes && (
                      <p className="text-[10px] text-red-400 mt-1 max-w-[140px] truncate">{order.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-blue-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-bold text-white">R$ {order.value.toLocaleString('pt-BR')}</span>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/pedidos/${order.id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
