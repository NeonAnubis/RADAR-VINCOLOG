'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Package, User, Truck, CheckCircle } from 'lucide-react'
import { mockProviders } from '@/lib/mockData'

const steps = [
  { id: 1, label: 'Dados do Pedido',         icon: Package },
  { id: 2, label: 'Remetente / Destinatário', icon: User },
  { id: 3, label: 'Alocar Prestador',         icon: Truck },
  { id: 4, label: 'Confirmar',                icon: CheckCircle },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done   = current > step.id
        const active = current === step.id
        const Icon   = step.icon
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={
                  done   ? { background: 'rgba(52,211,153,0.25)',  border: '1px solid rgba(52,211,153,0.5)',  color: '#6EE7B7' } :
                  active ? { background: 'rgba(59,130,246,0.3)',  border: '1px solid rgba(96,165,250,0.5)', color: '#93C5FD', boxShadow: '0 0 14px rgba(59,130,246,0.4)' } :
                           { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#475569' }
                }>
                {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className="text-[10px] mt-1 font-semibold" style={{ color: active ? '#93C5FD' : done ? '#6EE7B7' : '#475569' }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-14 h-px mb-4 mx-1" style={{ background: done ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.1)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const labelCls = "block text-xs font-semibold text-blue-300 mb-1 uppercase tracking-wider"

export default function NovoPedidoPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [form, setForm] = useState({
    clientName: '', clientPhone: '', clientEmail: '',
    cargo: '', weight: '', value: '',
    originAddress: '', originCity: '',
    destinationAddress: '', destinationCity: '',
    notes: '',
  })

  const activeProviders = mockProviders.filter(p => p.status === 'ativo')
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pedidos" className="p-2 rounded-xl text-blue-400 hover:text-white transition-colors glass">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Novo Pedido</h1>
          <p className="text-sm text-blue-400">Preencha os dados do frete</p>
        </div>
      </div>

      <StepIndicator current={step} />

      <div className="glass rounded-2xl p-6">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-4">Dados do Pedido</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Cliente / Empresa *</label>
                <input name="clientName" value={form.clientName} onChange={handle} placeholder="Farmácias Saúde Total" className="glass-input" /></div>
              <div><label className={labelCls}>Telefone</label>
                <input name="clientPhone" value={form.clientPhone} onChange={handle} placeholder="(11) 99999-9999" className="glass-input" /></div>
              <div className="col-span-2"><label className={labelCls}>E-mail do cliente</label>
                <input name="clientEmail" value={form.clientEmail} onChange={handle} placeholder="logistica@empresa.com.br" className="glass-input" /></div>
              <div className="col-span-2"><label className={labelCls}>Descrição da carga *</label>
                <input name="cargo" value={form.cargo} onChange={handle} placeholder="Ex: Medicamentos - carga fracionada" className="glass-input" /></div>
              <div><label className={labelCls}>Peso estimado</label>
                <input name="weight" value={form.weight} onChange={handle} placeholder="Ex: 180 kg" className="glass-input" /></div>
              <div><label className={labelCls}>Valor do frete (R$)</label>
                <input name="value" value={form.value} onChange={handle} placeholder="Ex: 420,00" className="glass-input" /></div>
              <div className="col-span-2"><label className={labelCls}>Observações</label>
                <textarea name="notes" value={form.notes} onChange={handle} rows={2} placeholder="Instruções especiais..."
                  className="glass-input resize-none" /></div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white">Remetente / Destinatário</h2>
            <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(96,165,250,0.25)' }}>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Ponto A — Coleta</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><label className={labelCls}>Endereço *</label>
                  <input name="originAddress" value={form.originAddress} onChange={handle} placeholder="Rua, número, bairro" className="glass-input" /></div>
                <div><label className={labelCls}>Cidade *</label>
                  <input name="originCity" value={form.originCity} onChange={handle} placeholder="São Paulo" className="glass-input" /></div>
              </div>
            </div>
            <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Ponto B — Entrega</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><label className={labelCls}>Endereço *</label>
                  <input name="destinationAddress" value={form.destinationAddress} onChange={handle} placeholder="Rua, número, bairro" className="glass-input" /></div>
                <div><label className={labelCls}>Cidade *</label>
                  <input name="destinationCity" value={form.destinationCity} onChange={handle} placeholder="Campinas" className="glass-input" /></div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Alocar Prestador</h2>
            <p className="text-sm text-blue-300">Selecione um prestador ativo para este frete:</p>
            <div className="space-y-2">
              {activeProviders.map(p => (
                <button key={p.id} onClick={() => setSelectedProvider(p.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                  style={selectedProvider === p.id
                    ? { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(96,165,250,0.5)', boxShadow: '0 0 16px rgba(59,130,246,0.2)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="w-10 h-10 rounded-full glass-sm flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-300">{p.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{p.name}</p>
                    <p className="text-xs text-blue-400">{p.vehicleType} · {p.vehiclePlate}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-0.5 justify-end">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-xs font-bold text-white">{p.rating}</span>
                    </div>
                    <p className="text-[10px] text-blue-500">{p.totalFretes} fretes</p>
                  </div>
                  {selectedProvider === p.id && <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />}
                </button>
              ))}
              <button onClick={() => setSelectedProvider(null)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium text-blue-400 transition-all"
                style={{ border: '1px dashed rgba(96,165,250,0.25)' }}>
                Alocar depois
              </button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white">Confirmar Pedido</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Dados do frete</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <span className="text-blue-400">Cliente:</span>   <span className="font-semibold text-white">{form.clientName || '—'}</span>
                  <span className="text-blue-400">Carga:</span>     <span className="font-semibold text-white">{form.cargo || '—'}</span>
                  <span className="text-blue-400">Rota:</span>      <span className="font-semibold text-white">{form.originCity||'—'} → {form.destinationCity||'—'}</span>
                  <span className="text-blue-400">Valor:</span>     <span className="font-bold text-white">R$ {form.value || '—'}</span>
                </div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Prestador alocado</p>
                {selectedProvider
                  ? <p className="text-sm font-bold text-white">{mockProviders.find(p=>p.id===selectedProvider)?.name}</p>
                  : <p className="text-sm text-blue-500">Sem prestador — alocar depois</p>}
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(96,165,250,0.25)' }}>
                <p className="text-sm font-bold text-blue-300 mb-2">Ações automáticas ao confirmar:</p>
                <ul className="space-y-1.5">
                  {[
                    'Protocolo gerado (FT-2026-XXXX)',
                    'Link de rastreamento criado',
                    selectedProvider ? 'Contrato de prestação enviado ao motorista' : 'Aguardando alocação de prestador',
                    'Ordem de coleta pronta para envio ao cliente',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-blue-300">
                      <CheckCircle className="w-3 h-3 flex-shrink-0 text-blue-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => step > 1 ? setStep(s=>s-1) : router.push('/pedidos')}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-300 hover:text-white transition-colors glass">
          {step === 1 ? 'Cancelar' : 'Voltar'}
        </button>
        {step < 4 ? (
          <button onClick={() => setStep(s=>s+1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 16px rgba(59,130,246,0.4)' }}>
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => router.push('/pedidos')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 16px rgba(5,150,105,0.4)' }}>
            <CheckCircle className="w-4 h-4" /> Confirmar Pedido
          </button>
        )}
      </div>
    </div>
  )
}
