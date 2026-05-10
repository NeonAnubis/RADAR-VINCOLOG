'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrderStatus } from '@/lib/types'

async function logAudit(
  supabase: ReturnType<typeof createClient>,
  entityId: string,
  action: string,
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null
) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('audit_logs').insert({
    entity_type: 'order',
    entity_id:   entityId,
    action,
    old_data:    oldData,
    new_data:    newData,
    created_by:  user?.id,
    user_email:  user?.email,
  })
}

export async function createOrder(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Generate protocol via DB function
  const { data: protocolData } = await supabase.rpc('generate_protocol')
  const protocol = protocolData as string

  const { data, error } = await supabase
    .from('orders')
    .insert({
      protocol,
      client_name:          formData.get('clientName') as string,
      client_phone:         formData.get('clientPhone') as string || null,
      client_email:         formData.get('clientEmail') as string || null,
      origin_address:       formData.get('originAddress') as string,
      origin_city:          formData.get('originCity') as string,
      destination_address:  formData.get('destinationAddress') as string,
      destination_city:     formData.get('destinationCity') as string,
      cargo_description:    formData.get('cargo') as string || null,
      cargo_weight:         formData.get('weight') as string || null,
      frete_value:          formData.get('value') ? parseFloat(formData.get('value') as string) : null,
      notes:                formData.get('notes') as string || null,
      status:               'criado' as OrderStatus,
      created_by:           user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  await logAudit(supabase, data.id, 'CRIADO', null, { status: 'criado', protocol: data.protocol })
  revalidatePath('/pedidos')
  redirect(`/pedidos/${data.id}`)
}

export async function acceptOrder(orderId: string) {
  const supabase = createClient()
  const { data: before } = await supabase.from('orders').select('status').eq('id', orderId).single()

  const { error } = await supabase
    .from('orders')
    .update({ status: 'aceito', accepted_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) return { error: error.message }

  await logAudit(supabase, orderId, 'STATUS_ACEITO', { status: before?.status }, { status: 'aceito' })
  revalidatePath(`/pedidos/${orderId}`)
  return { ok: true }
}

export async function allocateProvider(formData: FormData) {
  const supabase = createClient()
  const orderId    = formData.get('orderId') as string
  const providerId = formData.get('providerId') as string

  const { data: before } = await supabase.from('orders').select('status,provider_id').eq('id', orderId).single()

  const { error } = await supabase
    .from('orders')
    .update({
      provider_id:  providerId,
      status:       'alocado' as OrderStatus,
      allocated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) return { error: error.message }

  // Increment provider total_fretes
  await supabase.rpc('increment_provider_fretes' as never, { provider_id_param: providerId })

  await logAudit(supabase, orderId, 'ALOCADO', { status: before?.status }, { status: 'alocado', provider_id: providerId })
  revalidatePath(`/pedidos/${orderId}`)
  return { ok: true }
}

export async function saveCommercialTerms(formData: FormData) {
  const supabase = createClient()
  const orderId = formData.get('orderId') as string

  const freteValue   = parseFloat(formData.get('freteValue') as string) || 0
  const advanceAmt   = parseFloat(formData.get('advanceAmount') as string) || 0
  const balanceAmt   = freteValue - advanceAmt

  const { error: orderErr } = await supabase
    .from('orders')
    .update({
      frete_value:      freteValue,
      advance_amount:   advanceAmt,
      balance_amount:   balanceAmt,
      payment_deadline: formData.get('paymentDeadline') as string || null,
    })
    .eq('id', orderId)

  if (orderErr) return { error: orderErr.message }

  // Upsert contract
  const providerId = formData.get('providerId') as string | null
  const { error: contractErr } = await supabase
    .from('contracts')
    .upsert({
      order_id:         orderId,
      provider_id:      providerId || null,
      frete_value:      freteValue,
      advance_amount:   advanceAmt,
      balance_amount:   balanceAmt,
      payment_deadline: formData.get('paymentDeadline') as string || null,
      status:           'pendente',
    }, { onConflict: 'order_id' })

  if (contractErr) return { error: contractErr.message }

  await logAudit(supabase, orderId, 'COMERCIAL_SALVO', null, { frete_value: freteValue, advance_amount: advanceAmt })
  revalidatePath(`/pedidos/${orderId}`)
  return { ok: true }
}

export async function activateMonitoring(orderId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('orders')
    .update({ status: 'radar_ativo', radar_active_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) return { error: error.message }
  await logAudit(supabase, orderId, 'RADAR_ATIVO', null, { status: 'radar_ativo' })
  revalidatePath(`/pedidos/${orderId}`)
  return { ok: true }
}

export async function finalizeOrder(orderId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('orders')
    .update({ status: 'finalizado', finalized_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) return { error: error.message }

  // Mark contract as encerrado
  await supabase.from('contracts').update({ status: 'encerrado' }).eq('order_id', orderId)

  await logAudit(supabase, orderId, 'FINALIZADO', null, { status: 'finalizado' })
  revalidatePath(`/pedidos/${orderId}`)
  revalidatePath('/pedidos')
  return { ok: true }
}

export async function updateCollectionOrderSent(orderId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('orders')
    .update({ collection_order_sent: true })
    .eq('id', orderId)
  if (error) return { error: error.message }
  revalidatePath(`/pedidos/${orderId}`)
  return { ok: true }
}
