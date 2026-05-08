import clsx from 'clsx'
import { OrderStatus, ProviderStatus } from '@/lib/types'

const orderStatusConfig: Record<OrderStatus, { label: string; classes: string }> = {
  aguardando: { label: 'Aguardando', classes: 'bg-amber-400/20  text-amber-300  border-amber-400/35'  },
  coletado:   { label: 'Coletado',   classes: 'bg-sky-400/20    text-sky-300    border-sky-400/35'    },
  em_rota:    { label: 'Em Rota',    classes: 'bg-violet-400/20 text-violet-300 border-violet-400/35' },
  entregue:   { label: 'Entregue',   classes: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/35' },
  ocorrencia: { label: 'Ocorrência', classes: 'bg-red-400/20    text-red-300    border-red-400/35'    },
}

const providerStatusConfig: Record<ProviderStatus, { label: string; classes: string }> = {
  ativo:      { label: 'Ativo',      classes: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/35' },
  adormecido: { label: 'Adormecido', classes: 'bg-slate-400/15  text-slate-400  border-slate-400/25'  },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const c = orderStatusConfig[status]
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', c.classes)}>
      {c.label}
    </span>
  )
}

export function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  const c = providerStatusConfig[status]
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', c.classes)}>
      {c.label}
    </span>
  )
}

export function ContractStatusBadge({ status }: { status: 'pendente' | 'assinado' | 'encerrado' }) {
  const config = {
    pendente:  { label: 'Pendente',  classes: 'bg-amber-400/20  text-amber-300  border-amber-400/35'  },
    assinado:  { label: 'Assinado',  classes: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/35' },
    encerrado: { label: 'Encerrado', classes: 'bg-slate-400/15  text-slate-400  border-slate-400/25'  },
  }[status]
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', config.classes)}>
      {config.label}
    </span>
  )
}
