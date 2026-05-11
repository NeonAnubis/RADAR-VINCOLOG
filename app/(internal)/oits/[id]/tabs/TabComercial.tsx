import Link from 'next/link'
import { FileText, CheckCircle } from 'lucide-react'
import { ServiceLevelBadge } from '@/components/StatusBadge'
import { fmtCurrency, fmtDate, fmtDateTime } from '@/lib/utils/format'
import type { DbOit, DbBudget } from '@/lib/types'

export default function TabComercial({ oit, budget }: { oit: DbOit; budget: DbBudget | null }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <h2 className="text-base font-bold text-white">Dados Comerciais Herdados</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Nível Aprovado" value={<ServiceLevelBadge level={oit.service_level} />} />
        <Field label="Valor Vendido"  value={fmtCurrency(oit.vendor_value)} bold />
        <Field label="Orçamento Origem" value={budget ? <Link href={`/orcamentos/${budget.id}`} className="text-blue-400 hover:text-blue-300 font-mono">{budget.number}</Link> : '—'} />
        <Field label="Aprovado em" value={budget?.approved_at ? fmtDateTime(budget.approved_at) : '—'} />
      </div>

      {budget && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Field label="Validade da Proposta" value={budget.validity_date ? fmtDate(budget.validity_date) : '—'} />
            <Field label="Condição de Pagamento" value={budget.payment_condition ?? '—'} />
            <Field label="Premissas" value={budget.premises ?? '—'} />
            <Field label="Exclusões" value={budget.exclusions ?? '—'} />
            <div className="col-span-2"><Field label="Observações" value={budget.general_notes ?? '—'} /></div>
          </div>

          {budget.approval_evidence_url && (
            <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-300">Evidência: {budget.approval_evidence_url}</span>
            </div>
          )}

          {budget.proposal_pdf_url && (
            <Link href={`/orcamentos/${budget.id}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300">
              <FileText className="w-4 h-4" /> Ver proposta original
            </Link>
          )}
        </>
      )}
    </div>
  )
}

function Field({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{label}</p>
      <div className={`mt-1 text-sm ${bold ? 'font-extrabold text-white' : 'text-blue-200'}`}>{value}</div>
    </div>
  )
}
