'use client'

import type { DbOit, DbCollectionPoint, DbDeliveryPoint } from '@/lib/types'

interface Args {
  oit: DbOit
  collectionPoints: DbCollectionPoint[]
  deliveryPoints: DbDeliveryPoint[]
}

export async function generateContractPdf({ oit, collectionPoints, deliveryPoints }: Args) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const m = 18
  let y = 18

  // Header
  doc.setFillColor(3, 14, 36); doc.rect(0, 0, 210, 24, 'F')
  doc.setTextColor(255,255,255); doc.setFontSize(13); doc.setFont('helvetica', 'bold')
  doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FRETE', 105, 14, { align: 'center' })
  doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  doc.text(`OIT ${oit.number} · RADAR VINCOLOG`, 105, 20, { align: 'center' })

  y = 32
  doc.setTextColor(20,20,20); doc.setFontSize(9); doc.setFont('helvetica', 'normal')

  const writeLine = (txt: string, opts?: { bold?: boolean; spacing?: number }) => {
    if (y > 270) { doc.addPage(); y = 20 }
    if (opts?.bold) doc.setFont('helvetica', 'bold'); else doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(txt, 210 - m*2)
    doc.text(lines, m, y)
    y += (Array.isArray(lines) ? lines.length : 1) * 4.5 + (opts?.spacing ?? 0)
  }

  writeLine('CONTRATANTE: VINCOLOG TRANSPORTES', { bold: true })
  writeLine('Sistema RADAR VINCOLOG — Gestão Operacional de Transporte', { spacing: 2 })

  writeLine('CONTRATADO (PRESTADOR):', { bold: true })
  writeLine(`Nome: ${oit.providers?.name ?? '____________________'}`)
  writeLine(`CPF/CNPJ: ${oit.providers?.cpf ?? '____________________'}`)
  writeLine(`Telefone: ${oit.providers?.phone ?? '____________________'}`, { spacing: 2 })

  writeLine('MOTORISTA:', { bold: true })
  writeLine(`Nome: ${oit.driver_name ?? '____________________'}`)
  writeLine(`CPF: ${oit.driver_cpf ?? '____________________'}`)
  writeLine(`CNH: ${oit.driver_cnh ?? '____________________'}`)
  writeLine(`Telefone: ${oit.driver_phone ?? '____________________'}`, { spacing: 2 })

  writeLine('VEÍCULO:', { bold: true })
  writeLine(`Tipo: ${oit.vehicle_type ?? '—'} · Carroceria: ${oit.vehicle_body ?? '—'}`)
  writeLine(`Placa Cavalo: ${oit.vehicle_plate_cavalo ?? '—'} · Placa Carreta: ${oit.vehicle_plate_carreta ?? '—'}`, { spacing: 2 })

  writeLine('OBJETO DA CONTRATAÇÃO:', { bold: true })
  writeLine(`Prestação de serviço de transporte conforme OIT ${oit.number}, com a seguinte rota:`)
  collectionPoints.forEach((p, i) => {
    writeLine(`Coleta #${i+1}: ${p.full_address ?? '—'} — ${p.city ?? ''}/${p.uf ?? ''}`)
  })
  deliveryPoints.forEach((p, i) => {
    writeLine(`Entrega #${i+1}: ${p.full_address ?? '—'} — ${p.city ?? ''}/${p.uf ?? ''}`)
  })
  y += 2

  writeLine('CARGA:', { bold: true })
  writeLine(`${oit.cargo_description ?? '—'} · Peso: ${oit.cargo_weight ?? '—'} · Volumes: ${oit.cargo_volumes ?? '—'}`, { spacing: 2 })

  writeLine('REMUNERAÇÃO:', { bold: true })
  writeLine(`Valor total do frete: R$ ${(oit.contracted_value ?? 0).toFixed(2)}`)
  writeLine(`Adiantamento: R$ ${(oit.advance_amount ?? 0).toFixed(2)}`)
  writeLine(`Saldo (na entrega/comprovante): R$ ${(oit.balance_amount ?? 0).toFixed(2)}`, { spacing: 2 })

  writeLine('CONDIÇÕES E OBRIGAÇÕES DO PRESTADOR:', { bold: true })
  writeLine('1. Realizar o transporte com diligência, cuidado e nos prazos acordados.')
  writeLine('2. Manter comunicação ativa via aplicativo/link do prestador (RADAR VINCOLOG), atualizando status e enviando fotos exigidas.')
  writeLine('3. Enviar evidências fotográficas em cada etapa: chegada, carregamento, amarração, lona, lacre, descarga e entrega.')
  writeLine('4. Coletar comprovante de entrega (POD/canhoto) com nome legível e assinatura do recebedor.')
  writeLine('5. Comunicar imediatamente qualquer ocorrência (avaria, atraso, recusa, sinistro, fiscalização) via o sistema.')
  writeLine('6. É vedada a subcontratação sem autorização expressa da VINCOLOG.')
  writeLine('7. Manter sigilo sobre operações, dados do cliente e valores comerciais.', { spacing: 2 })

  writeLine('RESPONSABILIDADE:', { bold: true })
  writeLine('O PRESTADOR responde por dolo, culpa, negligência, imprudência, imperícia, descumprimento, omissão ou subcontratação irregular. A VINCOLOG reserva-se o direito de regresso por danos causados a si ou a terceiros.', { spacing: 2 })

  writeLine('ACEITE:', { bold: true })
  writeLine('A aceitação deste contrato se dá por upload de via assinada, aceite digital simples no link da viagem, registro via WhatsApp ou registro manual pelo operador VINCOLOG.', { spacing: 4 })

  if (y > 230) { doc.addPage(); y = 30 }
  writeLine('___________________________________________________', { spacing: 2 })
  writeLine('Assinatura do PRESTADOR / MOTORISTA', { bold: true })
  writeLine(`Data: ____/____/______  ·  Local: __________________`, { spacing: 6 })
  writeLine('___________________________________________________', { spacing: 2 })
  writeLine('VINCOLOG TRANSPORTES', { bold: true })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7); doc.setTextColor(120, 120, 120)
    doc.text(`Contrato ${oit.number} · RADAR VINCOLOG`, 105, 290, { align: 'center' })
    doc.text(`Página ${i} de ${pageCount}`, 210 - m, 290, { align: 'right' })
  }

  doc.save(`Contrato-${oit.number}.pdf`)
}
