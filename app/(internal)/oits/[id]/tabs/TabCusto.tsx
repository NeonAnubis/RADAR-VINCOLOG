'use client'

import { useState, useTransition } from 'react'
import { DollarSign, Save, Loader2, TrendingUp, AlertTriangle, CreditCard } from 'lucide-react'
import { saveOitCommercial, updatePaymentStatus } from '@/lib/actions/oits'
import { fmtCurrency } from '@/lib/utils/format'
import { PAYMENT_STATUSES } from '@/lib/types'
import type { DbOit, PaymentStatus } from '@/lib/types'

const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

export default function TabCusto({ oit }: { oit: DbOit }) {
  const [pending, start] = useTransition()
  const [data, setData] = useState({
    contracted_value: oit.contracted_value?.toString() ?? '',
    advance_amount: oit.advance_amount?.toString() ?? '0',
    balance_amount: oit.balance_amount?.toString() ?? '0',
    pedagio: oit.pedagio?.toString() ?? '',
    vale_pedagio: oit.vale_pedagio?.toString() ?? '',
    seguro: oit.seguro?.toString() ?? '',
    ciot: oit.ciot ?? '',
    other_expenses: oit.other_expenses?.toString() ?? '',
    financial_notes: oit.financial_notes ?? '',
  })

  const num = (v: string) => parseFloat(v) || 0
  const contracted = num(data.contracted_value)
  const advance    = num(data.advance_amount)
  const balance    = contracted - advance
  const totalCost  = contracted + num(data.pedagio) + num(data.vale_pedagio) + num(data.seguro) + num(data.other_expenses)
  const margin     = (oit.vendor_value ?? 0) - totalCost
  const marginPct  = oit.vendor_value ? (margin / oit.vendor_value) * 100 : 0

  function handleSave() {
    start(async () => {
      await saveOitCommercial(oit.id, {
        contracted_value: contracted,
        advance_amount: advance,
        balance_amount: balance,
        pedagio: num(data.pedagio),
        vale_pedagio: num(data.vale_pedagio),
        seguro: num(data.seguro),
        ciot: data.ciot || undefined,
        other_expenses: num(data.other_expenses),
        financial_notes: data.financial_notes || undefined,
      })
    })
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2"><DollarSign className="w-4 h-4" /> Custo / Auditoria Financeira</h2>
          <div className="text-right">
            <p className="text-[10px] text-blue-500 uppercase tracking-widest">Valor vendido ao cliente</p>
            <p className="text-2xl font-extrabold text-white">{fmtCurrency(oit.vendor_value)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div><label className={L}>Valor contratado com prestador *</label>
            <input type="number" step="0.01" value={data.contracted_value} onChange={e=>setData({...data,contracted_value:e.target.value})} className="glass-input" /></div>
          <div><label className={L}>Adiantamento</label>
            <input type="number" step="0.01" value={data.advance_amount} onChange={e=>setData({...data,advance_amount:e.target.value})} className="glass-input" /></div>
          <div className="flex items-end">
            <div className="w-full p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-[10px] text-blue-500 uppercase">Saldo</p>
              <p className="text-base font-bold text-white">{fmtCurrency(balance)}</p>
            </div>
          </div>
          <div><label className={L}>Pedágio</label>
            <input type="number" step="0.01" value={data.pedagio} onChange={e=>setData({...data,pedagio:e.target.value})} className="glass-input" /></div>
          <div><label className={L}>Vale-pedágio</label>
            <input type="number" step="0.01" value={data.vale_pedagio} onChange={e=>setData({...data,vale_pedagio:e.target.value})} className="glass-input" /></div>
          <div><label className={L}>Seguro</label>
            <input type="number" step="0.01" value={data.seguro} onChange={e=>setData({...data,seguro:e.target.value})} className="glass-input" /></div>
          <div><label className={L}>CIOT/PEF</label>
            <input value={data.ciot} onChange={e=>setData({...data,ciot:e.target.value})} className="glass-input" /></div>
          <div className="col-span-2"><label className={L}>Outras despesas</label>
            <input type="number" step="0.01" value={data.other_expenses} onChange={e=>setData({...data,other_expenses:e.target.value})} className="glass-input" /></div>
          <div className="col-span-3"><label className={L}>Observação financeira</label>
            <textarea value={data.financial_notes} onChange={e=>setData({...data,financial_notes:e.target.value})} rows={2} className="glass-input resize-none" /></div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(96,165,250,0.25)' }}>
            <p className="text-[10px] text-blue-400 uppercase">Custo total previsto</p>
            <p className="text-xl font-extrabold text-white mt-1">{fmtCurrency(totalCost)}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: margin >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${margin >= 0 ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <p className="text-[10px] uppercase" style={{ color: margin >= 0 ? '#34D399' : '#F87171' }}>Margem bruta</p>
            <p className="text-xl font-extrabold mt-1" style={{ color: margin >= 0 ? '#6EE7B7' : '#FCA5A5' }}>{fmtCurrency(margin)}</p>
          </div>
          <div className="p-4 rounded-xl flex items-center gap-2" style={{ background: marginPct >= 10 ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${marginPct >= 10 ? 'rgba(52,211,153,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
            <TrendingUp className="w-5 h-5" style={{ color: marginPct >= 10 ? '#34D399' : '#FBBF24' }} />
            <div>
              <p className="text-[10px] uppercase" style={{ color: marginPct >= 10 ? '#34D399' : '#FBBF24' }}>Margem %</p>
              <p className="text-xl font-extrabold" style={{ color: marginPct >= 10 ? '#6EE7B7' : '#FCD34D' }}>{marginPct.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {marginPct < 5 && contracted > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">Margem abaixo de 5% — requer atenção da auditoria financeira.</p>
          </div>
        )}

        <button onClick={handleSave} disabled={pending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {pending ? 'Salvando...' : 'Salvar Custo/Auditoria'}
        </button>
      </div>

      {/* Payment Status Flow per spec §20.2 */}
      <PaymentStatusBlock oit={oit} />
    </div>
  )
}

function PaymentStatusBlock({ oit }: { oit: DbOit }) {
  const [pending, start] = useTransition()
  const current = oit.payment_status ?? 'nao_iniciado'
  const cfg = PAYMENT_STATUSES[current]

  function move(s: PaymentStatus) {
    start(async () => { await updatePaymentStatus(oit.id, s) })
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2"><CreditCard className="w-4 h-4" /> Status de Pagamento do Prestador</h2>
        <span className="px-2 py-0.5 rounded text-xs font-bold border"
          style={{ background: `${cfg.color}22`, color: cfg.color, borderColor: `${cfg.color}55` }}>
          {cfg.label}
        </span>
      </div>

      <p className="text-xs text-blue-400">Fluxo per spec §20.2 — controle de adiantamento, saldo e auditoria financeira.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {(Object.keys(PAYMENT_STATUSES) as PaymentStatus[]).map(s => {
          const sc = PAYMENT_STATUSES[s]
          const isCurrent = current === s
          return (
            <button key={s} onClick={() => move(s)} disabled={pending || isCurrent}
              className="px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:cursor-default"
              style={isCurrent
                ? { background: `${sc.color}33`, color: sc.color, border: `1.5px solid ${sc.color}` }
                : { background: 'rgba(255,255,255,0.04)', color: sc.color, border: '1px solid rgba(255,255,255,0.08)', opacity: 0.7 }}>
              {pending && current === s ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
              {sc.label}
            </button>
          )
        })}
      </div>

      <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <p className="text-amber-300 font-bold mb-1">Regra (spec §20.3)</p>
        <p className="text-blue-300">Saldo só deve ser liberado após: entrega concluída, comprovante recebido, baixa operacional, ausência de pendência grave e liberação financeira.</p>
      </div>
    </div>
  )
}
