'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, User, Truck } from 'lucide-react'
import { submitProviderInvite } from '@/lib/actions/provider-invite'

const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function InviteForm({ token }: { token: string }) {
  const router = useRouter()
  const [done, setDone] = useState<{ providerLink: string; oitNumber: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const [form, setForm] = useState({
    name: '', cpf_cnpj: '', phone: '', rntrc: '', category: 'TAC',
    bank_name: '', pix_key: '',
    driver_name: '', driver_cpf: '', driver_phone: '', driver_cnh: '',
    vehicle_type: '', vehicle_body: '', vehicle_plate: '', vehicle_plate_carreta: '',
    has_tracker: false, has_tarp: false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await submitProviderInvite(token, {
        ...form,
        has_tracker: form.has_tracker,
        has_tarp: form.has_tarp,
      })
      if (res?.error) setError(res.error)
      else {
        setDone({ providerLink: `/prestador/${token.replace('inv-', '')}`, oitNumber: res.oitNumber ?? '' })
      }
    })
  }

  if (done) {
    return (
      <div className="glass-strong rounded-2xl p-6 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.5)' }}>
          <CheckCircle className="w-7 h-7 text-emerald-400" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Cadastro concluído!</h2>
        <p className="text-sm text-blue-300">Você foi vinculado à OIT <strong className="text-white font-mono">{done.oitNumber}</strong>. A equipe VINCOLOG entrará em contato com o link da viagem em instantes.</p>
        <p className="text-xs text-blue-500">Verifique seu WhatsApp informado.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="glass rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><User className="w-4 h-4 text-blue-400" /> Dados do Prestador</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className={L}>Razão Social / Nome *</label>
            <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="glass-input" /></div>
          <div><label className={L}>CNPJ / CPF *</label>
            <input required value={form.cpf_cnpj} onChange={e=>setForm({...form,cpf_cnpj:e.target.value})} className="glass-input" /></div>
          <div><label className={L}>Telefone / WhatsApp *</label>
            <input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="(11) 99999-9999" className="glass-input" /></div>
          <div><label className={L}>RNTRC</label>
            <input value={form.rntrc} onChange={e=>setForm({...form,rntrc:e.target.value})} className="glass-input" /></div>
          <div><label className={L}>Categoria</label>
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="glass-select">
              {['TAC','ETC','CTC','Outro'].map(v => <option key={v}>{v}</option>)}
            </select></div>
          <div><label className={L}>Banco</label>
            <input value={form.bank_name} onChange={e=>setForm({...form,bank_name:e.target.value})} className="glass-input" /></div>
          <div><label className={L}>Chave Pix</label>
            <input value={form.pix_key} onChange={e=>setForm({...form,pix_key:e.target.value})} className="glass-input" /></div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><User className="w-4 h-4 text-blue-400" /> Motorista</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className={L}>Nome do motorista *</label>
            <input required value={form.driver_name} onChange={e=>setForm({...form,driver_name:e.target.value})} className="glass-input" /></div>
          <div><label className={L}>CPF *</label>
            <input required value={form.driver_cpf} onChange={e=>setForm({...form,driver_cpf:e.target.value})} className="glass-input" /></div>
          <div><label className={L}>Telefone *</label>
            <input required value={form.driver_phone} onChange={e=>setForm({...form,driver_phone:e.target.value})} className="glass-input" /></div>
          <div className="col-span-2"><label className={L}>CNH</label>
            <input value={form.driver_cnh} onChange={e=>setForm({...form,driver_cnh:e.target.value})} className="glass-input" /></div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Truck className="w-4 h-4 text-blue-400" /> Veículo</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={L}>Tipo de veículo *</label>
            <select required value={form.vehicle_type} onChange={e=>setForm({...form,vehicle_type:e.target.value})} className="glass-select">
              <option value="">Selecione...</option>
              {['Fiorino','VUC','3/4','Toco','Truck','Carreta','Prancha','Munck','Outro'].map(v => <option key={v}>{v}</option>)}
            </select></div>
          <div><label className={L}>Carroceria</label>
            <input value={form.vehicle_body} onChange={e=>setForm({...form,vehicle_body:e.target.value})} placeholder="Baú, Sider..." className="glass-input" /></div>
          <div><label className={L}>Placa Cavalo *</label>
            <input required value={form.vehicle_plate} onChange={e=>setForm({...form,vehicle_plate:e.target.value})} className="glass-input" /></div>
          <div><label className={L}>Placa Carreta</label>
            <input value={form.vehicle_plate_carreta} onChange={e=>setForm({...form,vehicle_plate_carreta:e.target.value})} className="glass-input" /></div>
          <div className="col-span-2 flex gap-3 mt-1">
            <label className="flex items-center gap-2 text-xs text-blue-300">
              <input type="checkbox" checked={form.has_tarp} onChange={e=>setForm({...form,has_tarp:e.target.checked})} /> Possui lona
            </label>
            <label className="flex items-center gap-2 text-xs text-blue-300">
              <input type="checkbox" checked={form.has_tracker} onChange={e=>setForm({...form,has_tracker:e.target.checked})} /> Possui rastreador
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={pending}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 18px rgba(5,150,105,0.45)' }}>
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        {pending ? 'Enviando...' : 'Concluir Cadastro e Vincular à Viagem'}
      </button>
    </form>
  )
}
