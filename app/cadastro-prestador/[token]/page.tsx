import { notFound } from 'next/navigation'
import { getInviteContext } from '@/lib/actions/provider-invite'
import InviteForm from './InviteForm'
import InvitePageHeader, { InviteTopBar } from './InvitePageHeader'
import InvitePageFooter from './InvitePageFooter'
import { SERVICE_LEVELS } from '@/lib/types'

export default async function ProviderInvitePage({ params }: { params: { token: string } }) {
  const oit = await getInviteContext(params.token)
  if (!oit) notFound()

  return (
    <div className="min-h-screen" style={{ background: '#020C1F', backgroundImage: 'radial-gradient(ellipse 100% 60% at 10% 0%,rgba(12,35,120,0.5) 0%,transparent 60%)' }}>
      <InviteTopBar />

      <div className="max-w-2xl mx-auto p-4 pb-12 space-y-4">
        <InvitePageHeader oit={oit as Parameters<typeof InvitePageHeader>[0]['oit'] & { service_level: keyof typeof SERVICE_LEVELS }} />
        <InviteForm token={params.token} />
        <InvitePageFooter />
      </div>
    </div>
  )
}
