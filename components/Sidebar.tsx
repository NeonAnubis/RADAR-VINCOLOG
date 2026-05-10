'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Users, FileText,
  BarChart2, Settings, Truck, DollarSign, ShieldCheck, LogOut,
} from 'lucide-react'
import clsx from 'clsx'
import { signOut } from '@/lib/actions/auth'

const nav = [
  { href: '/dashboard',   label: 'Torre de Controle', icon: LayoutDashboard },
  { href: '/pedidos',     label: 'Pedidos',            icon: Package },
  { href: '/prestadores', label: 'Prestadores',        icon: Users },
  { href: '/contratos',   label: 'Contratos',          icon: FileText },
  { href: '/financeiro',  label: 'Financeiro',         icon: DollarSign },
  { href: '/relatorios',  label: 'Relatórios',         icon: BarChart2 },
  { href: '/auditoria',   label: 'Auditoria',          icon: ShieldCheck },
]

interface SidebarProps { userEmail?: string }

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen flex flex-col"
      style={{ background: '#020B1E', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Logo */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 18px rgba(59,130,246,0.45)' }}>
            <Truck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-[15px] leading-none tracking-wider">RADAR</p>
            <p className="text-blue-400 font-bold text-[9px] mt-[3px] tracking-[0.28em] uppercase">VINCOLOG</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'text-white' : 'text-blue-400 hover:text-white'
              )}
              style={active ? {
                background: 'linear-gradient(135deg,rgba(59,130,246,0.35),rgba(37,99,235,0.25))',
                border: '1px solid rgba(96,165,250,0.3)',
                boxShadow: '0 2px 12px rgba(59,130,246,0.2)',
              } : { background: 'transparent', border: '1px solid transparent' }}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1rem' }}>
        <Link href="/configuracoes"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-400 hover:text-white transition-all"
          style={{ border: '1px solid transparent' }}>
          <Settings className="w-4 h-4" />
          Configurações
        </Link>
        <div className="px-3 py-3 rounded-xl glass-sm">
          <p className="text-blue-400 text-[10px] uppercase tracking-wider">Operador</p>
          <p className="text-white text-sm font-semibold mt-0.5 truncate">{userEmail ?? 'Usuário'}</p>
          <div className="mt-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-medium">Online</span>
            </div>
            <form action={signOut}>
              <button type="submit" className="text-blue-500 hover:text-red-400 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  )
}
