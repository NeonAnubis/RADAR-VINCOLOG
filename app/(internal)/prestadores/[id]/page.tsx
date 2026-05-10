import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Truck, Phone, Star, FileText, CreditCard, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProviderStatusBadge, OrderStatusBadge } from '@/components/StatusBadge'
import { fmtDate, fmtCurrency } from '@/lib/utils/format'
import ToggleStatusButton from './ToggleStatusButton'
import UploadVehiclePhotoButton from './UploadVehiclePhotoButton'

export default async function ProviderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: provider } = await supabase.from('providers').select('*').eq('id', params.id).single()
  if (!provider) notFound()

  const { data: orders } = await supabase
    .from('orders')
    .select('id,protocol,status,client_name,origin_city,destination_city,frete_value,created_at')
    .eq('provider_id', params.id)
    .order('created_at', { ascending: false })

  const isDormant = provider.status === 'adormecido'

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/prestadores" className="p-2 rounded-xl text-blue-400 hover:text-white glass">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Perfil do Prestador</h1>
          <p className="text-sm text-blue-400">Detalhes e histórico de fretes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-extrabold mb-3 border-2"
                style={isDormant
                  ? { background:'rgba(255,255,255,0.05)',borderColor:'rgba(255,255,255,0.1)',color:'#475569' }
                  : { background:'rgba(59,130,246,0.15)',borderColor:'rgba(96,165,250,0.3)',color:'#93C5FD' }}>
                {provider.name.split(' ').map((n: string)=>n[0]).slice(0,2).join('')}
              </div>
              <h2 className="text-base font-extrabold text-white">{provider.name}</h2>
              <div className="mt-1.5"><ProviderStatusBadge status={provider.status} /></div>
              <div className="mt-2 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-extrabold text-white">{provider.rating}</span>
                <span className="text-xs text-blue-500">/ 5.0</span>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {[
                { icon: Phone,    val: provider.phone },
                { icon: Truck,    val: `${provider.vehicle_type} · ${provider.vehicle_plate}` },
                { icon: FileText, val: `CPF: ${provider.cpf ?? '—'}` },
                { icon: FileText, val: `CNH: ${provider.cnh ?? '—'}` },
              ].filter(r => r.val).map(({ icon: Icon, val }) => (
                <div key={val} className="flex items-center gap-3 text-sm text-blue-300">
                  <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" /> {val}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 space-y-2 text-xs" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              {[['Cadastrado em', fmtDate(provider.created_at)],['Total de fretes', provider.total_fretes]].map(([l,v]) => (
                <div key={l as string} className="flex justify-between">
                  <span className="text-blue-500">{l}</span>
                  <span className="font-bold text-blue-300">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <ToggleStatusButton providerId={provider.id} currentStatus={provider.status} />
            </div>
          </div>

          {/* Vehicle photos */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Truck className="w-4 h-4" /> Fotos do Veículo
            </h3>
            {provider.vehicle_photos?.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {provider.vehicle_photos.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" className="aspect-video rounded-lg overflow-hidden block"
                    style={{ background:'rgba(255,255,255,0.05)' }}>
                    <img src={url} alt={`Foto ${i+1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            ) : <p className="text-xs text-blue-600 mb-3">Nenhuma foto cadastrada.</p>}
            <UploadVehiclePhotoButton providerId={provider.id} />
          </div>

          {/* Contract */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wider"><FileText className="w-4 h-4" /> Contrato</h3>
            {provider.contract_signed
              ? <div className="flex items-center gap-2 text-sm text-emerald-400"><CheckCircle className="w-4 h-4" /><span className="font-bold">Assinado</span> <span className="text-xs text-blue-500">em {fmtDate(provider.contract_date)}</span></div>
              : <p className="text-sm font-bold text-amber-400">Pendente de assinatura</p>}
          </div>

          {/* Payment */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wider"><CreditCard className="w-4 h-4" /> Pagamento</h3>
            <div className="space-y-2 text-sm">
              {[['Banco', provider.bank_name ?? '—'],['Pix', provider.pix_key ?? '—']].map(([l,v]) => (
                <div key={l} className="flex justify-between"><span className="text-blue-400">{l}</span><span className="font-semibold text-blue-200 text-xs">{v}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl">
            <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white">Histórico de Fretes</h2>
              <p className="text-xs text-blue-500 mt-0.5">{orders?.length ?? 0} fretes</p>
            </div>
            {!orders?.length ? (
              <div className="p-10 text-center"><p className="text-sm text-blue-600">Nenhum frete registrado.</p></div>
            ) : (
              <div>
                {orders.map(o => (
                  <Link key={o.id} href={`/pedidos/${o.id}`}
                    className="flex items-center gap-4 px-5 py-4 glass-hover transition-colors"
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{o.protocol}</span>
                        <OrderStatusBadge status={o.status} />
                      </div>
                      <p className="text-xs text-blue-400 mt-0.5">{o.client_name}</p>
                      <p className="text-xs text-blue-500">{o.origin_city} → {o.destination_city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-white">{fmtCurrency(o.frete_value)}</p>
                      <p className="text-xs text-blue-500">{fmtDate(o.created_at)}</p>
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
