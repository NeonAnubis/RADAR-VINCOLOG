import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ComercialForm from './ComercialForm'

export default async function ComercialPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('id,protocol,provider_id,frete_value,advance_amount,balance_amount,payment_deadline')
    .eq('id', params.id)
    .single()
  if (!order) notFound()

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/pedidos/${params.id}`} className="p-2 rounded-xl text-blue-400 hover:text-white glass">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Condições Comerciais</h1>
          <p className="text-sm text-blue-400">{order.protocol}</p>
        </div>
      </div>
      <ComercialForm order={order} />
    </div>
  )
}
