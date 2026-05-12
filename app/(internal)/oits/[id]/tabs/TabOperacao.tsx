'use client'

import { useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { useSetNextAction, useSetPriority } from '@/lib/hooks/use-oit-mutations'
import { useT } from '@/lib/i18n/I18nProvider'
import type { DbOit, Priority } from '@/lib/types'

const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function TabOperacao({ oit }: { oit: DbOit }) {
  const t = useT()
  const setAction   = useSetNextAction(oit.id)
  const setPrio     = useSetPriority(oit.id)
  const pending = setAction.isPending || setPrio.isPending

  const [nextAction, setNextActionVal] = useState(oit.next_action ?? '')
  const [deadline, setDeadline] = useState(oit.next_action_deadline?.slice(0, 16) ?? '')
  const [priority, setPriorityVal] = useState<Priority>(oit.priority)

  function handleSave() {
    setAction.mutate({ action: nextAction, deadline: deadline || undefined })
    setPrio.mutate(priority)
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">{t('oits.operationTab.nextAction')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={L}>{t('oits.operationTab.nextActionLabel')}</label>
            <input value={nextAction} onChange={e => setNextActionVal(e.target.value)} placeholder={t('oits.operationTab.nextActionPlaceholder')} className="glass-input" />
          </div>
          <div><label className={L}>{t('oits.operationTab.deadline')}</label>
            <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="glass-input" /></div>
          <div><label className={L}>{t('oits.operationTab.priority')}</label>
            <select value={priority} onChange={e => setPriorityVal(e.target.value as Priority)} className="glass-select">
              <option value="baixa">{t('oits.operationTab.priorityLow')}</option>
              <option value="normal">{t('oits.operationTab.priorityNormal')}</option>
              <option value="alta">{t('oits.operationTab.priorityHigh')}</option>
              <option value="critica">{t('oits.operationTab.priorityCritical')}</option>
            </select></div>
        </div>
        <button onClick={handleSave} disabled={pending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {pending ? t('oits.operationTab.saving') : t('oits.operationTab.save')}
        </button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-base font-bold text-white">{t('oits.operationTab.operationalInstructions')}</h2>
        <div>
          <p className="text-xs text-blue-500 mb-1">{t('oits.operationTab.pendencies')}</p>
          <p className="text-sm text-blue-200">{oit.pendencies ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-blue-500 mb-1">{t('oits.operationTab.restrictions')}</p>
          <p className="text-sm text-blue-200">{oit.restrictions ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-blue-500 mb-1">{t('oits.operationTab.specificInstructions')}</p>
          <p className="text-sm text-blue-200">{oit.specific_instructions ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-blue-500 mb-1">{t('oits.operationTab.notes')}</p>
          <p className="text-sm text-blue-200">{oit.notes ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
