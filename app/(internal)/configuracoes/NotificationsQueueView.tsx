'use client'

import { Mail, MessageSquare, Inbox } from 'lucide-react'
import { fmtDateTime } from '@/lib/utils/format'
import { useT } from '@/lib/i18n/I18nProvider'

type Notification = {
  id: string
  oit_id: string | null
  channel: string
  recipient_address: string | null
  subject: string | null
  status: string
  created_at: string
  sent_at: string | null
}

export default function NotificationsQueueView({ notifications }: { notifications: Notification[] }) {
  const t = useT()
  const pending = notifications.filter(n => n.status === 'pendente').length

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2"><Inbox className="w-4 h-4 text-blue-400" /> {t('settings.notifQueue')}</h2>
        {pending > 0 && (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/35">
            {t(pending === 1 ? 'settings.notifPending' : 'settings.notifPendingPlural', { count: pending })}
          </span>
        )}
      </div>
      <p className="text-xs text-blue-400">{t('settings.notifHelp')}</p>
      {notifications.length === 0 ? (
        <p className="text-sm text-blue-600 text-center py-6">{t('settings.notifEmpty')}</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
          {notifications.map(n => {
            const Icon = n.channel === 'email' ? Mail : MessageSquare
            return (
              <div key={n.id} className="flex items-center gap-3 p-3 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Icon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-blue-200 truncate">{n.subject ?? '—'}</p>
                  <p className="text-blue-500">{n.channel} · {n.recipient_address} · {fmtDateTime(n.created_at)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  n.status === 'enviado' ? 'bg-emerald-400/20 text-emerald-300' :
                  n.status === 'falhou'  ? 'bg-red-400/20 text-red-300' :
                  'bg-amber-400/20 text-amber-300'
                }`}>{n.status}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
