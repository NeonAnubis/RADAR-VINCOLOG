import clsx from 'clsx'
import { OrderStatus, ProviderStatus } from '@/lib/types'

const orderCfg: Record<OrderStatus, { label: string; cls: string }> = {
  criado:      { label: 'Criado',       cls: 'bg-slate-400/15  text-slate-300  border-slate-400/25'  },
  aceito:      { label: 'Aceito',       cls: 'bg-cyan-400/20   text-cyan-300   border-cyan-400/35'   },
  alocado:     { label: 'Alocado',      cls: 'bg-sky-400/20    text-sky-300    border-sky-400/35'    },
  radar_ativo: { label: 'Radar Ativo',  cls: 'bg-violet-400/20 text-violet-300 border-violet-400/35' },
  em_rota:     { label: 'Em Rota',      cls: 'bg-blue-400/20   text-blue-300   border-blue-400/35'   },
  entregue:    { label: 'Entregue',     cls: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/35' },
  ocorrencia:  { label: 'Ocorrência',   cls: 'bg-red-400/20    text-red-300    border-red-400/35'    },
  finalizado:  { label: 'Finalizado',   cls: 'bg-slate-400/15  text-slate-400  border-slate-400/25'  },
}

const providerCfg: Record<ProviderStatus, { label: string; cls: string }> = {
  ativo:      { label: 'Ativo',      cls: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/35' },
  adormecido: { label: 'Adormecido', cls: 'bg-slate-400/15   text-slate-400  border-slate-400/25'   },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const c = orderCfg[status] ?? orderCfg.criado
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', c.cls)}>
      {c.label}
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
