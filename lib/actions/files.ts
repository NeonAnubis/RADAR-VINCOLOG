'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadCheckpointPhoto(
  orderId: string,
  checkpointId: string,
  formData: FormData
) {
  const supabase = createClient()
  const file = formData.get('file') as File
  if (!file) return { error: 'Nenhum arquivo enviado' }

  const ext  = file.name.split('.').pop()
  const path = `${orderId}/${checkpointId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('checkpoints')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('checkpoints').getPublicUrl(path)

  // Append URL to checkpoint
  const { data: cp } = await supabase.from('checkpoints').select('photo_urls').eq('id', checkpointId).single()
  const updated = [...(cp?.photo_urls ?? []), publicUrl]
  await supabase.from('checkpoints').update({ photo_urls: updated }).eq('id', checkpointId)

  revalidatePath(`/pedidos/${orderId}`)
  return { ok: true, url: publicUrl }
}

export async function uploadSignedContract(orderId: string, formData: FormData) {
  const supabase = createClient()
  const file = formData.get('file') as File
  if (!file) return { error: 'Nenhum arquivo enviado' }

  const path = `${orderId}/contrato-assinado.${file.name.split('.').pop()}`

  const { error: uploadError } = await supabase.storage
    .from('contracts')
    .upload(path, file, { contentType: file.type, upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(path)

  await supabase.from('orders').update({ signed_contract_url: urlData.publicUrl }).eq('id', orderId)
  await supabase.from('contracts')
    .update({ signed_url: urlData.publicUrl, status: 'assinado', signed_at: new Date().toISOString() })
    .eq('order_id', orderId)

  revalidatePath(`/pedidos/${orderId}`)
  return { ok: true, url: urlData.publicUrl }
}

export async function uploadVehiclePhoto(providerId: string, formData: FormData) {
  const supabase = createClient()
  const file = formData.get('file') as File
  if (!file) return { error: 'Nenhum arquivo enviado' }

  const path = `${providerId}/${Date.now()}.${file.name.split('.').pop()}`

  const { error } = await supabase.storage
    .from('vehicles')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) return { error: error.message }

  const { data: { publicUrl } } = supabase.storage.from('vehicles').getPublicUrl(path)

  const { data: prov } = await supabase.from('providers').select('vehicle_photos').eq('id', providerId).single()
  const updated = [...(prov?.vehicle_photos ?? []), publicUrl]
  await supabase.from('providers').update({ vehicle_photos: updated }).eq('id', providerId)

  revalidatePath(`/prestadores/${providerId}`)
  return { ok: true, url: publicUrl }
}
