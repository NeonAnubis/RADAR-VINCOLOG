import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, MapPin, Package, User, Truck, FileText,
  CheckCircle, Camera, ExternalLink, Share2, AlertTriangle,
  Clock, Phone, Mail,
} from 'lucide-react'
import { getOrderById, getProviderById } from '@/lib/mockData'
import { OrderStatusBadge } from '@/components/StatusBadge'
import { CheckpointType } from '@/lib/types'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const cpConfig: Record<CheckpointType, { label: string; icon: React.ElementType; dot: string; glow: string }> = {
  aguardando_coleta: { label: 'Aguardando Coleta', icon: Clock,         dot: '#F59E0B', glow: 'rgba(245,158,11,0.4)' },
  coletado:          { label: 'Coletado',          icon: Package,       dot: '#38BDF8', glow: 'rgba(56,189,248,0.4)' },
  em_rota:           { label: 'Em Rota',           icon: Truck,         dot: '#A78BFA', glow: 'rgba(167,139,250,0.4)' },
  entregue:          { label: 'Entregue',          icon: CheckCircle,   dot: '#34D399', glow: 'rgba(52,211,153,0.4)' },
  ocorrencia:        { label: 'Ocorrência',        icon: AlertTriangle, dot: '#F87171', glow: 'rgba(248,113,113,0.4)' },
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = getOrderById(params.id)
  if (!order) notFound()

  const provider = order.providerId ? getProviderById(order.providerId) : null
  const trackingUrl = `/rastreamento/${order.trackingToken}`

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pedidos" className="p-2 rounded-xl text-blue-400 hover:text-white transition-colors glass">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white font-mono">{order.protocol}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-blue-400 mt-0.5">Criado em {formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={trackingUrl} target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-300 hover:text-white transition-colors glass">
            <ExternalLink className="w-4 h-4" /> Link do cliente
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}>
            <Share2 className="w-4 h-4" /> WhatsApp
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Occurrence */}
          {order.status === 'ocorrencia' && (
            <div className="p-4 rounded-2xl flex items-start gap-3"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-300">Ocorrência registrada</p>
                <p className="text-sm text-red-400/90 mt-0.5">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Route */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-blue-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <MapPin className="w-4 h-4" /> Rota
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(96,165,250,0.25)' }}>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Ponto A — Coleta</p>
                <p className="text-sm font-bold text-white">{order.originCity}</p>
                <p className="text-xs text-blue-400 mt-0.5">{order.originAddress}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-5 h-px bg-blue-700" />
                <Truck className="w-4 h-4 text-blue-500" />
                <div className="w-5 h-px bg-blue-700" />
              </div>
              <div className="flex-1 p-3 rounded-xl" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Ponto B — Entrega</p>
                <p className="text-sm font-bold text-white">{order.destinationCity}</p>
                <p className="text-xs text-emerald-500/80 mt-0.5">{order.destinationAddress}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Carga',      val: order.cargoDescription },
                { label: 'Peso',       val: order.cargoWeight },
                { label: 'Valor',      val: `R$ ${order.value.toLocaleString('pt-BR')}`, bold: true },
              ].map(({ label, val, bold }) => (
                <div key={label} className="p-2 text-center rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px] text-blue-400 uppercase tracking-wider">{label}</p>
                  <p className={`text-sm mt-0.5 ${bold ? 'font-extrabold text-white' : 'font-medium text-blue-100'}`}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-blue-300 mb-5 flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-4 h-4" /> Linha do Tempo
            </h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="space-y-5">
                {order.checkpoints.map(cp => {
                  const cfg = cpConfig[cp.type]
                  const Icon = cfg.icon
                  return (
                    <div key={cp.id} className="flex gap-4 relative">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                        style={{ background: `${cfg.dot}22`, border: `1px solid ${cfg.dot}55`, boxShadow: `0 0 10px ${cfg.glow}` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: cfg.dot }} />
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-bold" style={{ color: cfg.dot }}>{cfg.label}</p>
                          <span className="text-xs text-blue-500 whitespace-nowrap ml-3">{formatDateTime(cp.timestamp)}</span>
                        </div>
                        <p className="text-sm text-blue-300 mt-0.5">{cp.description}</p>
                        {cp.city && (
                          <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {cp.city}
                          </p>
                        )}
                        {cp.photoUrl && (
                          <button className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors glass-sm">
                            <Camera className="w-3 h-3" /> Ver foto de evidência
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {order.pod && (
              <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">POD — Prova de Entrega</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-100">Assinado por: <strong className="text-white">{order.pod.recipientName}</strong></p>
                    <p className="text-xs text-blue-500 mt-0.5">{formatDateTime(order.pod.signedAt)}</p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-300 transition-colors glass-sm">
                    <Camera className="w-3.5 h-3.5" /> Ver POD
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Client */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-blue-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <User className="w-4 h-4" /> Cliente
            </h2>
            <p className="text-sm font-bold text-white">{order.clientName}</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-300"><Phone className="w-3.5 h-3.5 text-blue-500" />{order.clientPhone}</div>
              <div className="flex items-center gap-2 text-sm text-blue-300"><Mail  className="w-3.5 h-3.5 text-blue-500" />{order.clientEmail}</div>
            </div>
            <div className="mt-4 pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400">Ordem de coleta</span>
                {order.collectionOrderSent
                  ? <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Enviada</span>
                  : <button className="text-blue-400 font-semibold hover:text-blue-300">Enviar agora</button>}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400">Link de rastreamento</span>
                <Link href={trackingUrl} target="_blank" className="text-blue-400 font-semibold hover:text-blue-300 flex items-center gap-1">
                  Abrir <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Provider */}
          {provider ? (
            <div className="glass rounded-2xl p-5">
              <h2 className="text-sm font-bold text-blue-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Truck className="w-4 h-4" /> Prestador
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full glass-sm flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-300">{provider.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{provider.name}</p>
                  <p className="text-xs text-blue-400">{provider.vehicleType} · {provider.vehiclePlate}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2 text-sm text-blue-300"><Phone className="w-3.5 h-3.5 text-blue-500" />{provider.phone}</div>
              </div>
              <Link href={`/prestadores/${provider.id}`} className="mt-3 block text-xs font-bold text-blue-400 hover:text-blue-300">
                Ver perfil completo →
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <h2 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2"><Truck className="w-4 h-4" /> Sem Prestador</h2>
              <p className="text-xs text-amber-400/80">Nenhum motorista alocado para este frete.</p>
              <button className="mt-3 w-full py-2 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: 'rgba(245,158,11,0.3)', border: '1px solid rgba(245,158,11,0.4)' }}>
                Alocar motorista
              </button>
            </div>
          )}

          {/* Contract */}
          {order.contractId && (
            <div className="glass rounded-2xl p-5">
              <h2 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <FileText className="w-4 h-4" /> Contrato
              </h2>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-500 font-mono">#{order.contractId.toUpperCase()}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Assinado</span>
              </div>
              <Link href="/contratos" className="mt-3 block text-xs font-bold text-blue-400 hover:text-blue-300">Ver contrato →</Link>
            </div>
          )}

          {/* Token */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Token de rastreamento</p>
            <code className="text-xs text-blue-400 font-mono break-all">{order.trackingToken}</code>
            <div className="mt-2 p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <p className="text-[10px] text-blue-600 font-mono break-all">vincolog.com/rastreamento/{order.trackingToken}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
