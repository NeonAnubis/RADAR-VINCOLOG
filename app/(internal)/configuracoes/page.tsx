import { getAllSettings } from '@/lib/actions/settings'
import SettingsForm from './SettingsForm'
import { createClient } from '@/lib/supabase/server'
import { Mail, MessageSquare, Inbox } from 'lucide-react'
import { fmtDateTime } from '@/lib/utils/format'

export default async function ConfiguracoesPage() {
  const settings = await getAllSettings()
  const supabase = createClient()
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, oit_id, channel, recipient_address, subject, status, created_at, sent_at')
    .order('created_at', { ascending: false })
    .limit(20)

  const pending = (notifications ?? []).filter(n => n.status === 'pendente').length

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Configurações</h1>
        <p className="text-blue-400 mt-0.5 text-sm">Identidade, e-mails e regras padrão da plataforma</p>
      </div>
      <SettingsForm initial={settings} />

      {/* Outbound notifications queue */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2"><Inbox className="w-4 h-4 text-blue-400" /> Fila de Notificações</h2>
          {pending > 0 && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/35">
              {pending} pendente{pending > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-xs text-blue-400">Mensagens enfileiradas pelo sistema. Wire-up de transporte (Resend/SendGrid/WhatsApp API) é Phase 2.</p>
        {(notifications ?? []).length === 0 ? (
          <p className="text-sm text-blue-600 text-center py-6">Nenhuma notificação registrada ainda.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
            {notifications!.map(n => {
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
    </div>
  )
}
