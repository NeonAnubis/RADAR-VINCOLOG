'use client'

import { Image, Camera, Eye } from 'lucide-react'
import type { DbOit, DbTimelineEvent } from '@/lib/types'

const CATEGORIES = [
  { key: 'proposta',         label: 'Proposta' },
  { key: 'aprovacao',        label: 'Aprovação' },
  { key: 'contrato',         label: 'Contrato' },
  { key: 'ordem_coleta',     label: 'Ordem de Coleta' },
  { key: 'nf_xml',           label: 'NF/XML' },
  { key: 'foto_veiculo',     label: 'Foto Veículo' },
  { key: 'foto_carga',       label: 'Foto Carga' },
  { key: 'foto_amarracao',   label: 'Foto Amarração' },
  { key: 'foto_lona',        label: 'Foto Lona' },
  { key: 'foto_coleta',      label: 'Foto Coleta' },
  { key: 'foto_entrega',     label: 'Foto Entrega' },
  { key: 'canhoto_pod',      label: 'Canhoto / POD' },
  { key: 'comprovante_fin',  label: 'Comprovante Financeiro' },
  { key: 'ocorrencia',       label: 'Ocorrência' },
  { key: 'outros',           label: 'Outros' },
]

export default function TabFotos({ oit, timeline }: { oit: DbOit; timeline: DbTimelineEvent[] }) {
  const allAttachments = timeline.flatMap(t =>
    (t.attachments ?? []).map(a => ({ ...a, eventType: t.event_type, createdAt: t.created_at, visible: t.visible_to_client }))
  )
  // Vehicle photos
  const vehiclePhotos = oit.providers?.vehicle_photos ?? []

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4"><Image className="w-4 h-4" /> Fotos, Documentos e Comprovantes</h2>

        {vehiclePhotos.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Fotos do Veículo (alocado)</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {vehiclePhotos.map((url, i) => (
                <a key={i} href={url} target="_blank" className="aspect-video rounded-xl overflow-hidden block"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <img src={url} alt={`Veículo ${i+1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Anexos por Evento ({allAttachments.length})</p>
        {allAttachments.length === 0 ? (
          <p className="text-sm text-blue-600 text-center py-8">Nenhum anexo registrado ainda.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {allAttachments.map((a, i) => (
              <a key={i} href={a.url} target="_blank" className="rounded-xl overflow-hidden glass-sm hover:glass transition-all">
                <div className="aspect-video flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  {a.type?.startsWith('image/') ? (
                    <img src={a.url} alt={a.filename} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-blue-700" />
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold text-white truncate">{a.filename ?? 'Anexo'}</p>
                  <p className="text-[10px] text-blue-400 mt-0.5">{a.eventType?.replace(/_/g, ' ')}</p>
                  {!a.visible && <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-1"><Eye className="w-2.5 h-2.5" /> interno</span>}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Categorias disponíveis</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <span key={c.key} className="px-2 py-1 rounded text-[10px] font-semibold text-blue-300 glass-sm">{c.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
