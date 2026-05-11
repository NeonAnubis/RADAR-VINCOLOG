import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, FileText, Package, Truck, User, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BudgetStatusBadge, ServiceLevelBadge } from '@/components/StatusBadge'
import { fmtDate, fmtCurrency, fmtDateTime } from '@/lib/utils/format'
import { SERVICE_LEVELS } from '@/lib/types'
import type { DbBudget, DbCollectionPoint, DbDeliveryPoint, ServiceLevel, ServiceLevelOffer } from '@/lib/types'
import GenerateProposalButton from './GenerateProposalButton'
import ApproveBudgetButton from './ApproveBudgetButton'

export default async function BudgetDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: budget } = await supabase.from('budgets').select('*').eq('id', params.id).single()
  if (!budget) notFound()
  const b = budget as DbBudget

  const { data: cps } = await supabase.from('collection_points').select('*').eq('budget_id', params.id).order('sequence')
  const { data: dps } = await supabase.from('delivery_points').select('*').eq('budget_id', params.id).order('sequence')
  const collectionPoints = (cps ?? []) as DbCollectionPoint[]
  const deliveryPoints   = (dps ?? []) as DbDeliveryPoint[]

  // Find linked OIT if approved
  const { data: oit } = await supabase.from('oits').select('id, number').eq('budget_id', params.id).maybeSingle()

  const offered = Object.entries(b.service_levels ?? {})
    .filter(([_, cfg]) => (cfg as ServiceLevelOffer)?.offered) as [ServiceLevel, ServiceLevelOffer][]

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/orcamentos" className="p-2 rounded-xl text-blue-400 hover:text-white glass">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white font-mono">{b.number}</h1>
              <BudgetStatusBadge status={b.status} />
              {b.approved_level && <ServiceLevelBadge level={b.approved_level} />}
            </div>
            <p className="text-sm text-blue-400 mt-0.5">Criado em {fmtDateTime(b.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {b.status !== 'aprovado' && b.status !== 'recusado' && (
            <GenerateProposalButton budget={b} collectionPoints={collectionPoints} deliveryPoints={deliveryPoints} />
          )}
          {b.status !== 'aprovado' && b.status !== 'recusado' && offered.length > 0 && (
            <ApproveBudgetButton budgetId={b.id} offered={offered} />
          )}
          {oit && (
            <Link href={`/oits/${oit.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#34D399,#059669)', boxShadow: '0 4px 14px rgba(52,211,153,0.4)' }}>
              Ver OIT {oit.number} →
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cliente */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2"><User className="w-4 h-4" /> Cliente</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-blue-500 text-xs">Razão Social</p><p className="text-white font-bold">{b.client_name ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">CNPJ/CPF</p><p className="text-blue-200">{b.client_document ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">Contato</p><p className="text-blue-200">{b.client_contact_name ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">Telefone</p><p className="text-blue-200">{b.client_contact_phone ?? '—'}</p></div>
              <div className="col-span-2"><p className="text-blue-500 text-xs">E-mail</p><p className="text-blue-200">{b.client_contact_email ?? '—'}</p></div>
            </div>
          </div>

          {/* Rota A+ → B+ */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Rota A+ → B+
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">{collectionPoints.length} ponto(s) de coleta</p>
                {collectionPoints.map((p, i) => (
                  <div key={p.id} className="p-3 rounded-lg mb-2" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
                    <p className="text-xs font-bold text-blue-300">Coleta #{i+1}: {p.name ?? '—'}</p>
                    <p className="text-sm text-white">{p.full_address ?? '—'}</p>
                    <p className="text-xs text-blue-400">{p.city}/{p.uf} {p.cep ? `· CEP ${p.cep}` : ''}</p>
                    {p.scheduled_date && <p className="text-xs text-blue-400">Data: {fmtDate(p.scheduled_date)} {p.time_window ?? ''}</p>}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">{deliveryPoints.length} ponto(s) de entrega</p>
                {deliveryPoints.map((p, i) => (
                  <div key={p.id} className="p-3 rounded-lg mb-2" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <p className="text-xs font-bold text-emerald-300">Entrega #{i+1}: {p.name ?? '—'}</p>
                    <p className="text-sm text-white">{p.full_address ?? '—'}</p>
                    <p className="text-xs text-blue-400">{p.city}/{p.uf} {p.cep ? `· CEP ${p.cep}` : ''}</p>
                    {p.scheduled_date && <p className="text-xs text-blue-400">Data: {fmtDate(p.scheduled_date)} {p.time_window ?? ''}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Carga */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2"><Package className="w-4 h-4" /> Carga</h2>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="col-span-3"><p className="text-blue-500 text-xs">Descrição</p><p className="text-white">{b.cargo_description ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">Peso</p><p className="text-white">{b.cargo_weight ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">Volumes</p><p className="text-white">{b.cargo_volumes ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">NF</p><p className="text-white">{b.document_number ?? '—'}</p></div>
              {b.document_value && <div><p className="text-blue-500 text-xs">Valor NF</p><p className="text-white">{fmtCurrency(b.document_value)}</p></div>}
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              {b.cargo_sensitive    && <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/35">Sensível</span>}
              {b.cargo_high_value   && <span className="px-2 py-0.5 rounded text-[10px] bg-red-400/20 text-red-300 border border-red-400/35">Alto valor</span>}
              {b.cargo_needs_tarp   && <span className="px-2 py-0.5 rounded text-[10px] bg-blue-400/20 text-blue-300 border border-blue-400/35">Lona</span>}
              {b.cargo_needs_strap  && <span className="px-2 py-0.5 rounded text-[10px] bg-blue-400/20 text-blue-300 border border-blue-400/35">Amarração</span>}
              {b.cargo_needs_tracker && <span className="px-2 py-0.5 rounded text-[10px] bg-blue-400/20 text-blue-300 border border-blue-400/35">Rastreador</span>}
              {b.cargo_needs_photo  && <span className="px-2 py-0.5 rounded text-[10px] bg-blue-400/20 text-blue-300 border border-blue-400/35">Foto</span>}
            </div>
          </div>

          {/* Veículo */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2"><Truck className="w-4 h-4" /> Perfil de Veículo</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-blue-500 text-xs">Tipo</p><p className="text-white">{b.vehicle_suggested_type ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">Carroceria</p><p className="text-white">{b.vehicle_body_type ?? '—'}</p></div>
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              {b.vehicle_exclusive  && <span className="px-2 py-0.5 rounded text-[10px] bg-violet-400/20 text-violet-300 border border-violet-400/35">Exclusivo</span>}
              {b.vehicle_full_load  && <span className="px-2 py-0.5 rounded text-[10px] bg-violet-400/20 text-violet-300 border border-violet-400/35">Lotação</span>}
              {b.operation_dedicated && <span className="px-2 py-0.5 rounded text-[10px] bg-violet-400/20 text-violet-300 border border-violet-400/35">Dedicada</span>}
              {b.operation_aero     && <span className="px-2 py-0.5 rounded text-[10px] bg-violet-400/20 text-violet-300 border border-violet-400/35">Aérea</span>}
              {b.operation_project  && <span className="px-2 py-0.5 rounded text-[10px] bg-violet-400/20 text-violet-300 border border-violet-400/35">Projeto</span>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Service Levels */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider">Níveis de Serviço Ofertados</h2>
            {offered.length === 0 ? (
              <p className="text-xs text-blue-600">Nenhum nível configurado.</p>
            ) : (
              <div className="space-y-2.5">
                {offered.map(([key, cfg]) => {
                  const meta = SERVICE_LEVELS[key]
                  return (
                    <div key={key} className="rounded-lg p-3" style={{ background: `${meta.color}1a`, border: `1px solid ${meta.color}55` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</span>
                        <span className="text-sm font-extrabold text-white">{fmtCurrency(cfg.total)}</span>
                      </div>
                      {cfg.validity && <p className="text-[10px] text-blue-500">Validade: {cfg.validity}</p>}
                      {cfg.notes && <p className="text-[10px] text-blue-400 mt-1">{cfg.notes}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Proposal PDF */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4" /> Proposta</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-500">Status</span>
                <BudgetStatusBadge status={b.status} />
              </div>
              {b.proposal_sent_at && <div className="flex justify-between"><span className="text-blue-500">Enviada em</span><span className="text-blue-200">{fmtDateTime(b.proposal_sent_at)}</span></div>}
              {b.approved_at && <div className="flex justify-between"><span className="text-blue-500">Aprovada em</span><span className="text-emerald-400 font-bold">{fmtDateTime(b.approved_at)}</span></div>}
              {b.approved_value && <div className="flex justify-between"><span className="text-blue-500">Valor aprovado</span><span className="text-white font-bold">{fmtCurrency(b.approved_value)}</span></div>}
            </div>
          </div>

          {/* Commercial conditions */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider">Condições Comerciais</h2>
            <div className="space-y-2 text-xs">
              {b.validity_date     && <div><p className="text-blue-500">Validade</p><p className="text-blue-200">{fmtDate(b.validity_date)}</p></div>}
              {b.payment_condition && <div><p className="text-blue-500">Pagamento</p><p className="text-blue-200">{b.payment_condition}</p></div>}
              {b.premises          && <div><p className="text-blue-500">Premissas</p><p className="text-blue-200">{b.premises}</p></div>}
              {b.exclusions        && <div><p className="text-blue-500">Exclusões</p><p className="text-blue-200">{b.exclusions}</p></div>}
            </div>
          </div>

          {b.needs_operational_approval || b.needs_director_approval ? (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-300">
                  {b.needs_operational_approval && <p>Requer aprovação operacional</p>}
                  {b.needs_director_approval && <p>Requer aprovação da diretoria</p>}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
