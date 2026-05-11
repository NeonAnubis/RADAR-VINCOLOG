'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, ChevronLeft, Plus, Trash2, CheckCircle, Loader2, Package, User, MapPin, Truck, Settings, FileText } from 'lucide-react'
import { createBudget } from '@/lib/actions/budgets'
import type { FreightComponents, ServiceLevelsConfig } from '@/lib/types'
import ClientSelector from '@/components/ClientSelector'

const L = "block text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider"

type PointForm = {
  name: string; cnpj: string; contact_name: string; phone: string; email: string;
  full_address: string; city: string; uf: string; cep: string;
  scheduled_date: string; time_window: string; needs_scheduling: boolean;
  access_instructions: string; notes: string;
}
const emptyPoint = (): PointForm => ({
  name: '', cnpj: '', contact_name: '', phone: '', email: '',
  full_address: '', city: '', uf: '', cep: '',
  scheduled_date: '', time_window: '', needs_scheduling: false,
  access_instructions: '', notes: '',
})

const STEPS = [
  { id: 1, label: 'Identificação',     icon: FileText },
  { id: 2, label: 'Cliente',           icon: User },
  { id: 3, label: 'Coletas e Entregas', icon: MapPin },
  { id: 4, label: 'Carga',              icon: Package },
  { id: 5, label: 'Veículo',            icon: Truck },
  { id: 6, label: 'Valores',            icon: Settings },
  { id: 7, label: 'Níveis de Serviço',  icon: CheckCircle },
]

