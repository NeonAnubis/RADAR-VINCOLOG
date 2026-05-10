'use client'
import { useState } from 'react'
import { CheckCircle, Upload, ExternalLink } from 'lucide-react'
import { uploadSignedContract } from '@/lib/actions/files'
import FileUpload from '@/components/FileUpload'

export default function UploadContractForm({ orderId, existingUrl }: { orderId: string; existingUrl: string | null }) {
  const [url, setUrl] = useState(existingUrl)

  async function handleUpload(fd: FormData) {
    const res = await uploadSignedContract(orderId, fd)
    if (res.ok && res.url) setUrl(res.url)
    return res
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <p className="text-sm text-blue-300">
        Faça upload do contrato de prestação <strong className="text-white">assinado pelo motorista</strong> (PDF ou imagem).
      </p>

      {url ? (
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.3)' }}>
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-300">Contrato assinado enviado</p>
            <a href={url} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1">
              <ExternalLink className="w-3 h-3" /> Abrir documento
            </a>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl" style={{ background:'rgba(255,255,255,0.04)',border:'1px dashed rgba(255,255,255,0.15)' }}>
          <FileUpload
            label="Enviar contrato assinado"
            accept=".pdf,.jpg,.jpeg,.png"
            onUpload={handleUpload}
            hint="PDF, JPG ou PNG — max 10 MB"
          />
        </div>
      )}

      {url && (
        <div>
          <p className="text-xs text-blue-500 mb-2">Substituir documento:</p>
          <FileUpload
            label="Novo arquivo"
            accept=".pdf,.jpg,.jpeg,.png"
            onUpload={handleUpload}
          />
        </div>
      )}
    </div>
  )
}
