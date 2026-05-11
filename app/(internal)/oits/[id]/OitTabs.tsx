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

const TABS = [
  { id: 'resumo',       label: 'Resumo',         icon: FileText },
  { id: 'comercial',    label: 'Comercial',      icon: Briefcase },
  { id: 'operacao',     label: 'Operação',       icon: Settings },
  { id: 'prestador',    label: 'Prestador',      icon: Truck },
  { id: 'custo',        label: 'Custo',          icon: DollarSign },
  { id: 'contrato',     label: 'Contrato',       icon: FileSignature },
  { id: 'ordem',        label: 'Ordem Coleta',   icon: Send },
  { id: 'timeline',     label: 'Timeline',       icon: Clock },
  { id: 'fotos',        label: 'Fotos',          icon: Image },
  { id: 'ocorrencias',  label: 'Ocorrências',    icon: AlertTriangle },
  { id: 'gps',          label: 'GPS',            icon: RadioTower },
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
  const [active, setActive] = useState<typeof TABS[number]['id']>('resumo')

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-1.5 flex gap-1 overflow-x-auto scrollbar-thin">
        {TABS.map(t => {
          const Icon = t.icon
          const isActive = active === t.id
          return (
            <button key={t.id} onClick={() => setActive(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${isActive ? 'text-white' : 'text-blue-400 hover:text-blue-200'}`}
              style={isActive ? { background: 'linear-gradient(135deg,rgba(59,130,246,0.35),rgba(37,99,235,0.25))', border: '1px solid rgba(96,165,250,0.3)' } : {}}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {t.id === 'ocorrencias' && props.occurrences.length > 0 && (
                <span className="px-1.5 py-0 rounded text-[10px] bg-red-400/30 text-red-300">{props.occurrences.length}</span>
              )}
              {t.id === 'timeline' && props.timeline.length > 0 && (
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
