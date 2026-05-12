'use client'

import Link from 'next/link'
import { Package, Truck, CheckCircle, AlertTriangle, ArrowRight, FileText, Users, DollarSign } from 'lucide-react'
import { OitStatusBadge, ServiceLevelBadge } from '@/components/StatusBadge'
import { fmtCurrency } from '@/lib/utils/format'
import { useI18n } from '@/lib/i18n/I18nProvider'
import type { DbOit } from '@/lib/types'

function MetricCard({ label, value, sub, icon: Icon, accent }:
  { label: string; value: string | number; sub?: string; icon: React.ElementType; accent: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-blue-300">{label}</p>
          <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-blue-400/70 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

interface Props {
  allOits: DbOit[]
  activeOits: DbOit[]
  todayOits: DbOit[]
  finalizedToday: number
  openOccurrences: number
  weekRevenue: number
  pendingProposals: number
  activeProviders: number
  dormantProviders: number
}

export default function DashboardView({
  allOits, activeOits, todayOits, finalizedToday, openOccurrences,
  weekRevenue, pendingProposals, activeProviders, dormantProviders,
}: Props) {
  const { t, locale } = useI18n()
  const localeTag = locale === 'pt' ? 'pt-BR' : 'en-US'
  const dateStr = new Date().toLocaleDateString(localeTag, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-blue-400 mt-0.5 text-xs sm:text-sm">{dateStr}</p>
        </div>
        <Link href="/oits" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white w-fit"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 18px rgba(59,130,246,0.4)' }}>
          {t('dashboard.viewKanban')}
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label={t('dashboard.totalToday')}     value={todayOits.length}   sub={t('dashboard.totalTodaySub')}     icon={Package}       accent="bg-blue-500/25 text-blue-300" />
        <MetricCard label={t('dashboard.inProgress')}     value={activeOits.length}  sub={t('dashboard.inProgressSub')}     icon={Truck}         accent="bg-violet-500/25 text-violet-300" />
        <MetricCard label={t('dashboard.deliveredToday')} value={finalizedToday}     sub={t('dashboard.deliveredTodaySub')} icon={CheckCircle}   accent="bg-emerald-500/25 text-emerald-300" />
        <MetricCard label={t('dashboard.occurrences')}    value={openOccurrences}    sub={t('dashboard.occurrencesSub')}    icon={AlertTriangle} accent="bg-red-500/25 text-red-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Active OITs */}
        <div className="lg:col-span-3 glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <h2 className="font-bold text-white">{t('dashboard.activeFreights')}</h2>
              <p className="text-xs text-blue-400 mt-0.5">{t('dashboard.activeFreightsSub', { count: activeOits.length })}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('dashboard.live')}
            </span>
          </div>
          {activeOits.length === 0 ? (
            <div className="p-10 text-center">
              <Truck className="w-10 h-10 text-blue-900 mx-auto mb-2" />
              <p className="text-blue-600 text-sm">{t('dashboard.noActiveFreights')}</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {activeOits.slice(0, 10).map(o => (
                <Link key={o.id} href={`/oits/${o.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 glass-hover transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-white">{o.number}</span>
                      <OitStatusBadge status={o.status} />
                      <ServiceLevelBadge level={o.service_level} />
                    </div>
                    <p className="text-xs text-blue-400 mt-0.5">{o.client_name}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-blue-300 font-medium">{o.providers?.name?.split(' ').slice(0,2).join(' ') ?? '—'}</p>
                    <p className="text-blue-500">{fmtCurrency(o.vendor_value)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent OITs */}
        <div className="lg:col-span-2 glass rounded-2xl">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="font-bold text-white">{t('dashboard.recent')}</h2>
            <Link href="/oits" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
              {t('dashboard.viewAll')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {allOits.slice(0, 6).map(o => (
            <Link key={o.id} href={`/oits/${o.id}`}
              className="flex items-start gap-3 px-5 py-3.5 glass-hover transition-colors"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-white">{o.number}</span>
                  <OitStatusBadge status={o.status} />
                </div>
                <p className="text-xs text-blue-400 mt-0.5 truncate">{o.client_name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboards/comercial" className="glass glass-hover rounded-2xl p-5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white">{t('dashboard.commercial')}</h3>
          </div>
          <p className="text-xs text-blue-400">{t('dashboard.pendingProposals', { count: pendingProposals })}</p>
          <p className="text-lg font-extrabold text-white mt-1">{fmtCurrency(weekRevenue)}</p>
          <p className="text-[10px] text-blue-500">{t('dashboard.last7Days')}</p>
        </Link>
        <Link href="/dashboards/financeiro" className="glass glass-hover rounded-2xl p-5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">{t('dashboard.financial')}</h3>
          </div>
          <p className="text-xs text-blue-400">{t('dashboard.operationalAudit')}</p>
          <Link href="/financeiro" className="text-xs text-blue-400 hover:text-blue-300">{t('dashboard.openLink')}</Link>
        </Link>
        <Link href="/dashboards/prestadores" className="glass glass-hover rounded-2xl p-5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white">{t('dashboard.providers')}</h3>
          </div>
          <p className="text-xs text-blue-400">{t('dashboard.providersStatusSub', { active: activeProviders, dormant: dormantProviders })}</p>
        </Link>
        <Link href="/ocorrencias" className="glass glass-hover rounded-2xl p-5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-white">{t('dashboard.occurrences')}</h3>
          </div>
          <p className="text-xs text-blue-400">{openOccurrences} {t('dashboard.occurrencesSub')}</p>
        </Link>
      </div>
    </div>
  )
}
