'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function markContractSigned(contractId: string, orderId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('contracts')
    .update({ status: 'assinado', signed_at: new Date().toISOString() })
    .eq('id', contractId)
  if (error) return { error: error.message }

  // Also mark provider as contract_signed
  const { data: contract } = await supabase
    .from('contracts').select('provider_id').eq('id', contractId).single()
  if (contract?.provider_id) {
    await supabase.from('providers')
      .update({ contract_signed: true, contract_date: new Date().toISOString().split('T')[0] })
      .eq('id', contract.provider_id)
  }

  revalidatePath(`/pedidos/${orderId}`)
  revalidatePath('/contratos')
  return { ok: true }
}

export async function saveSignedContractUrl(orderId: string, url: string) {
  const supabase = createClient()
  await supabase.from('orders').update({ signed_contract_url: url }).eq('id', orderId)
  await supabase.from('contracts').update({ signed_url: url, status: 'assinado', signed_at: new Date().toISOString() }).eq('order_id', orderId)
  revalidatePath(`/pedidos/${orderId}`)
  return { ok: true }
}
