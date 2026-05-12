'use client'

import { Truck } from 'lucide-react'
import { useT } from '@/lib/i18n/I18nProvider'
import { SERVICE_LEVELS } from '@/lib/types'

interface Props {
  oit: {
    number: string
    client_name: string | null
    service_level: keyof typeof SERVICE_LEVELS
    cargo_description: string | null
    cargo_weight: string | null
    vehicle_type: string | null
  }
}

export function InviteTopBar() {
  const t = useT()
  return (
    <div className="py-3 px-4" style={{ background: 'rgba(2,8,30,0.9)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-2xl mx-auto flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
          <Truck className="w-3 h-3 text-white" />
        </div>
        <span className="text-white text-sm font-extrabold tracking-wide">RADAR</span>
        <span className="text-blue-400 text-[9px] font-bold tracking-[0.25em] uppercase">VINCOLOG</span>
        <span className="text-blue-600 text-xs ml-auto">{t('providerInvite.headerLabel')}</span>
      </div>
    </div>
  )
}

export default function InvitePageHeader({ oit }: Props) {
  const t = useT()
  const level = SERVICE_LEVELS[oit.service_level]

  return (
    <>
      <div className="text-center pt-2">
        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{t('providerInvite.tripInvite')}</p>
        <p className="text-2xl font-extrabold text-white font-mono mt-0.5">{oit.number}</p>
        <p className="text-sm text-blue-400 mt-0.5">{oit.client_name}</p>
        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{ background: `${level.color}1a`, color: level.color, border: `1px solid ${level.color}55` }}>
          {t(`serviceLevels.${oit.service_level}`)}
        </div>
      </div>

      <div className="rounded-2xl p-4 text-xs space-y-1" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
        <p className="text-blue-300"><strong className="text-white">{t('providerInvite.cargoLabel')}</strong> {oit.cargo_description ?? '—'}</p>
        <p className="text-blue-300"><strong className="text-white">{t('providerInvite.weightLabel')}</strong> {oit.cargo_weight ?? '—'}</p>
        <p className="text-blue-300"><strong className="text-white">{t('providerInvite.vehicleRequested')}</strong> {oit.vehicle_type ?? '—'}</p>
      </div>
    </>
  )
}
