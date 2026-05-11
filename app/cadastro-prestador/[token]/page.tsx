import { notFound } from 'next/navigation'
import { Truck } from 'lucide-react'
import { getInviteContext } from '@/lib/actions/provider-invite'
import { SERVICE_LEVELS } from '@/lib/types'
import InviteForm from './InviteForm'

export default async function ProviderInvitePage({ params }: { params: { token: string } }) {
  const oit = await getInviteContext(params.token)
  if (!oit) notFound()

  const level = SERVICE_LEVELS[oit.service_level as keyof typeof SERVICE_LEVELS]

  return (
    <div className="min-h-screen" style={{ background: '#020C1F', backgroundImage: 'radial-gradient(ellipse 100% 60% at 10% 0%,rgba(12,35,120,0.5) 0%,transparent 60%)' }}>
      <div className="py-3 px-4" style={{ background: 'rgba(2,8,30,0.9)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
            <Truck className="w-3 h-3 text-white" />
          </div>
          <span className="text-white text-sm font-extrabold tracking-wide">RADAR</span>
          <span className="text-blue-400 text-[9px] font-bold tracking-[0.25em] uppercase">VINCOLOG</span>
          <span className="text-blue-600 text-xs ml-auto">Cadastro Rápido de Prestador</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-12 space-y-4">
        <div className="text-center pt-2">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Convite para Viagem</p>
          <p className="text-2xl font-extrabold text-white font-mono mt-0.5">{oit.number}</p>
          <p className="text-sm text-blue-400 mt-0.5">{oit.client_name}</p>
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ background: `${level.color}1a`, color: level.color, border: `1px solid ${level.color}55` }}>
            {level.label}
          </div>
        </div>

        <div className="rounded-2xl p-4 text-xs space-y-1" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
          <p className="text-blue-300"><strong className="text-white">Carga:</strong> {oit.cargo_description ?? '—'}</p>
          <p className="text-blue-300"><strong className="text-white">Peso:</strong> {oit.cargo_weight ?? '—'}</p>
          <p className="text-blue-300"><strong className="text-white">Veículo solicitado:</strong> {oit.vehicle_type ?? '—'}</p>
        </div>

        <InviteForm token={params.token} />

        <p className="text-center text-[11px] text-blue-700 pb-2">
          RADAR VINCOLOG · Após cadastrar, você receberá o link da viagem com os botões de status, fotos e POD.
        </p>
      </div>
    </div>
  )
}
