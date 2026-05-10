'use client'
import { useTransition } from 'react'
import { Flag, Loader2 } from 'lucide-react'
import { finalizeOrder } from '@/lib/actions/orders'

export default function FinalizeOrderButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      onClick={() => { if (confirm('Encerrar este frete?')) start(async () => { await finalizeOrder(orderId) }) }}
      disabled={pending}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 glass">
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4 text-blue-400" />}
      {pending ? 'Finalizando...' : 'Finalizar Frete'}
    </button>
  )
}
