'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CheckpointType, OccurrenceType, OrderStatus } from '@/lib/types'

// Map checkpoint type → order status transition
const statusMap: Partial<Record<CheckpointType, OrderStatus>> = {
  saiu_coleta:     'em_rota',
  chegou_coleta:   'em_rota',
  coletou:         'em_rota',
  saiu_coleta_fim: 'em_rota',
  em_transito:     'em_rota',
  chegou_entrega:  'em_rota',
  entregue:        'entregue',
  finalizado:      'finalizado',
  ocorrencia:      'ocorrencia',
}

export async function addCheckpoint(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const orderId        = formData.get('orderId') as string
  const type           = formData.get('type') as CheckpointType
  const occurrenceType = formData.get('occurrenceType') as OccurrenceType | null || null
  const description    = formData.get('description') as string
  const city           = formData.get('city') as string || null
  const podRecipient   = formData.get('podRecipientName') as string || null

  const { error: cpError } = await supabase.from('checkpoints').insert({
    order_id:           orderId,
    type,
    occurrence_type:    occurrenceType,
    description,
    city,
    pod_recipient_name: podRecipient,
    photo_urls:         [],
    created_by:         user.id,
  })

  if (cpError) return { error: cpError.message }

  // Update order status
  const newStatus = statusMap[type]
  if (newStatus) {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
  }

  // Audit
  await supabase.from('audit_logs').insert({
    entity_type: 'order',
    entity_id:   orderId,
    action:      `CHECKPOINT_${type.toUpperCase()}`,
    new_data:    { type, description, occurrence_type: occurrenceType },
    created_by:  user.id,
    user_email:  user.email,
  })

  revalidatePath(`/pedidos/${orderId}`)
  return { ok: true }
}
