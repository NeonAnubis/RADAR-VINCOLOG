import Link from 'next/link'
import { Plus, UserCheck, Moon, Star, Truck, Phone } from 'lucide-react'
import { mockProviders } from '@/lib/mockData'
import { ProviderStatusBadge } from '@/components/StatusBadge'

export default function PrestadoresPage() {
  const ativos      = mockProviders.filter(p => p.status === 'ativo')
  const adormecidos = mockProviders.filter(p => p.status === 'adormecido')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Prestadores</h1>
          <p className="text-blue-400 mt-0.5 text-sm">{mockProviders.length} prestadores cadastrados</p>
        </div>
        <Link href="/prestadores/novo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 18px rgba(59,130,246,0.4)' }}>
          <Plus className="w-4 h-4" /> Adicionar prestador
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Ativos',            value: ativos.length,      icon: UserCheck, color: 'text-emerald-300', bg: 'rgba(52,211,153,0.18)' },
          { label: 'Adormecidos',       value: adormecidos.length, icon: Moon,      color: 'text-blue-400',   bg: 'rgba(255,255,255,0.07)' },
          { label: 'Fretes realizados', value: mockProviders.reduce((s,p)=>s+p.totalFretes,0), icon: Truck, color: 'text-sky-300', bg: 'rgba(56,189,248,0.18)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">{value}</p>
              <p className="text-xs text-blue-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active */}
      <div>
        <h2 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
          Prestadores Ativos ({ativos.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ativos.map(p => (
            <Link key={p.id} href={`/prestadores/${p.id}`}>
              <div className="glass glass-hover rounded-2xl p-5 cursor-pointer transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center border-2"
                      style={{ background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(96,165,250,0.3)' }}>
                      <span className="text-sm font-extrabold text-blue-300">
                        {p.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{p.name}</p>
                      <p className="text-xs text-blue-400 mt-0.5">{p.vehicleType}</p>
                    </div>
                  </div>
                  <ProviderStatusBadge status={p.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-[10px] text-blue-400 uppercase tracking-wider">Fretes</p>
                    <p className="text-xl font-extrabold text-white mt-0.5">{p.totalFretes}</p>
                  </div>
                  <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-[10px] text-blue-400 uppercase tracking-wider">Avaliação</p>
                    <div className="flex items-center justify-center gap-0.5 mt-0.5">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xl font-extrabold text-white">{p.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 flex items-center justify-between text-xs text-blue-500"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-1"><Truck className="w-3 h-3" />{p.vehiclePlate}</div>
                  <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</div>
                </div>
                {!p.contractSigned && (
                  <div className="mt-2 px-2 py-1 rounded-lg text-[10px] font-semibold text-amber-300"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    ⚠ Contrato pendente de assinatura
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dormant */}
      <div>
        <h2 className="text-sm font-bold text-blue-400 mb-1 flex items-center gap-2 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-blue-700" />
          Adormecidos ({adormecidos.length})
        </h2>
        <p className="text-xs text-blue-500 mb-3">Frete encerrado — prontos para reativar</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {adormecidos.map(p => (
            <Link key={p.id} href={`/prestadores/${p.id}`}>
              <div className="glass-sm rounded-2xl p-5 cursor-pointer hover:glass transition-all opacity-75 hover:opacity-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center border-2"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="text-sm font-extrabold text-blue-500">
                        {p.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-200 leading-tight">{p.name}</p>
                      <p className="text-xs text-blue-500 mt-0.5">{p.vehicleType}</p>
                    </div>
                  </div>
                  <ProviderStatusBadge status={p.status} />
                </div>
                <div className="mt-3 pt-3 flex items-center justify-between text-xs text-blue-500"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span>{p.totalFretes} fretes realizados</span>
                  {p.lastFreteDate && <span>Último: {new Date(p.lastFreteDate).toLocaleDateString('pt-BR')}</span>}
                </div>
                <button className="mt-3 w-full py-1.5 rounded-xl text-xs font-bold text-blue-400 hover:text-white transition-all"
                  style={{ border: '1px solid rgba(96,165,250,0.3)' }}>
                  Reativar com 1 clique
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
