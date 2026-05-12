'use client'

import { useT } from '@/lib/i18n/I18nProvider'

export default function InvitePageFooter() {
  const t = useT()
  return (
    <p className="text-center text-[11px] text-blue-700 pb-2">
      {t('providerInvite.footerHelp')}
    </p>
  )
}
