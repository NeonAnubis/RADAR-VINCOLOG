'use client'

import { useState, useTransition } from 'react'
import { Clock, Plus, Loader2, Eye, EyeOff, Camera } from 'lucide-react'
import { addManualTimelineEvent } from '@/lib/actions/oits'
import { fmtDateTime } from '@/lib/utils/format'
import type { DbOit, DbTimelineEvent, TimelineSource } from '@/lib/types'

const sourceColor: Record<TimelineSource, string> = {
  comercial: '#22D3EE',
  operacional: '#60A5FA',
  financeiro: '#FBBF24',
  prestador: '#A78BFA',
  cliente: '#34D399',
  sistema: '#94A3B8',
}

const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function TabTimeline({ oit, timeline }: { oit: DbOit; timeline: DbTimelineEvent[] }) {
  const [open, setOpen] = useState(false)
  const [eventType, setEventType] = useState('observacao')
  const [description, setDescription] = useState('')
  const [visibleClient, setVisibleClient] = useState(false)
  const [pending, start] = useTransition()

  function handleAdd() {
    if (!description.trim()) return
    start(async () => {
      await addManualTimelineEvent(oit.id, eventType, description, visibleClient)
      setOpen(false); setDescription('')
    })
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2"><Clock className="w-4 h-4" /> Timeline Operacional ({timeline.length})</h2>
        {!open && (
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-400 hover:text-white glass">
            <Plus className="w-3 h-3" /> Adicionar evento manual
          </button>
        )}
      </div>

      {open && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(96,165,250,0.25)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={L}>Tipo</label>
              <select value={eventType} onChange={e => setEventType(e.target.value)} className="glass-select">
                <option value="observacao">Observação interna</option>
                <option value="contato_cliente">Contato com cliente</option>
                <option value="contato_prestador">Contato com prestador</option>
                <option value="atualizacao_previsao">Atualização de previsão</option>
                <option value="pendencia_documental">Pendência documental</option>
                <option value="pendencia_financeira">Pendência financeira</option>
                <option value="liberacao_operacional">Liberação operacional</option>
              </select></div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-xs text-blue-300 pb-2">
                <input type="checkbox" checked={visibleClient} onChange={e => setVisibleClient(e.target.checked)} />
                Visível para cliente
              </label>
            </div>
            <div className="col-span-2"><label className={L}>Descrição</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="glass-input resize-none" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={pending || !description.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Adicionar
            </button>
            <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-blue-400 glass">Cancelar</button>
          </div>
        </div>
      )}

      {timeline.length === 0 ? (
        <p className="text-sm text-blue-600 text-center py-8">Nenhum evento registrado ainda.</p>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="space-y-4">
            {timeline.map(ev => {
              const color = sourceColor[ev.source ?? 'sistema']
              return (
                <div key={ev.id} className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                    style={{ background: `${color}22`, border: `1px solid ${color}55`, boxShadow: `0 0 8px ${color}33` }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold" style={{ color }}>{ev.event_type.replace(/_/g, ' ')}</p>
                      <span className="text-[11px] text-blue-500 whitespace-nowrap">{fmtDateTime(ev.created_at)}</span>
                    </div>
                    {ev.description && <p className="text-xs text-blue-200 mt-0.5">{ev.description}</p>}
                    {ev.location_text && <p className="text-[11px] text-blue-500 mt-0.5">📍 {ev.location_text}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: `${color}1a`, color }}>{ev.source ?? 'sistema'}</span>
                      <span className="text-[10px] text-blue-600 flex items-center gap-1">
                        {ev.visible_to_client ? <><Eye className="w-2.5 h-2.5" /> visível ao cliente</> : <><EyeOff className="w-2.5 h-2.5" /> interno</>}
                      </span>
                    </div>
                    {ev.attachments && ev.attachments.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {ev.attachments.map((a, i) => (
                          <a key={i} href={a.url} target="_blank" className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-blue-400 hover:text-blue-300 glass-sm">
                            <Camera className="w-3 h-3" /> {a.filename ?? `Anexo ${i+1}`}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
