import Link from 'next/link'
import {
  Package, Truck, CheckCircle, AlertTriangle,
  TrendingUp, Plus, ArrowRight, MapPin,
} from 'lucide-react'
import { mockOrders, dashboardStats } from '@/lib/mockData'
import { OrderStatusBadge } from '@/components/StatusBadge'

function MetricCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; accent: string
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-blue-300">{label}</p>
          <p className="text-4xl font-extrabold text-white mt-1 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-blue-400/70 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function LiveMap() {
  const activeOrders = mockOrders.filter(o => o.status === 'em_rota' || o.status === 'coletado')
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <h2 className="font-bold text-white">Mapa de Operações</h2>
          <p className="text-xs text-blue-400 mt-0.5">Fretes ativos em tempo real</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Ao vivo
        </span>
      </div>

      {/* Map area */}
      <div className="relative h-72 overflow-hidden" style={{ background: 'rgba(2,8,28,0.7)' }}>
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Glow blobs */}
        <div className="absolute w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)', left: '15%', top: '20%', filter: 'blur(20px)' }} />
        <div className="absolute w-36 h-36 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)', left: '58%', top: '15%', filter: 'blur(16px)' }} />

        {/* Route lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <line x1="18%" y1="35%" x2="55%" y2="58%" stroke="#818CF8" strokeWidth="2" strokeDasharray="6,4" opacity="0.8"/>
          <line x1="62%" y1="28%" x2="38%" y2="68%" stroke="#60A5FA" strokeWidth="2" strokeDasharray="6,4" opacity="0.6"/>
        </svg>

        {/* City pins */}
        {[
          { left: '16%', top: '31%', label: 'Guarulhos', color: '#818CF8' },
          { left: '52%', top: '55%', label: 'São Paulo',  color: '#818CF8' },
          { left: '59%', top: '24%', label: 'São Paulo',  color: '#60A5FA' },
          { left: '35%', top: '65%', label: 'Sorocaba',   color: '#60A5FA' },
        ].map((p, i) => (
          <div key={i} className="absolute flex flex-col items-center" style={{ left: p.left, top: p.top }}>
            <div className="w-2.5 h-2.5 rounded-full border-2 border-white/30" style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }} />
            <span className="text-[9px] font-semibold mt-0.5 px-1 rounded" style={{ background: 'rgba(2,8,28,0.75)', color: '#BAE6FD' }}>{p.label}</span>
          </div>
        ))}

        {/* Truck markers */}
        <div className="absolute flex items-center justify-center w-8 h-8 rounded-full border-2 border-white/30 shadow-lg" style={{ left: '34%', top: '44%', background: 'rgba(99,102,241,0.85)', boxShadow: '0 0 12px rgba(99,102,241,0.7)' }}>
          <Truck className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="absolute flex items-center justify-center w-8 h-8 rounded-full border-2 border-white/30 shadow-lg" style={{ left: '50%', top: '46%', background: 'rgba(59,130,246,0.85)', boxShadow: '0 0 12px rgba(59,130,246,0.7)' }}>
          <Truck className="w-3.5 h-3.5 text-white" />
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {[
            { color: '#818CF8', label: 'Em Rota' },
            { color: '#60A5FA', label: 'Coletado' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium"
              style={{ background: 'rgba(2,8,28,0.75)', color: '#BAE6FD', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-3 h-0.5 rounded" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Active routes */}
      <div>
        {activeOrders.map(order => (
          <Link key={order.id} href={`/pedidos/${order.id}`}
            className="flex items-center gap-3 px-5 py-3 transition-colors glass-hover"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${order.status === 'em_rota' ? 'bg-violet-400' : 'bg-sky-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{order.protocol}</p>
              <p className="text-xs text-blue-400 truncate">{order.originCity} → {order.destinationCity}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-blue-200 font-medium">{order.providerName?.split(' ').slice(0, 2).join(' ')}</p>
              <p className="text-[10px] text-blue-500">{order.vehiclePlate}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const todayOrders = mockOrders.filter(o =>
    o.createdAt.startsWith('2026-05-08') ||
    o.status === 'em_rota' ||
    o.status === 'coletado' ||
    (o.status === 'ocorrencia' && o.createdAt > '2026-05-07')
  ).filter((o, i, arr) => arr.findIndex(x => x.id === o.id) === i)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Torre de Controle</h1>
          <p className="text-blue-400 mt-0.5 text-sm">Quinta-feira, 8 de maio de 2026</p>
        </div>
        <Link href="/pedidos/novo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 18px rgba(59,130,246,0.4)' }}>
          <Plus className="w-4 h-4" />
          Novo Pedido
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Pedidos Hoje"    value={dashboardStats.totalHoje}   sub="4 ativos no momento"         icon={Package}       accent="bg-blue-500/25 text-blue-300" />
        <MetricCard label="Em Rota"         value={dashboardStats.emRota}       sub="1 motorista em trânsito"     icon={Truck}         accent="bg-violet-500/25 text-violet-300" />
        <MetricCard label="Entregues Hoje"  value={dashboardStats.entregues}    sub="100% no prazo"               icon={CheckCircle}   accent="bg-emerald-500/25 text-emerald-300" />
        <MetricCard label="Ocorrências"     value={dashboardStats.ocorrencias}  sub="Requer atenção"              icon={AlertTriangle} accent="bg-red-500/25 text-red-300" />
      </div>

      {/* Map + orders */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3"><LiveMap /></div>

        <div className="lg:col-span-2">
          <div className="glass rounded-2xl h-full">
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white">Pedidos do Dia</h2>
              <Link href="/pedidos" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div>
              {todayOrders.slice(0, 5).map(order => (
                <Link key={order.id} href={`/pedidos/${order.id}`}
                  className="flex items-start gap-3 px-5 py-3.5 transition-colors glass-hover"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{order.protocol}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-blue-400 mt-0.5 truncate">{order.clientName}</p>
                    <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {order.originCity} → {order.destinationCity}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Providers */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Prestadores</h2>
            <Link href="/prestadores" className="text-xs text-blue-400 hover:text-blue-300 font-medium">Ver todos</Link>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
                <span className="text-sm text-blue-200">Ativos</span>
              </div>
              <span className="text-lg font-extrabold text-white">{dashboardStats.prestadoresAtivos}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-700" />
                <span className="text-sm text-blue-300">Adormecidos</span>
              </div>
              <span className="text-lg font-extrabold text-white">{dashboardStats.prestadoresAdormecidos}</span>
            </div>
          </div>
          <Link href="/prestadores/novo"
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-blue-300 hover:text-white transition-colors"
            style={{ border: '1px dashed rgba(96,165,250,0.3)' }}>
            <Plus className="w-3.5 h-3.5" />
            Adicionar prestador
          </Link>
        </div>

        {/* Occurrence alert */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.2)' }}>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-300 text-sm">Ocorrência Ativa</h3>
              <p className="text-xs text-red-400/90 mt-1">
                <strong className="text-red-300">FT-2026-0045</strong> — Destinatário ausente em São Paulo.
              </p>
              <Link href="/pedidos/o5" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-red-300 hover:text-red-200">
                Ver pedido <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Weekly revenue */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-white">Semana Atual</h2>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">
            R$ {dashboardStats.receitaSemana.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-blue-400 mt-1">Valor total em fretes</p>
          <div className="mt-4 flex gap-1.5 items-end h-14">
            {[65, 80, 45, 90, 70, 55, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full">
                <div className="w-full rounded-t-sm"
                  style={{ height: `${h}%`, background: i === 3 ? 'rgba(96,165,250,0.9)' : 'rgba(96,165,250,0.35)' }} />
              </div>
            ))}
          </div>
          <div className="flex mt-1.5">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
              <span key={i} className="flex-1 text-center text-[10px] text-blue-500">{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
