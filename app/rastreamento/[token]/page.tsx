import { notFound } from 'next/navigation'
import { MapPin, Package, Truck, CheckCircle, Clock, AlertTriangle, Phone, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { fmtDateTime } from '@/lib/utils/format'
import { CheckpointType, OrderStatus } from '@/lib/types'

const statusInfo: Record<OrderStatus, { label: string; desc: string; icon: React.ElementType; textColor: string; bgStyle: React.CSSProperties; iconColor: string }> = {
  criado:      { label:'Pedido criado',         desc:'Seu pedido foi registrado e está sendo processado.', icon: Clock,          textColor:'#CBD5E1', iconColor:'#94A3B8', bgStyle:{ background:'rgba(148,163,184,0.1)',border:'1px solid rgba(148,163,184,0.25)' } },
  aceito:      { label:'Pedido aceito',          desc:'Seu pedido foi aceito e estamos localizando um motorista.', icon: CheckCircle, textColor:'#7DD3FC', iconColor:'#38BDF8', bgStyle:{ background:'rgba(56,189,248,0.1)',border:'1px solid rgba(56,189,248,0.25)' } },
  alocado:     { label:'Motorista confirmado',   desc:'Motorista e veículo confirmados para seu frete.', icon: Truck,          textColor:'#93C5FD', iconColor:'#60A5FA', bgStyle:{ background:'rgba(96,165,250,0.1)',border:'1px solid rgba(96,165,250,0.25)' } },
  radar_ativo: { label:'Monitoramento ativo',    desc:'A viagem foi iniciada. Acompanhe em tempo real.', icon: Truck,          textColor:'#C4B5FD', iconColor:'#A78BFA', bgStyle:{ background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.25)' } },
  em_rota:     { label:'Em rota de entrega',     desc:'O motorista está em rota para o endereço de entrega.', icon: Truck,     textColor:'#C4B5FD', iconColor:'#A78BFA', bgStyle:{ background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.25)' } },
  entregue:    { label:'Entregue com sucesso',   desc:'Sua carga foi entregue. Obrigado!',                  icon: CheckCircle, textColor:'#6EE7B7', iconColor:'#34D399', bgStyle:{ background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.25)' } },
  ocorrencia:  { label:'Ocorrência registrada',  desc:'Ocorreu uma intercorrência. Entre em contato.',       icon: AlertTriangle,textColor:'#FCA5A5', iconColor:'#F87171', bgStyle:{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)' } },
  finalizado:  { label:'Frete finalizado',       desc:'Este frete foi encerrado com sucesso.',               icon: CheckCircle, textColor:'#6EE7B7', iconColor:'#34D399', bgStyle:{ background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.25)' } },
}

const cpInfo: Record<CheckpointType, { label: string; color: string }> = {
  saiu_coleta:     { label:'Saiu para Coleta',            color:'#60A5FA' },
  chegou_coleta:   { label:'Chegou na Coleta',            color:'#60A5FA' },
  coletou:         { label:'Carga Coletada',              color:'#38BDF8' },
  saiu_coleta_fim: { label:'Saiu do Local de Coleta',     color:'#60A5FA' },
  em_transito:     { label:'Em Trânsito',                 color:'#A78BFA' },
  chegou_entrega:  { label:'Chegou na Entrega',           color:'#A78BFA' },
  entregue:        { label:'Entregue — POD',              color:'#34D399' },
  finalizado:      { label:'Frete Finalizado',            color:'#34D399' },
  ocorrencia:      { label:'Ocorrência',                  color:'#F87171' },
}

export default async function TrackingPage({ params }: { params: { token: string } }) {
  const supabase = createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, providers(name,vehicle_type,vehicle_plate,phone)')
    .eq('tracking_token', params.token)
    .single()

  if (!order) notFound()

  const { data: checkpointsData } = await supabase
    .from('checkpoints')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: true })

  const checkpoints = checkpointsData ?? []
  const info = statusInfo[order.status as OrderStatus] ?? statusInfo.criado
  const StatusIcon = info.icon

  return (
    <div className="min-h-screen" style={{ background:'#020C1F',backgroundImage:'radial-gradient(ellipse 100% 60% at 10% 0%,rgba(12,35,120,0.5) 0%,transparent 60%),radial-gradient(ellipse 70% 50% at 90% 100%,rgba(5,16,60,0.4) 0%,transparent 60%)' }}>
      {/* Top bar */}
      <div className="py-3 px-4" style={{ background:'rgba(2,8,30,0.9)',borderBottom:'1px solid rgba(255,255,255,0.07)',backdropFilter:'blur(20px)' }}>
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background:'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
            <Truck className="w-3 h-3 text-white" />
          </div>
          <span className="text-white text-sm font-extrabold tracking-wide">RADAR</span>
          <span className="text-blue-400 text-[9px] font-bold tracking-[0.25em] uppercase">VINCOLOG</span>
          <span className="text-blue-600 text-xs ml-auto">Rastreamento</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4 pb-8">
        {/* Protocol */}
        <div className="text-center pt-2">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Pedido</p>
          <p className="text-2xl font-extrabold text-white font-mono mt-0.5">{order.protocol}</p>
          <p className="text-sm text-blue-400 mt-0.5">{order.client_name}</p>
        </div>

        {/* Status hero */}
        <div className="rounded-2xl p-5" style={info.bgStyle}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background:`${info.iconColor}22`,border:`1px solid ${info.iconColor}44`,boxShadow:`0 0 20px ${info.iconColor}33` }}>
              <StatusIcon className="w-7 h-7" style={{ color: info.iconColor }} />
            </div>
            <div>
              <p className="text-lg font-extrabold" style={{ color: info.textColor }}>{info.label}</p>
              <p className="text-sm mt-0.5 text-blue-300">{info.desc}</p>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.05)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Rota</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:'#38BDF8',boxShadow:'0 0 8px rgba(56,189,248,0.6)' }} />
              <div>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Coleta</p>
                <p className="text-sm text-blue-200">{order.origin_address}</p>
                <p className="text-sm font-bold text-white">{order.origin_city}</p>
              </div>
            </div>
            <div className="ml-1 w-px h-5 bg-blue-900" />
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:'#34D399',boxShadow:'0 0 8px rgba(52,211,153,0.6)' }} />
              <div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Entrega</p>
                <p className="text-sm text-blue-200">{order.destination_address}</p>
                <p className="text-sm font-bold text-white">{order.destination_city}</p>
              </div>
            </div>
          </div>
          {order.cargo_description && (
            <p className="mt-4 pt-3 text-xs text-blue-500" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              {order.cargo_description} {order.cargo_weight ? `· ${order.cargo_weight}` : ''}
            </p>
          )}
        </div>

        {/* Driver */}
        {order.providers && (
          <div className="rounded-2xl p-5" style={{ background:'rgba(59,130,246,0.08)',border:'1px solid rgba(96,165,250,0.2)' }}>
            <h3 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2"><Truck className="w-3.5 h-3.5" /> Motorista</h3>
            <p className="text-sm font-bold text-white">{order.providers.name}</p>
            <p className="text-xs text-blue-400 mt-0.5">{order.providers.vehicle_type} · {order.providers.vehicle_plate}</p>
          </div>
        )}

        {/* Timeline */}
        {checkpoints.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.05)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider">Atualizações</h3>
            <div className="relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-px" style={{ background:'rgba(255,255,255,0.08)' }} />
              <div className="space-y-4">
                {checkpoints.map(cp => {
                  const cfg = cpInfo[cp.type as CheckpointType] ?? { label: cp.type, color: '#60A5FA' }
                  return (
                    <div key={cp.id} className="flex gap-4 relative">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                        style={{ background:`${cfg.color}22`,border:`1px solid ${cfg.color}44` }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
                        {cp.description && <p className="text-xs text-blue-400 mt-0.5">{cp.description}</p>}
                        {cp.occurrence_type && <p className="text-xs text-red-400 mt-0.5">Tipo: {cp.occurrence_type}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-blue-600">{fmtDateTime(cp.created_at)}</span>
                          {cp.city && <span className="text-[11px] text-blue-600 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{cp.city}</span>}
                        </div>
                        {cp.pod_recipient_name && <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> POD: {cp.pod_recipient_name}</p>}
                        {cp.photo_urls?.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {cp.photo_urls.map((url: string, i: number) => (
                              <a key={i} href={url} target="_blank" className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 hover:text-blue-300">
                                <Camera className="w-3 h-3" /> Foto {i+1}
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
          </div>
        )}

        {/* Contact */}
        <div className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background:'rgba(255,255,255,0.05)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <p className="text-xs text-blue-500">Dúvidas sobre sua entrega?</p>
            <p className="text-sm font-bold text-white mt-0.5">Fale pelo WhatsApp</p>
          </div>
          <a href="https://wa.me/5511999999999"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background:'rgba(22,163,74,0.35)',border:'1px solid rgba(34,197,94,0.4)' }}>
            <Phone className="w-4 h-4 text-green-400" /> WhatsApp
          </a>
        </div>

        <p className="text-center text-[11px] text-blue-700 pb-2">
          Rastreamento por <strong className="text-blue-600">RADAR VINCOLOG</strong> · {order.tracking_token}
        </p>
      </div>
    </div>
  )
}
