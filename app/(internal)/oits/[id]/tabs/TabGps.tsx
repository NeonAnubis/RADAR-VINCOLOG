'use client'

import { useState, useTransition } from 'react'
import { Radio, RadioTower, ExternalLink, Loader2, MapPin } from 'lucide-react'
import { toggleGpsTracking } from '@/lib/actions/oits'
import { fmtDateTime } from '@/lib/utils/format'
import { useT } from '@/lib/i18n/I18nProvider'
import type { DbOit, DbGpsPosition } from '@/lib/types'

export default function TabGps({ oit, positions }: { oit: DbOit; positions: DbGpsPosition[] }) {
  const t = useT()
  const [pending, start] = useTransition()
  const [active, setActive] = useState(oit.gps_tracking_active)

  const last = positions[0]
  const minutesSinceLast = oit.last_gps_at
    ? Math.floor((Date.now() - new Date(oit.last_gps_at).getTime()) / 60000)
    : null

  // Bounding box
  const lats = positions.map(p => p.latitude)
  const lngs = positions.map(p => p.longitude)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const padding = 0.001
  const dLat = Math.max(maxLat - minLat, 0.01) + padding
  const dLng = Math.max(maxLng - minLng, 0.01) + padding

  function project(p: DbGpsPosition): [number, number] {
    const x = ((p.longitude - minLng + padding/2) / dLng) * 100
    const y = 100 - ((p.latitude - minLat + padding/2) / dLat) * 100
    return [x, y]
  }

  function handleToggle() {
    const next = !active
    start(async () => {
      const res = await toggleGpsTracking(oit.id, next)
      if (res.ok) setActive(next)
    })
  }

  const lastUpdateLabel =
    minutesSinceLast === null ? t('oits.gpsTab.never') :
    minutesSinceLast < 1 ? t('oits.gpsTab.now') :
    minutesSinceLast < 60 ? `${minutesSinceLast} min` :
    `${Math.floor(minutesSinceLast/60)}h ${minutesSinceLast%60}m`

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          {active
            ? <RadioTower className="w-4 h-4 text-violet-300 animate-pulse" />
            : <Radio className="w-4 h-4 text-blue-400" />}
          {t('oits.gpsTab.title')}
        </h2>
        <button onClick={handleToggle} disabled={pending}
          className="px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-50"
          style={active
            ? { background: 'rgba(167,139,250,0.25)', color: '#C4B5FD', border: '1px solid rgba(167,139,250,0.5)' }
            : { background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)' }}>
          {pending ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
          {active ? t('oits.gpsTab.pause') : t('oits.gpsTab.activate')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Stat label={t('oits.gpsTab.statusLabel')} value={active ? t('oits.gpsTab.statusActive') : t('oits.gpsTab.statusInactive')} color={active ? '#A78BFA' : '#94A3B8'} />
        <Stat label={t('oits.gpsTab.pingsReceived')} value={String(positions.length)} color="#60A5FA" />
        <Stat label={t('oits.gpsTab.lastUpdate')} value={lastUpdateLabel} color={minutesSinceLast !== null && minutesSinceLast > 20 ? '#F87171' : '#34D399'} />
      </div>

      {minutesSinceLast !== null && minutesSinceLast > 20 && active && (
        <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
          {t('oits.gpsTab.noSignal', { minutes: minutesSinceLast })}
        </div>
      )}

      {positions.length === 0 ? (
        <div className="rounded-xl py-12 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <MapPin className="w-10 h-10 text-blue-800 mx-auto mb-2" />
          <p className="text-sm text-blue-600">{t('oits.gpsTab.noPings')}</p>
          <p className="text-xs text-blue-700 mt-1">{t('oits.gpsTab.noPingsSub')}</p>
        </div>
      ) : (
        <>
          {/* Trail map (SVG) */}
          <div className="rounded-xl overflow-hidden relative" style={{ background: '#030B1F', border: '1px solid rgba(255,255,255,0.08)' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-72 block">
              <defs>
                <pattern id="gpsGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(96,165,250,0.08)" strokeWidth="0.2" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#gpsGrid)" />

              {/* Trail line */}
              {positions.length > 1 && (
                <polyline
                  points={positions.slice().reverse().map(p => project(p).join(',')).join(' ')}
                  fill="none" stroke="#A78BFA" strokeWidth="0.6" opacity="0.7" strokeLinejoin="round"
                />
              )}

              {/* Position dots */}
              {positions.slice(0, 50).reverse().map((p, i, arr) => {
                const [x, y] = project(p)
                const isLast = i === arr.length - 1
                return (
                  <g key={p.id}>
                    {isLast && (
                      <>
                        <circle cx={x} cy={y} r="2.5" fill="#A78BFA" opacity="0.4">
                          <animate attributeName="r" from="2.5" to="5" dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={x} cy={y} r="1.5" fill="#A78BFA" stroke="white" strokeWidth="0.3" />
                      </>
                    )}
                    {!isLast && <circle cx={x} cy={y} r="0.6" fill="#60A5FA" opacity="0.6" />}
                  </g>
                )
              })}
            </svg>
            {last && (
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded text-[10px] font-mono"
                style={{ background: 'rgba(2,8,28,0.8)', color: '#C4B5FD' }}>
                {last.latitude.toFixed(5)}, {last.longitude.toFixed(5)}
              </div>
            )}
            {last && (
              <a target="_blank" rel="noopener noreferrer"
                href={`https://www.google.com/maps?q=${last.latitude},${last.longitude}`}
                className="absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1"
                style={{ background: 'rgba(59,130,246,0.5)' }}>
                Google Maps <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>

          {/* Position list */}
          <div>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">{t('oits.gpsTab.lastPositionsTitle')}</p>
            <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
              {positions.slice(0, 30).map(p => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2 text-xs rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="font-mono text-blue-300">{p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}</span>
                  <div className="flex items-center gap-3">
                    {p.speed != null && <span className="text-blue-500">{(p.speed * 3.6).toFixed(0)} km/h</span>}
                    {p.accuracy != null && <span className="text-blue-600">±{p.accuracy.toFixed(0)}m</span>}
                    <span className="text-blue-500">{fmtDateTime(p.recorded_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <p className="text-[10px] text-blue-500 uppercase tracking-wider">{label}</p>
      <p className="text-base font-extrabold mt-1" style={{ color }}>{value}</p>
    </div>
  )
}
