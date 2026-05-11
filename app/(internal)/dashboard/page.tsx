import Link from 'next/link'
import { Package, Truck, CheckCircle, AlertTriangle, TrendingUp, ArrowRight, MapPin, FileText, Users, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OitStatusBadge, ServiceLevelBadge } from '@/components/StatusBadge'
import { fmtCurrency } from '@/lib/utils/format'
import { OIT_STATUSES } from '@/lib/types'
import type { DbOit, OitStatus } from '@/lib/types'

function MetricCard({ label, value, sub, icon: Icon, accent }:
  { label: string; value: string | number; sub?: string; icon: React.ElementType; accent: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-blue-300">{label}</p>
          <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</p>
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

  const [
    { data: oits },
    { data: budgets },
    { data: occurrences },
    { count: activeProviders },
    { count: dormantProviders },
  ] = await Promise.all([
    supabase.from('oits').select('*, providers(name, vehicle_plate)').order('created_at', { ascending: false }).limit(50),
    supabase.from('budgets').select('id, status, approved_value, approved_at, created_at'),
    supabase.from('occurrences').select('id, oit_id, type, description, status, created_at').eq('status', 'aberta').limit(5),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status', 'adormecido'),
  ])

  const allOits = (oits ?? []) as DbOit[]
  const todayStr = new Date().toISOString().slice(0, 10)

  const todayOits        = allOits.filter(o => o.created_at.startsWith(todayStr))
  const activeStatuses: OitStatus[] = ['em_alocacao','aguardando_contrato','prestador_alocado','aguardando_coleta','em_coleta','em_transito','em_entrega','comprovante_pendente']
  const activeOits       = allOits.filter(o => activeStatuses.includes(o.status))
  const finalizedToday   = allOits.filter(o => o.status === 'finalizado' && (o.finalized_at?.startsWith(todayStr) ?? false)).length
  const openOccurrences  = (occurrences ?? []).length

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const weekRevenue = (budgets ?? []).filter(b => b.approved_at && b.approved_at >= weekAgo).reduce((s, b) => s + (b.approved_value ?? 0), 0)
  const pendingProposals = (budgets ?? []).filter(b => b.status === 'proposta_enviada' || b.status === 'proposta_gerada').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Torre de Controle</h1>
          <p className="text-blue-400 mt-0.5 text-sm">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Link href="/oits" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 18px rgba(59,130,246,0.4)' }}>
          Ver Kanban →
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="OITs Hoje"        value={todayOits.length}   sub="criadas hoje"            icon={Package}       accent="bg-blue-500/25 text-blue-300" />
        <MetricCard label="Em Andamento"     value={activeOits.length}  sub="operações ativas"        icon={Truck}         accent="bg-violet-500/25 text-violet-300" />
        <MetricCard label="Finalizadas Hoje" value={finalizedToday}     sub="entregues e encerradas"  icon={CheckCircle}   accent="bg-emerald-500/25 text-emerald-300" />
        <MetricCard label="Ocorrências"      value={openOccurrences}    sub="abertas"                 icon={AlertTriangle} accent="bg-red-500/25 text-red-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Active OITs */}
        <div className="lg:col-span-3 glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <h2 className="font-bold text-white">OITs em Andamento</h2>
              <p className="text-xs text-blue-400 mt-0.5">{activeOits.length} em operação agora</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ao vivo
            </span>
          </div>
          {activeOits.length === 0 ? (
            <div className="p-10 text-center">
              <Truck className="w-10 h-10 text-blue-900 mx-auto mb-2" />
              <p className="text-blue-600 text-sm">Nenhuma operação em andamento</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {activeOits.slice(0, 10).map(o => (
                <Link key={o.id} href={`/oits/${o.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 glass-hover transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-white">{o.number}</span>
                      <OitStatusBadge status={o.status} />
                      <ServiceLevelBadge level={o.service_level} />
                    </div>
                    <p className="text-xs text-blue-400 mt-0.5">{o.client_name}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-blue-300 font-medium">{o.providers?.name?.split(' ').slice(0,2).join(' ') ?? '—'}</p>
                    <p className="text-blue-500">{fmtCurrency(o.vendor_value)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent OITs */}
        <div className="lg:col-span-2 glass rounded-2xl">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="font-bold text-white">Recentes</h2>
            <Link href="/oits" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {allOits.slice(0, 6).map(o => (
            <Link key={o.id} href={`/oits/${o.id}`}
              className="flex items-start gap-3 px-5 py-3.5 glass-hover transition-colors"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-white">{o.number}</span>
                  <OitStatusBadge status={o.status} />
                </div>
                <p className="text-xs text-blue-400 mt-0.5 truncate">{o.client_name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboards/comercial" className="glass glass-hover rounded-2xl p-5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white">Comercial</h3>
          </div>
          <p className="text-xs text-blue-400">{pendingProposals} propostas pendentes</p>
          <p className="text-lg font-extrabold text-white mt-1">{fmtCurrency(weekRevenue)}</p>
          <p className="text-[10px] text-blue-500">aprovado últimos 7 dias</p>
        </Link>
        <Link href="/dashboards/financeiro" className="glass glass-hover rounded-2xl p-5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">Financeiro</h3>
          </div>
          <p className="text-xs text-blue-400">auditoria operacional</p>
          <Link href="/financeiro" className="text-xs text-blue-400 hover:text-blue-300">Acessar →</Link>
        </Link>
        <Link href="/dashboards/prestadores" className="glass glass-hover rounded-2xl p-5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white">Prestadores</h3>
          </div>
          <p className="text-xs text-blue-400">{activeProviders ?? 0} ativos · {dormantProviders ?? 0} dormentes</p>
        </Link>
        <Link href="/ocorrencias" className="glass glass-hover rounded-2xl p-5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-white">Ocorrências</h3>
          </div>
          <p className="text-xs text-blue-400">{openOccurrences} abertas</p>
        </Link>
      </div>
    </div>
  )
}
