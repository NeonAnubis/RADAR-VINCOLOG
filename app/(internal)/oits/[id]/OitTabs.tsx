'use client'

import { useState } from 'react'
import { FileText, Briefcase, Settings, Truck, DollarSign, FileSignature, Send, Clock, Image, AlertTriangle, RadioTower } from 'lucide-react'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint, DbContractPerTrip, DbTimelineEvent, DbOccurrence, DbProvider, DbBudget, DbGpsPosition } from '@/lib/types'
import TabResumo from './tabs/TabResumo'
import TabComercial from './tabs/TabComercial'
import TabOperacao from './tabs/TabOperacao'
import TabPrestador from './tabs/TabPrestador'
import TabCusto from './tabs/TabCusto'
import TabContrato from './tabs/TabContrato'
import TabOrdemColeta from './tabs/TabOrdemColeta'
import TabTimeline from './tabs/TabTimeline'
import TabFotos from './tabs/TabFotos'
import TabOcorrencias from './tabs/TabOcorrencias'
import TabGps from './tabs/TabGps'
import { useT } from '@/lib/i18n/I18nProvider'

const TABS = [
  { id: 'resumo',       tkey: 'summary',         icon: FileText },
  { id: 'comercial',    tkey: 'commercial',      icon: Briefcase },
  { id: 'operacao',     tkey: 'operation',       icon: Settings },
  { id: 'prestador',    tkey: 'provider',        icon: Truck },
  { id: 'custo',        tkey: 'cost',            icon: DollarSign },
  { id: 'contrato',     tkey: 'contract',        icon: FileSignature },
  { id: 'ordem',        tkey: 'collectionOrder', icon: Send },
  { id: 'timeline',     tkey: 'timeline',        icon: Clock },
  { id: 'fotos',        tkey: 'photos',          icon: Image },
  { id: 'ocorrencias',  tkey: 'occurrences',     icon: AlertTriangle },
  { id: 'gps',          tkey: 'gps',             icon: RadioTower },
] as const

interface Props {
  oit: DbOit
  collectionPoints: DbCollectionPoint[]
  deliveryPoints: DbDeliveryPoint[]
  contract: DbContractPerTrip | null
  timeline: DbTimelineEvent[]
  occurrences: DbOccurrence[]
  availableProviders: DbProvider[]
  budget: DbBudget | null
  gpsPositions: DbGpsPosition[]
}

export default function OitTabs(props: Props) {
  const t = useT()
  const [active, setActive] = useState<typeof TABS[number]['id']>('resumo')

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-1.5 flex gap-1 overflow-x-auto scrollbar-thin">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <button key={tab.id} onClick={() => setActive(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${isActive ? 'text-white' : 'text-blue-400 hover:text-blue-200'}`}
              style={isActive ? { background: 'linear-gradient(135deg,rgba(59,130,246,0.35),rgba(37,99,235,0.25))', border: '1px solid rgba(96,165,250,0.3)' } : {}}>
              <Icon className="w-3.5 h-3.5" />
              {t(`oits.detail.tabs.${tab.tkey}`)}
              {tab.id === 'ocorrencias' && props.occurrences.length > 0 && (
                <span className="px-1.5 py-0 rounded text-[10px] bg-red-400/30 text-red-300">{props.occurrences.length}</span>
              )}
              {tab.id === 'timeline' && props.timeline.length > 0 && (
                <span className="px-1.5 py-0 rounded text-[10px] bg-blue-400/30 text-blue-300">{props.timeline.length}</span>
              )}
            </button>
          )
        })}
      </div>

      {active === 'resumo'      && <TabResumo {...props} />}
      {active === 'comercial'   && <TabComercial {...props} />}
      {active === 'operacao'    && <TabOperacao {...props} />}
      {active === 'prestador'   && <TabPrestador {...props} />}
      {active === 'custo'       && <TabCusto {...props} />}
      {active === 'contrato'    && <TabContrato {...props} />}
      {active === 'ordem'       && <TabOrdemColeta {...props} />}
      {active === 'timeline'    && <TabTimeline {...props} />}
      {active === 'fotos'       && <TabFotos {...props} />}
      {active === 'ocorrencias' && <TabOcorrencias {...props} />}
      {active === 'gps'         && <TabGps oit={props.oit} positions={props.gpsPositions} />}
    </div>
  )
}
