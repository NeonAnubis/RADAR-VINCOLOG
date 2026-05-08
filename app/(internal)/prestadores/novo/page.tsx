'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Copy, Send, User, FileText } from 'lucide-react'

const labelCls = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function NovoPrestadorPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'manual' | 'link'>('link')
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', cpf: '', vehicleType: '', vehiclePlate: '',
    pixKey: '', bankName: '', advanceAmount: '',
  })

  const mockLink = 'vincolog.com/cadastro/tk-nv-x9kp2m'
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  function handleCopy() { setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/prestadores" className="p-2 rounded-xl text-blue-400 hover:text-white transition-colors glass">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Adicionar Prestador</h1>
          <p className="text-sm text-blue-400">Cadastre um novo motorista freelance</p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 p-1.5 rounded-2xl glass-sm">
        {[
          { id: 'link',   label: 'Link de cadastro', desc: 'Motorista preenche pelo celular', icon: Send },
          { id: 'manual', label: 'Cadastro manual',   desc: 'Operador preenche aqui',         icon: User },
        ].map(({ id, label, desc, icon: Icon }) => (
          <button key={id} onClick={() => setMode(id as 'manual' | 'link')}
            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
            style={mode === id
              ? { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(96,165,250,0.35)' }
              : { background: 'transparent', border: '1px solid transparent' }}>
            <Icon className={`w-4 h-4 flex-shrink-0 ${mode === id ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <p className={`text-sm font-bold ${mode === id ? 'text-white' : 'text-blue-400'}`}>{label}</p>
              <p className="text-[11px] text-blue-500">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Link mode */}
      {mode === 'link' && (
        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(96,165,250,0.3)' }}>
              <Send className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="font-bold text-white text-lg">Envie o link ao motorista</h2>
            <p className="text-sm text-blue-400 mt-1">
              O motorista preenche nome, CPF, foto do documento e assina o contrato pelo celular em menos de 2 minutos.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <code className="text-sm text-blue-300 font-mono">{mockLink}</code>
            <button onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-colors ${
                copied ? 'text-emerald-300' : 'text-blue-400 hover:text-white'
              }`}
              style={{ background: copied ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {copied ? <><CheckCircle className="w-3 h-3" /> Copiado!</> : <><Copy className="w-3 h-3" /> Copiar</>}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'rgba(22,163,74,0.3)', border: '1px solid rgba(34,197,94,0.4)' }}>
              <Send className="w-4 h-4 text-green-400" /> Enviar via WhatsApp
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-blue-300 hover:text-white transition-all glass">
              Enviar por e-mail
            </button>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <p className="text-xs font-bold text-blue-300 mb-2">O motorista irá:</p>
            <ul className="space-y-1.5">
              {[
                'Preencher nome, CPF e telefone',
                'Tirar foto frente/verso do documento',
                'Informar placa e tipo de veículo',
                'Adicionar chave Pix para pagamento',
                'Assinar digitalmente o contrato de prestação',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-blue-300">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Manual mode */}
      {mode === 'manual' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Dados do Prestador</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Nome completo *</label>
              <input name="name" value={form.name} onChange={handle} placeholder="João da Silva Santos" className="glass-input" />
            </div>
            <div>
              <label className={labelCls}>CPF *</label>
              <input name="cpf" value={form.cpf} onChange={handle} placeholder="000.000.000-00" className="glass-input" />
            </div>
            <div>
              <label className={labelCls}>Telefone / WhatsApp *</label>
              <input name="phone" value={form.phone} onChange={handle} placeholder="(11) 99999-9999" className="glass-input" />
            </div>
            <div>
              <label className={labelCls}>Tipo de veículo *</label>
              <select name="vehicleType" value={form.vehicleType} onChange={handle} className="glass-select">
                <option value="">Selecione...</option>
                {['Moto','Carro','Furgão','Caminhonete','Caminhão Leve','Caminhão Médio'].map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Placa *</label>
              <input name="vehiclePlate" value={form.vehiclePlate} onChange={handle} placeholder="BRA-2E19" className="glass-input" />
            </div>
            <div>
              <label className={labelCls}>Banco</label>
              <input name="bankName" value={form.bankName} onChange={handle} placeholder="Nubank, Itaú..." className="glass-input" />
            </div>
            <div>
              <label className={labelCls}>Chave Pix</label>
              <input name="pixKey" value={form.pixKey} onChange={handle} placeholder="CPF, e-mail ou telefone" className="glass-input" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Adiantamento (R$)</label>
              <input name="advanceAmount" value={form.advanceAmount} onChange={handle} placeholder="100,00" className="glass-input" />
            </div>
          </div>

          <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <FileText className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              Ao confirmar, o contrato de prestação é gerado automaticamente e enviado ao motorista via WhatsApp.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/prestadores"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-400 hover:text-white transition-colors glass">
              Cancelar
            </Link>
            <button onClick={() => router.push('/prestadores')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 16px rgba(59,130,246,0.4)' }}>
              <CheckCircle className="w-4 h-4" /> Cadastrar e gerar contrato
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
