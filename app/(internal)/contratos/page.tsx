import Link from 'next/link'
import { FileText, CheckCircle, Clock, Archive, Download, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ContractStatusBadge } from '@/components/StatusBadge'
import { fmtDateTime, fmtCurrency } from '@/lib/utils/format'

export default async function ContratosPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('contracts')
    .select('*, providers(name), orders(protocol,client_name,origin_city,destination_city)')
    .order('created_at', { ascending: false })

  const all       = data ?? []
  const assinados = all.filter(c => c.status === 'assinado').length
  const pendentes = all.filter(c => c.status === 'pendente').length
  const encerrados= all.filter(c => c.status === 'encerrado').length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Contratos</h1>
        <p className="text-blue-400 mt-0.5 text-sm">Contratos de prestação de serviço</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Assinados (ativos)',     v: assinados,  icon: CheckCircle, color:'text-emerald-300', bg:'rgba(52,211,153,0.18)' },
          { label:'Aguardando assinatura',  v: pendentes,  icon: Clock,       color:'text-amber-300',  bg:'rgba(245,158,11,0.18)' },
          { label:'Encerrados',             v: encerrados, icon: Archive,     color:'text-blue-400',   bg:'rgba(255,255,255,0.08)' },
        ].map(({ label, v, icon: Icon, color, bg }) => (
          <div key={label} className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">{v}</p>
              <p className="text-xs text-blue-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-bold text-white">Todos os Contratos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Contrato','Prestador','Frete','Rota','Valor','Status','Assinado em',''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-5 py-3 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map(c => (
                <tr key={c.id} className="glass-hover transition-colors" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="font-mono text-xs font-bold text-blue-300">{c.id.slice(0,8).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-blue-100">{c.providers?.name?.split(' ').slice(0,2).join(' ') ?? '—'}</td>
                  <td className="px-4 py-4">
                    <Link href={`/pedidos/${c.order_id}`} className="font-mono text-xs font-bold text-blue-400 hover:text-blue-300">
                      {c.orders?.protocol ?? '—'}
                    </Link>
                    <p className="text-xs text-blue-600 mt-0.5 truncate max-w-[120px]">{c.orders?.client_name}</p>
                  </td>
                  <td className="px-4 py-4 text-xs text-blue-400">{c.orders?.origin_city} → {c.orders?.destination_city}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-extrabold text-white">{fmtCurrency(c.frete_value)}</p>
                    <p className="text-xs text-blue-500">Adiant.: {fmtCurrency(c.advance_amount)}</p>
                  </td>
                  <td className="px-4 py-4"><ContractStatusBadge status={c.status} /></td>
                  <td className="px-4 py-4 text-xs text-blue-500 whitespace-nowrap">{c.signed_at ? fmtDateTime(c.signed_at) : '—'}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {c.signed_url && <a href={c.signed_url} target="_blank" className="p-1.5 rounded-lg text-blue-500 hover:text-white hover:bg-white/10"><Eye className="w-4 h-4" /></a>}
                      <Link href={`/pedidos/${c.order_id}`} className="p-1.5 rounded-lg text-blue-500 hover:text-white hover:bg-white/10"><Download className="w-4 h-4" /></Link>
                    </div>
                  </td>
                </tr>
              ))}
              {all.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-blue-600 text-sm">Nenhum contrato cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
