import clsx from 'clsx'
import { OitStatus, BudgetStatus, ProviderStatus, ServiceLevel, OccurrenceStatus, OIT_STATUSES, BUDGET_STATUSES, SERVICE_LEVELS } from '@/lib/types'

const providerCfg: Record<ProviderStatus, { label: string; cls: string }> = {
  ativo:      { label: 'Ativo',      cls: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/35' },
  adormecido: { label: 'Adormecido', cls: 'bg-slate-400/15   text-slate-400  border-slate-400/25'   },
}

export function OitStatusBadge({ status }: { status: OitStatus }) {
  const cfg = OIT_STATUSES[status]
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border"
      style={{ background: `${cfg.color}22`, color: cfg.color, borderColor: `${cfg.color}55` }}>
      {cfg.label}
    </span>
  )
}

export function BudgetStatusBadge({ status }: { status: BudgetStatus }) {
  const cfg = BUDGET_STATUSES[status]
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border"
      style={{ background: `${cfg.color}22`, color: cfg.color, borderColor: `${cfg.color}55` }}>
      {cfg.label}
    </span>
  )
}

export function ServiceLevelBadge({ level }: { level: ServiceLevel }) {
  const cfg = SERVICE_LEVELS[level]
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border"
      style={{ background: `${cfg.color}22`, color: cfg.color, borderColor: `${cfg.color}55` }}>
      {cfg.short}
    </span>
  )
}

export function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  const c = providerCfg[status]
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', c.cls)}>
      {c.label}
    </span>
  )
}

const occurrenceCfg: Record<OccurrenceStatus, { label: string; cls: string }> = {
  aberta:       { label: 'Aberta',       cls: 'bg-red-400/20    text-red-300    border-red-400/35'    },
  em_tratativa: { label: 'Em Tratativa', cls: 'bg-amber-400/20  text-amber-300  border-amber-400/35'  },
  resolvida:    { label: 'Resolvida',    cls: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/35' },
  encerrada:    { label: 'Encerrada',    cls: 'bg-slate-400/15  text-slate-400  border-slate-400/25'  },
  escalada:     { label: 'Escalada',     cls: 'bg-orange-400/20 text-orange-300 border-orange-400/35' },
}

export function OccurrenceStatusBadge({ status }: { status: OccurrenceStatus }) {
  const c = occurrenceCfg[status]
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', c.cls)}>
      {c.label}
    </span>
  )
}

export function ContractStatusBadge({ status }: { status: 'pendente' | 'assinado' | 'encerrado' }) {
  const cfg = {
    pendente:  { label: 'Pendente',  cls: 'bg-amber-400/20  text-amber-300  border-amber-400/35'  },
    assinado:  { label: 'Assinado',  cls: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/35' },
    encerrado: { label: 'Encerrado', cls: 'bg-slate-400/15  text-slate-400  border-slate-400/25'  },
  }[status]
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', cfg.cls)}>
      {cfg.label}
    </span>
  )
}

// Legacy alias kept for any remaining code paths
export const OrderStatusBadge = OitStatusBadge as unknown as React.FC<{ status: string }>
