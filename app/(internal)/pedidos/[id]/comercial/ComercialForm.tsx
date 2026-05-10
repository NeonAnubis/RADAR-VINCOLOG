'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { saveCommercialTerms } from '@/lib/actions/orders'

interface Props {
  order: { id: string; provider_id: string | null; frete_value: number | null; advance_amount: number; balance_amount: number; payment_deadline: string | null }
}
const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function ComercialForm({ order }: Props) {
  const router = useRouter()
  const [freteValue, setFrete] = useState(order.frete_value?.toString() ?? '')
  const [advance,    setAdv  ] = useState(order.advance_amount.toString())
  const [deadline,   setDL   ] = useState(order.payment_deadline ?? '')
  const [error, setError] = useState<string|null>(null)
  const [pending, start]  = useTransition()

  const balance = (parseFloat(freteValue) || 0) - (parseFloat(advance) || 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('orderId', order.id)
    fd.set('freteValue', freteValue)
    fd.set('advanceAmount', advance)
    fd.set('paymentDeadline', deadline)
    if (order.provider_id) fd.set('providerId', order.provider_id)
    start(async () => {
      const res = await saveCommercialTerms(fd)
      if (res?.error) setError(res.error)
      else router.push(`/pedidos/${order.id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
      <div>
        <label className={L}>Valor do frete (R$) *</label>
        <input type="number" step="0.01" value={freteValue} onChange={e => setFrete(e.target.value)} placeholder="420.00" className="glass-input" required />
      </div>
      <div>
        <label className={L}>Adiantamento (R$)</label>
        <input type="number" step="0.01" value={advance} onChange={e => setAdv(e.target.value)} placeholder="100.00" className="glass-input" />
      </div>
      <div className="p-3 rounded-xl flex items-center justify-between" style={{ background:'rgba(255,255,255,0.04)' }}>
        <span className="text-sm text-blue-400">Saldo restante</span>
        <span className="text-lg font-extrabold text-white">
          R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div>
        <label className={L}>Prazo de pagamento do saldo</label>
        <input type="text" value={deadline} onChange={e => setDL(e.target.value)} placeholder="Ex: na entrega, 30 dias..." className="glass-input" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={pending}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
        style={{ background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',boxShadow:'0 4px 16px rgba(59,130,246,0.4)' }}>
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        {pending ? 'Salvando...' : 'Salvar Condições'}
      </button>
    </form>
  )
}
