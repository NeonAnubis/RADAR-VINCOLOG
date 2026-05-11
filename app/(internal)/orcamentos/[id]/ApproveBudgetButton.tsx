'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, X, Loader2 } from 'lucide-react'
import { approveBudget } from '@/lib/actions/budgets'
import { SERVICE_LEVELS } from '@/lib/types'
import type { ServiceLevel, ServiceLevelOffer } from '@/lib/types'
import { fmtCurrency } from '@/lib/utils/format'

export default function ApproveBudgetButton({ budgetId, offered }: {
  budgetId: string; offered: [ServiceLevel, ServiceLevelOffer][]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<ServiceLevel | null>(null)
  const [evidence, setEvidence] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function handleApprove() {
    if (!selected) { setError('Selecione um nível.'); return }
    const cfg = offered.find(([k]) => k === selected)?.[1]
    const value = cfg?.total ?? 0
    setError(null)
    start(async () => {
      const res = await approveBudget(budgetId, selected, value, evidence || undefined)
      if (res?.error) setError(res.error)
      else {
        setOpen(false)
        if (res.oitId) router.push(`/oits/${res.oitId}`)
        else router.refresh()
      }
    })
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white"
      style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 14px rgba(5,150,105,0.4)' }}>
      <CheckCircle className="w-4 h-4" /> Registrar Aprovação
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2,8,28,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-strong rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-white">Aprovação do Cliente</h2>
          <button onClick={() => setOpen(false)} className="text-blue-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-blue-300 mb-4">Selecione o nível de serviço aprovado pelo cliente:</p>
        <div className="space-y-2 mb-4">
          {offered.map(([k, cfg]) => {
            const meta = SERVICE_LEVELS[k]
            return (
              <button key={k} onClick={() => setSelected(k)}
                className="w-full flex items-center justify-between p-3 rounded-xl transition-all"
                style={selected === k
                  ? { background: `${meta.color}33`, border: `1.5px solid ${meta.color}` }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-left">
                  <p className="text-sm font-bold" style={{ color: meta.color }}>{meta.label}</p>
                  {cfg.validity && <p className="text-[10px] text-blue-500">Validade: {cfg.validity}</p>}
                </div>
                <span className="text-sm font-extrabold text-white">{fmtCurrency(cfg.total)}</span>
              </button>
            )
          })}
        </div>
        <div className="mb-3">
          <label className="block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider">Evidência (opcional)</label>
          <input value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="URL ou referência do e-mail/WhatsApp" className="glass-input" />
        </div>
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        <p className="text-xs text-blue-500 mb-4">⚠ Ao aprovar, uma OIT será criada automaticamente e o time operacional será notificado.</p>
        <div className="flex gap-2">
          <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-blue-300 glass">Cancelar</button>
          <button onClick={handleApprove} disabled={pending || !selected}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Aprovar e Criar OIT
          </button>
        </div>
      </div>
    </div>
  )
}
