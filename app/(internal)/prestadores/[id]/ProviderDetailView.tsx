'use client'

import Link from 'next/link'
import { ArrowLeft, Truck, Phone, Star, FileText, CreditCard, CheckCircle } from 'lucide-react'
import { ProviderStatusBadge, OitStatusBadge } from '@/components/StatusBadge'
import { fmtDate, fmtCurrency } from '@/lib/utils/format'
import { useT } from '@/lib/i18n/I18nProvider'
import ToggleStatusButton from './ToggleStatusButton'
import UploadVehiclePhotoButton from './UploadVehiclePhotoButton'

type Provider = {
  id: string
  name: string
  status: 'ativo' | 'adormecido'
  phone: string | null
  vehicle_type: string | null
  vehicle_plate: string
  cpf: string | null
  cnh: string | null
  rating: number
  total_fretes: number
  created_at: string
  vehicle_photos: string[] | null
  contract_signed: boolean
  contract_date: string | null
  bank_name: string | null
  pix_key: string | null
}

type Oit = {
  id: string
  number: string
  status: Parameters<typeof OitStatusBadge>[0]['status']
  client_name: string | null
  vendor_value: number | null
  created_at: string
  collection_points?: Array<{ city: string | null }>
  delivery_points?: Array<{ city: string | null }>
}

interface Props { provider: Provider; oits: Oit[] }

export default function ProviderDetailView({ provider, oits }: Props) {
  const t = useT()
  const isDormant = provider.status === 'adormecido'

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/prestadores" className="p-2 rounded-xl text-blue-400 hover:text-white glass">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('providers.detail.header')}</h1>
          <p className="text-sm text-blue-400">{t('providers.detail.headerSub')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
                { icon: Truck,    val: `${provider.vehicle_type ?? '—'} · ${provider.vehicle_plate}` },
                { icon: FileText, val: `${t('common.fields.cpf')}: ${provider.cpf ?? '—'}` },
                { icon: FileText, val: `${t('common.fields.cnh')}: ${provider.cnh ?? '—'}` },
              ].filter(r => r.val).map(({ icon: Icon, val }, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-blue-300">
                  <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" /> {val}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 space-y-2 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex justify-between">
                <span className="text-blue-500">{t('providers.detail.createdAt')}</span>
                <span className="font-bold text-blue-300">{fmtDate(provider.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-500">{t('providers.detail.total')}</span>
                <span className="font-bold text-blue-300">{provider.total_fretes}</span>
              </div>
            </div>

            <div className="mt-4">
              <ToggleStatusButton providerId={provider.id} currentStatus={provider.status} />
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Truck className="w-4 h-4" /> {t('providers.detail.vehiclePhotosTitle')}
            </h3>
            {provider.vehicle_photos && provider.vehicle_photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {provider.vehicle_photos.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" className="aspect-video rounded-lg overflow-hidden block"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <img src={url} alt={`${t('oits.photosTab.cat_vehiclePhoto')} ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            ) : <p className="text-xs text-blue-600 mb-3">{t('providers.detail.noPhotos')}</p>}
            <UploadVehiclePhotoButton providerId={provider.id} />
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wider"><FileText className="w-4 h-4" /> {t('providers.detail.contractTitle')}</h3>
            {provider.contract_signed
              ? <div className="flex items-center gap-2 text-sm text-emerald-400"><CheckCircle className="w-4 h-4" /><span className="font-bold">{t('providers.detail.contractSigned')}</span> <span className="text-xs text-blue-500">{t('providers.detail.contractAt')} {fmtDate(provider.contract_date)}</span></div>
              : <p className="text-sm font-bold text-amber-400">{t('providers.detail.contractPending')}</p>}
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wider"><CreditCard className="w-4 h-4" /> {t('providers.detail.paymentTitle')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-400">{t('providers.detail.bank')}</span>
                <span className="font-semibold text-blue-200 text-xs">{provider.bank_name ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400">{t('providers.detail.pix')}</span>
                <span className="font-semibold text-blue-200 text-xs">{provider.pix_key ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass rounded-2xl">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white">{t('providers.detail.historyTitle')}</h2>
              <p className="text-xs text-blue-500 mt-0.5">{t('providers.detail.freightsCount', { count: oits.length })}</p>
            </div>
            {oits.length === 0 ? (
              <div className="p-10 text-center"><p className="text-sm text-blue-600">{t('providers.detail.emptyHistory')}</p></div>
            ) : (
              <div>
                {oits.map(o => {
                  const cps = o.collection_points ?? []
                  const dps = o.delivery_points ?? []
                  return (
                    <Link key={o.id} href={`/oits/${o.id}`}
                      className="flex items-center gap-4 px-5 py-4 glass-hover transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-white">{o.number}</span>
                          <OitStatusBadge status={o.status} />
                        </div>
                        <p className="text-xs text-blue-400 mt-0.5">{o.client_name}</p>
                        <p className="text-xs text-blue-500">{cps[0]?.city ?? '—'} → {dps[0]?.city ?? '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-white">{fmtCurrency(o.vendor_value)}</p>
                        <p className="text-xs text-blue-500">{fmtDate(o.created_at)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
