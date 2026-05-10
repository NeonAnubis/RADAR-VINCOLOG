'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { createProvider } from '@/lib/actions/providers'

const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function NovoPrestadorPage() {
  const [error, setError] = useState<string|null>(null)
  const [pending, start] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const res = await createProvider(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/prestadores" className="p-2 rounded-xl text-blue-400 hover:text-white glass">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Novo Prestador</h1>
          <p className="text-sm text-blue-400">Cadastro manual de motorista freelance</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Dados Pessoais</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className={L}>Nome completo *</label><input name="name" required placeholder="João da Silva Santos" className="glass-input" /></div>
          <div><label className={L}>CPF</label><input name="cpf" placeholder="000.000.000-00" className="glass-input" /></div>
          <div><label className={L}>Telefone / WhatsApp</label><input name="phone" placeholder="(11) 99999-9999" className="glass-input" /></div>
          <div><label className={L}>CNH nº</label><input name="cnh" placeholder="12345678901" className="glass-input" /></div>
        </div>

        <div className="h-px" style={{ background:'rgba(255,255,255,0.07)' }} />
        <h2 className="text-base font-bold text-white">Veículo</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={L}>Tipo de veículo</label>
            <select name="vehicleType" className="glass-select">
              <option value="">Selecione...</option>
              {['Moto','Carro','Furgão','Caminhonete','Caminhão Leve','Caminhão Médio'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div><label className={L}>Placa *</label><input name="vehiclePlate" required placeholder="BRA-2E19" className="glass-input" /></div>
        </div>

        <div className="h-px" style={{ background:'rgba(255,255,255,0.07)' }} />
        <h2 className="text-base font-bold text-white">Pagamento</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={L}>Banco</label><input name="bankName" placeholder="Nubank, Itaú..." className="glass-input" /></div>
          <div><label className={L}>Chave Pix</label><input name="pixKey" placeholder="CPF, e-mail ou telefone" className="glass-input" /></div>
        </div>

        {error && <p className="text-sm text-red-400 p-3 rounded-xl" style={{ background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)' }}>{error}</p>}

        <div className="flex gap-3 pt-2">
          <Link href="/prestadores" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-400 hover:text-white glass">Cancelar</Link>
          <button type="submit" disabled={pending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',boxShadow:'0 4px 16px rgba(59,130,246,0.4)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {pending ? 'Cadastrando...' : 'Cadastrar Prestador'}
          </button>
        </div>
      </form>
    </div>
  )
}
