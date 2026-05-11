'use client'

import { useState, useTransition } from 'react'
import { Save, Building2, Mail, MessageSquare, FileText, Loader2, CheckCircle } from 'lucide-react'
import { updateMultipleSettings } from '@/lib/actions/settings'

const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function SettingsForm({ initial }: { initial: Record<string, unknown> }) {
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [state, setState] = useState(() => ({
    'company.name':              String(initial['company.name'] ?? 'VINCOLOG TRANSPORTES'),
    'company.tagline':           String(initial['company.tagline'] ?? 'Gestão Operacional de Transporte'),
    'company.phone':             String(initial['company.phone'] ?? ''),
    'company.email':             String(initial['company.email'] ?? ''),
    'company.cnpj':              String(initial['company.cnpj'] ?? ''),
    'company.address':           String(initial['company.address'] ?? ''),
    'pdf.footer':                String(initial['pdf.footer'] ?? ''),
    'emails.operational':        String(initial['emails.operational'] ?? ''),
    'emails.financial':          String(initial['emails.financial'] ?? ''),
    'emails.commercial':         String(initial['emails.commercial'] ?? ''),
    'finance.margin_alert':      String(initial['finance.margin_alert'] ?? '5'),
    'whatsapp.dispatch_phone':   String(initial['whatsapp.dispatch_phone'] ?? ''),
  }))

  function set(k: string, v: string) { setState(s => ({ ...s, [k]: v })) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)
    const payload: Record<string, unknown> = {}
    Object.entries(state).forEach(([k, v]) => {
      payload[k] = k === 'finance.margin_alert' ? Number(v) : v
    })
    start(async () => {
      await updateMultipleSettings(payload)
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Empresa */}
      <Section title="Identidade da Empresa" icon={Building2}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className={L}>Nome / Razão Social</label>
            <input value={state['company.name']} onChange={e=>set('company.name',e.target.value)} className="glass-input" /></div>
          <div className="col-span-2"><label className={L}>Tagline</label>
            <input value={state['company.tagline']} onChange={e=>set('company.tagline',e.target.value)} className="glass-input" /></div>
          <div><label className={L}>CNPJ</label>
            <input value={state['company.cnpj']} onChange={e=>set('company.cnpj',e.target.value)} className="glass-input" /></div>
          <div><label className={L}>Telefone</label>
            <input value={state['company.phone']} onChange={e=>set('company.phone',e.target.value)} className="glass-input" /></div>
          <div className="col-span-2"><label className={L}>E-mail principal</label>
            <input type="email" value={state['company.email']} onChange={e=>set('company.email',e.target.value)} className="glass-input" /></div>
          <div className="col-span-2"><label className={L}>Endereço</label>
            <input value={state['company.address']} onChange={e=>set('company.address',e.target.value)} className="glass-input" /></div>
          <div className="col-span-2"><label className={L}>Rodapé dos PDFs</label>
            <input value={state['pdf.footer']} onChange={e=>set('pdf.footer',e.target.value)} className="glass-input" /></div>
        </div>
      </Section>

      {/* E-mails de notificação */}
      <Section title="E-mails de Notificação" icon={Mail}>
        <p className="text-xs text-blue-400 mb-3">Endereços que recebem as notificações automáticas do sistema (spec §8.1).</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className={L}>Equipe operacional (nova OIT)</label>
            <input type="email" value={state['emails.operational']} onChange={e=>set('emails.operational',e.target.value)} className="glass-input" /></div>
          <div><label className={L}>Financeiro</label>
            <input type="email" value={state['emails.financial']} onChange={e=>set('emails.financial',e.target.value)} className="glass-input" /></div>
          <div><label className={L}>Comercial</label>
            <input type="email" value={state['emails.commercial']} onChange={e=>set('emails.commercial',e.target.value)} className="glass-input" /></div>
        </div>
      </Section>

      {/* Financeiro */}
      <Section title="Regras Financeiras" icon={FileText}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={L}>Margem mínima de alerta (%)</label>
            <input type="number" min="0" max="100" value={state['finance.margin_alert']} onChange={e=>set('finance.margin_alert',e.target.value)} className="glass-input" /></div>
          <p className="col-span-2 text-xs text-blue-500">OITs com margem abaixo deste valor aparecem como alerta no dashboard financeiro.</p>
        </div>
      </Section>

      {/* WhatsApp */}
      <Section title="WhatsApp" icon={MessageSquare}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={L}>Telefone de dispatch (com DDI)</label>
            <input value={state['whatsapp.dispatch_phone']} onChange={e=>set('whatsapp.dispatch_phone',e.target.value)} placeholder="5511999999999" className="glass-input" /></div>
          <p className="col-span-2 text-xs text-blue-500">Usado nos links e mensagens automáticas (botão Copiar / wa.me).</p>
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 16px rgba(59,130,246,0.4)' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {pending ? 'Salvando...' : 'Salvar Configurações'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-300 font-semibold">
            <CheckCircle className="w-4 h-4" /> Configurações salvas
          </span>
        )}
      </div>
    </form>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h2 className="text-base font-bold text-white flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-400" /> {title}
      </h2>
      {children}
    </div>
  )
}
