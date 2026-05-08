import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, Truck, Phone, Star, Package,
  FileText, CreditCard, CheckCircle, Moon, RotateCcw,
} from 'lucide-react'
import { getProviderById, getOrdersByProvider } from '@/lib/mockData'
import { ProviderStatusBadge, OrderStatusBadge } from '@/components/StatusBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const sectionTitle = "text-xs font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wider"

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const provider = getProviderById(params.id)
  if (!provider) notFound()

  const orders    = getOrdersByProvider(params.id)
  const isDormant = provider.status === 'adormecido'

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/prestadores" className="p-2 rounded-xl text-blue-400 hover:text-white transition-colors glass">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Perfil do Prestador</h1>
          <p className="text-sm text-blue-400">Detalhes e histórico de fretes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-extrabold mb-3 border-2"
                style={isDormant
                  ? { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#475569' }
                  : { background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(96,165,250,0.3)', color: '#93C5FD' }}>
                {provider.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
              </div>
              <h2 className="text-base font-extrabold text-white">{provider.name}</h2>
              <div className="mt-1.5"><ProviderStatusBadge status={provider.status} /></div>
              <div className="mt-2 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-extrabold text-white">{provider.rating}</span>
                <span className="text-xs text-blue-500">/ 5.0</span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { icon: Phone,    val: provider.phone },
                { icon: Truck,    val: `${provider.vehicleType} · ${provider.vehiclePlate}` },
                { icon: FileText, val: `CPF: ${provider.cpf}` },
              ].map(({ icon: Icon, val }) => (
                <div key={val} className="flex items-center gap-3 text-sm text-blue-300">
                  <Icon className="w-4 h-4 text-blue-500" /> {val}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 space-y-2 text-xs text-blue-500"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { label: 'Cadastrado em',  val: formatDate(provider.createdAt) },
                ...(provider.lastFreteDate ? [{ label: 'Último frete', val: formatDate(provider.lastFreteDate) }] : []),
                { label: 'Total de fretes', val: String(provider.totalFretes) },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between">
                  <span>{label}</span>
                  <span className="font-bold text-blue-300">{val}</span>
                </div>
              ))}
            </div>

            {isDormant ? (
              <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}>
                <RotateCcw className="w-4 h-4" /> Reativar prestador
              </button>
            ) : (
              <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-blue-400 hover:text-white transition-all glass">
                <Moon className="w-4 h-4" /> Colocar em adormecido
              </button>
            )}
          </div>

          {/* Contract */}
          <div className="glass rounded-2xl p-5">
            <h3 className={sectionTitle}><FileText className="w-4 h-4" /> Contrato</h3>
            {provider.contractSigned ? (
              <div>
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-bold">Assinado digitalmente</span>
                </div>
                {provider.contractDate && <p className="text-xs text-blue-500 mt-1">em {formatDate(provider.contractDate)}</p>}
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-amber-400">Pendente de assinatura</p>
                <button className="mt-2 text-xs font-bold text-blue-400 hover:text-blue-300">Reenviar link de assinatura →</button>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="glass rounded-2xl p-5">
            <h3 className={sectionTitle}><CreditCard className="w-4 h-4" /> Pagamento</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Banco', val: provider.bankName || '—' },
                { label: 'Pix',   val: provider.pixKey   || '—' },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-blue-400">{label}</span>
                  <span className="font-semibold text-blue-200 text-xs">{val}</span>
                </div>
              ))}
              {provider.status === 'ativo' && (
                <>
                  <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
                  {[
                    { label: 'Adiantamento',   val: `R$ ${(provider.advanceAmount ?? 0).toLocaleString('pt-BR')}` },
                    { label: 'Saldo a pagar',  val: `R$ ${(provider.balanceAmount  ?? 0).toLocaleString('pt-BR')}`, bold: true },
                  ].map(({ label, val, bold }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-blue-400">{label}</span>
                      <span className={`${bold ? 'font-extrabold text-white' : 'font-semibold text-blue-200'}`}>{val}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white">Histórico de Fretes</h2>
              <p className="text-xs text-blue-500 mt-0.5">{orders.length} frete{orders.length !== 1 ? 's' : ''} realizado{orders.length !== 1 ? 's' : ''} com este prestador</p>
            </div>
            {orders.length === 0 ? (
              <div className="p-10 text-center">
                <Package className="w-10 h-10 text-blue-900 mx-auto mb-3" />
                <p className="text-sm text-blue-600">Nenhum frete registrado ainda.</p>
              </div>
            ) : (
              <div>
                {orders.map(order => (
                  <Link key={order.id} href={`/pedidos/${order.id}`}
                    className="flex items-center gap-4 px-5 py-4 transition-colors glass-hover"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{order.protocol}</span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-blue-400 mt-0.5">{order.clientName}</p>
                      <p className="text-xs text-blue-500">{order.originCity} → {order.destinationCity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-extrabold text-white">R$ {order.value.toLocaleString('pt-BR')}</p>
                      <p className="text-xs text-blue-500">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
