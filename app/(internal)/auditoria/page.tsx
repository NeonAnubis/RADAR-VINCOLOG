import { createClient } from '@/lib/supabase/server'
import AuditView from './AuditView'

export default async function AuditoriaPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return <AuditView logs={(data ?? []) as Parameters<typeof AuditView>[0]['logs']} />
}
