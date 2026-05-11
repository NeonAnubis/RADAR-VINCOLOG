'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OitStatus, PaymentStatus } from '@/lib/types'
import { randomBytes } from 'crypto'

async function audit(supabase: ReturnType<typeof createClient>, oitId: string, action: string, newData: Record<string, unknown>) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('audit_logs').insert({
    entity_type: 'oit',
    entity_id: oitId,
    action,
    new_data: newData,
    created_by: user?.id,
    user_email: user?.email,
  })
}

async function logTimeline(
  supabase: ReturnType<typeof createClient>,
  oitId: string,
  eventType: string,
  description: string,
  source: 'comercial' | 'operacional' | 'financeiro' | 'prestador' | 'cliente' | 'sistema' = 'operacional',
  visibleToClient = false,
  metadata?: Record<string, unknown>,
) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('timeline_events').insert({
    oit_id: oitId,
    event_type: eventType,
    source,
    user_id: user?.id,
    description,
    visible_to_client: visibleToClient,
    metadata: metadata ?? null,
  })
}

export async function moveOitStatus(oitId: string, newStatus: OitStatus) {
  const supabase = createClient()
  const updates: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'prestador_alocado') updates.allocated_at = new Date().toISOString()
  if (newStatus === 'em_transito') updates.gps_tracking_active = true

  const { error } = await supabase.from('oits').update(updates).eq('id', oitId)
  if (error) return { error: error.message }

  await logTimeline(supabase, oitId, `status_${newStatus}`, `Status alterado para ${newStatus}`, 'operacional', false)
  await audit(supabase, oitId, `STATUS_${newStatus.toUpperCase()}`, { status: newStatus })
  revalidatePath('/oits')
  revalidatePath(`/oits/${oitId}`)
  return { ok: true }
}

export async function setOitPriority(oitId: string, priority: 'baixa'|'normal'|'alta'|'critica') {
  const supabase = createClient()
  const { error } = await supabase.from('oits').update({ priority }).eq('id', oitId)
  if (error) return { error: error.message }
  revalidatePath(`/oits/${oitId}`)
  return { ok: true }
}

export async function allocateProviderToOit(oitId: string, providerId: string, vehicleData: {
  driver_name?: string; driver_cpf?: string; driver_phone?: string; driver_cnh?: string;
  vehicle_type?: string; vehicle_body?: string; vehicle_plate_cavalo?: string; vehicle_plate_carreta?: string;
  vehicle_has_tarp?: boolean; vehicle_has_tracker?: boolean; vehicle_tracker_link?: string;
}) {
  const supabase = createClient()
  const { error } = await supabase
    .from('oits')
    .update({
      provider_id: providerId,
      ...vehicleData,
      status: 'prestador_alocado',
      allocated_at: new Date().toISOString(),
    })
    .eq('id', oitId)
  if (error) return { error: error.message }

  await supabase.rpc('increment_provider_fretes' as never, { provider_id_param: providerId })
  // Reactivate provider in case it was dormant
  await supabase.from('providers').update({ status: 'ativo' }).eq('id', providerId)

  await logTimeline(supabase, oitId, 'prestador_alocado', 'Prestador alocado à OIT', 'operacional', true)
  await audit(supabase, oitId, 'PROVIDER_ALLOCATED', { provider_id: providerId })
  revalidatePath(`/oits/${oitId}`)
  return { ok: true }
}

export async function saveOitCommercial(oitId: string, data: {
  contracted_value: number; advance_amount: number; balance_amount: number;
  pedagio?: number; vale_pedagio?: number; seguro?: number; ciot?: string;
  other_expenses?: number; financial_notes?: string;
}) {
  const supabase = createClient()
  const { data: oit } = await supabase.from('oits').select('vendor_value').eq('id', oitId).single()
  const vendor = oit?.vendor_value ?? 0
  const cost = data.contracted_value + (data.pedagio ?? 0) + (data.vale_pedagio ?? 0) + (data.seguro ?? 0) + (data.other_expenses ?? 0)
  const margin = vendor - cost
  const marginPct = vendor > 0 ? (margin / vendor) * 100 : 0

  const { error } = await supabase
    .from('oits')
    .update({
      ...data,
      estimated_margin: margin,
      margin_percentage: marginPct,
      payment_status: data.advance_amount > 0 ? 'adiantamento_pendente' : 'nao_iniciado',
    })
    .eq('id', oitId)

  if (error) return { error: error.message }
  await audit(supabase, oitId, 'COMMERCIAL_SAVED', { contracted_value: data.contracted_value, margin })
  revalidatePath(`/oits/${oitId}`)
  return { ok: true }
}

export async function updatePaymentStatus(oitId: string, newStatus: PaymentStatus) {
  const supabase = createClient()
  const { error } = await supabase.from('oits').update({ payment_status: newStatus }).eq('id', oitId)
  if (error) return { error: error.message }
  await logTimeline(supabase, oitId, `pagamento_${newStatus}`, `Status financeiro: ${newStatus}`, 'financeiro', false)
  await audit(supabase, oitId, `PAYMENT_${newStatus.toUpperCase()}`, { payment_status: newStatus })
  revalidatePath(`/oits/${oitId}`)
  revalidatePath('/financeiro')
  return { ok: true }
}

