'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OitStatus } from '@/lib/types'

const STATUS_TRANSITIONS: Record<string, OitStatus> = {
  em_rota_coleta:       'aguardando_coleta',
  chegou_coleta:        'em_coleta',
  carregamento_iniciado:'em_coleta',
  carga_embarcada:      'em_coleta',
  saiu_coleta:          'em_transito',
  em_transito:          'em_transito',
  chegou_destino:       'em_entrega',
  descarga_iniciada:    'em_entrega',
  entrega_concluida:    'comprovante_pendente',
}

export async function providerUpdateStatus(token: string, eventType: string, description: string, locationText?: string) {
  const supabase = createClient()
  const { data: oit } = await supabase.from('oits').select('id, status').eq('provider_link_token', token).single()
  if (!oit) return { error: 'Token inválido' }
  if (oit.status === 'finalizado') return { error: 'OIT já finalizada' }

  // Insert timeline event
  await supabase.from('timeline_events').insert({
    oit_id: oit.id,
    event_type: eventType,
    source: 'prestador',
    description,
    location_text: locationText ?? null,
    visible_to_client: true,
  })

  // Update OIT status if mapping exists
  const newStatus = STATUS_TRANSITIONS[eventType]
  if (newStatus) {
    await supabase.from('oits').update({ status: newStatus }).eq('id', oit.id)
  }

  revalidatePath(`/prestador/${token}`)
  revalidatePath(`/rastreamento/${token}`)
  return { ok: true }
}

export async function providerUploadEvidence(token: string, eventType: string, formData: FormData) {
  const supabase = createClient()
  const { data: oit } = await supabase.from('oits').select('id').eq('provider_link_token', token).single()
  if (!oit) return { error: 'Token inválido' }

  const file = formData.get('file') as File
  if (!file) return { error: 'Arquivo não enviado' }

  const ext = file.name.split('.').pop()
  const path = `${oit.id}/${eventType}/${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage.from('checkpoints').upload(path, file, { contentType: file.type })
  if (upErr) return { error: upErr.message }
  const { data: { publicUrl } } = supabase.storage.from('checkpoints').getPublicUrl(path)

  await supabase.from('timeline_events').insert({
    oit_id: oit.id,
    event_type: eventType,
    source: 'prestador',
    description: `Evidência ${eventType}`,
    visible_to_client: true,
    attachments: [{ url: publicUrl, type: file.type, filename: file.name }],
  })

  revalidatePath(`/prestador/${token}`)
  return { ok: true, url: publicUrl }
}

export async function providerUploadPod(token: string, recipientName: string, formData: FormData) {
  const supabase = createClient()
  const { data: oit } = await supabase.from('oits').select('id').eq('provider_link_token', token).single()
  if (!oit) return { error: 'Token inválido' }

  const file = formData.get('file') as File
  let publicUrl: string | undefined
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const path = `${oit.id}/pod/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('checkpoints').upload(path, file, { contentType: file.type })
    if (upErr) return { error: upErr.message }
    const { data: urlData } = supabase.storage.from('checkpoints').getPublicUrl(path)
    publicUrl = urlData.publicUrl
  }

  // Insert timeline event for entrega concluída with POD
  await supabase.from('timeline_events').insert({
    oit_id: oit.id,
    event_type: 'entrega_concluida',
    source: 'prestador',
    description: `Entrega concluída. POD recebido por: ${recipientName}`,
    visible_to_client: true,
    attachments: publicUrl ? [{ url: publicUrl, type: file.type, filename: file.name }] : [],
    metadata: { pod_recipient: recipientName },
  })

  // Update OIT status
  await supabase.from('oits').update({ status: 'comprovante_pendente' }).eq('id', oit.id)

  // Update first delivery point with POD
  const { data: dp } = await supabase.from('delivery_points').select('id').eq('oit_id', oit.id).order('sequence').limit(1).single()
  if (dp) {
    await supabase.from('delivery_points').update({
      delivered_at: new Date().toISOString(),
      pod_recipient: recipientName,
      pod_url: publicUrl ?? null,
    }).eq('id', dp.id)
  }

  revalidatePath(`/prestador/${token}`)
  revalidatePath(`/rastreamento/${token}`)
  return { ok: true }
}

export async function providerRecordGps(token: string, lat: number, lng: number, accuracy?: number, speed?: number, batteryLevel?: number) {
  const supabase = createClient()
  const { data: oit } = await supabase.from('oits').select('id').eq('provider_link_token', token).single()
  if (!oit) return { error: 'Token inválido' }

  await supabase.from('gps_positions').insert({
    oit_id: oit.id,
    latitude: lat,
    longitude: lng,
    accuracy: accuracy ?? null,
    speed: speed ?? null,
    battery_level: batteryLevel ?? null,
    recorded_at: new Date().toISOString(),
    source: 'web',
  })
  return { ok: true }
}
