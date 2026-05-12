'use client'

import { useEffect, useRef, useState } from 'react'
import { Radio, RadioTower, Loader2, Cloud, CloudOff } from 'lucide-react'
import { receiveGpsBatch } from '@/lib/actions/gps'
import { useT, useI18n } from '@/lib/i18n/I18nProvider'

interface QueuedPosition {
  latitude: number
  longitude: number
  accuracy?: number
  speed?: number
  battery_level?: number
  recorded_at: string
}

const QUEUE_KEY = (token: string) => `radar-gps-queue-${token}`
const STATE_KEY = (token: string) => `radar-gps-active-${token}`

/** Tracks GPS in browser + queues positions when offline + flushes when back online (spec §26.3) */
export default function GpsTracker({ token, initiallyActive }: { token: string; initiallyActive: boolean }) {
  const t = useT()
  const { locale } = useI18n()
  const localeTag = locale === 'pt' ? 'pt-BR' : 'en-US'
  const [active, setActive] = useState(initiallyActive)
  const [last, setLast] = useState<QueuedPosition | null>(null)
  const [queueSize, setQueueSize] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [permErr, setPermErr] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function loadQueue(): QueuedPosition[] {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY(token)) ?? '[]') } catch { return [] }
  }
  function saveQueue(q: QueuedPosition[]) {
    localStorage.setItem(QUEUE_KEY(token), JSON.stringify(q))
    setQueueSize(q.length)
  }
  function pushPosition(p: QueuedPosition) {
    const q = loadQueue(); q.push(p); saveQueue(q); setLast(p)
  }

  async function flush() {
    if (!navigator.onLine) return
    const q = loadQueue()
    if (q.length === 0) return
    setSyncing(true)
    try {
      const res = await receiveGpsBatch(token, q)
      if (res.ok) saveQueue([])
    } finally {
      setSyncing(false)
    }
  }

  // Resume state from localStorage
  useEffect(() => {
    setIsOnline(navigator.onLine)
    setQueueSize(loadQueue().length)
    const wasActive = localStorage.getItem(STATE_KEY(token)) === '1'
    if (wasActive) start()

    const onOnline  = () => { setIsOnline(true); flush() }
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function start() {
    if (!navigator.geolocation) { setPermErr(t('providerPortal.gpsUnavailable')); return }
    setActive(true)
    localStorage.setItem(STATE_KEY(token), '1')

    const id = navigator.geolocation.watchPosition(
      pos => {
        const p: QueuedPosition = {
          latitude:  pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy:  pos.coords.accuracy ?? undefined,
          speed:     pos.coords.speed ?? undefined,
          recorded_at: new Date(pos.timestamp).toISOString(),
        }
        pushPosition(p)
      },
      err => setPermErr(`GPS: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 30_000 },
    )
    watchIdRef.current = id

    // Flush queue every 30s while online
    flushTimerRef.current = setInterval(() => { if (navigator.onLine) flush() }, 30_000)
  }

  function stop() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current); flushTimerRef.current = null
    }
    setActive(false)
    localStorage.removeItem(STATE_KEY(token))
  }

  function toggle() { if (active) stop(); else start() }

  return (
    <div className="rounded-2xl p-4" style={{ background: active ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {active
            ? <RadioTower className="w-4 h-4 text-violet-300 animate-pulse" />
            : <Radio className="w-4 h-4 text-blue-500" />}
          <p className="text-sm font-bold text-white">{t('providerPortal.gpsTitle')}</p>
        </div>
        <button onClick={toggle}
          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={active
            ? { background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.4)' }
            : { background: 'rgba(167,139,250,0.25)', color: '#C4B5FD', border: '1px solid rgba(167,139,250,0.5)' }}>
          {active ? t('providerPortal.gpsStop') : t('providerPortal.gpsStart')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[10px]">
        <div className="flex items-center gap-1.5">
          {isOnline ? <Cloud className="w-3 h-3 text-emerald-400" /> : <CloudOff className="w-3 h-3 text-amber-400" />}
          <span className={isOnline ? 'text-emerald-300' : 'text-amber-300'}>{isOnline ? t('common.online') : t('common.offline')}</span>
        </div>
        <div className="text-blue-400">
          {t('providerPortal.queue')} <span className="font-bold text-white">{queueSize}</span>
        </div>
        <div className="flex items-center gap-1 justify-end">
          {syncing && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
          <span className="text-blue-400">{syncing ? t('providerPortal.syncing') : t('providerPortal.synced')}</span>
        </div>
      </div>

      {last && (
        <p className="mt-2 text-[10px] text-blue-500 font-mono">
          {t('providerPortal.lastPos')} {last.latitude.toFixed(5)}, {last.longitude.toFixed(5)} · {new Date(last.recorded_at).toLocaleTimeString(localeTag)}
        </p>
      )}

      {permErr && <p className="mt-2 text-[10px] text-red-400">{permErr}</p>}

      {active && (
        <p className="mt-2 text-[10px] text-blue-500">
          {t('providerPortal.gpsHelp')}
        </p>
      )}
    </div>
  )
}
