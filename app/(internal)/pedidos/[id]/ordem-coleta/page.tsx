import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { fmtDate } from '@/lib/utils/format'
import OCDownloadButton from './OCDownloadButton'
import SendOCButton from './SendOCButton'

export default async function OrdemColetaPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*, providers(*)')
    .eq('id', params.id)
    .single()
  if (!order) notFound()

  const p = order.providers

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/pedidos/${params.id}`} className="p-2 rounded-xl text-blue-400 hover:text-white glass">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Ordem de Coleta</h1>
            <p className="text-sm text-blue-400">{order.protocol}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <SendOCButton orderId={order.id} />
          <OCDownloadButton order={order} />
        </div>
      </div>

      {/* OC Preview */}
      <div id="oc-content" className="glass rounded-2xl p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">RADAR VINCOLOG</p>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Ordem de Coleta</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold text-white font-mono">{order.protocol}</p>
            <p className="text-xs text-blue-400">Emitida: {fmtDate(new Date().toISOString())}</p>
          </div>
        </div>

        <div className="h-px" style={{ background:'rgba(255,255,255,0.1)' }} />

        {/* Route */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Ponto A — Coleta</p>
            <p className="text-sm font-bold text-white">{order.origin_city}</p>
            <p className="text-sm text-blue-300">{order.origin_address}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Ponto B — Entrega</p>
            <p className="text-sm font-bold text-white">{order.destination_city}</p>
            <p className="text-sm text-blue-300">{order.destination_address}</p>
          </div>
        </div>

        {/* Cargo */}
        <div className="p-4 rounded-xl" style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Carga</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-blue-400 text-xs">Descrição</p><p className="text-white font-semibold mt-0.5">{order.cargo_description ?? '—'}</p></div>
            <div><p className="text-blue-400 text-xs">Peso</p><p className="text-white font-semibold mt-0.5">{order.cargo_weight ?? '—'}</p></div>
            <div><p className="text-blue-400 text-xs">Cliente</p><p className="text-white font-semibold mt-0.5">{order.client_name}</p></div>
          </div>
        </div>

        {/* Conductor */}
        {p ? (
          <div className="p-4 rounded-xl" style={{ background:'rgba(59,130,246,0.1)',border:'1px solid rgba(96,165,250,0.25)' }}>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Condutor / Prestador</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-blue-400 text-xs">Nome</p><p className="text-white font-bold mt-0.5">{p.name}</p></div>
              <div><p className="text-blue-400 text-xs">Telefone</p><p className="text-white font-semibold mt-0.5">{p.phone ?? '—'}</p></div>
              <div><p className="text-blue-400 text-xs">CPF</p><p className="text-white font-semibold mt-0.5">{p.cpf ?? '—'}</p></div>
              <div><p className="text-blue-400 text-xs">CNH</p><p className="text-white font-semibold mt-0.5">{p.cnh ?? '—'}</p></div>
              <div><p className="text-blue-400 text-xs">Veículo</p><p className="text-white font-semibold mt-0.5">{p.vehicle_type} — {p.vehicle_plate}</p></div>
            </div>
            {p.vehicle_photos.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Fotos do Veículo</p>
                <div className="flex gap-2 flex-wrap">
                  {p.vehicle_photos.slice(0, 4).map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" className="w-20 h-16 rounded-lg overflow-hidden block"
                      style={{ background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.1)' }}>
                      <img src={url} alt={`Foto veículo ${i+1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl" style={{ background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.25)' }}>
            <p className="text-sm text-amber-400">⚠ Nenhum prestador alocado. Aloque um prestador antes de emitir a OC.</p>
          </div>
        )}

        {/* Commercial */}
        <div className="p-4 rounded-xl" style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Condições Comerciais</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-blue-400 text-xs">Frete</p><p className="text-white font-bold mt-0.5">R$ {(order.frete_value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits:2 })}</p></div>
            <div><p className="text-blue-400 text-xs">Adiantamento</p><p className="text-white font-semibold mt-0.5">R$ {order.advance_amount.toLocaleString('pt-BR', { minimumFractionDigits:2 })}</p></div>
            <div><p className="text-blue-400 text-xs">Saldo</p><p className="text-white font-semibold mt-0.5">R$ {order.balance_amount.toLocaleString('pt-BR', { minimumFractionDigits:2 })}</p></div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="p-3 rounded-xl" style={{ background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)' }}>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Observações</p>
            <p className="text-sm text-blue-200">{order.notes}</p>
          </div>
        )}

        <div className="h-px" style={{ background:'rgba(255,255,255,0.1)' }} />
        <p className="text-xs text-blue-600 text-center">
          Documento gerado automaticamente por RADAR VINCOLOG · Token: {order.tracking_token}
        </p>
      </div>
    </div>
  )
}
