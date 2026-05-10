'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Truck, CheckCircle, Loader2 } from 'lucide-react'
import { allocateProvider } from '@/lib/actions/orders'
import { DbProvider } from '@/lib/types'

export default function AllocateForm({ orderId, providers }: { orderId: string; providers: DbProvider[] }) {
  const router  = useRouter()
  const [sel, setSel] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function handleSubmit() {
    if (!sel) { setError('Selecione um prestador.'); return }
    const fd = new FormData()
    fd.set('orderId', orderId)
    fd.set('providerId', sel)
    start(async () => {
      const res = await allocateProvider(fd)
      if (res?.error) setError(res.error)
      else router.push(`/pedidos/${orderId}`)
    })
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <p className="text-sm text-blue-300">Selecione um prestador ativo para este frete:</p>
      {providers.length === 0 && <p className="text-sm text-blue-600">Nenhum prestador ativo disponível. <a href="/prestadores/novo" className="text-blue-400 underline">Cadastrar agora</a></p>}
      <div className="space-y-2">
        {providers.map(p => (
          <button key={p.id} onClick={() => setSel(p.id)}
            className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
            style={sel === p.id
              ? { background:'rgba(59,130,246,0.2)',border:'1px solid rgba(96,165,250,0.5)',boxShadow:'0 0 16px rgba(59,130,246,0.2)' }
              : { background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-10 h-10 rounded-full glass-sm flex items-center justify-center text-sm font-bold text-blue-300">
              {p.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{p.name}</p>
              <div className="flex items-center gap-2 text-xs text-blue-400 mt-0.5">
                <Truck className="w-3 h-3" />{p.vehicle_type} · {p.vehicle_plate}
                {p.cnh && <span>· CNH: {p.cnh}</span>}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-0.5 justify-end">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">{p.rating}</span>
              </div>
              <p className="text-[10px] text-blue-500">{p.total_fretes} fretes</p>
            </div>
            {sel === p.id && <CheckCircle className="w-5 h-5 text-blue-400" />}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button onClick={handleSubmit} disabled={pending || !sel}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
        style={{ background:'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        {pending ? 'Alocando...' : 'Confirmar Alocação'}
      </button>
    </div>
  )
}
