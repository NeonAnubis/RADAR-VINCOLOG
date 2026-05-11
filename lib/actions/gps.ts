'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface GpsBatch {
  latitude: number
  longitude: number
  accuracy?: number
  speed?: number
  battery_level?: number
  recorded_at: string
}

/** Receive batched GPS positions from provider portal (supports offline sync) */
export async function receiveGpsBatch(token: string, positions: GpsBatch[]) {
  if (positions.length === 0) return { ok: true }
  const supabase = createClient()
  const { data: oit } = await supabase
    .from('oits')
    .select('id, gps_tracking_active')
    .eq('provider_link_token', token)
    .single()
  if (!oit) return { error: 'Token inválido' }
  if (!oit.gps_tracking_active) {
    // Not tracking — accept the positions anyway but mark as off
  }

  // Insert all batched positions
  const rows = positions.map(p => ({
    oit_id: oit.id,
    latitude: p.latitude,
    longitude: p.longitude,
    accuracy: p.accuracy ?? null,
    speed: p.speed ?? null,
    battery_level: p.battery_level ?? null,
    recorded_at: p.recorded_at,
    source: 'web',
  }))
  const { error } = await supabase.from('gps_positions').insert(rows)
  if (error) return { error: error.message }

  // Update last known position on OIT
  const latest = positions[positions.length - 1]
  await supabase.from('oits').update({
    last_gps_lat: latest.latitude,
    last_gps_lng: latest.longitude,
    last_gps_at:  latest.recorded_at,
  }).eq('id', oit.id)

  revalidatePath(`/oits/${oit.id}`)
  return { ok: true, synced: positions.length }
}
