'use client'

import { useState, useTransition } from 'react'
import { Truck, Package, MapPin, CheckCircle, Camera, AlertTriangle, Loader2, Send, FileSignature } from 'lucide-react'
import { providerUpdateStatus, providerUploadEvidence, providerUploadPod } from '@/lib/actions/provider-portal'
import { createOccurrenceFromToken } from '@/lib/actions/occurrences'
import { OCCURRENCE_TYPES } from '@/lib/types'
import { useT } from '@/lib/i18n/I18nProvider'
import type { DbOit, OccurrenceType } from '@/lib/types'

const STATUS_BUTTONS = [
  { key: 'em_rota_coleta',        tkey: 'btnEnRouteToPickup',     icon: Truck,    color: '#60A5FA' },
  { key: 'chegou_coleta',         tkey: 'btnArrivedPickup',       icon: MapPin,   color: '#60A5FA' },
  { key: 'carregamento_iniciado', tkey: 'btnLoadingStarted',      icon: Package,  color: '#38BDF8' },
  { key: 'carga_embarcada',       tkey: 'btnCargoLoaded',         icon: Package,  color: '#38BDF8' },
  { key: 'saiu_coleta',           tkey: 'btnLeftPickup',          icon: Truck,    color: '#A78BFA' },
  { key: 'em_transito',           tkey: 'btnInTransit',           icon: Truck,    color: '#A78BFA' },
  { key: 'chegou_destino',        tkey: 'btnArrivedDestination',  icon: MapPin,   color: '#F472B6' },
  { key: 'descarga_iniciada',     tkey: 'btnUnloadStarted',       icon: Package,  color: '#FB923C' },
] as const

export default function ProviderActions({ token, oit }: { token: string; oit: DbOit }) {
  const t = useT()
  const [pending, start] = useTransition()
  const [lastStatus, setLastStatus] = useState<string | null>(null)
  const [showOccurrence, setShowOccurrence] = useState(false)
  const [showPod, setShowPod] = useState(false)
  const [podName, setPodName] = useState('')
  const [occType, setOccType] = useState<OccurrenceType>('atraso_entrega')
  const [occDesc, setOccDesc] = useState('')

  function handleStatus(key: string, label: string) {
    setLastStatus(key)
    start(async () => {
      await providerUpdateStatus(token, key, label)
    })
  }

  function handleUploadEvidence(eventType: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]; if (!file) return
      const fd = new FormData(); fd.append('file', file)
      start(async () => { await providerUploadEvidence(token, eventType, fd) })
    }
  }

  function handlePodSubmit(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!podName.trim()) { alert(t('providerPortal.podRecipient')); return }
    const fd = new FormData()
    if (file) fd.append('file', file)
    start(async () => {
      await providerUploadPod(token, podName, fd)
      setShowPod(false); setPodName('')
    })
  }

  function handleOccurrence() {
    if (!occDesc.trim()) return
    start(async () => {
      await createOccurrenceFromToken({ oit_token: token, type: occType, description: occDesc })
      setShowOccurrence(false); setOccDesc('')
    })
  }

  return (
    <div className="space-y-3">
      {/* Status buttons grid */}
      <div className="glass rounded-2xl p-4">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">{t('providerPortal.updateStatus')}</p>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_BUTTONS.map(b => {
            const Icon = b.icon
            const sentNow = lastStatus === b.key
            const label = t(`providerPortal.${b.tkey}`)
            return (
              <div key={b.key} className="space-y-1.5">
                <button onClick={() => handleStatus(b.key, label)} disabled={pending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  style={{ background: sentNow ? `${b.color}33` : `${b.color}1a`, border: `1px solid ${b.color}55`, color: b.color }}>
                  {pending && lastStatus === b.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
                  {label}
                </button>
                <label className="flex items-center justify-center gap-1 text-[10px] text-blue-500 cursor-pointer hover:text-blue-300">
                  <Camera className="w-3 h-3" /> {t('providerPortal.attachPhoto')}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadEvidence(b.key)} />
                </label>
              </div>
            )
          })}
        </div>
      </div>

      {/* POD section */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
        {!showPod ? (
          <button onClick={() => setShowPod(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold text-white"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}>
            <CheckCircle className="w-4 h-4" /> {t('providerPortal.podBlockTitle')}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-bold text-emerald-300">{t('providerPortal.podTitle')}</p>
            <div>
              <label className="block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider">{t('providerPortal.podRecipient')}</label>
              <input value={podName} onChange={e => setPodName(e.target.value)} placeholder={t('providerPortal.podRecipientPlaceholder')} className="glass-input" />
            </div>
            <label className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {pending ? t('providerPortal.podSending') : t('providerPortal.podPhotoButton')}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePodSubmit} />
            </label>
            <button onClick={() => setShowPod(false)} className="w-full text-xs font-medium text-blue-400">{t('common.cancel')}</button>
          </div>
        )}
      </div>

      {/* Occurrence section */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
        {!showOccurrence ? (
          <button onClick={() => setShowOccurrence(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-red-300 glass">
            <AlertTriangle className="w-4 h-4" /> {t('providerPortal.reportOccurrence')}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-bold text-red-300">{t('providerPortal.reportOccurrenceTitle')}</p>
            <select value={occType} onChange={e => setOccType(e.target.value as OccurrenceType)} className="glass-select">
              {Object.keys(OCCURRENCE_TYPES).map(k => <option key={k} value={k}>{t(`occurrences.types.${k}`)}</option>)}
            </select>
            <textarea value={occDesc} onChange={e => setOccDesc(e.target.value)} rows={3} placeholder={t('providerPortal.occurrenceDescPlaceholder')} className="glass-input resize-none" />
            <div className="flex gap-2">
              <button onClick={handleOccurrence} disabled={pending || !occDesc.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#EF4444,#B91C1C)' }}>
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {t('providerPortal.report')}
              </button>
              <button onClick={() => setShowOccurrence(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-blue-400 glass">{t('common.cancel')}</button>
            </div>
          </div>
        )}
      </div>

      {/* Contract */}
      {oit.contract_pdf_url && !oit.signed_contract_url && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(96,165,250,0.25)' }}>
          <p className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-1.5"><FileSignature className="w-4 h-4" /> {t('providerPortal.contractPending')}</p>
          <p className="text-xs text-blue-400">{t('providerPortal.contractPendingHelp')}</p>
        </div>
      )}
    </div>
  )
}
