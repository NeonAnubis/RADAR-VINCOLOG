import { getAllSettings } from '@/lib/actions/settings'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/PageHeader'
import SettingsForm from './SettingsForm'
import NotificationsQueueView from './NotificationsQueueView'

export default async function ConfiguracoesPage() {
  const settings = await getAllSettings()
  const supabase = createClient()
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, oit_id, channel, recipient_address, subject, status, created_at, sent_at')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="p-6 space-y-5">
      <PageHeader titleKey="settings.title" subtitleKey="settings.subtitle" />
      <SettingsForm initial={settings} />
      <NotificationsQueueView notifications={(notifications ?? []) as Parameters<typeof NotificationsQueueView>[0]['notifications']} />
    </div>
  )
}
