'use client'

import type { DbBudget, DbCollectionPoint, DbDeliveryPoint } from '@/lib/types'
import { SERVICE_LEVELS } from '@/lib/types'

interface Args {
  budget: DbBudget
  collectionPoints: DbCollectionPoint[]
  deliveryPoints: DbDeliveryPoint[]
}

export async function generateProposalPdf({ budget, collectionPoints, deliveryPoints }: Args) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()

  const margin = 15
  let y = 20

  // Header band
  doc.setFillColor(3, 14, 36)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18); doc.setFont('helvetica', 'bold')
  doc.text('RADAR', margin, 14)
  doc.setFontSize(8); doc.setTextColor(96, 165, 250)
  doc.text('VINCOLOG', margin + 22, 14)

  doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.setFont('helvetica', 'bold')
  doc.text('Proposta Comercial de Transporte', 210 - margin, 14, { align: 'right' })
  doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  doc.text(`Orçamento ${budget.number}`, 210 - margin, 21, { align: 'right' })
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 210 - margin, 26, { align: 'right' })

  y = 38
  doc.setTextColor(20, 20, 20)

  // Section: Cliente
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(59, 130, 246)
  doc.text('CLIENTE', margin, y); y += 5
  doc.setDrawColor(59, 130, 246); doc.line(margin, y - 1, 210 - margin, y - 1)
  doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text(`Razão Social: ${budget.client_name ?? '—'}`, margin, y + 4)
  doc.text(`CNPJ/CPF: ${budget.client_document ?? '—'}`, margin, y + 9)
  doc.text(`Contato: ${budget.client_contact_name ?? '—'}  ·  Tel: ${budget.client_contact_phone ?? '—'}`, margin, y + 14)
  if (budget.client_contact_email) doc.text(`E-mail: ${budget.client_contact_email}`, margin, y + 19)
  y += 24

  // Section: Rota (Coletas e Entregas)
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(59, 130, 246)
  doc.text('ROTA / OPERAÇÃO A+ → B+', margin, y); y += 5
  doc.line(margin, y - 1, 210 - margin, y - 1)
  doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)

  collectionPoints.forEach((p, i) => {
    if (y > 260) { doc.addPage(); y = 20 }
    doc.setFont('helvetica', 'bold'); doc.setTextColor(59, 130, 246)
    doc.text(`Coleta #${i+1}:`, margin, y + 5)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(20, 20, 20)
    doc.text(`${p.full_address ?? '—'} — ${p.city ?? ''}/${p.uf ?? ''}`, margin + 25, y + 5)
    if (p.scheduled_date) doc.text(`Data: ${new Date(p.scheduled_date).toLocaleDateString('pt-BR')} ${p.time_window ?? ''}`, margin + 25, y + 9)
    y += 11
  })

  deliveryPoints.forEach((p, i) => {
    if (y > 260) { doc.addPage(); y = 20 }
    doc.setFont('helvetica', 'bold'); doc.setTextColor(52, 211, 153)
    doc.text(`Entrega #${i+1}:`, margin, y + 5)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(20, 20, 20)
    doc.text(`${p.full_address ?? '—'} — ${p.city ?? ''}/${p.uf ?? ''}`, margin + 25, y + 5)
    if (p.scheduled_date) doc.text(`Data: ${new Date(p.scheduled_date).toLocaleDateString('pt-BR')} ${p.time_window ?? ''}`, margin + 25, y + 9)
    y += 11
  })

  y += 5

  // Section: Carga
  if (y > 230) { doc.addPage(); y = 20 }
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(59, 130, 246)
  doc.text('CARGA', margin, y); y += 5
  doc.line(margin, y - 1, 210 - margin, y - 1)
  doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text(`Descrição: ${budget.cargo_description ?? '—'}`, margin, y + 4)
  doc.text(`Peso: ${budget.cargo_weight ?? '—'}   Volumes: ${budget.cargo_volumes ?? '—'}`, margin, y + 9)
  if (budget.document_value) doc.text(`Valor da NF: R$ ${budget.document_value.toFixed(2)}`, margin, y + 14)
  y += 19

  // Section: Veículo
  if (y > 240) { doc.addPage(); y = 20 }
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(59, 130, 246)
  doc.text('PERFIL DE VEÍCULO', margin, y); y += 5
  doc.line(margin, y - 1, 210 - margin, y - 1)
  doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text(`Tipo: ${budget.vehicle_suggested_type ?? '—'}  ·  Carroceria: ${budget.vehicle_body_type ?? '—'}`, margin, y + 4)
  y += 12

  // Section: Service Levels (table)
  if (y > 200) { doc.addPage(); y = 20 }
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(59, 130, 246)
  doc.text('NÍVEIS DE SERVIÇO OFERTADOS', margin, y); y += 5
  doc.line(margin, y - 1, 210 - margin, y - 1)
  y += 4

  const offered = Object.entries(budget.service_levels ?? {})
    .filter(([_, cfg]) => cfg?.offered) as Array<[string, { total?: number; additionalValue?: number; notes?: string; validity?: string; conditions?: string }]>

  if (offered.length === 0) {
    doc.setTextColor(120, 120, 120); doc.setFont('helvetica', 'italic')
    doc.text('Nenhum nível de serviço configurado.', margin, y + 3); y += 8
  } else {
    // Table header
    doc.setFillColor(240, 245, 255); doc.rect(margin, y, 210 - margin*2, 6, 'F')
    doc.setTextColor(59, 130, 246); doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
    doc.text('Nível de Serviço', margin + 2, y + 4)
    doc.text('Descrição', margin + 55, y + 4)
    doc.text('Validade', margin + 125, y + 4)
    doc.text('Valor Total', 210 - margin - 2, y + 4, { align: 'right' })
    y += 8
    doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)

    offered.forEach(([key, cfg]) => {
      if (y > 270) { doc.addPage(); y = 20 }
      const meta = SERVICE_LEVELS[key as keyof typeof SERVICE_LEVELS]
      const desc = ({
        essencial:           'Comunicação básica + comprovante',
        assistido_basico:    'Status por marcos principais',
        assistido_completo:  'Acompanhamento ativo + evidências',
        prime_critico:       'Gestão operacional + relatório',
      } as Record<string, string>)[key] ?? ''
      doc.setFont('helvetica', 'bold')
      doc.text(meta.label, margin + 2, y + 4)
      doc.setFont('helvetica', 'normal')
      doc.text(desc, margin + 55, y + 4)
      doc.text(cfg.validity ?? '—', margin + 125, y + 4)
      doc.setFont('helvetica', 'bold')
      doc.text(`R$ ${(cfg.total ?? 0).toFixed(2)}`, 210 - margin - 2, y + 4, { align: 'right' })
      y += 7
      if (cfg.notes) {
        doc.setFont('helvetica', 'italic'); doc.setTextColor(120, 120, 120); doc.setFontSize(8)
        doc.text(`Obs: ${cfg.notes}`, margin + 2, y + 3)
        doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
        y += 5
      }
      doc.setDrawColor(220, 220, 220); doc.line(margin, y, 210 - margin, y); y += 1
    })
  }

  y += 6

  // Validity & terms
  if (y > 250) { doc.addPage(); y = 20 }
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(59, 130, 246)
  doc.text('CONDIÇÕES COMERCIAIS', margin, y); y += 5
  doc.line(margin, y - 1, 210 - margin, y - 1)
  doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  if (budget.validity_date)     doc.text(`Validade da proposta: ${new Date(budget.validity_date).toLocaleDateString('pt-BR')}`, margin, y + 4)
  if (budget.payment_condition) doc.text(`Condição de pagamento: ${budget.payment_condition}`, margin, y + 9)
  if (budget.premises)          doc.text(`Premissas: ${budget.premises}`, margin, y + 14)
  if (budget.exclusions)        doc.text(`Exclusões: ${budget.exclusions}`, margin, y + 19)
  y += 26

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7); doc.setTextColor(120, 120, 120)
    doc.text('RADAR VINCOLOG · Sistema interno de gestão operacional de transporte', 105, 290, { align: 'center' })
    doc.text(`Página ${i} de ${pageCount}`, 210 - margin, 290, { align: 'right' })
  }

  doc.save(`Proposta-${budget.number}.pdf`)
}
