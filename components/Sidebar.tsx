'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, Briefcase, Users, FileSignature,
  DollarSign, AlertTriangle, BarChart2, Settings, Truck, LogOut, ShieldCheck, Menu, X,
} from 'lucide-react'
import clsx from 'clsx'
import { signOut } from '@/lib/actions/auth'
import { useT } from '@/lib/i18n/I18nProvider'
import ThemeLanguageToggle from './ThemeLanguageToggle'

const NAV = [
  { href: '/dashboard',    key: 'controlTower', icon: LayoutDashboard },
  { href: '/orcamentos',   key: 'budgets',      icon: Briefcase },
  { href: '/oits',         key: 'oits',         icon: FileText },
  { href: '/prestadores',  key: 'providers',    icon: Users },
  { href: '/contratos',    key: 'contracts',    icon: FileSignature },
  { href: '/financeiro',   key: 'finance',      icon: DollarSign },
  { href: '/ocorrencias',  key: 'occurrences',  icon: AlertTriangle },
  { href: '/relatorios',   key: 'reports',      icon: BarChart2 },
  { href: '/auditoria',    key: 'audit',        icon: ShieldCheck },
] as const

interface SidebarProps { userEmail?: string }

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const t = useT()
  const [open, setOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* ── Mobile top bar (visible only below lg) ── */}
      <div
        className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-soft)' }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -ml-2 rounded-lg"
          style={{ color: 'var(--text-primary)' }}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 2px 12px rgba(59,130,246,0.4)' }}
          >
            <Truck className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="leading-none">
            <p className="font-extrabold text-sm tracking-wider" style={{ color: 'var(--text-primary)' }}>RADAR</p>
            <p className="font-bold text-[8px] tracking-[0.25em] uppercase mt-[2px]" style={{ color: 'var(--text-secondary)' }}>VINCOLOG</p>
          </div>
        </div>
        <div className="w-9" />
      </div>

      {/* ── Mobile backdrop ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(2,12,31,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar (fixed drawer on mobile, static aside on lg+) ── */}
      <aside
        className={clsx(
          'flex flex-col w-64 z-50',
          'fixed inset-y-0 left-0 transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:static lg:translate-x-0 lg:min-h-screen lg:flex-shrink-0',
        )}
        style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-soft)' }}
      >
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-soft)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 18px rgba(59,130,246,0.45)' }}>
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-[15px] leading-none tracking-wider" style={{ color: 'var(--text-primary)' }}>RADAR</p>
              <p className="font-bold text-[9px] mt-[3px] tracking-[0.28em] uppercase" style={{ color: 'var(--text-secondary)' }}>VINCOLOG</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-1.5 rounded-lg"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {NAV.map(({ href, key, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all')}
                style={active ? {
                  background: 'linear-gradient(135deg,rgba(59,130,246,0.35),rgba(37,99,235,0.25))',
                  border: '1px solid rgba(96,165,250,0.3)',
                  boxShadow: '0 2px 12px rgba(59,130,246,0.2)',
                  color: 'var(--text-primary)',
                } : { background: 'transparent', border: '1px solid transparent', color: 'var(--text-muted)' }}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {t(`sidebar.${key}`)}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-4 space-y-2" style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '1rem' }}>
          <Link href="/configuracoes"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ color: 'var(--text-muted)' }}>
            <Settings className="w-4 h-4" />
            {t('sidebar.settings')}
          </Link>

          <ThemeLanguageToggle />

          <div className="px-3 py-3 rounded-xl glass-sm">
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('sidebar.operator')}</p>
            <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>{userEmail ?? '—'}</p>
            <div className="mt-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-medium">{t('sidebar.online')}</span>
              </div>
              <form action={signOut}>
                <button type="submit" className="hover:text-red-400 transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
