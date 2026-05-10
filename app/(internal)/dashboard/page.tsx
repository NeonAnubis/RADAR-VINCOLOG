import Link from 'next/link'
import { Package, Truck, CheckCircle, AlertTriangle, TrendingUp, Plus, ArrowRight, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OrderStatusBadge } from '@/components/StatusBadge'
import { fmtCurrency } from '@/lib/utils/format'
import { DbOrder } from '@/lib/types'

function MetricCard({ label, value, sub, icon: Icon, accent }:
  { label: string; value: string | number; sub?: string; icon: React.ElementType; accent: string }) {
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

export default async function DashboardPage() {
  const supabase = createClient()

  // Fetch recent orders with provider data
  const { data: orders } = await supabase
    .from('orders')
    .select('*, providers(name, vehicle_plate, vehicle_type)')
    .order('created_at', { ascending: false })
    .limit(20)

  const rows = (orders ?? []) as DbOrder[]

  const activeStatuses = ['em_rota', 'radar_ativo', 'alocado', 'aceito']
  const todayStr = new Date().toISOString().slice(0, 10)

  const todayOrders  = rows.filter(o => o.created_at.startsWith(todayStr))
  const emRota       = rows.filter(o => o.status === 'em_rota').length
  const entregues    = rows.filter(o => o.status === 'entregue' && o.created_at.startsWith(todayStr)).length
  const ocorrencias  = rows.filter(o => o.status === 'ocorrencia').length
  const activeOrders = rows.filter(o => activeStatuses.includes(o.status))

  // Weekly revenue
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const { data: weekOrders } = await supabase
    .from('orders')
    .select('frete_value')
    .gte('created_at', weekAgo)
  const weekRevenue = (weekOrders ?? []).reduce((s, o) => s + (o.frete_value ?? 0), 0)

  // Provider counts
  const { count: provAtivos }     = await supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status', 'ativo')
  const { count: provAdormecidos } = await supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status', 'adormecido')

  // Occurrence alert
  const ocorrenciaAtiva = rows.find(o => o.status === 'ocorrencia')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Torre de Controle</h1>
          <p className="text-blue-400 mt-0.5 text-sm">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Link href="/pedidos/novo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 18px rgba(59,130,246,0.4)' }}>
          <Plus className="w-4 h-4" /> Novo Pedido
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Pedidos Hoje"   value={todayOrders.length} sub="criados hoje"       icon={Package}       accent="bg-blue-500/25 text-blue-300" />
        <MetricCard label="Em Rota"        value={emRota}             sub="motoristas ativos"  icon={Truck}         accent="bg-violet-500/25 text-violet-300" />
        <MetricCard label="Entregues Hoje" value={entregues}          sub="confirmados"         icon={CheckCircle}   accent="bg-emerald-500/25 text-emerald-300" />
        <MetricCard label="Ocorrências"    value={ocorrencias}        sub="requer atenção"      icon={AlertTriangle} accent="bg-red-500/25 text-red-300" />
      </div>

      {/* Active + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Active orders map-style card */}
        <div className="lg:col-span-3 glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <h2 className="font-bold text-white">Fretes Ativos</h2>
              <p className="text-xs text-blue-400 mt-0.5">{activeOrders.length} em andamento agora</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ao vivo
            </span>
          </div>
          {activeOrders.length === 0 ? (
            <div className="p-10 text-center">
              <Truck className="w-10 h-10 text-blue-900 mx-auto mb-2" />
              <p className="text-blue-600 text-sm">Nenhum frete em andamento</p>
            </div>
          ) : (
            <div>
              {activeOrders.map(o => (
                <Link key={o.id} href={`/pedidos/${o.id}`}
                  className="flex items-center gap-4 px-5 py-4 glass-hover transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{o.protocol}</span>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <p className="text-xs text-blue-400 mt-0.5">{o.client_name}</p>
                    <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {o.origin_city} → {o.destination_city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-300 font-medium truncate max-w-[120px]">
                      {o.providers?.name?.split(' ').slice(0,2).join(' ') ?? '—'}
                    </p>
                    <p className="text-[10px] text-blue-600">{o.providers?.vehicle_plate ?? '—'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 glass rounded-2xl">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="font-bold text-white">Recentes</h2>
            <Link href="/pedidos" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {rows.slice(0, 5).map(o => (
            <Link key={o.id} href={`/pedidos/${o.id}`}
              className="flex items-start gap-3 px-5 py-3.5 glass-hover transition-colors"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{o.protocol}</p>
                  <OrderStatusBadge status={o.status} />
                </div>
                <p className="text-xs text-blue-400 mt-0.5 truncate">{o.client_name}</p>
                <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />{o.origin_city} → {o.destination_city}
                </p>
              </div>
            </Link>
          ))}
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
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
                <span className="text-sm text-blue-200">Ativos</span>
              </div>
              <span className="text-lg font-extrabold text-white">{provAtivos ?? 0}</span>
            </div>
            <div className="flex justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-700" />
                <span className="text-sm text-blue-300">Adormecidos</span>
              </div>
              <span className="text-lg font-extrabold text-white">{provAdormecidos ?? 0}</span>
            </div>
          </div>
          <Link href="/prestadores/novo"
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-blue-300 hover:text-white transition-colors"
            style={{ border: '1px dashed rgba(96,165,250,0.3)' }}>
            <Plus className="w-3.5 h-3.5" /> Adicionar prestador
          </Link>
        </div>

        {/* Occurrence alert or OK */}
        {ocorrenciaAtiva ? (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.2)' }}>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-300 text-sm">Ocorrência Ativa</h3>
                <p className="text-xs text-red-400/90 mt-1">
                  <strong className="text-red-300">{ocorrenciaAtiva.protocol}</strong> — {ocorrenciaAtiva.notes ?? 'Sem descrição'}
                </p>
                <Link href={`/pedidos/${ocorrenciaAtiva.id}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-red-300 hover:text-red-200">
                  Ver pedido <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.2)' }}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">Sem ocorrências</p>
              <p className="text-xs text-emerald-500 mt-0.5">Operação normal</p>
            </div>
          </div>
        )}

        {/* Weekly revenue */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-white">Semana Atual</h2>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">{fmtCurrency(weekRevenue)}</p>
          <p className="text-xs text-blue-400 mt-1">Valor total em fretes (7 dias)</p>
          <Link href="/financeiro" className="mt-4 block text-xs font-bold text-blue-400 hover:text-blue-300">
            Ver painel financeiro →
          </Link>
        </div>
      </div>
    </div>
  )
}
