'use client'
import { useTransition } from 'react'
import { Moon, RotateCcw, Loader2 } from 'lucide-react'
import { toggleProviderStatus } from '@/lib/actions/providers'
import { ProviderStatus } from '@/lib/types'
import { useT } from '@/lib/i18n/I18nProvider'

export default function ToggleStatusButton({ providerId, currentStatus }: { providerId: string; currentStatus: ProviderStatus }) {
  const t = useT()
  const [pending, start] = useTransition()
  const isDormant = currentStatus === 'adormecido'
  const newStatus = isDormant ? 'ativo' : 'adormecido'

  return (
    <button
      onClick={() => start(async () => { await toggleProviderStatus(providerId, newStatus) })}
      disabled={pending}
      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-all ${isDormant ? 'text-white' : 'text-blue-400 hover:text-white glass'}`}
      style={isDormant ? { background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',boxShadow:'0 4px 14px rgba(59,130,246,0.35)' } : {}}>
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : isDormant ? <RotateCcw className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {pending ? t('common.loading') : isDormant ? t('providers.detail.reactivateBtn') : t('providers.detail.putDormantBtn')}
    </button>
  )
}
