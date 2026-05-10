import { createClient } from '@/lib/supabase/server'
import { fmtDateTime } from '@/lib/utils/format'
import { ShieldCheck } from 'lucide-react'

export default async function AuditoriaPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const logs = data ?? []

  const actionColor: Record<string, string> = {
    CRIADO:        'text-cyan-300',
    STATUS_ACEITO: 'text-sky-300',
    ALOCADO:       'text-blue-300',
    RADAR_ATIVO:   'text-violet-300',
    FINALIZADO:    'text-slate-400',
    COMERCIAL_SALVO:'text-amber-300',
  }

  function color(action: string) {
    if (action.startsWith('CHECKPOINT_')) return 'text-purple-300'
    return actionColor[action] ?? 'text-blue-300'
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Auditoria</h1>
        <p className="text-blue-400 mt-0.5 text-sm">Registro de todas as ações no sistema</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-bold text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-400" /> Log de atividades ({logs.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['Data / Hora','Entidade','Ação','Usuário','Dados'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-blue-400 px-5 py-3 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="glass-hover transition-colors" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-5 py-3 text-xs text-blue-400 whitespace-nowrap">{fmtDateTime(log.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-blue-300">{log.entity_type}</span>
                    <p className="text-[10px] text-blue-600 font-mono">{log.entity_id.slice(0,8)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${color(log.action)}`}>{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-blue-400">{log.user_email ?? '—'}</td>
                  <td className="px-4 py-3">
                    {log.new_data && (
                      <code className="text-[10px] text-blue-500 font-mono">
                        {JSON.stringify(log.new_data).slice(0, 60)}
                      </code>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-blue-600 text-sm">Nenhuma atividade registrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
