'use client'

import { useState, useTransition } from 'react'
import { FileSignature, Download, Upload, Loader2, CheckCircle, ExternalLink } from 'lucide-react'
import { generateContractPdf } from '@/lib/utils/contract-pdf'
import { uploadSignedContract } from '@/lib/actions/files'
import { fmtCurrency, fmtDateTime } from '@/lib/utils/format'
import type { DbOit, DbCollectionPoint, DbDeliveryPoint, DbContractPerTrip } from '@/lib/types'

export default function TabContrato({ oit, collectionPoints, deliveryPoints, contract }: {
  oit: DbOit; collectionPoints: DbCollectionPoint[]; deliveryPoints: DbDeliveryPoint[]; contract: DbContractPerTrip | null
}) {
  const [generating, setGenerating] = useState(false)
  const [pending, start] = useTransition()
  const [signedUrl, setSignedUrl] = useState(oit.signed_contract_url)

  async function handleGenerate() {
    setGenerating(true)
    try {
      await generateContractPdf({ oit, collectionPoints, deliveryPoints })
    } finally {
      setGenerating(false)
    }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const fd = new FormData(); fd.append('file', file)
    start(async () => {
      const res = await uploadSignedContract(oit.id, fd)
      if (res.ok && res.url) setSignedUrl(res.url)
    })
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2"><FileSignature className="w-4 h-4" /> Contrato por Viagem</h2>
        {contract?.status === 'aceito' || contract?.status === 'assinado_anexado' || signedUrl ? (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/35">Aceito/Assinado</span>
        ) : (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/35">Pendente</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-blue-500 text-xs">Prestador</p><p className="text-white font-bold">{oit.providers?.name ?? '— Aloque um prestador primeiro'}</p></div>
        <div><p className="text-blue-500 text-xs">Motorista</p><p className="text-white">{oit.driver_name ?? '—'}</p></div>
        <div><p className="text-blue-500 text-xs">Valor contratado</p><p className="text-white font-bold">{fmtCurrency(oit.contracted_value)}</p></div>
        <div><p className="text-blue-500 text-xs">Adiantamento</p><p className="text-white">{fmtCurrency(oit.advance_amount)}</p></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={handleGenerate} disabled={generating || !oit.providers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {generating ? 'Gerando...' : 'Gerar Contrato PDF'}
        </button>

        <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-blue-300 hover:text-white glass cursor-pointer">
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {pending ? 'Enviando...' : 'Upload do contrato assinado'}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {signedUrl && (
        <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-300">Contrato assinado enviado</p>
            <p className="text-xs text-blue-400">Anexo registrado · {contract?.accepted_at ? `Aceito em ${fmtDateTime(contract.accepted_at)}` : ''}</p>
          </div>
          <a href={signedUrl} target="_blank" className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            Ver <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <div className="text-xs text-blue-500 space-y-1 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="font-bold text-blue-400">Formas de aceite (Fase 1):</p>
        <p>· Upload do contrato físico assinado (PDF/imagem)</p>
        <p>· Aceite digital simples no link do prestador</p>
        <p>· Print de WhatsApp anexado</p>
        <p>· Registro manual pelo operador VINCOLOG</p>
      </div>
    </div>
  )
}
