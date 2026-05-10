'use client'
import { useState, useTransition } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { addCheckpoint } from '@/lib/actions/checkpoints'
import { CheckpointType, OccurrenceType } from '@/lib/types'

const TYPES: { value: CheckpointType; label: string }[] = [
  { value:'saiu_coleta',     label:'Saiu para Coleta' },
  { value:'chegou_coleta',   label:'Chegou na Coleta (portaria)' },
  { value:'coletou',         label:'Coletou Carga' },
  { value:'saiu_coleta_fim', label:'Saiu do Local de Coleta' },
  { value:'em_transito',     label:'Em Trânsito' },
  { value:'chegou_entrega',  label:'Chegou na Entrega (portaria)' },
  { value:'entregue',        label:'Entregue — POD' },
  { value:'finalizado',      label:'Finalizado' },
  { value:'ocorrencia',      label:'Ocorrência' },
]
const OCC_TYPES: { value: OccurrenceType; label: string }[] = [
  { value:'atraso',    label:'Atraso' },
  { value:'recusa',    label:'Recusa do Destinatário' },
  { value:'avaria',    label:'Avaria na Carga' },
  { value:'reentrega', label:'Reentrega Solicitada' },
  { value:'sem_acesso',label:'Sem Acesso ao Local' },
  { value:'outro',     label:'Outro' },
]

export default function AddCheckpointForm({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<CheckpointType>('saiu_coleta')
  const [occ, setOcc]   = useState<OccurrenceType>('atraso')
  const [desc, setDesc] = useState('')
  const [city, setCity] = useState('')
  const [pod,  setPod]  = useState('')
  const [error, setError] = useState<string|null>(null)
  const [pending, start]  = useTransition()

  const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set('orderId', orderId)
    fd.set('type', type)
    if (type === 'ocorrencia') fd.set('occurrenceType', occ)
    fd.set('description', desc)
    fd.set('city', city)
    if (type === 'entregue') fd.set('podRecipientName', pod)
    start(async () => {
      const res = await addCheckpoint(fd)
      if (res?.error) { setError(res.error) } else { setOpen(false); setDesc(''); setCity(''); setPod('') }
    })
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300">
      <Plus className="w-4 h-4" /> Registrar checkpoint
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">Novo Checkpoint</p>
      <div>
        <label className={L}>Tipo</label>
        <select value={type} onChange={e => setType(e.target.value as CheckpointType)} className="glass-select">
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      {type === 'ocorrencia' && (
        <div>
          <label className={L}>Tipo de ocorrência</label>
          <select value={occ} onChange={e => setOcc(e.target.value as OccurrenceType)} className="glass-select">
            {OCC_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}
      {type === 'entregue' && (
        <div>
          <label className={L}>Nome do recebedor (POD)</label>
          <input value={pod} onChange={e => setPod(e.target.value)} placeholder="Ana Paula Rodrigues" className="glass-input" />
        </div>
      )}
      <div>
        <label className={L}>Descrição</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Detalhes do checkpoint..." className="glass-input resize-none" required />
      </div>
      <div>
        <label className={L}>Cidade</label>
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="São Paulo" className="glass-input" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background:'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {pending ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-blue-400 glass">
          Cancelar
        </button>
      </div>
    </form>
  )
}
