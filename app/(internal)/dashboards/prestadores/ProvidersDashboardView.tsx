'use client'

import Link from 'next/link'
import { Users, Star, Truck } from 'lucide-react'
import { ProviderStatusBadge } from '@/components/StatusBadge'
import { useT } from '@/lib/i18n/I18nProvider'
import type { DbProvider } from '@/lib/types'

interface Props {
  all: DbProvider[]
  ativos: number
  adormecidos: number
  totalFretes: number
  byType: Record<string, number>
}

export default function ProvidersDashboardView({ all, ativos, adormecidos, totalFretes, byType }: Props) {
  const t = useT()
  const metrics = [
    { tkey: 'totalRegistered', value: all.length,   color: 'bg-blue-500/25 text-blue-300',     icon: Users },
    { tkey: 'totalActive',     value: ativos,       color: 'bg-emerald-500/25 text-emerald-300', icon: Users },
    { tkey: 'totalDormant',    value: adormecidos,  color: 'bg-slate-500/25 text-slate-300',   icon: Users },
    { tkey: 'freightsDone',    value: totalFretes,  color: 'bg-violet-500/25 text-violet-300', icon: Truck },
  ]
  const headers = ['name', 'vehicle', 'plate', 'status', 'freights', 'rating'] as const

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('dashboards.providers.title')}</h1>
        <p className="text-blue-400 mt-0.5 text-sm">{t('dashboards.providers.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ tkey, value, icon: Icon, color }) => (
          <div key={tkey} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">{t(`dashboards.providers.${tkey}`)}</p>
                <p className="text-3xl font-extrabold text-white mt-1">{value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4">{t('dashboards.providers.byVehicleType')}</h2>
          {Object.keys(byType).length === 0 ? (
            <p className="text-sm text-blue-600">{t('dashboards.providers.noData')}</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(byType).sort((a,b) => b[1] - a[1]).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-sm text-blue-200 flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-blue-500" />{type}</span>
                  <span className="text-base font-extrabold text-white">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4">{t('dashboards.providers.top5')}</h2>
          <div className="space-y-2">
            {all.slice(0, 5).map(p => (
              <Link key={p.id} href={`/prestadores/${p.id}`}
                className="flex items-center gap-3 p-3 rounded-lg glass-hover transition-colors">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD' }}>
                  {p.name.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{p.name}</p>
                  <p className="text-xs text-blue-400">{p.vehicle_type} · {p.vehicle_plate}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-white">{p.total_fretes}</p>
                  <div className="flex items-center gap-0.5 justify-end">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-blue-300">{p.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-bold text-white">{t('dashboards.providers.allTitle')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {headers.map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-4 py-3 uppercase tracking-widest">{t(`dashboards.providers.columns.${h}`)}</th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {all.map(p => (
                <tr key={p.id} className="glass-hover transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-4 py-3 text-sm font-medium text-blue-100">{p.name}</td>
                  <td className="px-4 py-3 text-xs text-blue-300">{p.vehicle_type}</td>
                  <td className="px-4 py-3 text-xs text-blue-300 font-mono">{p.vehicle_plate}</td>
                  <td className="px-4 py-3"><ProviderStatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-sm font-bold text-white">{p.total_fretes}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-blue-300">{p.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/prestadores/${p.id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300">{t('common.view')} →</Link>
                  </td>
                </tr>
              ))}
              {all.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-blue-600 text-sm">{t('dashboards.providers.noProviders')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
