'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, Plus, Loader2 } from 'lucide-react'
import { createOccurrence, updateOccurrenceStatus } from '@/lib/actions/occurrences'
import { OccurrenceStatusBadge } from '@/components/StatusBadge'
import { OCCURRENCE_TYPES } from '@/lib/types'
import { fmtDateTime } from '@/lib/utils/format'
import type { DbOit, DbOccurrence, OccurrenceType, OccurrenceStatus } from '@/lib/types'

const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function TabOcorrencias({ oit, occurrences }: { oit: DbOit; occurrences: DbOccurrence[] }) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [form, setForm] = useState({
    type: 'atraso_entrega' as OccurrenceType,
    description: '', location: '', impact: '', action_taken: '', new_estimate: '',
    visible_to_client: false,
  })

  function handleCreate() {
    if (!form.description.trim()) return
    start(async () => {
      const res = await createOccurrence({
        oit_id: oit.id,
        type: form.type,
        description: form.description,
        location: form.location || undefined,
        impact: form.impact || undefined,
        action_taken: form.action_taken || undefined,
        new_estimate: form.new_estimate || undefined,
        visible_to_client: form.visible_to_client,
      })
      if (!res?.error) {
        setOpen(false)
        setForm({ ...form, description: '', location: '', impact: '', action_taken: '', new_estimate: '' })
      }
    })
  }

  function changeStatus(id: string, newStatus: OccurrenceStatus) {
    start(async () => { await updateOccurrenceStatus(id, newStatus) })
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Ocorrências ({occurrences.length})</h2>
        {!open && (
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#EF4444,#B91C1C)' }}>
            <Plus className="w-3 h-3" /> Registrar Ocorrência
          </button>
        )}
      </div>

      {open && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={L}>Tipo *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as OccurrenceType})} className="glass-select">
                {Object.entries(OCCURRENCE_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select></div>
            <div><label className={L}>Local</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="glass-input" /></div>
            <div className="col-span-2"><label className={L}>Descrição do fato *</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="glass-input resize-none" /></div>
            <div><label className={L}>Impacto</label>
              <input value={form.impact} onChange={e => setForm({...form, impact: e.target.value})} placeholder="Ex: atraso de 3h" className="glass-input" /></div>
            <div><label className={L}>Nova previsão</label>
              <input type="datetime-local" value={form.new_estimate} onChange={e => setForm({...form, new_estimate: e.target.value})} className="glass-input" /></div>
            <div className="col-span-2"><label className={L}>Ação tomada</label>
              <textarea value={form.action_taken} onChange={e => setForm({...form, action_taken: e.target.value})} rows={2} className="glass-input resize-none" /></div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-xs text-blue-300">
                <input type="checkbox" checked={form.visible_to_client} onChange={e => setForm({...form, visible_to_client: e.target.checked})} />
                Visível para o cliente
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={pending || !form.description.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#EF4444,#B91C1C)' }}>
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Registrar
            </button>
            <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-blue-400 glass">Cancelar</button>
          </div>
        </div>
      )}

      {occurrences.length === 0 ? (
        <p className="text-sm text-blue-600 text-center py-6">Nenhuma ocorrência registrada.</p>
      ) : (
        <div className="space-y-3">
          {occurrences.map(o => (
            <div key={o.id} className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-red-300">{OCCURRENCE_TYPES[o.type ?? 'outros']}</p>
                    <OccurrenceStatusBadge status={o.status} />
                    {o.visible_to_client && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300">visível ao cliente</span>}
                  </div>
                  <p className="text-xs text-blue-200 mt-1">{o.description}</p>
                  {o.location && <p className="text-[11px] text-blue-500 mt-0.5">📍 {o.location}</p>}
                  {o.impact && <p className="text-[11px] text-amber-400 mt-0.5">Impacto: {o.impact}</p>}
                  {o.action_taken && <p className="text-[11px] text-blue-300 mt-0.5">Ação: {o.action_taken}</p>}
                  {o.new_estimate && <p className="text-[11px] text-blue-400 mt-0.5">Nova previsão: {fmtDateTime(o.new_estimate)}</p>}
                  <p className="text-[10px] text-blue-600 mt-2">Registrada em {fmtDateTime(o.created_at)}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {o.status !== 'resolvida' && o.status !== 'encerrada' && (
                    <>
                      <button onClick={() => changeStatus(o.id, 'em_tratativa')}
                        className="text-[10px] font-bold text-amber-300 hover:text-amber-200 px-2 py-1 rounded glass-sm">Em tratativa</button>
                      <button onClick={() => changeStatus(o.id, 'resolvida')}
                        className="text-[10px] font-bold text-emerald-300 hover:text-emerald-200 px-2 py-1 rounded glass-sm">Resolver</button>
                    </>
                  )}
                  {o.status === 'resolvida' && (
                    <button onClick={() => changeStatus(o.id, 'encerrada')}
                      className="text-[10px] font-bold text-blue-300 hover:text-blue-200 px-2 py-1 rounded glass-sm">Encerrar</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
