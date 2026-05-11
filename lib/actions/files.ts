'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function uploadSignedContract(oitId: string, formData: FormData) {
  const supabase = createClient()
  const file = formData.get('file') as File
  if (!file) return { error: 'Nenhum arquivo enviado' }

  const ext = file.name.split('.').pop()
  const path = `${oitId}/contrato-assinado-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('contracts')
    .upload(path, file, { contentType: file.type, upsert: true })
  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(path)

  // Update OIT and contracts_per_trip
  await supabase.from('oits').update({ signed_contract_url: urlData.publicUrl }).eq('id', oitId)
  await supabase.from('contracts_per_trip')
    .upsert({
      oit_id: oitId,
      signed_pdf_url: urlData.publicUrl,
      acceptance_type: 'upload',
      accepted_at: new Date().toISOString(),
      status: 'assinado_anexado',
    }, { onConflict: 'oit_id' })

  // Timeline event
  await supabase.from('timeline_events').insert({
    oit_id: oitId,
    event_type: 'contrato_anexado',
    source: 'operacional',
    description: 'Contrato assinado anexado pelo operador',
    visible_to_client: false,
    attachments: [{ url: urlData.publicUrl, type: file.type, filename: file.name }],
  })

  revalidatePath(`/oits/${oitId}`)
  return { ok: true, url: urlData.publicUrl }
}

export async function uploadVehiclePhoto(providerId: string, formData: FormData) {
  const supabase = createClient()
  const file = formData.get('file') as File
  if (!file) return { error: 'Nenhum arquivo enviado' }

  const ext = file.name.split('.').pop()
  const path = `${providerId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('vehicles').upload(path, file, { contentType: file.type, upsert: false })
  if (error) return { error: error.message }
  const { data: { publicUrl } } = supabase.storage.from('vehicles').getPublicUrl(path)

  const { data: prov } = await supabase.from('providers').select('vehicle_photos').eq('id', providerId).single()
  const updated = [...(prov?.vehicle_photos ?? []), publicUrl]
  await supabase.from('providers').update({ vehicle_photos: updated }).eq('id', providerId)

  revalidatePath(`/prestadores/${providerId}`)
  return { ok: true, url: publicUrl }
}

export async function uploadEvidencePhoto(oitId: string, eventType: string, formData: FormData) {
  const supabase = createClient()
  const file = formData.get('file') as File
  if (!file) return { error: 'Nenhum arquivo enviado' }

  const ext = file.name.split('.').pop()
  const path = `${oitId}/${eventType}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('checkpoints').upload(path, file, { contentType: file.type })
  if (error) return { error: error.message }
  const { data: { publicUrl } } = supabase.storage.from('checkpoints').getPublicUrl(path)

  await supabase.from('timeline_events').insert({
    oit_id: oitId,
    event_type: eventType,
    source: 'operacional',
    description: `Evidência ${eventType} adicionada`,
    visible_to_client: true,
    attachments: [{ url: publicUrl, type: file.type, filename: file.name }],
  })

  revalidatePath(`/oits/${oitId}`)
  return { ok: true, url: publicUrl }
}
