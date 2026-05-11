'use client'

import { useState, useTransition } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { setOitNextAction, setOitPriority } from '@/lib/actions/oits'
import type { DbOit, Priority } from '@/lib/types'

const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function TabOperacao({ oit }: { oit: DbOit }) {
  const [pending, start] = useTransition()
  const [nextAction, setAction] = useState(oit.next_action ?? '')
  const [deadline, setDeadline] = useState(oit.next_action_deadline?.slice(0, 16) ?? '')
  const [priority, setPriority] = useState<Priority>(oit.priority)

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Próxima Ação</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className={L}>Próxima ação</label>
            <input value={nextAction} onChange={e => setAction(e.target.value)} placeholder="Ex: Confirmar coleta com prestador" className="glass-input" /></div>
          <div><label className={L}>Prazo</label>
            <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="glass-input" /></div>
          <div><label className={L}>Prioridade</label>
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="glass-select">
              <option value="baixa">Baixa</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select></div>
        </div>
        <button onClick={() => start(async () => {
          await setOitNextAction(oit.id, nextAction, deadline || undefined)
          await setOitPriority(oit.id, priority)
        })} disabled={pending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {pending ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-base font-bold text-white">Instruções Operacionais</h2>
        <div>
          <p className="text-xs text-blue-500 mb-1">Pendências</p>
          <p className="text-sm text-blue-200">{oit.pendencies ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-blue-500 mb-1">Restrições</p>
          <p className="text-sm text-blue-200">{oit.restrictions ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-blue-500 mb-1">Instruções específicas</p>
          <p className="text-sm text-blue-200">{oit.specific_instructions ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-blue-500 mb-1">Observações</p>
          <p className="text-sm text-blue-200">{oit.notes ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
