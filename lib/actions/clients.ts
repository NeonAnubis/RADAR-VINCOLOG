'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createClient_(payload: {
  name: string; document?: string; document_type?: 'cnpj'|'cpf';
  email?: string; phone?: string; contact_name?: string; contact_sector?: string;
  city?: string; uf?: string; notes?: string;
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...payload, created_by: user.id })
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/clientes')
  return { ok: true, id: data.id, client: data }
}

export async function listClients() {
  const supabase = createClient()
  const { data } = await supabase.from('clients').select('*').order('name')
  return data ?? []
}
