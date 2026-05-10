import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, MapPin, Package, User, Truck, FileText,
  CheckCircle, Camera, ExternalLink, AlertTriangle,
  Clock, Phone, Mail, Play, Flag, PenLine,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OrderStatusBadge } from '@/components/StatusBadge'
import { fmtDateTime, fmtCurrency, fmtDate } from '@/lib/utils/format'
import { DbOrder, DbCheckpoint, DbContract, CheckpointType } from '@/lib/types'
import AcceptOrderButton from './AcceptOrderButton'
import ActivateMonitoringButton from './ActivateMonitoringButton'
import FinalizeOrderButton from './FinalizeOrderButton'
import AddCheckpointForm from './AddCheckpointForm'

const cpLabel: Record<CheckpointType, string> = {
  saiu_coleta:     'Saiu para Coleta',
  chegou_coleta:   'Chegou na Coleta',
  coletou:         'Coletou Carga',
  saiu_coleta_fim: 'Saiu do Local de Coleta',
  em_transito:     'Em Trânsito',
  chegou_entrega:  'Chegou na Entrega',
  entregue:        'Entregue — POD',
  finalizado:      'Finalizado',
  ocorrencia:      'Ocorrência',
}
const cpColor: Record<CheckpointType, string> = {
  saiu_coleta:'#60A5FA',chegou_coleta:'#60A5FA',coletou:'#38BDF8',
  saiu_coleta_fim:'#60A5FA',em_transito:'#A78BFA',chegou_entrega:'#A78BFA',
  entregue:'#34D399',finalizado:'#34D399',ocorrencia:'#F87171',
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: orderData } = await supabase
    .from('orders')
    .select('*, providers(*)')
    .eq('id', params.id)
    .single()

  if (!orderData) notFound()
  const order = orderData as DbOrder

  const { data: checkpointsData } = await supabase
    .from('checkpoints')
    .select('*')
    .eq('order_id', params.id)
    .order('created_at', { ascending: true })

  const checkpoints = (checkpointsData ?? []) as DbCheckpoint[]

  const { data: contractData } = await supabase
    .from('contracts')
    .select('*')
    .eq('order_id', params.id)
    .maybeSingle()

  const contract = contractData as DbContract | null

  const trackingUrl = `/rastreamento/${order.tracking_token}`

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/pedidos" className="p-2 rounded-xl text-blue-400 hover:text-white glass"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white font-mono">{order.protocol}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-blue-400 mt-0.5">Criado em {fmtDateTime(order.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {order.status === 'criado'      && <AcceptOrderButton orderId={order.id} />}
          {order.status === 'alocado'     && <ActivateMonitoringButton orderId={order.id} />}
          {order.status === 'entregue'    && <FinalizeOrderButton orderId={order.id} />}
          <Link href={trackingUrl} target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-300 hover:text-white glass">
            <ExternalLink className="w-4 h-4" /> Link cliente
          </Link>
        </div>
      </div>

      {/* Status flow breadcrumb */}
      <div className="glass rounded-xl px-5 py-3 flex items-center gap-2 overflow-x-auto">
        {(['criado','aceito','alocado','radar_ativo','em_rota','entregue','finalizado'] as const).map((s, i, arr) => {
          const statuses = ['criado','aceito','alocado','radar_ativo','em_rota','entregue','ocorrencia','finalizado']
          const currentIdx = statuses.indexOf(order.status)
          const thisIdx    = statuses.indexOf(s)
          const done       = currentIdx > thisIdx
          const active     = order.status === s
          const label      = { criado:'Criado',aceito:'Aceito',alocado:'Alocado',radar_ativo:'Radar',em_rota:'Em Rota',entregue:'Entregue',finalizado:'Final' }[s]
          return (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: active ? '#60A5FA' : done ? '#34D399' : '#1E3A5F' }} />
                <span className="text-xs font-semibold" style={{ color: active ? '#93C5FD' : done ? '#6EE7B7' : '#1E3A5F' }}>{label}</span>
              </div>
              {i < arr.length - 1 && <span className="text-blue-900 text-xs">›</span>}
            </div>
          )
        })}
        {order.status === 'ocorrencia' && (
          <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full" style={{ background:'rgba(239,68,68,0.2)',border:'1px solid rgba(239,68,68,0.4)' }}>
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-xs font-bold text-red-300">Ocorrência</span>
          </div>
        )}
      </div>

      {/* Occurrence alert */}
      {order.status === 'ocorrencia' && (
        <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)' }}>
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-300">Ocorrência registrada</p>
            <p className="text-sm text-red-400/90 mt-0.5">{order.notes ?? 'Sem descrição'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Route */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Rota
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1 p-3 rounded-xl" style={{ background:'rgba(59,130,246,0.12)',border:'1px solid rgba(96,165,250,0.25)' }}>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Ponto A — Coleta</p>
                <p className="text-sm font-bold text-white">{order.origin_city}</p>
                <p className="text-xs text-blue-400 mt-0.5">{order.origin_address}</p>
              </div>
              <Truck className="w-4 h-4 text-blue-600" />
              <div className="flex-1 p-3 rounded-xl" style={{ background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.25)' }}>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Ponto B — Entrega</p>
                <p className="text-sm font-bold text-white">{order.destination_city}</p>
                <p className="text-xs text-emerald-500/80 mt-0.5">{order.destination_address}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label:'Carga',  val: order.cargo_description ?? '—' },
                { label:'Peso',   val: order.cargo_weight ?? '—' },
                { label:'Valor',  val: fmtCurrency(order.frete_value), bold: true },
              ].map(({ label, val, bold }) => (
                <div key={label} className="p-2 text-center rounded-lg" style={{ background:'rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px] text-blue-400 uppercase tracking-wider">{label}</p>
                  <p className={`text-sm mt-0.5 ${bold ? 'font-extrabold text-white' : 'font-medium text-blue-100'}`}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Checkpoint Timeline */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" /> Linha do Tempo ({checkpoints.length})
              </h2>
            </div>

            {checkpoints.length === 0 ? (
              <p className="text-sm text-blue-600 text-center py-6">Nenhum checkpoint registrado ainda.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background:'rgba(255,255,255,0.1)' }} />
                <div className="space-y-5">
                  {checkpoints.map(cp => {
                    const color = cpColor[cp.type] ?? '#60A5FA'
                    return (
                      <div key={cp.id} className="flex gap-4 relative">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                          style={{ background:`${color}22`, border:`1px solid ${color}55`, boxShadow:`0 0 10px ${color}44` }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-bold" style={{ color }}>
                              {cpLabel[cp.type]}
                              {cp.occurrence_type && <span className="ml-2 text-xs font-normal opacity-80">({cp.occurrence_type})</span>}
                            </p>
                            <span className="text-xs text-blue-500 whitespace-nowrap ml-3">{fmtDateTime(cp.created_at)}</span>
                          </div>
                          {cp.description && <p className="text-sm text-blue-300 mt-0.5">{cp.description}</p>}
                          {cp.city && <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {cp.city}</p>}
                          {cp.pod_recipient_name && (
                            <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> POD: {cp.pod_recipient_name}</p>
                          )}
                          {cp.photo_urls.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {cp.photo_urls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-400 hover:text-blue-300 glass-sm">
                                  <Camera className="w-3 h-3" /> Foto {i + 1}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Add checkpoint (only for active orders) */}
            {['radar_ativo','em_rota','entregue','ocorrencia'].includes(order.status) && (
              <div className="mt-5 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                <AddCheckpointForm orderId={order.id} />
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Client */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2"><User className="w-4 h-4" /> Cliente</h2>
            <p className="text-sm font-bold text-white">{order.client_name}</p>
            <div className="mt-3 space-y-2">
              {order.client_phone && <div className="flex items-center gap-2 text-sm text-blue-300"><Phone className="w-3.5 h-3.5 text-blue-500" />{order.client_phone}</div>}
              {order.client_email && <div className="flex items-center gap-2 text-sm text-blue-300"><Mail className="w-3.5 h-3.5 text-blue-500" />{order.client_email}</div>}
            </div>
            <div className="mt-4 pt-3 space-y-2" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400">Ordem de Coleta</span>
                {order.collection_order_sent
                  ? <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Enviada</span>
                  : <Link href={`/pedidos/${order.id}/ordem-coleta`} className="text-blue-400 font-bold hover:text-blue-300">Gerar PDF →</Link>}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400">Link rastreamento</span>
                <Link href={trackingUrl} target="_blank" className="text-blue-400 font-bold hover:text-blue-300 flex items-center gap-1">
                  Abrir <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Provider */}
          {order.providers ? (
            <div className="glass rounded-2xl p-5">
              <h2 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2"><Truck className="w-4 h-4" /> Prestador</h2>
              <p className="text-sm font-bold text-white">{order.providers.name}</p>
              <p className="text-xs text-blue-400 mt-0.5">{order.providers.vehicle_type} · {order.providers.vehicle_plate}</p>
              {order.providers.phone && <div className="flex items-center gap-2 text-sm text-blue-300 mt-3"><Phone className="w-3.5 h-3.5 text-blue-500" />{order.providers.phone}</div>}
              {order.providers.cnh && <p className="text-xs text-blue-500 mt-1">CNH: {order.providers.cnh}</p>}
              <Link href={`/prestadores/${order.provider_id}`} className="mt-3 block text-xs font-bold text-blue-400 hover:text-blue-300">Ver perfil →</Link>
            </div>
          ) : (
            <div className="rounded-2xl p-5" style={{ background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)' }}>
              <h2 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-2 uppercase tracking-wider"><Truck className="w-4 h-4" /> Sem Prestador</h2>
              <p className="text-xs text-amber-400/80 mb-3">Nenhum motorista alocado.</p>
              {order.status === 'aceito' && (
                <Link href={`/pedidos/${order.id}/alocar`}
                  className="w-full block text-center py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background:'rgba(245,158,11,0.3)',border:'1px solid rgba(245,158,11,0.4)' }}>
                  Alocar prestador
                </Link>
              )}
            </div>
          )}

          {/* Commercial */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4" /> Comercial</h2>
              <Link href={`/pedidos/${order.id}/comercial`} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"><PenLine className="w-3 h-3" /> Editar</Link>
            </div>
            <div className="space-y-2 text-sm">
              {[['Frete', fmtCurrency(order.frete_value)],['Adiantamento', fmtCurrency(order.advance_amount)],['Saldo', fmtCurrency(order.balance_amount)],['Prazo pgto.', order.payment_deadline ?? '—'],].map(([k,v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-blue-400">{k}</span>
                  <span className="font-bold text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contract */}
          {contract && (
            <div className="glass rounded-2xl p-5">
              <h2 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4" /> Contrato</h2>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-blue-500 font-mono">{contract.id.slice(0,8).toUpperCase()}</span>
                {contract.status === 'assinado'
                  ? <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Assinado</span>
                  : <span className="text-xs font-bold text-amber-400">Pendente</span>}
              </div>
              {contract.signed_url
                ? <a href={contract.signed_url} target="_blank" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Ver contrato assinado</a>
                : <Link href={`/pedidos/${order.id}/contrato`} className="text-xs font-bold text-blue-400 hover:text-blue-300">Upload do contrato assinado →</Link>}
            </div>
          )}

          {/* Timestamps */}
          <div className="rounded-2xl p-4" style={{ background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Histórico de datas</p>
            {[['Criado',order.created_at],['Aceito',order.accepted_at],['Alocado',order.allocated_at],['Radar Ativo',order.radar_active_at],['Finalizado',order.finalized_at]].map(([l,v]) => v && (
              <div key={l} className="flex justify-between text-xs mb-1">
                <span className="text-blue-500">{l}</span>
                <span className="text-blue-300">{fmtDateTime(v as string)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
