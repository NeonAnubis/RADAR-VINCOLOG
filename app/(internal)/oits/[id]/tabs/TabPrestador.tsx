'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Truck, Save, Loader2, CheckCircle, Phone } from 'lucide-react'
import { allocateProviderToOit, generateProviderInvite } from '@/lib/actions/oits'
import { useT } from '@/lib/i18n/I18nProvider'
import type { DbOit, DbProvider } from '@/lib/types'

const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function TabPrestador({ oit, availableProviders }: { oit: DbOit; availableProviders: DbProvider[] }) {
  const t = useT()
  const [pending, start] = useTransition()
  const [selectedProvider, setSelected] = useState<string | null>(oit.provider_id)
  const [inviteToken, setInviteToken] = useState<string | null>(oit.provider_invite_token)
  const [copied, setCopied] = useState(false)
  const [vehicleData, setVehicle] = useState({
    driver_name: oit.driver_name ?? '',
    driver_cpf: oit.driver_cpf ?? '',
    driver_phone: oit.driver_phone ?? '',
    driver_cnh: oit.driver_cnh ?? '',
    vehicle_type: oit.vehicle_type ?? '',
    vehicle_body: oit.vehicle_body ?? '',
    vehicle_plate_cavalo: oit.vehicle_plate_cavalo ?? '',
    vehicle_plate_carreta: oit.vehicle_plate_carreta ?? '',
    vehicle_has_tarp: oit.vehicle_has_tarp ?? false,
    vehicle_has_tracker: oit.vehicle_has_tracker ?? false,
    vehicle_tracker_link: oit.vehicle_tracker_link ?? '',
  })

  function handleAllocate() {
    if (!selectedProvider) return
    start(async () => { await allocateProviderToOit(oit.id, selectedProvider, vehicleData) })
  }

  function handleGenerateInvite() {
    start(async () => {
      const res = await generateProviderInvite(oit.id)
      if (res.ok && res.token) setInviteToken(res.token)
    })
  }

  function copyInviteLink() {
    const url = `${window.location.origin}/cadastro-prestador/${inviteToken}`
    navigator.clipboard.writeText(url)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (oit.providers) {
    const p = oit.providers
    return (
      <div className="space-y-4">
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">{t('oits.providerTab.linkedTitle')}</h2>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/35">{t('oits.providerTab.allocated')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold"
              style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(96,165,250,0.4)', color: '#93C5FD' }}>
              {p.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
            </div>
            <div>
              <p className="text-base font-bold text-white">{p.name}</p>
              <p className="text-xs text-blue-400">{t('oits.providerTab.cpf')}: {p.cpf ?? '—'} · {t('oits.providerTab.cnh')}: {p.cnh ?? '—'}</p>
              <p className="text-xs text-blue-400 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{p.phone}</p>
            </div>
          </div>
          <Link href={`/prestadores/${p.id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300">{t('oits.providerTab.viewProfile')}</Link>
        </div>

        <div className="glass rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2"><Truck className="w-4 h-4" /> {t('oits.providerTab.vehicleDriverTitle')}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-blue-500 text-xs">{t('oits.providerTab.type')}</p><p className="text-white">{oit.vehicle_type ?? '—'}</p></div>
            <div><p className="text-blue-500 text-xs">{t('oits.providerTab.body')}</p><p className="text-white">{oit.vehicle_body ?? '—'}</p></div>
            <div><p className="text-blue-500 text-xs">{t('oits.providerTab.plateCavalo')}</p><p className="text-white font-mono">{oit.vehicle_plate_cavalo ?? p.vehicle_plate}</p></div>
            <div><p className="text-blue-500 text-xs">{t('oits.providerTab.plateCarreta')}</p><p className="text-white font-mono">{oit.vehicle_plate_carreta ?? '—'}</p></div>
            <div><p className="text-blue-500 text-xs">{t('oits.providerTab.driver')}</p><p className="text-white">{oit.driver_name ?? '—'}</p></div>
            <div><p className="text-blue-500 text-xs">{t('oits.providerTab.cpf')}</p><p className="text-white">{oit.driver_cpf ?? '—'}</p></div>
            <div><p className="text-blue-500 text-xs">{t('oits.providerTab.phone')}</p><p className="text-white">{oit.driver_phone ?? '—'}</p></div>
            <div><p className="text-blue-500 text-xs">{t('oits.providerTab.cnh')}</p><p className="text-white">{oit.driver_cnh ?? '—'}</p></div>
          </div>
          <div className="flex gap-2 pt-2">
            {oit.vehicle_has_tarp    && <span className="px-2 py-0.5 rounded text-[10px] bg-blue-400/20 text-blue-300">{t('oits.providerTab.hasTarp')}</span>}
            {oit.vehicle_has_tracker && <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-400/20 text-emerald-300">{t('oits.providerTab.hasTracker')}</span>}
          </div>
          {oit.vehicle_tracker_link && (
            <a href={oit.vehicle_tracker_link} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 font-bold">
              {t('oits.providerTab.openTrackerLink')}
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-violet-300 flex items-center gap-2"><Loader2 className="w-4 h-4" /> {t('oits.providerTab.inviteTitle')}</h3>
          {!inviteToken && (
            <button onClick={handleGenerateInvite} disabled={pending}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>
              {pending ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
              {t('oits.providerTab.generateInvite')}
            </button>
          )}
        </div>
        <p className="text-xs text-blue-400 mb-3">{t('oits.providerTab.inviteHelp')}</p>
        {inviteToken && (
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <code className="text-xs text-violet-300 font-mono flex-1 truncate">
              /cadastro-prestador/{inviteToken}
            </code>
            <button onClick={copyInviteLink}
              className="px-2 py-1 rounded text-[10px] font-bold text-violet-300 hover:text-white glass-sm">
              {copied ? t('oits.providerTab.copied') : t('oits.providerTab.copyUrl')}
            </button>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white">{t('oits.providerTab.allocateTitle')}</h2>
        <Link href="/prestadores/novo" className="text-xs font-bold text-blue-400 hover:text-blue-300">{t('oits.providerTab.registerNew')}</Link>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {availableProviders.map(p => (
          <button key={p.id} onClick={() => setSelected(p.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
            style={selectedProvider === p.id
              ? { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(96,165,250,0.5)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-10 h-10 rounded-full glass-sm flex items-center justify-center text-xs font-bold text-blue-300">
              {p.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{p.name}</p>
              <p className="text-xs text-blue-400">{p.vehicle_type} · {p.vehicle_plate}</p>
            </div>
            {selectedProvider === p.id && <CheckCircle className="w-4 h-4 text-blue-400" />}
          </button>
        ))}
      </div>

      {selectedProvider && (
        <div className="space-y-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-bold text-white">{t('oits.providerTab.tripData')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={L}>{t('oits.providerTab.driverName')}</label><input value={vehicleData.driver_name} onChange={e=>setVehicle({...vehicleData,driver_name:e.target.value})} className="glass-input" /></div>
            <div><label className={L}>{t('oits.providerTab.cpfDriver')}</label><input value={vehicleData.driver_cpf} onChange={e=>setVehicle({...vehicleData,driver_cpf:e.target.value})} className="glass-input" /></div>
            <div><label className={L}>{t('oits.providerTab.phone')}</label><input value={vehicleData.driver_phone} onChange={e=>setVehicle({...vehicleData,driver_phone:e.target.value})} className="glass-input" /></div>
            <div><label className={L}>{t('oits.providerTab.cnh')}</label><input value={vehicleData.driver_cnh} onChange={e=>setVehicle({...vehicleData,driver_cnh:e.target.value})} className="glass-input" /></div>
            <div><label className={L}>{t('oits.providerTab.vehicleType')}</label><input value={vehicleData.vehicle_type} onChange={e=>setVehicle({...vehicleData,vehicle_type:e.target.value})} className="glass-input" /></div>
            <div><label className={L}>{t('oits.providerTab.carroceria')}</label><input value={vehicleData.vehicle_body} onChange={e=>setVehicle({...vehicleData,vehicle_body:e.target.value})} className="glass-input" /></div>
            <div><label className={L}>{t('oits.providerTab.plateCavalo')}</label><input value={vehicleData.vehicle_plate_cavalo} onChange={e=>setVehicle({...vehicleData,vehicle_plate_cavalo:e.target.value})} className="glass-input" /></div>
            <div><label className={L}>{t('oits.providerTab.plateCarreta')}</label><input value={vehicleData.vehicle_plate_carreta} onChange={e=>setVehicle({...vehicleData,vehicle_plate_carreta:e.target.value})} className="glass-input" /></div>
            <div className="flex items-end gap-2 col-span-2">
              <label className="flex items-center gap-2 text-xs text-blue-300 pb-2">
                <input type="checkbox" checked={vehicleData.vehicle_has_tarp} onChange={e=>setVehicle({...vehicleData,vehicle_has_tarp:e.target.checked})} /> {t('oits.providerTab.hasTarpLabel')}
              </label>
              <label className="flex items-center gap-2 text-xs text-blue-300 pb-2">
                <input type="checkbox" checked={vehicleData.vehicle_has_tracker} onChange={e=>setVehicle({...vehicleData,vehicle_has_tracker:e.target.checked})} /> {t('oits.providerTab.hasTrackerLabel')}
              </label>
            </div>
            {vehicleData.vehicle_has_tracker && (
              <div className="col-span-2"><label className={L}>{t('oits.providerTab.trackerLink')}</label><input value={vehicleData.vehicle_tracker_link} onChange={e=>setVehicle({...vehicleData,vehicle_tracker_link:e.target.value})} className="glass-input" /></div>
            )}
          </div>

          <button onClick={handleAllocate} disabled={pending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {pending ? t('oits.providerTab.allocating') : t('oits.providerTab.confirmAllocation')}
          </button>
        </div>
      )}
      </div>
    </div>
  )
}
