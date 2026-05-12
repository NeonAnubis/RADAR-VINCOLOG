'use client'

import { useState, useTransition } from 'react'
import { Clock, Plus, Loader2, Eye, EyeOff, Camera } from 'lucide-react'
import { addManualTimelineEvent } from '@/lib/actions/oits'
import { fmtDateTime } from '@/lib/utils/format'
import { useT } from '@/lib/i18n/I18nProvider'
import type { DbOit, DbTimelineEvent, TimelineSource } from '@/lib/types'

const sourceColor: Record<TimelineSource, string> = {
  comercial: '#22D3EE',
  operacional: '#60A5FA',
  financeiro: '#FBBF24',
  prestador: '#A78BFA',
  cliente: '#34D399',
  sistema: '#94A3B8',
}

const sourceLabel: Record<TimelineSource, string> = {
  comercial: 'sourceCommercial',
  operacional: 'sourceOperational',
  financeiro: 'sourceFinancial',
  prestador: 'sourceProvider',
  cliente: 'sourceClient',
  sistema: 'sourceSystem',
}

const EVENT_TYPES = [
  'observacao', 'contato_cliente', 'contato_prestador',
  'atualizacao_previsao', 'pendencia_documental',
  'pendencia_financeira', 'liberacao_operacional',
] as const

const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function TabTimeline({ oit, timeline }: { oit: DbOit; timeline: DbTimelineEvent[] }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [eventType, setEventType] = useState<string>('observacao')
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
        <h2 className="text-base font-bold text-white flex items-center gap-2"><Clock className="w-4 h-4" /> {t('oits.timelineTab.title', { count: timeline.length })}</h2>
        {!open && (
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-400 hover:text-white glass">
            <Plus className="w-3 h-3" /> {t('oits.timelineTab.addManual')}
          </button>
        )}
      </div>

      {open && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(96,165,250,0.25)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={L}>{t('oits.timelineTab.type')}</label>
              <select value={eventType} onChange={e => setEventType(e.target.value)} className="glass-select">
                {EVENT_TYPES.map(k => (
                  <option key={k} value={k}>{t(`oits.timelineTab.evType_${k}`)}</option>
                ))}
              </select></div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-xs text-blue-300 pb-2">
                <input type="checkbox" checked={visibleClient} onChange={e => setVisibleClient(e.target.checked)} />
                {t('oits.timelineTab.visibleToClient')}
              </label>
            </div>
            <div className="col-span-2"><label className={L}>{t('oits.timelineTab.description')}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="glass-input resize-none" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={pending || !description.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {t('oits.timelineTab.add')}
            </button>
            <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-blue-400 glass">{t('common.cancel')}</button>
          </div>
        </div>
      )}

      {timeline.length === 0 ? (
        <p className="text-sm text-blue-600 text-center py-8">{t('oits.timelineTab.noEvents')}</p>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="space-y-4">
            {timeline.map(ev => {
              const src = ev.source ?? 'sistema'
              const color = sourceColor[src]
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
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: `${color}1a`, color }}>{t(`oits.timelineTab.${sourceLabel[src]}`)}</span>
                      <span className="text-[10px] text-blue-600 flex items-center gap-1">
                        {ev.visible_to_client ? <><Eye className="w-2.5 h-2.5" /> {t('oits.timelineTab.visible')}</> : <><EyeOff className="w-2.5 h-2.5" /> {t('oits.timelineTab.internal')}</>}
                      </span>
                    </div>
                    {ev.attachments && ev.attachments.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {ev.attachments.map((a, i) => (
                          <a key={i} href={a.url} target="_blank" className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-blue-400 hover:text-blue-300 glass-sm">
                            <Camera className="w-3 h-3" /> {a.filename ?? `${t('common.attachment')} ${i+1}`}
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
