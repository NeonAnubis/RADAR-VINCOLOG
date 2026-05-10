'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createProvider(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data, error } = await supabase
    .from('providers')
    .insert({
      name:          formData.get('name') as string,
      phone:         formData.get('phone') as string || null,
      cpf:           formData.get('cpf') as string || null,
      cnh:           formData.get('cnh') as string || null,
      vehicle_type:  formData.get('vehicleType') as string || null,
      vehicle_plate: formData.get('vehiclePlate') as string,
      bank_name:     formData.get('bankName') as string || null,
      pix_key:       formData.get('pixKey') as string || null,
      status:        'ativo',
      created_by:    user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/prestadores')
  redirect(`/prestadores/${data.id}`)
}

export async function toggleProviderStatus(providerId: string, newStatus: 'ativo' | 'adormecido') {
  const supabase = createClient()
  const { error } = await supabase
    .from('providers')
    .update({ status: newStatus })
    .eq('id', providerId)
  if (error) return { error: error.message }
  revalidatePath('/prestadores')
  revalidatePath(`/prestadores/${providerId}`)
  return { ok: true }
}

export async function markContractSigned(providerId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('providers')
    .update({ contract_signed: true, contract_date: new Date().toISOString().split('T')[0] })
    .eq('id', providerId)
  if (error) return { error: error.message }
  revalidatePath(`/prestadores/${providerId}`)
  return { ok: true }
}
