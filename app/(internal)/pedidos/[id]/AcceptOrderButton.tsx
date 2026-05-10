'use client'
import { useTransition } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { acceptOrder } from '@/lib/actions/orders'

export default function AcceptOrderButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      onClick={() => start(async () => { await acceptOrder(orderId) })}
      disabled={pending}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
      style={{ background:'linear-gradient(135deg,#059669,#047857)',boxShadow:'0 4px 14px rgba(5,150,105,0.4)' }}>
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
      {pending ? 'Aceitando...' : 'Aceitar Pedido'}
    </button>
  )
}
