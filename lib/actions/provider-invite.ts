'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getInviteContext(token: string) {
  const supabase = createClient()
  const { data: oit } = await supabase
    .from('oits')
    .select('id, number, client_name, service_level, cargo_description, cargo_weight, vehicle_type')
    .eq('provider_invite_token', token)
    .single()
  return oit
}

export async function submitProviderInvite(token: string, payload: {
  name: string; cpf_cnpj: string; phone: string; rntrc?: string; category?: string;
  bank_name?: string; pix_key?: string;
  driver_name: string; driver_cpf: string; driver_phone: string; driver_cnh?: string;
  vehicle_type: string; vehicle_body?: string; vehicle_plate: string; vehicle_plate_carreta?: string;
  has_tracker?: boolean; has_tarp?: boolean;
}) {
  const supabase = createClient()
  const { data: oit } = await supabase
    .from('oits')
    .select('id, number, provider_id, provider_invite_token')
    .eq('provider_invite_token', token)
    .single()
  if (!oit) return { error: 'Convite inválido ou expirado.' }
  if (oit.provider_id) return { error: 'Esta OIT já possui prestador alocado.' }

  // Create provider with minimal info
  const { data: provider, error: pErr } = await supabase
    .from('providers')
    .insert({
      name: payload.name,
      cpf: payload.cpf_cnpj,
      phone: payload.phone,
      cnh: payload.driver_cnh ?? null,
      vehicle_type: payload.vehicle_type,
      vehicle_plate: payload.vehicle_plate,
      bank_name: payload.bank_name ?? null,
      pix_key: payload.pix_key ?? null,
      status: 'ativo',
      contract_signed: false,
    })
    .select()
    .single()
  if (pErr) return { error: pErr.message }

  // Allocate provider to OIT and clear invite token
  const { error: oErr } = await supabase
    .from('oits')
    .update({
      provider_id: provider.id,
      driver_name: payload.driver_name,
      driver_cpf: payload.driver_cpf,
      driver_phone: payload.driver_phone,
      driver_cnh: payload.driver_cnh ?? null,
      vehicle_type: payload.vehicle_type,
      vehicle_body: payload.vehicle_body ?? null,
      vehicle_plate_cavalo: payload.vehicle_plate,
      vehicle_plate_carreta: payload.vehicle_plate_carreta ?? null,
      vehicle_has_tarp: payload.has_tarp ?? false,
      vehicle_has_tracker: payload.has_tracker ?? false,
      status: 'prestador_alocado',
      allocated_at: new Date().toISOString(),
      provider_invite_token: null, // burn the invite
    })
    .eq('id', oit.id)
  if (oErr) return { error: oErr.message }

  // Timeline event
  await supabase.from('timeline_events').insert({
    oit_id: oit.id,
    event_type: 'prestador_autocadastrado',
    source: 'prestador',
    description: `Prestador ${payload.name} cadastrou-se via convite e foi vinculado à OIT`,
    visible_to_client: true,
  })

  revalidatePath(`/oits/${oit.id}`)
  return { ok: true, oitNumber: oit.number, providerId: provider.id }
}
