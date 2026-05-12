import { createClient } from '@/lib/supabase/server'
import FinanceiroView from './FinanceiroView'

export default async function FinanceiroPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('oits')
    .select('id, number, client_name, status, vendor_value, contracted_value, advance_amount, balance_amount, estimated_margin, margin_percentage, providers(name)')
    .order('created_at', { ascending: false })

  return <FinanceiroView oits={(data ?? []) as unknown as Parameters<typeof FinanceiroView>[0]['oits']} />
}
