'use client'
import { useTransition } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { updateCollectionOrderSent } from '@/lib/actions/orders'

export default function SendOCButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      onClick={() => start(async () => { await updateCollectionOrderSent(orderId) })}
      disabled={pending}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 glass">
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-400" />}
      {pending ? 'Marcando...' : 'Marcar como Enviada'}
    </button>
  )
}
