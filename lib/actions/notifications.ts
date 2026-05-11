'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Logs an outbound operational notification (email/WhatsApp). The actual transport
 * delivery is intentionally pluggable: this records the message body and metadata
 * so admins can review and wire up Resend/SendGrid/WhatsApp API later by reading
 * pending rows from the `notifications` table.
 */
export async function notifyNewOit(oitId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: oit } = await supabase
    .from('oits')
    .select('*, collection_points(city, uf, scheduled_date), delivery_points(city, uf, scheduled_date)')
    .eq('id', oitId)
    .single()
  if (!oit) return { error: 'OIT não encontrada' }

  const { data: settings } = await supabase
    .from('app_settings')
    .select('key, value')
    .eq('key', 'emails.operational')
    .single()
  const opEmail = (settings?.value as string) ?? 'operacional@vincolog.com.br'

  const cps = (oit.collection_points ?? []) as Array<{city:string;uf:string;scheduled_date:string|null}>
  const dps = (oit.delivery_points ?? []) as Array<{city:string;uf:string;scheduled_date:string|null}>

  const subject = `Nova OIT aprovada — ${oit.client_name} — ${cps[0]?.city ?? '?'} x ${dps[0]?.city ?? '?'} — OIT ${oit.number}`
  const body = `Nova OIT aprovada e disponível na Torre de Controle.

OIT: ${oit.number}
Cliente: ${oit.client_name}
Contato: ${oit.client_contact_name ?? '—'} · ${oit.client_contact_phone ?? '—'}
Rota: ${cps.length > 1 ? `${cps.length} coletas` : (cps[0]?.city ?? '—')} → ${dps.length > 1 ? `${dps.length} entregas` : (dps[0]?.city ?? '—')}
Coleta prevista: ${cps[0]?.scheduled_date ?? 'a definir'}
Entrega prevista: ${dps[0]?.scheduled_date ?? 'a definir'}
Carga: ${oit.cargo_description ?? '—'}
Peso/Volumes: ${oit.cargo_weight ?? '—'} · ${oit.cargo_volumes ?? '—'} volumes
Veículo sugerido: ${oit.vehicle_type ?? '—'}
Nível de serviço: ${oit.service_level}
Valor vendido: R$ ${(oit.vendor_value ?? 0).toFixed(2)}

Abrir OIT: /oits/${oit.id}

— Sistema RADAR VINCOLOG`

  await supabase.from('notifications').insert({
    oit_id: oitId,
    channel: 'email',
    recipient_type: 'operational_team',
    recipient_address: opEmail,
    subject,
    body,
    status: 'pendente',
    created_by: user?.id,
  })

  await supabase.from('timeline_events').insert({
    oit_id: oitId,
    event_type: 'notificacao_operacional',
    source: 'sistema',
    description: `E-mail operacional enfileirado para ${opEmail}`,
    visible_to_client: false,
  })

  revalidatePath(`/oits/${oitId}`)
  return { ok: true }
}

export async function notifyClientMilestone(oitId: string, milestone: string, customMessage?: string) {
  const supabase = createClient()
  const { data: oit } = await supabase
    .from('oits')
    .select('client_name, client_contact_phone, client_contact_email, number, client_link_token')
    .eq('id', oitId)
    .single()
  if (!oit) return { error: 'OIT não encontrada' }

  const message = customMessage ?? `Atualização da operação ${oit.number}: ${milestone}.\n\nAcompanhe em tempo real: vincolog.com/rastreamento/${oit.client_link_token}`

  // Log both channels
  await supabase.from('notifications').insert([
    {
      oit_id: oitId,
      channel: 'whatsapp',
      recipient_type: 'client',
      recipient_address: oit.client_contact_phone,
      subject: `Atualização OIT ${oit.number}`,
      body: message,
      status: 'pendente',
    },
    ...(oit.client_contact_email ? [{
      oit_id: oitId,
      channel: 'email' as const,
      recipient_type: 'client',
      recipient_address: oit.client_contact_email,
      subject: `Atualização da sua operação ${oit.number}`,
      body: message,
      status: 'pendente' as const,
    }] : []),
  ])

  return { ok: true }
}

export async function markNotificationSent(notificationId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ status: 'enviado', sent_at: new Date().toISOString() })
    .eq('id', notificationId)
  if (error) return { error: error.message }
  revalidatePath('/configuracoes')
  return { ok: true }
}
