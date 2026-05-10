'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Package, User, Truck, CheckCircle, Loader2 } from 'lucide-react'
import { createOrder } from '@/lib/actions/orders'

const steps = [
  { id: 1, label: 'Dados',       icon: Package },
  { id: 2, label: 'Endereços',   icon: User },
  { id: 3, label: 'Confirmar',   icon: CheckCircle },
]

const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function NovoPedidoPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    clientName: '', clientPhone: '', clientEmail: '',
    cargo: '', weight: '', value: '', notes: '',
    originAddress: '', originCity: '',
    destinationAddress: '', destinationCity: '',
  })

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  function handleSubmit() {
    setError(null)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.set(k, v))
    startTransition(async () => {
      const res = await createOrder(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pedidos" className="p-2 rounded-xl text-blue-400 hover:text-white glass">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Novo Pedido</h1>
          <p className="text-sm text-blue-400">Passo {step} de {steps.length}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => {
          const done = step > s.id; const active = step === s.id; const Icon = s.icon
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={done ? { background:'rgba(52,211,153,0.25)',border:'1px solid rgba(52,211,153,0.5)',color:'#6EE7B7' }
                    : active ? { background:'rgba(59,130,246,0.3)',border:'1px solid rgba(96,165,250,0.5)',color:'#93C5FD',boxShadow:'0 0 14px rgba(59,130,246,0.4)' }
                    : { background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#475569' }}>
                  {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] mt-1 font-semibold" style={{ color: active ? '#93C5FD' : done ? '#6EE7B7' : '#475569' }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className="w-14 h-px mb-4 mx-1" style={{ background: done ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.1)' }} />}
            </div>
          )
        })}
      </div>

      <div className="glass rounded-2xl p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Dados do Pedido</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className={L}>Cliente / Empresa *</label><input name="clientName" value={form.clientName} onChange={handle} placeholder="Farmácias Saúde Total" className="glass-input" /></div>
              <div><label className={L}>Telefone</label><input name="clientPhone" value={form.clientPhone} onChange={handle} placeholder="(11) 99999-9999" className="glass-input" /></div>
              <div><label className={L}>E-mail</label><input name="clientEmail" value={form.clientEmail} onChange={handle} placeholder="logistica@empresa.com.br" className="glass-input" /></div>
              <div className="col-span-2"><label className={L}>Descrição da carga *</label><input name="cargo" value={form.cargo} onChange={handle} placeholder="Ex: Medicamentos — carga fracionada" className="glass-input" /></div>
              <div><label className={L}>Peso estimado</label><input name="weight" value={form.weight} onChange={handle} placeholder="180 kg" className="glass-input" /></div>
              <div><label className={L}>Valor do frete (R$)</label><input name="value" value={form.value} onChange={handle} placeholder="420,00" className="glass-input" /></div>
              <div className="col-span-2"><label className={L}>Observações</label><textarea name="notes" value={form.notes} onChange={handle} rows={2} placeholder="Instruções especiais..." className="glass-input resize-none" /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white">Endereços</h2>
            <div className="p-4 rounded-xl space-y-3" style={{ background:'rgba(59,130,246,0.1)',border:'1px solid rgba(96,165,250,0.25)' }}>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Ponto A — Coleta</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><label className={L}>Endereço *</label><input name="originAddress" value={form.originAddress} onChange={handle} placeholder="Rua, número, bairro" className="glass-input" /></div>
                <div><label className={L}>Cidade *</label><input name="originCity" value={form.originCity} onChange={handle} placeholder="Guarulhos" className="glass-input" /></div>
              </div>
            </div>
            <div className="p-4 rounded-xl space-y-3" style={{ background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.25)' }}>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Ponto B — Entrega</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><label className={L}>Endereço *</label><input name="destinationAddress" value={form.destinationAddress} onChange={handle} placeholder="Rua, número, bairro" className="glass-input" /></div>
                <div><label className={L}>Cidade *</label><input name="destinationCity" value={form.destinationCity} onChange={handle} placeholder="São Paulo" className="glass-input" /></div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Confirmar</h2>
            <div className="p-4 rounded-xl space-y-2" style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Resumo do Pedido</p>
              {[['Cliente', form.clientName || '—'],['Carga', form.cargo || '—'],['Origem', `${form.originCity} — ${form.originAddress}` || '—'],['Destino', `${form.destinationCity} — ${form.destinationAddress}` || '—'],['Valor', form.value ? `R$ ${form.value}` : '—'],].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm"><span className="text-blue-400">{k}:</span><span className="font-semibold text-white text-right max-w-[60%]">{v}</span></div>
              ))}
            </div>
            <div className="p-4 rounded-xl" style={{ background:'rgba(59,130,246,0.1)',border:'1px solid rgba(96,165,250,0.25)' }}>
              <p className="text-xs font-bold text-blue-300 mb-2">Ao confirmar:</p>
              {['Protocolo FT-YYYY-NNNN gerado','Link de rastreamento criado com token único','Status: CRIADO — próximos passos: Aceitar → Alocar'].map(t => (
                <p key={t} className="text-xs text-blue-300 flex items-center gap-2 mt-1.5"><CheckCircle className="w-3 h-3 text-blue-400" />{t}</p>
              ))}
            </div>
            {error && <p className="text-sm text-red-400 p-3 rounded-xl" style={{ background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)' }}>{error}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={() => step > 1 ? setStep(s => s-1) : router.push('/pedidos')}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-300 hover:text-white glass">
          {step === 1 ? 'Cancelar' : 'Voltar'}
        </button>
        {step < steps.length ? (
          <button onClick={() => setStep(s => s+1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',boxShadow:'0 4px 16px rgba(59,130,246,0.4)' }}>
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={pending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background:'linear-gradient(135deg,#059669,#047857)',boxShadow:'0 4px 16px rgba(5,150,105,0.4)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {pending ? 'Criando...' : 'Criar Pedido'}
          </button>
        )}
      </div>
    </div>
  )
}
