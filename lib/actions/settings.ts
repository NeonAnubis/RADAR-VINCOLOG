'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getAllSettings() {
  const supabase = createClient()
  const { data } = await supabase.from('app_settings').select('*').order('key')
  const map: Record<string, unknown> = {}
  ;(data ?? []).forEach(row => { map[row.key] = row.value })
  return map
}

export async function updateSetting(key: string, value: unknown) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString(), updated_by: user?.id }, { onConflict: 'key' })
  if (error) return { error: error.message }
  revalidatePath('/configuracoes')
  return { ok: true }
}

export async function updateMultipleSettings(updates: Record<string, unknown>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const rows = Object.entries(updates).map(([key, value]) => ({
    key, value, updated_at: new Date().toISOString(), updated_by: user?.id,
  }))
  const { error } = await supabase.from('app_settings').upsert(rows, { onConflict: 'key' })
  if (error) return { error: error.message }
  revalidatePath('/configuracoes')
  return { ok: true }
}
