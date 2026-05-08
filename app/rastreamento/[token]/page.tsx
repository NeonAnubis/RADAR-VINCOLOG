import { notFound } from 'next/navigation'
import {
  MapPin, Package, Truck, CheckCircle, Clock,
  AlertTriangle, Phone, Camera,
} from 'lucide-react'
import { getOrderByToken } from '@/lib/mockData'
import { CheckpointType, OrderStatus } from '@/lib/types'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const statusInfo: Record<OrderStatus, {
  label: string; desc: string; icon: React.ElementType
  textColor: string; bgStyle: React.CSSProperties; iconColor: string
}> = {
  aguardando: {
    label: 'Aguardando coleta', desc: 'Seu pedido foi registrado e estamos aguardando a coleta.',
    icon: Clock, textColor: '#FCD34D', iconColor: '#F59E0B',
    bgStyle: { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' },
  },
  coletado: {
    label: 'Carga coletada', desc: 'Sua carga foi coletada pelo motorista.',
    icon: Package, textColor: '#7DD3FC', iconColor: '#38BDF8',
    bgStyle: { background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)' },
  },
  em_rota: {
    label: 'Em rota de entrega', desc: 'O motorista está em rota para o endereço de entrega.',
    icon: Truck, textColor: '#C4B5FD', iconColor: '#A78BFA',
    bgStyle: { background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)' },
  },
  entregue: {
    label: 'Entregue com sucesso', desc: 'Sua carga foi entregue com sucesso. Obrigado pela preferência!',
    icon: CheckCircle, textColor: '#6EE7B7', iconColor: '#34D399',
    bgStyle: { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' },
  },
  ocorrencia: {
    label: 'Ocorrência registrada', desc: 'Ocorreu uma intercorrência na entrega. Entre em contato.',
    icon: AlertTriangle, textColor: '#FCA5A5', iconColor: '#F87171',
    bgStyle: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' },
  },
}

const cpInfo: Record<CheckpointType, { label: string; icon: React.ElementType; color: string; glow: string }> = {
  aguardando_coleta: { label: 'Pedido criado', icon: Clock,         color: '#F59E0B', glow: 'rgba(245,158,11,0.3)' },
  coletado:          { label: 'Coletado',      icon: Package,       color: '#38BDF8', glow: 'rgba(56,189,248,0.3)' },
  em_rota:           { label: 'Em rota',       icon: Truck,         color: '#A78BFA', glow: 'rgba(167,139,250,0.3)' },
  entregue:          { label: 'Entregue',      icon: CheckCircle,   color: '#34D399', glow: 'rgba(52,211,153,0.3)' },
  ocorrencia:        { label: 'Ocorrência',    icon: AlertTriangle, color: '#F87171', glow: 'rgba(248,113,113,0.3)' },
}

const stepOrder: CheckpointType[] = ['aguardando_coleta', 'coletado', 'em_rota', 'entregue']

export default function TrackingPage({ params }: { params: { token: string } }) {
  const order = getOrderByToken(params.token)
  if (!order) notFound()

  const info     = statusInfo[order.status]
  const StatusIcon = info.icon
  const stepsDone = stepOrder.indexOf(
    order.status === 'ocorrencia' ? 'em_rota' : order.status as CheckpointType
  )

  return (
    <div className="min-h-screen" style={{ background: '#020C1F', backgroundImage: 'radial-gradient(ellipse 100% 60% at 10% 0%, rgba(12,35,120,0.5) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 90% 100%, rgba(5,16,60,0.4) 0%, transparent 60%)' }}>

      {/* Top bar */}
      <div className="py-3 px-4" style={{ background: 'rgba(2,8,30,0.9)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
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
          <p className="text-sm text-blue-400 mt-0.5">{order.clientName}</p>
        </div>

        {/* Status hero */}
        <div className="rounded-2xl p-5" style={info.bgStyle}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${info.iconColor}22`, border: `1px solid ${info.iconColor}44`, boxShadow: `0 0 20px ${info.iconColor}33` }}>
              <StatusIcon className="w-7 h-7" style={{ color: info.iconColor }} />
            </div>
            <div>
              <p className="text-lg font-extrabold" style={{ color: info.textColor }}>{info.label}</p>
              <p className="text-sm mt-0.5 text-blue-300">{info.desc}</p>
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center">
            {stepOrder.map((step, i) => {
              const done   = i <= stepsDone
              const Icon   = cpInfo[step].icon
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={done
                        ? { background: `${cpInfo[step].color}25`, border: `1px solid ${cpInfo[step].color}55`, boxShadow: `0 0 10px ${cpInfo[step].glow}` }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Icon className="w-4 h-4" style={{ color: done ? cpInfo[step].color : '#334155' }} />
                    </div>
                    <p className="text-[10px] mt-1 font-bold text-center max-w-[60px]"
                      style={{ color: done ? cpInfo[step].color : '#334155' }}>
                      {cpInfo[step].label}
                    </p>
                  </div>
                  {i < stepOrder.length - 1 && (
                    <div className="flex-1 h-px mb-4 mx-1" style={{ background: i < stepsDone ? cpInfo[step].color + '55' : 'rgba(255,255,255,0.1)' }} />
                  )}
                </div>
              )
            })}
          </div>
          {order.status === 'ocorrencia' && (
            <div className="mt-3 p-3 rounded-xl flex items-start gap-2"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Route */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Rota
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#38BDF8', boxShadow: '0 0 8px rgba(56,189,248,0.6)' }} />
              <div>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Coleta</p>
                <p className="text-sm text-blue-200">{order.originAddress}</p>
                <p className="text-sm font-bold text-white">{order.originCity}</p>
              </div>
            </div>
            <div className="ml-1 w-px h-5 bg-blue-900" />
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#34D399', boxShadow: '0 0 8px rgba(52,211,153,0.6)' }} />
              <div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Entrega</p>
                <p className="text-sm text-blue-200">{order.destinationAddress}</p>
                <p className="text-sm font-bold text-white">{order.destinationCity}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 text-xs text-blue-500 flex gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <span>{order.cargoDescription}</span>
            <span>·</span>
            <span>{order.cargoWeight}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider">Atualizações</h3>
          <div className="relative">
            <div className="absolute left-3.5 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="space-y-4">
              {order.checkpoints.map(cp => {
                const cfg = cpInfo[cp.type]
                const Icon = cfg.icon
                return (
                  <div key={cp.id} className="flex gap-4 relative">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                      style={{ background: `${cfg.color}22`, border: `1px solid ${cfg.color}44`, boxShadow: `0 0 8px ${cfg.glow}` }}>
                      <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
                      <p className="text-xs text-blue-400 mt-0.5">{cp.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-blue-600">{formatDateTime(cp.timestamp)}</span>
                        {cp.city && <span className="text-[11px] text-blue-600 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{cp.city}</span>}
                      </div>
                      {cp.photoUrl && (
                        <button className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-blue-400 hover:text-blue-300">
                          <Camera className="w-3 h-3" /> Ver foto
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* POD */}
        {order.pod && (
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <h3 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5" /> Comprovante de Entrega (POD)
            </h3>
            <p className="text-sm text-blue-200">
              Recebido por: <strong className="text-white">{order.pod.recipientName}</strong>
            </p>
            <p className="text-xs text-blue-500 mt-1">{formatDateTime(order.pod.signedAt)}</p>
            <button className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300">
              <Camera className="w-3.5 h-3.5" /> Ver foto e assinatura
            </button>
          </div>
        )}

        {/* Contact */}
        <div className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <p className="text-xs text-blue-500">Dúvidas sobre sua entrega?</p>
            <p className="text-sm font-bold text-white mt-0.5">Fale pelo WhatsApp</p>
          </div>
          <a href="https://wa.me/5511999999999"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'rgba(22,163,74,0.35)', border: '1px solid rgba(34,197,94,0.4)' }}>
            <Phone className="w-4 h-4 text-green-400" /> WhatsApp
          </a>
        </div>

        <p className="text-center text-[11px] text-blue-700 pb-2">
          Rastreamento por <strong className="text-blue-600">RADAR VINCOLOG</strong> · {order.trackingToken}
        </p>
      </div>
    </div>
  )
}