/** Validates spec §21.1 prerequisites and finalizes the OIT + unlinks provider per §22 */
export async function finalizeOit(oitId: string) {
  const supabase = createClient()

  // Load full OIT context for validation
  const { data: oit } = await supabase
    .from('oits')
    .select('id, status, provider_id, signed_contract_url, providers(status)')
    .eq('id', oitId)
    .single()
  if (!oit) return { error: 'OIT não encontrada' }

  const [{ data: deliveries }, { data: openOcc }, { data: contract }] = await Promise.all([
    supabase.from('delivery_points').select('id, pod_url, pod_recipient, delivered_at').eq('oit_id', oitId),
    supabase.from('occurrences').select('id').eq('oit_id', oitId).in('status', ['aberta','em_tratativa']),
    supabase.from('contracts_per_trip').select('status, signed_pdf_url').eq('oit_id', oitId).maybeSingle(),
  ])

  // ── Validation per §21.1 ──
  const errors: string[] = []
  const hasPod = (deliveries ?? []).some(d => d.pod_url || d.pod_recipient || d.delivered_at)
  if (!hasPod) errors.push('POD/comprovante não anexado em nenhuma entrega.')
  if ((openOcc ?? []).length > 0) errors.push(`${openOcc!.length} ocorrência(s) aberta(s). Encerre antes de finalizar.`)
  if (oit.provider_id && !contract) errors.push('Contrato por viagem não foi gerado.')
  if (contract && !['aceito','assinado_anexado'].includes(contract.status)) {
    errors.push('Contrato não está aceito ou assinado.')
  }

  if (errors.length > 0) {
    return { error: 'Pré-requisitos não atendidos:\n• ' + errors.join('\n• ') }
  }

  // ── Finalize OIT ──
  const now = new Date().toISOString()
  const { error: updErr } = await supabase
    .from('oits')
    .update({
      status: 'finalizado',
      finalized_at: now,
      provider_unlinked_at: now,
      gps_tracking_active: false,
      // expire the provider token by regenerating to a sentinel
      provider_link_token: 'EXPIRED-' + randomBytes(8).toString('hex'),
    })
    .eq('id', oitId)
  if (updErr) return { error: updErr.message }

  // ── Provider unlink per §22 ──
  if (oit.provider_id) {
    // Mark contract as encerrado
    await supabase.from('contracts_per_trip').update({ status: 'aceito' }).eq('oit_id', oitId).eq('status', 'pendente')

    // Check if provider has other active OITs; if not, set to 'adormecido'
    const { count } = await supabase
      .from('oits')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', oit.provider_id)
      .neq('status', 'finalizado')
    if ((count ?? 0) === 0) {
      await supabase.from('providers').update({ status: 'adormecido' }).eq('id', oit.provider_id)
    }
  }

  await logTimeline(supabase, oitId, 'oit_finalizada', 'OIT finalizada · prestador desvinculado · link prestador expirado', 'operacional', true)
  await audit(supabase, oitId, 'FINALIZED', { status: 'finalizado', provider_unlinked: true })
  revalidatePath('/oits')
  revalidatePath(`/oits/${oitId}`)
  revalidatePath('/prestadores')
  return { ok: true }
}

export async function setOitNextAction(oitId: string, action: string, deadline?: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('oits')
    .update({ next_action: action, next_action_deadline: deadline ?? null })
    .eq('id', oitId)
  if (error) return { error: error.message }
  revalidatePath(`/oits/${oitId}`)
  return { ok: true }
}

export async function addManualTimelineEvent(oitId: string, eventType: string, description: string, visibleToClient: boolean) {
  const supabase = createClient()
  await logTimeline(supabase, oitId, eventType, description, 'operacional', visibleToClient)
  revalidatePath(`/oits/${oitId}`)
  return { ok: true }
}

export async function markCollectionOrderSent(oitId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('oits')
    .update({ collection_order_sent_at: new Date().toISOString() })
    .eq('id', oitId)
  if (error) return { error: error.message }
  await logTimeline(supabase, oitId, 'ordem_coleta_enviada', 'Ordem de coleta enviada ao cliente', 'operacional', true)
  revalidatePath(`/oits/${oitId}`)
  return { ok: true }
}

/** Generates a unique invite token so the provider can self-register via /cadastro-prestador/[token] */
export async function generateProviderInvite(oitId: string) {
  const supabase = createClient()
  const token = 'inv-' + randomBytes(12).toString('hex')
  const { error } = await supabase
    .from('oits')
    .update({ provider_invite_token: token })
    .eq('id', oitId)
  if (error) return { error: error.message }
  revalidatePath(`/oits/${oitId}`)
  return { ok: true, token }
}

export async function toggleGpsTracking(oitId: string, active: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('oits')
    .update({ gps_tracking_active: active })
    .eq('id', oitId)
  if (error) return { error: error.message }
  await logTimeline(supabase, oitId, active ? 'gps_iniciado' : 'gps_pausado', active ? 'Rastreamento GPS ativado' : 'Rastreamento GPS pausado', 'operacional', false)
  revalidatePath(`/oits/${oitId}`)
  return { ok: true }
}
