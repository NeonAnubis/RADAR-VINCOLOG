'use client'

import { useRef, useState } from 'react'
import { Upload, CheckCircle, Loader2 } from 'lucide-react'
import { useT } from '@/lib/i18n/I18nProvider'

interface FileUploadProps {
  label: string
  accept?: string
  onUpload: (formData: FormData) => Promise<{ ok?: boolean; url?: string; error?: string }>
  hint?: string
}

export default function FileUpload({ label, accept = '*', onUpload, hint }: FileUploadProps) {
  const t = useT()
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setState('uploading')
    const fd = new FormData()
    fd.append('file', file)
    const res = await onUpload(fd)
    if (res.error) { setState('error'); setMsg(res.error) }
    else            { setState('done');  setMsg(res.url ?? t('common.sent')) }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <button type="button"
        onClick={() => inputRef.current?.click()}
        disabled={state === 'uploading'}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-300 hover:text-white transition-all glass disabled:opacity-50">
        {state === 'uploading' && <Loader2 className="w-4 h-4 animate-spin" />}
        {state === 'done'      && <CheckCircle className="w-4 h-4 text-emerald-400" />}
        {state === 'idle' || state === 'error' ? <Upload className="w-4 h-4" /> : null}
        {state === 'uploading' ? t('common.uploading') : state === 'done' ? t('common.uploaded') : label}
      </button>
      {hint && state === 'idle' && <p className="text-xs text-blue-500 mt-1">{hint}</p>}
      {state === 'error' && <p className="text-xs text-red-400 mt-1">{msg}</p>}
      {state === 'done'  && <p className="text-xs text-emerald-400 mt-1 truncate max-w-xs">{msg}</p>}
    </div>
  )
}
