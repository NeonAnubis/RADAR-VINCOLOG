'use client'
import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

export default function OCDownloadButton({ order }: { order: Record<string, unknown> }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      const o = order as {
        protocol: string; client_name: string; cargo_description: string;
        cargo_weight: string; origin_city: string; origin_address: string;
        destination_city: string; destination_address: string;
        frete_value: number; advance_amount: number; balance_amount: number;
        notes: string; tracking_token: string;
        providers: { name: string; phone: string; cpf: string; cnh: string; vehicle_type: string; vehicle_plate: string } | null;
      }

      // Header
      doc.setFontSize(18); doc.setFont('helvetica','bold')
      doc.text('ORDEM DE COLETA', 105, 20, { align: 'center' })
      doc.setFontSize(10); doc.setFont('helvetica','normal')
      doc.text(`RADAR VINCOLOG — ${o.protocol}`, 105, 28, { align: 'center' })
      doc.text(`Emitida em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 34, { align: 'center' })

      doc.line(15, 38, 195, 38)

      // Route
      let y = 46
      doc.setFont('helvetica','bold'); doc.text('ROTA', 15, y)
      doc.setFont('helvetica','normal')
      doc.text(`Coleta (A): ${o.origin_city} — ${o.origin_address}`, 15, y+7)
      doc.text(`Entrega (B): ${o.destination_city} — ${o.destination_address}`, 15, y+14)

      y += 26; doc.line(15, y, 195, y); y += 8
      doc.setFont('helvetica','bold'); doc.text('CARGA', 15, y)
      doc.setFont('helvetica','normal')
      doc.text(`Descrição: ${o.cargo_description ?? '—'}`, 15, y+7)
      doc.text(`Peso: ${o.cargo_weight ?? '—'}`, 15, y+14)
      doc.text(`Cliente: ${o.client_name}`, 15, y+21)

      y += 33; doc.line(15, y, 195, y); y += 8
      doc.setFont('helvetica','bold'); doc.text('CONDUTOR / PRESTADOR', 15, y)
      const p = o.providers
      doc.setFont('helvetica','normal')
      doc.text(`Nome: ${p?.name ?? '—'}`, 15, y+7)
      doc.text(`CPF: ${p?.cpf ?? '—'}     CNH: ${p?.cnh ?? '—'}`, 15, y+14)
      doc.text(`Veículo: ${p?.vehicle_type ?? '—'} — Placa: ${p?.vehicle_plate ?? '—'}`, 15, y+21)
      doc.text(`Contato: ${p?.phone ?? '—'}`, 15, y+28)

      y += 40; doc.line(15, y, 195, y); y += 8
      doc.setFont('helvetica','bold'); doc.text('CONDIÇÕES COMERCIAIS', 15, y)
      doc.setFont('helvetica','normal')
      doc.text(`Frete: R$ ${(o.frete_value ?? 0).toFixed(2)}`, 15, y+7)
      doc.text(`Adiantamento: R$ ${(o.advance_amount ?? 0).toFixed(2)}`, 15, y+14)
      doc.text(`Saldo: R$ ${(o.balance_amount ?? 0).toFixed(2)}`, 15, y+21)

      if (o.notes) {
        y += 33; doc.line(15, y, 195, y); y += 8
        doc.setFont('helvetica','bold'); doc.text('OBSERVAÇÕES', 15, y)
        doc.setFont('helvetica','normal')
        const lines = doc.splitTextToSize(o.notes, 175)
        doc.text(lines, 15, y+7)
      }

      y = 270
      doc.line(15, y, 195, y); y += 6
      doc.setFontSize(8); doc.text(`Token: ${o.tracking_token}`, 105, y, { align:'center' })

      doc.save(`OC-${o.protocol}.pdf`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDownload} disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
      style={{ background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',boxShadow:'0 4px 14px rgba(59,130,246,0.4)' }}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {loading ? 'Gerando PDF...' : 'Baixar PDF'}
    </button>
  )
}
