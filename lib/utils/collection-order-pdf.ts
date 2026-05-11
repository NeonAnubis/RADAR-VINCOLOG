'use client'

import type { DbOit, DbCollectionPoint, DbDeliveryPoint } from '@/lib/types'

interface Args {
  oit: DbOit
  collectionPoints: DbCollectionPoint[]
  deliveryPoints: DbDeliveryPoint[]
}

export async function generateCollectionOrderPdf({ oit, collectionPoints, deliveryPoints }: Args) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const m = 18
  let y = 18

  // Header
  doc.setFillColor(3, 14, 36); doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont('helvetica', 'bold')
  doc.text('RADAR', m, 14)
  doc.setFontSize(8); doc.setTextColor(96,165,250)
  doc.text('VINCOLOG', m + 22, 14)
  doc.setTextColor(255,255,255); doc.setFontSize(13); doc.setFont('helvetica', 'bold')
  doc.text('Ordem de Coleta', 210 - m, 14, { align: 'right' })
  doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  doc.text(`OIT ${oit.number}  ·  ${new Date().toLocaleDateString('pt-BR')}`, 210 - m, 22, { align: 'right' })

  y = 38
  doc.setTextColor(20,20,20); doc.setFontSize(9); doc.setFont('helvetica', 'normal')

  const writeBlock = (title: string, content: string[]) => {
    if (y > 270) { doc.addPage(); y = 20 }
    doc.setTextColor(59,130,246); doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
    doc.text(title, m, y)
    doc.setDrawColor(59,130,246); doc.line(m, y + 1.5, 210 - m, y + 1.5)
    y += 6
    doc.setTextColor(20,20,20); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
    content.forEach(line => {
      const wrapped = doc.splitTextToSize(line, 210 - m*2)
      doc.text(wrapped, m, y)
      y += (Array.isArray(wrapped) ? wrapped.length : 1) * 4.5
    })
    y += 4
  }

  writeBlock('CLIENTE', [
    `Razão Social: ${oit.client_name ?? '—'}`,
    `Contato: ${oit.client_contact_name ?? '—'}  ·  Tel: ${oit.client_contact_phone ?? '—'}`,
    oit.client_contact_email ? `E-mail: ${oit.client_contact_email}` : '',
  ].filter(Boolean))

  writeBlock(`COLETAS (${collectionPoints.length})`, collectionPoints.flatMap((p, i) => [
    `Coleta #${i+1}: ${p.name ?? '—'}`,
    `  ${p.full_address ?? '—'} — ${p.city ?? ''}/${p.uf ?? ''} ${p.cep ? '· CEP ' + p.cep : ''}`,
    p.scheduled_date ? `  Data: ${new Date(p.scheduled_date).toLocaleDateString('pt-BR')} ${p.time_window ?? ''}` : '',
    p.contact_name || p.phone ? `  Contato: ${p.contact_name ?? '—'} ${p.phone ?? ''}` : '',
  ].filter(Boolean)))

  writeBlock(`ENTREGAS (${deliveryPoints.length})`, deliveryPoints.flatMap((p, i) => [
    `Entrega #${i+1}: ${p.name ?? '—'}`,
    `  ${p.full_address ?? '—'} — ${p.city ?? ''}/${p.uf ?? ''} ${p.cep ? '· CEP ' + p.cep : ''}`,
    p.scheduled_date ? `  Data prevista: ${new Date(p.scheduled_date).toLocaleDateString('pt-BR')} ${p.time_window ?? ''}` : '',
  ].filter(Boolean)))

  writeBlock('CARGA', [
    `Descrição: ${oit.cargo_description ?? '—'}`,
    `Peso: ${oit.cargo_weight ?? '—'}  ·  Volumes: ${oit.cargo_volumes ?? '—'}`,
    oit.document_number ? `NF: ${oit.document_number}` : '',
  ].filter(Boolean))

  writeBlock('VEÍCULO E MOTORISTA', [
    `Motorista: ${oit.driver_name ?? '—'}`,
    `Telefone: ${oit.driver_phone ?? '—'}`,
    `Tipo de veículo: ${oit.vehicle_type ?? '—'}  ·  Carroceria: ${oit.vehicle_body ?? '—'}`,
    `Placa Cavalo: ${oit.vehicle_plate_cavalo ?? oit.providers?.vehicle_plate ?? '—'}`,
    oit.vehicle_plate_carreta ? `Placa Carreta: ${oit.vehicle_plate_carreta}` : '',
  ].filter(Boolean))

  // Tracking link
  if (y > 250) { doc.addPage(); y = 20 }
  doc.setFillColor(240, 248, 255); doc.rect(m, y, 210 - m*2, 18, 'F')
  doc.setTextColor(59,130,246); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
  doc.text('ACOMPANHAMENTO EM TEMPO REAL', m + 3, y + 6)
  doc.setTextColor(20,20,20); doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
  doc.text(`Acompanhe sua entrega: vincolog.com/rastreamento/${oit.client_link_token}`, m + 3, y + 13)
  y += 24

  if (oit.specific_instructions) {
    writeBlock('INSTRUÇÕES OPERACIONAIS', [oit.specific_instructions])
  }

  writeBlock('CONTATO VINCOLOG', [
    'Equipe operacional VINCOLOG · Sistema RADAR',
    'Para qualquer dúvida operacional, contate-nos pelo WhatsApp ou e-mail.',
  ])

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7); doc.setTextColor(120, 120, 120)
    doc.text(`Ordem de Coleta ${oit.number} · RADAR VINCOLOG`, 105, 290, { align: 'center' })
    doc.text(`Página ${i} de ${pageCount}`, 210 - m, 290, { align: 'right' })
  }

  doc.save(`Ordem-Coleta-${oit.number}.pdf`)
}
