import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import UploadContractForm from './UploadContractForm'

export default async function ContratoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: order } = await supabase.from('orders').select('id,protocol,signed_contract_url').eq('id', params.id).single()
  if (!order) notFound()

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/pedidos/${params.id}`} className="p-2 rounded-xl text-blue-400 hover:text-white glass">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Contrato Assinado</h1>
          <p className="text-sm text-blue-400">{order.protocol}</p>
        </div>
      </div>
      <UploadContractForm orderId={order.id} existingUrl={order.signed_contract_url} />
    </div>
  )
}
