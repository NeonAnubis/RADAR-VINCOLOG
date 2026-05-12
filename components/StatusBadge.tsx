'use client'

import clsx from 'clsx'
import { OitStatus, BudgetStatus, ProviderStatus, ServiceLevel, OccurrenceStatus, OIT_STATUSES, BUDGET_STATUSES, SERVICE_LEVELS } from '@/lib/types'
import { useT } from '@/lib/i18n/I18nProvider'

const providerCfg: Record<ProviderStatus, { cls: string }> = {
  ativo:      { cls: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/35' },
  adormecido: { cls: 'bg-slate-400/15   text-slate-400  border-slate-400/25'   },
}

const occurrenceCfg: Record<OccurrenceStatus, { cls: string }> = {
  aberta:       { cls: 'bg-red-400/20    text-red-300    border-red-400/35'    },
  em_tratativa: { cls: 'bg-amber-400/20  text-amber-300  border-amber-400/35'  },
  resolvida:    { cls: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/35' },
  encerrada:    { cls: 'bg-slate-400/15  text-slate-400  border-slate-400/25'  },
  escalada:     { cls: 'bg-orange-400/20 text-orange-300 border-orange-400/35' },
}

export function OitStatusBadge({ status }: { status: OitStatus }) {
  const t = useT()
  const cfg = OIT_STATUSES[status]
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border"
      style={{ background: `${cfg.color}22`, color: cfg.color, borderColor: `${cfg.color}55` }}>
      {t(`oitStatus.${status}`)}
    </span>
  )
}

export function BudgetStatusBadge({ status }: { status: BudgetStatus }) {
  const t = useT()
  const cfg = BUDGET_STATUSES[status]
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border"
      style={{ background: `${cfg.color}22`, color: cfg.color, borderColor: `${cfg.color}55` }}>
      {t(`budgetStatus.${status}`)}
    </span>
  )
}

export function ServiceLevelBadge({ level }: { level: ServiceLevel }) {
  const t = useT()
  const cfg = SERVICE_LEVELS[level]
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border"
      style={{ background: `${cfg.color}22`, color: cfg.color, borderColor: `${cfg.color}55` }}>
      {t(`serviceLevels.${level}Short`)}
    </span>
  )
}

export function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  const t = useT()
  const c = providerCfg[status]
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', c.cls)}>
      {t(`providerStatus.${status}`)}
    </span>
  )
}

export function OccurrenceStatusBadge({ status }: { status: OccurrenceStatus }) {
  const t = useT()
  const c = occurrenceCfg[status]
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', c.cls)}>
      {t(`occurrences.status.${status}`)}
    </span>
  )
}

export function ContractStatusBadge({ status }: { status: 'pendente' | 'assinado' | 'encerrado' }) {
  const t = useT()
  const map = {
    pendente:  { cls: 'bg-amber-400/20  text-amber-300  border-amber-400/35',  key: 'pendente' },
    assinado:  { cls: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/35', key: 'aceito' },
    encerrado: { cls: 'bg-slate-400/15  text-slate-400  border-slate-400/25',   key: 'cancelado' },
  }
  const cfg = map[status]
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', cfg.cls)}>
      {t(`contracts.statusLabels.${cfg.key}`)}
    </span>
  )
}

// Legacy alias kept for any remaining code paths
export const OrderStatusBadge = OitStatusBadge as unknown as React.FC<{ status: string }>
