import Link from 'next/link'
import { FileText, CheckCircle, Clock, Archive, Download, Eye } from 'lucide-react'
import { mockContracts } from '@/lib/mockData'
import { ContractStatusBadge } from '@/components/StatusBadge'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ContratosPage() {
  const assinados = mockContracts.filter(c => c.status === 'assinado')
  const encerrados = mockContracts.filter(c => c.status === 'encerrado')
  const pendentes = mockContracts.filter(c => c.status === 'pendente')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Contratos</h1>
        <p className="text-blue-400 mt-0.5 text-sm">Contratos de prestação de serviço</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Assinados (ativos)',      value: assinados.length,  icon: CheckCircle, color: 'text-emerald-300', bg: 'rgba(52,211,153,0.18)' },
          { label: 'Aguardando assinatura',   value: pendentes.length,  icon: Clock,       color: 'text-amber-300',  bg: 'rgba(245,158,11,0.18)' },
          { label: 'Encerrados',              value: encerrados.length, icon: Archive,     color: 'text-blue-400',   bg: 'rgba(255,255,255,0.08)' },
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

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-bold text-white">Todos os Contratos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Contrato','Prestador','Frete','Rota','Valor','Status','Assinado em',''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-5 py-3 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockContracts.map(c => (
                <tr key={c.id} className="transition-colors glass-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="font-mono text-sm font-bold text-blue-300">{c.id.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/prestadores/${c.providerId}`} className="text-sm font-bold text-blue-400 hover:text-blue-300">
                      {c.providerName.split(' ').slice(0,2).join(' ')}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/pedidos/${c.orderId}`} className="font-mono text-xs font-bold text-blue-400 hover:text-blue-300">
                      {c.orderProtocol}
                    </Link>
                    <p className="text-xs text-blue-600 mt-0.5 truncate max-w-[120px]">{c.clientName}</p>
                  </td>
                  <td className="px-4 py-4 text-xs text-blue-400">{c.originCity} → {c.destinationCity}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-extrabold text-white">R$ {c.value.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-blue-500">Adiant.: R$ {c.advanceAmount}</p>
                  </td>
                  <td className="px-4 py-4"><ContractStatusBadge status={c.status} /></td>
                  <td className="px-4 py-4 text-xs text-blue-500 whitespace-nowrap">
                    {c.signedAt ? formatDateTime(c.signedAt) : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg transition-colors text-blue-500 hover:text-white hover:bg-white/10"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg transition-colors text-blue-500 hover:text-white hover:bg-white/10"><Download className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Template */}
      <div className="glass rounded-2xl p-5">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Modelo de Contrato — Prestação de Serviço de Frete
        </h2>
        <div className="rounded-xl p-5 font-mono text-xs leading-relaxed space-y-3"
          style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', color: '#93C5FD' }}>
          <p className="font-extrabold text-center text-white text-sm not-italic">CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FRETE</p>
          <p><strong className="text-white">CONTRATANTE:</strong> [Nome da empresa / Felipe V.], doravante denominado CONTRATANTE.</p>
          <p><strong className="text-white">CONTRATADO:</strong> [Nome do prestador], CPF [000.000.000-00], doravante denominado PRESTADOR.</p>
          <p><strong className="text-white">OBJETO:</strong> Prestação de serviço de frete de ponto A para ponto B, conforme ordem de serviço nº [PROTOCOLO].</p>
          <p><strong className="text-white">ROTA:</strong> [Cidade de origem] → [Cidade de destino]</p>
          <p><strong className="text-white">REMUNERAÇÃO:</strong> R$ [VALOR], sendo R$ [ADIANTAMENTO] de adiantamento no ato da coleta e o saldo na confirmação da entrega.</p>
          <p><strong className="text-white">OBRIGAÇÕES DO PRESTADOR:</strong> Realizar o transporte com cuidado, registrar os checkpoints no aplicativo, coletar assinatura do recebedor (POD) e fotografar a carga na coleta e entrega.</p>
          <p><strong className="text-white">VIGÊNCIA:</strong> Este contrato é válido exclusivamente para o frete especificado, sendo encerrado automaticamente após confirmação de entrega.</p>
          <p className="text-center text-blue-600 italic">— Assinado digitalmente pelo PRESTADOR via link seguro enviado por WhatsApp —</p>
        </div>
      </div>
    </div>
  )
}