export default function NovoOrcamentoPage() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  // Bloco A — Identificação
  const [identification, setId] = useState({
    origin_source: '',
    description: '',
  })

  // Bloco B — Cliente
  const [client, setClient] = useState({
    client_id: null as string | null,
    client_name: '',
    client_document: '',
    client_contact_name: '',
    client_contact_phone: '',
    client_contact_email: '',
    client_contact_sector: '',
    client_notes: '',
  })

  // Bloco C/D — Coletas e Entregas
  const [collections, setCollections] = useState<PointForm[]>([emptyPoint()])
  const [deliveries, setDeliveries] = useState<PointForm[]>([emptyPoint()])

  // Bloco E — Documento e carga
  const [cargo, setCargo] = useState({
    document_number: '',
    document_value: '',
    xml_received: false,
    cargo_description: '',
    cargo_volumes: '',
    cargo_weight: '',
    cargo_length: '',
    cargo_width: '',
    cargo_height: '',
    cargo_cubage: '',
    cargo_sensitive: false,
    cargo_high_value: false,
    cargo_needs_tarp: false,
    cargo_needs_strap: false,
    cargo_needs_tracker: false,
    cargo_needs_photo: false,
    cargo_notes: '',
  })

  // Bloco F — Veículo
  const [vehicle, setVehicle] = useState({
    vehicle_suggested_type: '',
    vehicle_body_type: '',
    vehicle_exclusive: false,
    vehicle_full_load: false,
    operation_dedicated: false,
    operation_aero: false,
    operation_project: false,
    vehicle_notes: '',
  })

  // Bloco G — Componentes do frete
  const [freight, setFreight] = useState<FreightComponents>({})

  // Bloco H — Níveis ofertados
  const [levels, setLevels] = useState<ServiceLevelsConfig>({
    essencial: { offered: false },
    assistido_basico: { offered: false },
    assistido_completo: { offered: false },
    prime_critico: { offered: false },
  })

  // Bloco I — Observações
  const [obs, setObs] = useState({
    validity_date: '',
    payment_condition: '',
    general_notes: '',
    premises: '',
    exclusions: '',
  })

  function updatePoint(arr: PointForm[], setArr: (a:PointForm[])=>void, idx: number, field: keyof PointForm, value: unknown) {
    const next = [...arr]; next[idx] = { ...next[idx], [field]: value }; setArr(next)
  }

  function handleSubmit() {
    setError(null)
    const baseFreight = (freight.fretePeso ?? 0) + (freight.freteValor ?? 0) + (freight.freteMinimo ?? 0) +
                        (freight.pedagio ?? 0) + (freight.valePedagio ?? 0) + (freight.seguro ?? 0) +
                        (freight.gris ?? 0) + (freight.descarga ?? 0) + (freight.movimentacao ?? 0) +
                        (freight.ajudante ?? 0) + (freight.diaria ?? 0) + (freight.pernoite ?? 0) +
                        (freight.escolta ?? 0) + (freight.batedor ?? 0) + (freight.munck ?? 0) +
                        (freight.empilhadeira ?? 0) + (freight.taxaDificilAcesso ?? 0) + (freight.taxaAgendamento ?? 0) +
                        (freight.taxaUrgencia ?? 0) + (freight.taxaEspera ?? 0) + (freight.taxaReentrega ?? 0) +
                        (freight.outrasTaxas ?? 0) + (freight.icms ?? 0)

    const computedLevels: ServiceLevelsConfig = {}
    ;(['essencial','assistido_basico','assistido_completo','prime_critico'] as const).forEach(k => {
      const cfg = levels[k]
      if (cfg?.offered) {
        const add = cfg.additionalValue ?? 0
        computedLevels[k] = { ...cfg, total: baseFreight + add }
      } else {
        computedLevels[k] = { offered: false }
      }
    })

    const payload = {
      ...identification,
      ...client,
      ...cargo,
      document_value: cargo.document_value ? parseFloat(cargo.document_value) : null,
      cargo_volumes: cargo.cargo_volumes ? parseInt(cargo.cargo_volumes) : null,
      cargo_dimensions: { length: cargo.cargo_length, width: cargo.cargo_width, height: cargo.cargo_height, cubage: cargo.cargo_cubage },
      ...vehicle,
      freight_components: freight,
      service_levels: computedLevels,
      ...obs,
      validity_date: obs.validity_date || null,
      collection_points: collections.filter(c => c.full_address || c.city).map(c => ({
        ...c, scheduled_date: c.scheduled_date || null,
      })),
      delivery_points: deliveries.filter(d => d.full_address || d.city).map(d => ({
        ...d, scheduled_date: d.scheduled_date || null,
      })),
    }

    start(async () => {
      const res = await createBudget(payload)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/orcamentos" className="p-2 rounded-xl text-blue-400 hover:text-white glass"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Novo Orçamento</h1>
          <p className="text-sm text-blue-400">Passo {step} de {STEPS.length} — {STEPS[step-1].label}</p>
        </div>
      </div>

      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const done = step > s.id; const active = step === s.id; const Icon = s.icon
          return (
            <div key={s.id} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={done ? { background:'rgba(52,211,153,0.25)',border:'1px solid rgba(52,211,153,0.5)',color:'#6EE7B7' }
                    : active ? { background:'rgba(59,130,246,0.3)',border:'1px solid rgba(96,165,250,0.5)',color:'#93C5FD',boxShadow:'0 0 14px rgba(59,130,246,0.4)' }
                    : { background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#475569' }}>
                  {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] mt-1 font-semibold whitespace-nowrap" style={{ color: active ? '#93C5FD' : done ? '#6EE7B7' : '#475569' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-10 h-px mb-4 mx-1" style={{ background: done ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.1)' }} />}
            </div>
          )
        })}
      </div>

      <div className="glass rounded-2xl p-6">

        {/* Step 1 — Identificação */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Identificação</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={L}>Origem da demanda</label>
                <select value={identification.origin_source} onChange={e => setId({...identification, origin_source: e.target.value})} className="glass-select">
                  <option value="">Selecione...</option>
                  <option value="email">E-mail</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="ligacao">Ligação</option>
                  <option value="portal">Portal</option>
                  <option value="indicacao">Indicação</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div className="col-span-2"><label className={L}>Descrição / Assunto do pedido</label>
                <textarea value={identification.description} onChange={e => setId({...identification, description: e.target.value})} rows={3} className="glass-input resize-none" /></div>
            </div>
          </div>
        )}

        {/* Step 2 — Cliente */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Cliente</h2>
            <ClientSelector
              value={{
                client_id: client.client_id,
                client_name: client.client_name,
                client_document: client.client_document,
                client_contact_name: client.client_contact_name,
                client_contact_phone: client.client_contact_phone,
                client_contact_email: client.client_contact_email,
                client_contact_sector: client.client_contact_sector,
              }}
              onChange={v => setClient({ ...client, ...v })}
            />
            <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <label className={L}>Observações comerciais</label>
              <textarea value={client.client_notes} onChange={e => setClient({...client, client_notes: e.target.value})} rows={2} className="glass-input resize-none" />
            </div>
          </div>
        )}

        {/* Step 3 — Coletas e Entregas */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-white">Pontos de Coleta ({collections.length})</h2>
                <button type="button" onClick={() => setCollections([...collections, emptyPoint()])}
                  className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 glass px-2.5 py-1.5 rounded-lg">
                  <Plus className="w-3 h-3" /> Adicionar coleta
                </button>
              </div>
              {collections.map((c, i) => (
                <div key={i} className="rounded-xl p-4 space-y-3 mb-3" style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(96,165,250,0.2)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Coleta #{i+1}</p>
                    {collections.length > 1 && (
                      <button type="button" onClick={() => setCollections(collections.filter((_,k) => k !== i))} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2"><label className={L}>Nome do local</label>
                      <input value={c.name} onChange={e => updatePoint(collections, setCollections, i, 'name', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>CNPJ</label>
                      <input value={c.cnpj} onChange={e => updatePoint(collections, setCollections, i, 'cnpj', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>Contato</label>
                      <input value={c.contact_name} onChange={e => updatePoint(collections, setCollections, i, 'contact_name', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>Telefone</label>
                      <input value={c.phone} onChange={e => updatePoint(collections, setCollections, i, 'phone', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>E-mail</label>
                      <input value={c.email} onChange={e => updatePoint(collections, setCollections, i, 'email', e.target.value)} className="glass-input" /></div>
                    <div className="col-span-3"><label className={L}>Endereço completo</label>
                      <input value={c.full_address} onChange={e => updatePoint(collections, setCollections, i, 'full_address', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>Cidade</label>
                      <input value={c.city} onChange={e => updatePoint(collections, setCollections, i, 'city', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>UF</label>
                      <input value={c.uf} onChange={e => updatePoint(collections, setCollections, i, 'uf', e.target.value)} className="glass-input" maxLength={2} /></div>
                    <div><label className={L}>CEP</label>
                      <input value={c.cep} onChange={e => updatePoint(collections, setCollections, i, 'cep', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>Data coleta</label>
                      <input type="date" value={c.scheduled_date} onChange={e => updatePoint(collections, setCollections, i, 'scheduled_date', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>Horário/Janela</label>
                      <input value={c.time_window} onChange={e => updatePoint(collections, setCollections, i, 'time_window', e.target.value)} className="glass-input" placeholder="08h-12h" /></div>
                    <div className="flex items-end gap-2">
                      <label className="flex items-center gap-2 text-xs text-blue-300 pb-2">
                        <input type="checkbox" checked={c.needs_scheduling} onChange={e => updatePoint(collections, setCollections, i, 'needs_scheduling', e.target.checked)} />
                        Precisa agendamento
                      </label>
                    </div>
                    <div className="col-span-3"><label className={L}>Observações de acesso</label>
                      <textarea value={c.access_instructions} onChange={e => updatePoint(collections, setCollections, i, 'access_instructions', e.target.value)} rows={1} className="glass-input resize-none" /></div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-white">Pontos de Entrega ({deliveries.length})</h2>
                <button type="button" onClick={() => setDeliveries([...deliveries, emptyPoint()])}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 glass px-2.5 py-1.5 rounded-lg">
                  <Plus className="w-3 h-3" /> Adicionar entrega
                </button>
              </div>
              {deliveries.map((d, i) => (
                <div key={i} className="rounded-xl p-4 space-y-3 mb-3" style={{ background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.2)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Entrega #{i+1}</p>
                    {deliveries.length > 1 && (
                      <button type="button" onClick={() => setDeliveries(deliveries.filter((_,k) => k !== i))} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2"><label className={L}>Nome do local</label>
                      <input value={d.name} onChange={e => updatePoint(deliveries, setDeliveries, i, 'name', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>CNPJ</label>
                      <input value={d.cnpj} onChange={e => updatePoint(deliveries, setDeliveries, i, 'cnpj', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>Contato</label>
                      <input value={d.contact_name} onChange={e => updatePoint(deliveries, setDeliveries, i, 'contact_name', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>Telefone</label>
                      <input value={d.phone} onChange={e => updatePoint(deliveries, setDeliveries, i, 'phone', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>E-mail</label>
                      <input value={d.email} onChange={e => updatePoint(deliveries, setDeliveries, i, 'email', e.target.value)} className="glass-input" /></div>
                    <div className="col-span-3"><label className={L}>Endereço completo</label>
                      <input value={d.full_address} onChange={e => updatePoint(deliveries, setDeliveries, i, 'full_address', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>Cidade</label>
                      <input value={d.city} onChange={e => updatePoint(deliveries, setDeliveries, i, 'city', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>UF</label>
                      <input value={d.uf} onChange={e => updatePoint(deliveries, setDeliveries, i, 'uf', e.target.value)} className="glass-input" maxLength={2} /></div>
                    <div><label className={L}>CEP</label>
                      <input value={d.cep} onChange={e => updatePoint(deliveries, setDeliveries, i, 'cep', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>Data entrega</label>
                      <input type="date" value={d.scheduled_date} onChange={e => updatePoint(deliveries, setDeliveries, i, 'scheduled_date', e.target.value)} className="glass-input" /></div>
                    <div><label className={L}>Horário/Janela</label>
                      <input value={d.time_window} onChange={e => updatePoint(deliveries, setDeliveries, i, 'time_window', e.target.value)} className="glass-input" /></div>
                    <div className="flex items-end gap-2">
                      <label className="flex items-center gap-2 text-xs text-blue-300 pb-2">
                        <input type="checkbox" checked={d.needs_scheduling} onChange={e => updatePoint(deliveries, setDeliveries, i, 'needs_scheduling', e.target.checked)} />
                        Precisa agendamento
                      </label>
                    </div>
                    <div className="col-span-3"><label className={L}>Observações de acesso</label>
                      <textarea value={d.access_instructions} onChange={e => updatePoint(deliveries, setDeliveries, i, 'access_instructions', e.target.value)} rows={1} className="glass-input resize-none" /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Carga */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Documento e Carga</h2>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={L}>Nº NF / Documento</label>
                <input value={cargo.document_number} onChange={e => setCargo({...cargo, document_number: e.target.value})} className="glass-input" /></div>
              <div><label className={L}>Valor da NF (R$)</label>
                <input type="number" step="0.01" value={cargo.document_value} onChange={e => setCargo({...cargo, document_value: e.target.value})} className="glass-input" /></div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-blue-300">
                  <input type="checkbox" checked={cargo.xml_received} onChange={e => setCargo({...cargo, xml_received: e.target.checked})} />
                  XML recebido
                </label>
              </div>
              <div className="col-span-3"><label className={L}>Descrição da carga</label>
                <input value={cargo.cargo_description} onChange={e => setCargo({...cargo, cargo_description: e.target.value})} className="glass-input" /></div>
              <div><label className={L}>Volumes</label>
                <input type="number" value={cargo.cargo_volumes} onChange={e => setCargo({...cargo, cargo_volumes: e.target.value})} className="glass-input" /></div>
              <div><label className={L}>Peso total</label>
                <input value={cargo.cargo_weight} onChange={e => setCargo({...cargo, cargo_weight: e.target.value})} placeholder="kg" className="glass-input" /></div>
              <div><label className={L}>Cubagem (m³)</label>
                <input value={cargo.cargo_cubage} onChange={e => setCargo({...cargo, cargo_cubage: e.target.value})} className="glass-input" /></div>
              <div><label className={L}>Comprimento (m)</label>
                <input value={cargo.cargo_length} onChange={e => setCargo({...cargo, cargo_length: e.target.value})} className="glass-input" /></div>
              <div><label className={L}>Largura (m)</label>
                <input value={cargo.cargo_width} onChange={e => setCargo({...cargo, cargo_width: e.target.value})} className="glass-input" /></div>
              <div><label className={L}>Altura (m)</label>
                <input value={cargo.cargo_height} onChange={e => setCargo({...cargo, cargo_height: e.target.value})} className="glass-input" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {([
                ['cargo_sensitive','Sensível'],
                ['cargo_high_value','Alto valor'],
                ['cargo_needs_tarp','Exige lona'],
                ['cargo_needs_strap','Exige amarração'],
                ['cargo_needs_tracker','Exige rastreador'],
                ['cargo_needs_photo','Exige foto'],
              ] as const).map(([k,l]) => (
                <label key={k} className="flex items-center gap-2 text-sm text-blue-300 glass-sm rounded-lg px-3 py-2">
                  <input type="checkbox" checked={cargo[k]} onChange={e => setCargo({...cargo, [k]: e.target.checked})} />
                  {l}
                </label>
              ))}
            </div>
            <div><label className={L}>Observações da carga</label>
              <textarea value={cargo.cargo_notes} onChange={e => setCargo({...cargo, cargo_notes: e.target.value})} rows={2} className="glass-input resize-none" /></div>
          </div>
        )}

        {/* Step 5 — Veículo */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Perfil de Veículo</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={L}>Tipo de veículo sugerido</label>
                <select value={vehicle.vehicle_suggested_type} onChange={e => setVehicle({...vehicle, vehicle_suggested_type: e.target.value})} className="glass-select">
                  <option value="">Selecione...</option>
                  {['Fiorino','VUC','3/4','Toco','Truck','Carreta','Prancha','Munck','Baú','Sider','Outro'].map(v=> <option key={v}>{v}</option>)}
                </select></div>
              <div><label className={L}>Carroceria</label>
                <input value={vehicle.vehicle_body_type} onChange={e => setVehicle({...vehicle, vehicle_body_type: e.target.value})} className="glass-input" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {([
                ['vehicle_exclusive','Veículo exclusivo'],
                ['vehicle_full_load','Carga lotação'],
                ['operation_dedicated','Operação dedicada'],
                ['operation_aero','Operação aérea'],
                ['operation_project','Carga projeto'],
              ] as const).map(([k,l]) => (
                <label key={k} className="flex items-center gap-2 text-sm text-blue-300 glass-sm rounded-lg px-3 py-2">
                  <input type="checkbox" checked={vehicle[k]} onChange={e => setVehicle({...vehicle, [k]: e.target.checked})} />
                  {l}
                </label>
              ))}
            </div>
            <div><label className={L}>Observações sobre veículo</label>
              <textarea value={vehicle.vehicle_notes} onChange={e => setVehicle({...vehicle, vehicle_notes: e.target.value})} rows={2} className="glass-input resize-none" /></div>
          </div>
        )}

        {/* Step 6 — Valores */}
        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Composição do Frete</h2>
            <div className="grid grid-cols-4 gap-3">
              {([
                ['fretePeso','Frete Peso'],['freteValor','Frete Valor'],['freteMinimo','Frete Mínimo'],
                ['pedagio','Pedágio'],['valePedagio','Vale-pedágio'],['seguro','Seguro'],['gris','GRIS'],
                ['descarga','Descarga'],['movimentacao','Movimentação'],['ajudante','Ajudante'],
                ['diaria','Diária'],['pernoite','Pernoite'],['escolta','Escolta'],['batedor','Batedor'],
                ['munck','Munck'],['empilhadeira','Empilhadeira'],
                ['taxaDificilAcesso','Difícil acesso'],['taxaAgendamento','Agendamento'],
                ['taxaUrgencia','Urgência'],['taxaEspera','Espera'],['taxaReentrega','Reentrega'],
                ['outrasTaxas','Outras taxas'],['icms','ICMS'],
              ] as const).map(([k,l]) => (
                <div key={k}>
                  <label className="block text-[10px] font-bold text-blue-300 mb-1 uppercase tracking-wider">{l}</label>
                  <input type="number" step="0.01"
                    value={freight[k] ?? ''} onChange={e => setFreight({...freight, [k]: e.target.value ? parseFloat(e.target.value) : undefined})}
                    placeholder="0,00" className="glass-input" />
                </div>
              ))}
            </div>
            <div><label className={L}>Observações de valores</label>
              <textarea value={freight.observacoes ?? ''} onChange={e => setFreight({...freight, observacoes: e.target.value})} rows={2} className="glass-input resize-none" /></div>
          </div>
        )}

        {/* Step 7 — Níveis de Serviço */}
        {step === 7 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white">Níveis de Serviço Ofertados</h2>
            <p className="text-sm text-blue-400">Marque quais produtos serão enviados na proposta. Para cada um, informe o valor adicional.</p>

            {[
              { key:'essencial' as const,           name:'Essencial',           desc:'Comunicação básica + comprovante final', color:'#94A3B8' },
              { key:'assistido_basico' as const,    name:'Assistido Básico',    desc:'Status por marcos principais',           color:'#60A5FA' },
              { key:'assistido_completo' as const,  name:'Assistido Completo',  desc:'Acompanhamento ativo + evidências',      color:'#A78BFA' },
              { key:'prime_critico' as const,       name:'Prime / Crítico',     desc:'Gestão operacional + relatórios',        color:'#F59E0B' },
            ].map(({ key, name, desc, color }) => {
              const cfg = levels[key] ?? { offered: false }
              return (
                <div key={key} className="rounded-xl p-4" style={{ background: cfg.offered ? `${color}1a` : 'rgba(255,255,255,0.03)', border: cfg.offered ? `1px solid ${color}55` : '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-start gap-3">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input type="checkbox" checked={!!cfg.offered}
                        onChange={e => setLevels({ ...levels, [key]: { ...cfg, offered: e.target.checked }})} />
                      <div>
                        <p className="text-sm font-bold" style={{ color }}>{name}</p>
                        <p className="text-xs text-blue-400">{desc}</p>
                      </div>
                    </label>
                  </div>
                  {cfg.offered && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div><label className={L}>Valor adicional (R$)</label>
                        <input type="number" step="0.01" value={cfg.additionalValue ?? ''}
                          onChange={e => setLevels({...levels, [key]: { ...cfg, additionalValue: e.target.value ? parseFloat(e.target.value) : undefined }})}
                          className="glass-input" /></div>
                      <div><label className={L}>Validade</label>
                        <input value={cfg.validity ?? ''} onChange={e => setLevels({...levels, [key]: { ...cfg, validity: e.target.value }})} className="glass-input" placeholder="7 dias" /></div>
                      <div><label className={L}>Condição</label>
                        <input value={cfg.conditions ?? ''} onChange={e => setLevels({...levels, [key]: { ...cfg, conditions: e.target.value }})} className="glass-input" /></div>
                      <div className="col-span-3"><label className={L}>Observação</label>
                        <input value={cfg.notes ?? ''} onChange={e => setLevels({...levels, [key]: { ...cfg, notes: e.target.value }})} className="glass-input" /></div>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-bold text-white mb-3">Observações Comerciais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={L}>Validade da proposta</label>
                  <input type="date" value={obs.validity_date} onChange={e => setObs({...obs, validity_date: e.target.value})} className="glass-input" /></div>
                <div><label className={L}>Condição de pagamento</label>
                  <input value={obs.payment_condition} onChange={e => setObs({...obs, payment_condition: e.target.value})} className="glass-input" placeholder="28 dias" /></div>
                <div className="col-span-2"><label className={L}>Premissas</label>
                  <textarea value={obs.premises} onChange={e => setObs({...obs, premises: e.target.value})} rows={2} className="glass-input resize-none" /></div>
                <div className="col-span-2"><label className={L}>Exclusões</label>
                  <textarea value={obs.exclusions} onChange={e => setObs({...obs, exclusions: e.target.value})} rows={2} className="glass-input resize-none" /></div>
                <div className="col-span-2"><label className={L}>Observações gerais</label>
                  <textarea value={obs.general_notes} onChange={e => setObs({...obs, general_notes: e.target.value})} rows={2} className="glass-input resize-none" /></div>
              </div>
            </div>

            {error && <p className="text-sm text-red-400 p-3 rounded-xl" style={{ background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)' }}>{error}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={() => step > 1 ? setStep(s=>s-1) : null} disabled={step===1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-300 hover:text-white glass disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        {step < STEPS.length ? (
          <button onClick={() => setStep(s=>s+1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background:'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}>
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={pending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background:'linear-gradient(135deg,#059669,#047857)',boxShadow:'0 4px 16px rgba(5,150,105,0.4)' }}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {pending ? 'Criando...' : 'Criar Orçamento'}
          </button>
        )}
      </div>
    </div>
  )
}
