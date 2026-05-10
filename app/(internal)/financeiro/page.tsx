import { createClient } from '@/lib/supabase/server'
import { OrderStatusBadge } from '@/components/StatusBadge'
import { fmtCurrency, fmtDate } from '@/lib/utils/format'
import Link from 'next/link'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default async function FinanceiroPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('id,protocol,client_name,status,frete_value,advance_amount,balance_amount,payment_deadline,created_at,providers(name)')
    .not('frete_value', 'is', null)
    .order('created_at', { ascending: false })

  const orders = data ?? []

  const totalReceita    = orders.reduce((s, o) => s + (o.frete_value ?? 0), 0)
  const totalAdiantado  = orders.reduce((s, o) => s + (o.advance_amount ?? 0), 0)
  const totalSaldo      = orders.reduce((s, o) => s + (o.balance_amount ?? 0), 0)
  const pendentePgto    = orders.filter(o => o.status !== 'finalizado' && (o.balance_amount ?? 0) > 0).length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Financeiro</h1>
        <p className="text-blue-400 mt-0.5 text-sm">Controle de adiantamentos e saldos por frete</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Receita Total',        v: fmtCurrency(totalReceita),   icon: DollarSign,   accent:'bg-blue-500/25 text-blue-300' },
          { label:'Adiantamentos Pagos',  v: fmtCurrency(totalAdiantado), icon: TrendingUp,   accent:'bg-violet-500/25 text-violet-300' },
          { label:'Saldo a Receber',      v: fmtCurrency(totalSaldo),     icon: Clock,        accent:'bg-amber-500/25 text-amber-300' },
          { label:'Fretes c/ saldo pend.',v: pendentePgto,                icon: CheckCircle,  accent:'bg-emerald-500/25 text-emerald-300' },
        ].map(({ label, v, icon: Icon, accent }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">{label}</p>
                <p className="text-2xl font-extrabold text-white mt-1 tracking-tight">{v}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-bold text-white">Fretes com condições comerciais</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Protocolo','Cliente','Prestador','Status','Frete','Adiantamento','Saldo','Prazo Pgto.',''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-4 py-3 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="glass-hover transition-colors" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-4 py-3"><span className="font-mono text-sm font-bold text-white">{o.protocol}</span></td>
                  <td className="px-4 py-3 text-sm text-blue-100">{o.client_name}</td>
                  <td className="px-4 py-3 text-sm text-blue-300">{(o.providers as unknown as { name: string } | null)?.name?.split(' ').slice(0,2).join(' ') ?? '—'}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-sm font-bold text-white">{fmtCurrency(o.frete_value)}</td>
                  <td className="px-4 py-3 text-sm text-blue-300">{fmtCurrency(o.advance_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${(o.balance_amount ?? 0) > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                      {fmtCurrency(o.balance_amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-blue-400">{o.payment_deadline ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Link href={`/pedidos/${o.id}/comercial`} className="text-xs font-bold text-blue-400 hover:text-blue-300">Editar</Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={9} className="text-center py-10 text-blue-600 text-sm">Nenhum frete com condições comerciais.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
