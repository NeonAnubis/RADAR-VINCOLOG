'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OccurrenceType, OccurrenceStatus } from '@/lib/types'

export async function createOccurrence(payload: {
  oit_id: string
  type: OccurrenceType
  description: string
  location?: string
  impact?: string
  action_taken?: string
  new_estimate?: string
  visible_to_client: boolean
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data, error } = await supabase
    .from('occurrences')
    .insert({
      ...payload,
      responsible_user: user.id,
      created_by: user.id,
      status: 'aberta',
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Also mark OIT as ocorrencia status (but keep previous in metadata)
  await supabase
    .from('oits')
    .update({ status: 'ocorrencia' })
    .eq('id', payload.oit_id)

  // Timeline event
  await supabase.from('timeline_events').insert({
    oit_id: payload.oit_id,
    event_type: 'ocorrencia_registrada',
    source: 'operacional',
    user_id: user.id,
    description: `Ocorrência: ${payload.description}`,
    visible_to_client: payload.visible_to_client,
    metadata: { occurrence_id: data.id, type: payload.type, impact: payload.impact },
  })

  await supabase.from('audit_logs').insert({
    entity_type: 'occurrence',
    entity_id: data.id,
    action: 'OCCURRENCE_CREATED',
    new_data: { oit_id: payload.oit_id, type: payload.type },
    created_by: user.id,
    user_email: user.email,
  })

  revalidatePath(`/oits/${payload.oit_id}`)
  revalidatePath('/ocorrencias')
  return { ok: true, id: data.id }
}

export async function updateOccurrenceStatus(occurrenceId: string, status: OccurrenceStatus) {
  const supabase = createClient()
  const updates: Record<string, unknown> = { status }
  if (['resolvida', 'encerrada'].includes(status)) updates.closed_at = new Date().toISOString()

  const { error } = await supabase.from('occurrences').update(updates).eq('id', occurrenceId)
  if (error) return { error: error.message }
  revalidatePath('/ocorrencias')
  return { ok: true }
}

export async function createOccurrenceFromToken(payload: {
  oit_token: string
  type: OccurrenceType
  description: string
}) {
  const supabase = createClient()
  const { data: oit } = await supabase.from('oits').select('id').eq('provider_link_token', payload.oit_token).single()
  if (!oit) return { error: 'Token inválido' }

  const { error } = await supabase.from('occurrences').insert({
    oit_id: oit.id,
    type: payload.type,
    description: payload.description,
    status: 'aberta',
  })
  if (error) return { error: error.message }

  await supabase.from('timeline_events').insert({
    oit_id: oit.id,
    event_type: 'ocorrencia_prestador',
    source: 'prestador',
    description: `Ocorrência reportada pelo prestador: ${payload.description}`,
    visible_to_client: false,
  })

  return { ok: true }
}
