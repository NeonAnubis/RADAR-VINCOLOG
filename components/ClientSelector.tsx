'use client'

import { useEffect, useState } from 'react'
import { Search, Plus, User, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useT } from '@/lib/i18n/I18nProvider'
import type { DbClient } from '@/lib/types'

interface Props {
  /** Currently filled client form state (lifted from parent) */
  value: {
    client_id: string | null
    client_name: string
    client_document: string
    client_contact_name: string
    client_contact_phone: string
    client_contact_email: string
    client_contact_sector: string
  }
  onChange: (v: Props['value']) => void
}

export default function ClientSelector({ value, onChange }: Props) {
  const t = useT()
  const supabase = createClient()
  const [clients, setClients] = useState<DbClient[]>([])
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'select' | 'new'>(value.client_id ? 'select' : 'new')

  useEffect(() => {
    supabase.from('clients').select('*').order('name').then(({ data }) => setClients((data ?? []) as DbClient[]))
  }, [supabase])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.document ?? '').includes(search))

  function selectClient(c: DbClient) {
    onChange({
      client_id: c.id,
      client_name: c.name,
      client_document: c.document ?? '',
      client_contact_name: c.contact_name ?? '',
      client_contact_phone: c.phone ?? '',
      client_contact_email: c.email ?? '',
      client_contact_sector: c.contact_sector ?? '',
    })
  }

  const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

  return (
    <div className="space-y-3">
      <div className="flex gap-2 p-1 rounded-xl glass-sm">
        <button type="button" onClick={() => setMode('select')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode==='select' ? 'text-white' : 'text-blue-400'}`}
          style={mode==='select' ? { background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(96,165,250,0.3)' } : {}}>
          <Search className="w-3 h-3 inline mr-1" /> {t('budgets.clientSelector.existing')}
        </button>
        <button type="button" onClick={() => setMode('new')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode==='new' ? 'text-white' : 'text-blue-400'}`}
          style={mode==='new' ? { background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(96,165,250,0.3)' } : {}}>
          <Plus className="w-3 h-3 inline mr-1" /> {t('budgets.clientSelector.new')}
        </button>
      </div>

      {mode === 'select' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('budgets.clientSelector.searchPlaceholder')} className="glass-input pl-9" />
          </div>

          {value.client_id && (
            <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <div>
                <p className="text-sm font-bold text-emerald-300">{value.client_name}</p>
                <p className="text-xs text-blue-400">{value.client_document}</p>
              </div>
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto scrollbar-thin space-y-1">
            {filtered.slice(0, 20).map(c => (
              <button key={c.id} type="button" onClick={() => selectClient(c)}
                className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors hover:bg-white/5"
                style={value.client_id === c.id ? { background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(96,165,250,0.3)' } : {}}>
                <User className="w-3.5 h-3.5 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-100">{c.name}</p>
                  <p className="text-xs text-blue-500">{c.document ?? '—'} · {c.city ?? '—'}/{c.uf ?? ''}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-xs text-blue-600 text-center py-3">{t('budgets.clientSelector.noResults')}</p>}
          </div>
        </>
      )}

      {mode === 'new' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><label className={L}>{t('budgets.clientSelector.razaoSocial')}</label>
            <input value={value.client_name} onChange={e=>onChange({...value, client_name: e.target.value, client_id: null})} required className="glass-input" /></div>
          <div><label className={L}>{t('budgets.clientSelector.documentField')}</label>
            <input value={value.client_document} onChange={e=>onChange({...value, client_document: e.target.value, client_id: null})} className="glass-input" /></div>
          <div><label className={L}>{t('budgets.clientSelector.sector')}</label>
            <input value={value.client_contact_sector} onChange={e=>onChange({...value, client_contact_sector: e.target.value})} className="glass-input" /></div>
          <div><label className={L}>{t('budgets.clientSelector.contact')}</label>
            <input value={value.client_contact_name} onChange={e=>onChange({...value, client_contact_name: e.target.value})} className="glass-input" /></div>
          <div><label className={L}>{t('budgets.clientSelector.phone')}</label>
            <input value={value.client_contact_phone} onChange={e=>onChange({...value, client_contact_phone: e.target.value})} className="glass-input" /></div>
          <div className="sm:col-span-2"><label className={L}>{t('budgets.clientSelector.email')}</label>
            <input type="email" value={value.client_contact_email} onChange={e=>onChange({...value, client_contact_email: e.target.value})} className="glass-input" /></div>
        </div>
      )}
    </div>
  )
}
