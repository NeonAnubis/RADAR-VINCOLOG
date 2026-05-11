'use client'

import { useState, useTransition } from 'react'
import { Send, Download, Loader2, CheckCircle, MessageSquare, Copy, FileText } from 'lucide-react'
import { generateCollectionOrderPdf } from '@/lib/utils/collection-order-pdf'
import { markCollectionOrderSent } from '@/lib/actions/oits'
import { fmtDateTime } from '@/lib/utils/format'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint } from '@/lib/types'

const TEMPLATES = [
  { id: 'embarque', label: 'Boletim de Embarque', icon: '📦' },
  { id: 'saida',    label: 'Boletim de Saída',     icon: '🚛' },
  { id: 'entrega',  label: 'Boletim de Entrega',   icon: '✅' },
  { id: 'cliente',  label: 'Mensagem ao Cliente',  icon: '💬' },
] as const

export default function TabOrdemColeta({ oit, collectionPoints, deliveryPoints }: {
  oit: DbOit; collectionPoints: DbCollectionPoint[]; deliveryPoints: DbDeliveryPoint[]
}) {
  const [generating, setGenerating] = useState(false)
  const [pending, start] = useTransition()
  const [copied, setCopied] = useState<string | null>(null)

  const trackingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/rastreamento/${oit.client_link_token}`

  const templates: Record<typeof TEMPLATES[number]['id'], string> = {
    embarque: `📦 *Boletim de Embarque VINCOLOG — OIT ${oit.number}*

Cliente: ${oit.client_name}
Origem: ${collectionPoints[0]?.full_address ?? '—'} (${collectionPoints[0]?.city ?? ''}/${collectionPoints[0]?.uf ?? ''})
Destino: ${deliveryPoints[0]?.full_address ?? '—'} (${deliveryPoints[0]?.city ?? ''}/${deliveryPoints[0]?.uf ?? ''})

Status: carga embarcada e veículo liberado.
Previsão de entrega: ${deliveryPoints[0]?.scheduled_date ?? 'a definir'}
Ocorrência: não há

Acompanhe em tempo real: ${trackingUrl}

Próxima atualização: na chegada do destino.`,

    saida: `🚛 *Status VINCOLOG — OIT ${oit.number}*

Carga embarcada.
Veículo: ${oit.vehicle_type ?? '—'} · Placa ${oit.vehicle_plate_cavalo ?? '—'}
Motorista: ${oit.driver_name ?? '—'}

Previsão de entrega: ${deliveryPoints[0]?.scheduled_date ?? 'a definir'}
Ocorrência: não há

Link de acompanhamento: ${trackingUrl}`,

    entrega: `✅ *Entrega concluída — OIT ${oit.number}*

Cliente: ${oit.client_name}
Destino: ${deliveryPoints[0]?.city ?? '—'}/${deliveryPoints[0]?.uf ?? ''}

Entrega realizada com sucesso.
POD/comprovante disponível no link de acompanhamento.

Histórico completo: ${trackingUrl}

Obrigado pela confiança!`,

    cliente: `📍 *Acompanhamento da operação VINCOLOG*

OIT: ${oit.number}
Cliente: ${oit.client_name}
Rota: ${collectionPoints[0]?.city ?? '—'} → ${deliveryPoints[0]?.city ?? '—'}

Você pode acompanhar o andamento, status, fotos e comprovante pelo link abaixo:
${trackingUrl}

Em caso de dúvida, fale com nossa equipe.

— Equipe VINCOLOG`,
  }

  async function handleGenerate() {
    setGenerating(true)
    try { await generateCollectionOrderPdf({ oit, collectionPoints, deliveryPoints }) }
    finally { setGenerating(false) }
  }

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Ordem de Coleta PDF */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2"><Send className="w-4 h-4" /> Ordem de Coleta / Boletim Operacional</h2>
          {oit.collection_order_sent_at ? (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/35">Enviada</span>
          ) : (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/35">Pendente envio</span>
          )}
        </div>
        <p className="text-sm text-blue-400">Documento PDF para o cliente — sem informações de custo, margem ou contrato com prestador.</p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {generating ? 'Gerando...' : 'Gerar PDF'}
          </button>
          {!oit.collection_order_sent_at && (
            <button onClick={() => start(async () => { await markCollectionOrderSent(oit.id) })} disabled={pending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-emerald-300 hover:text-white glass">
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Marcar como Enviada
            </button>
          )}
        </div>
        {oit.collection_order_sent_at && (
          <p className="text-xs text-emerald-400">Enviada em {fmtDateTime(oit.collection_order_sent_at)}</p>
        )}
      </div>

      {/* 4 Boletim templates per spec §19 */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2"><MessageSquare className="w-4 h-4 text-green-400" /> Boletins WhatsApp Prontos (spec §19)</h2>
        <p className="text-xs text-blue-400">4 modelos padronizados para copiar e colar nos grupos operacionais ou enviar ao cliente.</p>
        <div className="space-y-3">
          {TEMPLATES.map(t => (
            <div key={t.id} className="rounded-xl p-4" style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                  {t.icon} {t.label}
                </p>
                <button onClick={() => copyText(t.id, templates[t.id])}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-colors"
                  style={copied === t.id
                    ? { background: 'rgba(52,211,153,0.3)', color: '#6EE7B7' }
                    : { background: 'rgba(22,163,74,0.25)', color: '#86EFAC' }}>
                  {copied === t.id ? <><CheckCircle className="w-3 h-3" /> Copiado!</> : <><Copy className="w-3 h-3" /> Copiar</>}
                </button>
              </div>
              <pre className="text-[11px] text-blue-200 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto scrollbar-thin">{templates[t.id]}</pre>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-3.5 h-3.5 text-blue-500" />
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Link de acompanhamento</p>
        </div>
        <code className="text-xs text-blue-300 font-mono break-all">{trackingUrl}</code>
      </div>
    </div>
  )
}
