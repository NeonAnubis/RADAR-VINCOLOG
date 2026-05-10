'use client'
import { useTransition } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { activateMonitoring } from '@/lib/actions/orders'

export default function ActivateMonitoringButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      onClick={() => start(async () => { await activateMonitoring(orderId) })}
      disabled={pending}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
      style={{ background:'linear-gradient(135deg,#7C3AED,#5B21B6)',boxShadow:'0 4px 14px rgba(124,58,237,0.4)' }}>
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
      {pending ? 'Ativando...' : 'Iniciar Monitoramento'}
    </button>
  )
}
