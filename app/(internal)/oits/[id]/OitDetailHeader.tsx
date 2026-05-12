'use client'

import Link from 'next/link'
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react'
import { OitStatusBadge, ServiceLevelBadge } from '@/components/StatusBadge'
import { OIT_STATUSES } from '@/lib/types'
import type { DbOit, OitStatus } from '@/lib/types'
import { useT } from '@/lib/i18n/I18nProvider'

interface Props {
  oit: DbOit
  collectionCount: number
  deliveryCount: number
}

export default function OitDetailHeader({ oit, collectionCount, deliveryCount }: Props) {
  const t = useT()
  const trackingUrl = `/rastreamento/${oit.client_link_token}`
  const providerUrl = `/prestador/${oit.provider_link_token}`

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/oits" className="p-2 rounded-xl text-blue-400 hover:text-white glass flex-shrink-0"><ArrowLeft className="w-4 h-4" /></Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono">{oit.number}</h1>
              <OitStatusBadge status={oit.status} />
              <ServiceLevelBadge level={oit.service_level} />
            </div>
            <p className="text-xs sm:text-sm text-blue-400 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{t('oits.subtitleHeader', { collections: collectionCount, deliveries: deliveryCount, client: oit.client_name ?? '' })}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap lg:justify-end">
          <Link href={trackingUrl} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-blue-300 hover:text-white glass">
            <ExternalLink className="w-4 h-4" /> {t('oits.detail.clientLink')}
          </Link>
          <Link href={providerUrl} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-blue-300 hover:text-white glass">
            <ExternalLink className="w-4 h-4" /> {t('oits.detail.providerMode')}
          </Link>
        </div>
      </div>

      <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <span className="text-xs text-blue-500 font-bold mr-1 whitespace-nowrap">{t('oits.detail.flow')}</span>
        {(Object.keys(OIT_STATUSES) as OitStatus[])
          .filter(s => s !== 'ocorrencia')
          .sort((a, b) => OIT_STATUSES[a].order - OIT_STATUSES[b].order)
          .map((s, i, arr) => {
            const cfg = OIT_STATUSES[s]
            const isCurrent = oit.status === s
            const isPast = OIT_STATUSES[oit.status].order > cfg.order
            return (
              <div key={s} className="flex items-center gap-1 flex-shrink-0">
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${isCurrent ? 'border' : ''}`}
                  style={isCurrent ? { background: `${cfg.color}33`, color: cfg.color, borderColor: cfg.color }
                    : isPast ? { color: '#34D399' }
                    : { color: '#1E3A5F' }}>
                  {t(`oitStatus.${s}`)}
                </div>
                {i < arr.length - 1 && <span className="text-blue-900 text-[10px]">›</span>}
              </div>
            )
          })}
        {oit.status === 'ocorrencia' && (
          <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
            <span className="text-xs font-bold text-red-300">{t('oitStatus.ocorrencia')}</span>
          </div>
        )}
      </div>
    </>
  )
}
