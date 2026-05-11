// ═══════════════════════════════════════════════════════════════════════════
// RADAR VINCOLOG — Phase 1 Types
// ═══════════════════════════════════════════════════════════════════════════

// ── Service Levels ────────────────────────────────────────────────────────
export type ServiceLevel = 'essencial' | 'assistido_basico' | 'assistido_completo' | 'prime_critico'

export const SERVICE_LEVELS: Record<ServiceLevel, { label: string; short: string; color: string }> = {
  essencial:           { label: 'Essencial',           short: 'Essencial', color: '#94A3B8' },
  assistido_basico:    { label: 'Assistido Básico',    short: 'Básico',    color: '#60A5FA' },
  assistido_completo:  { label: 'Assistido Completo',  short: 'Completo',  color: '#A78BFA' },
  prime_critico:       { label: 'Prime / Crítico',     short: 'Prime',     color: '#F59E0B' },
}

// ── Budget Status ─────────────────────────────────────────────────────────
export type BudgetStatus = 'cadastrado' | 'proposta_gerada' | 'proposta_enviada' | 'aprovado' | 'recusado' | 'cancelado'

export const BUDGET_STATUSES: Record<BudgetStatus, { label: string; color: string }> = {
  cadastrado:        { label: 'Cadastrado',        color: '#94A3B8' },
  proposta_gerada:   { label: 'Proposta Gerada',   color: '#60A5FA' },
  proposta_enviada:  { label: 'Proposta Enviada',  color: '#A78BFA' },
  aprovado:          { label: 'Aprovado',          color: '#34D399' },
  recusado:          { label: 'Recusado',          color: '#F87171' },
  cancelado:         { label: 'Cancelado',         color: '#475569' },
}

// ── OIT Status (12 columns of Kanban) ────────────────────────────────────
export type OitStatus =
  | 'novos_aprovados'
  | 'em_analise'
  | 'em_alocacao'
  | 'aguardando_contrato'
  | 'prestador_alocado'
  | 'aguardando_coleta'
  | 'em_coleta'
  | 'em_transito'
  | 'em_entrega'
  | 'comprovante_pendente'
  | 'finalizado'
  | 'ocorrencia'

export const OIT_STATUSES: Record<OitStatus, { label: string; color: string; order: number }> = {
  novos_aprovados:      { label: 'Novos Aprovados',      color: '#22D3EE', order: 1 },
  em_analise:           { label: 'Em Análise',           color: '#38BDF8', order: 2 },
  em_alocacao:          { label: 'Em Alocação',          color: '#60A5FA', order: 3 },
  aguardando_contrato:  { label: 'Aguardando Contrato',  color: '#818CF8', order: 4 },
  prestador_alocado:    { label: 'Prestador Alocado',    color: '#A78BFA', order: 5 },
  aguardando_coleta:    { label: 'Aguardando Coleta',    color: '#C084FC', order: 6 },
  em_coleta:            { label: 'Em Coleta',            color: '#E879F9', order: 7 },
  em_transito:          { label: 'Em Trânsito',          color: '#F472B6', order: 8 },
  em_entrega:           { label: 'Em Entrega',           color: '#FB923C', order: 9 },
  comprovante_pendente: { label: 'Comprovante Pendente', color: '#FBBF24', order: 10 },
  finalizado:           { label: 'Finalizado',           color: '#34D399', order: 11 },
  ocorrencia:           { label: 'Ocorrência',           color: '#F87171', order: 12 },
}

export type Priority = 'baixa' | 'normal' | 'alta' | 'critica'

// ── Occurrence Types ──────────────────────────────────────────────────────
export type OccurrenceType =
  | 'atraso_coleta' | 'atraso_entrega' | 'espera_origem' | 'espera_destino'
  | 'avaria' | 'recusa_recebimento' | 'problema_documental' | 'problema_veiculo'
  | 'fiscalizacao' | 'sinistro' | 'reentrega' | 'divergencia_carga' | 'outros'

export const OCCURRENCE_TYPES: Record<OccurrenceType, string> = {
  atraso_coleta:         'Atraso na Coleta',
  atraso_entrega:        'Atraso na Entrega',
  espera_origem:         'Espera na Origem',
  espera_destino:        'Espera no Destino',
  avaria:                'Avaria',
  recusa_recebimento:    'Recusa de Recebimento',
  problema_documental:   'Problema Documental',
  problema_veiculo:      'Problema no Veículo',
  fiscalizacao:          'Fiscalização',
  sinistro:              'Sinistro',
  reentrega:             'Reentrega',
  divergencia_carga:     'Divergência de Carga',
  outros:                'Outros',
}

export type OccurrenceStatus = 'aberta' | 'em_tratativa' | 'resolvida' | 'encerrada' | 'escalada'

// ── Contract Status ───────────────────────────────────────────────────────
export type ContractTripStatus = 'nao_gerado' | 'gerado' | 'enviado' | 'aceito' | 'assinado_anexado' | 'pendente' | 'cancelado'

// ── Timeline Source ───────────────────────────────────────────────────────
export type TimelineSource = 'comercial' | 'operacional' | 'financeiro' | 'prestador' | 'cliente' | 'sistema'

// ── Provider Status (kept) ────────────────────────────────────────────────
export type ProviderStatus = 'ativo' | 'adormecido'

// ── Payment Status (spec §20.2) ──────────────────────────────────────────
export type PaymentStatus =
  | 'nao_iniciado'
  | 'adiantamento_pendente'
  | 'adiantamento_pago'
  | 'saldo_pendente'
  | 'saldo_liberado'
  | 'pago_integralmente'
  | 'bloqueado'
  | 'em_auditoria'

export const PAYMENT_STATUSES: Record<PaymentStatus, { label: string; color: string }> = {
  nao_iniciado:          { label: 'Não Iniciado',         color: '#94A3B8' },
  adiantamento_pendente: { label: 'Adiantamento Pendente', color: '#FBBF24' },
  adiantamento_pago:     { label: 'Adiantamento Pago',     color: '#60A5FA' },
  saldo_pendente:        { label: 'Saldo Pendente',        color: '#FBBF24' },
  saldo_liberado:        { label: 'Saldo Liberado',        color: '#A78BFA' },
  pago_integralmente:    { label: 'Pago Integralmente',    color: '#34D399' },
  bloqueado:             { label: 'Bloqueado',             color: '#F87171' },
  em_auditoria:          { label: 'Em Auditoria',          color: '#22D3EE' },
}

// ── Freight components ────────────────────────────────────────────────────
export interface FreightComponents {
  fretePeso?: number
  freteValor?: number
  freteMinimo?: number
  pedagio?: number
  valePedagio?: number
  seguro?: number
  gris?: number
  descarga?: number
  movimentacao?: number
  ajudante?: number
  diaria?: number
  pernoite?: number
  escolta?: number
  batedor?: number
  munck?: number
  empilhadeira?: number
  taxaDificilAcesso?: number
  taxaAgendamento?: number
  taxaUrgencia?: number
  taxaEspera?: number
  taxaReentrega?: number
  outrasTaxas?: number
  icms?: number
  observacoes?: string
}

export interface ServiceLevelOffer {
  offered: boolean
  additionalValue?: number
  total?: number
  notes?: string
  validity?: string
  conditions?: string
}

export interface ServiceLevelsConfig {
  essencial?: ServiceLevelOffer
  assistido_basico?: ServiceLevelOffer
  assistido_completo?: ServiceLevelOffer
  prime_critico?: ServiceLevelOffer
}

// ── Database row shapes ───────────────────────────────────────────────────
export interface DbClient {
  id: string
  name: string
  document: string | null
  document_type: 'cnpj' | 'cpf' | null
  email: string | null
  phone: string | null
  contact_name: string | null
  contact_sector: string | null
  city: string | null
  uf: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DbBudget {
  id: string
  number: string
  status: BudgetStatus
  origin_source: string | null
  description: string | null
  client_id: string | null
  client_name: string | null
  client_document: string | null
  client_contact_name: string | null
  client_contact_phone: string | null
  client_contact_email: string | null
  client_contact_sector: string | null
  client_notes: string | null
  document_number: string | null
  document_value: number | null
  xml_received: boolean
  cargo_description: string | null
  cargo_volumes: number | null
  cargo_weight: string | null
  cargo_dimensions: Record<string, unknown> | null
  cargo_sensitive: boolean
  cargo_high_value: boolean
  cargo_needs_tarp: boolean
  cargo_needs_strap: boolean
  cargo_needs_tracker: boolean
  cargo_needs_photo: boolean
  cargo_notes: string | null
  vehicle_suggested_type: string | null
  vehicle_body_type: string | null
  vehicle_exclusive: boolean
  vehicle_full_load: boolean
  operation_dedicated: boolean
  operation_aero: boolean
  operation_project: boolean
  vehicle_notes: string | null
  freight_components: FreightComponents
  service_levels: ServiceLevelsConfig
  validity_date: string | null
  payment_condition: string | null
  general_notes: string | null
  premises: string | null
  exclusions: string | null
  needs_operational_approval: boolean
  needs_director_approval: boolean
  proposal_pdf_url: string | null
  proposal_sent_at: string | null
  approval_evidence_url: string | null
  approved_at: string | null
  approved_level: ServiceLevel | null
  approved_value: number | null
  created_at: string
  updated_at: string
  created_by: string | null
  // joined
  collection_points?: DbCollectionPoint[]
  delivery_points?: DbDeliveryPoint[]
}

export interface DbCollectionPoint {
  id: string
  budget_id: string | null
  oit_id: string | null
  sequence: number
  name: string | null
  cnpj: string | null
  contact_name: string | null
  phone: string | null
  email: string | null
  full_address: string | null
  city: string | null
  uf: string | null
  cep: string | null
  scheduled_date: string | null
  time_window: string | null
  needs_scheduling: boolean
  access_instructions: string | null
  linked_docs: string | null
  notes: string | null
  arrived_at: string | null
  collected_at: string | null
  created_at: string
}

export interface DbDeliveryPoint {
  id: string
  budget_id: string | null
  oit_id: string | null
  sequence: number
  name: string | null
  cnpj: string | null
  contact_name: string | null
  phone: string | null
  email: string | null
  full_address: string | null
  city: string | null
  uf: string | null
  cep: string | null
  scheduled_date: string | null
  time_window: string | null
  needs_scheduling: boolean
  access_instructions: string | null
  linked_docs: string | null
  notes: string | null
  arrived_at: string | null
  delivered_at: string | null
  pod_recipient: string | null
  pod_url: string | null
  created_at: string
}

export interface DbOit {
  id: string
  number: string
  budget_id: string | null
  client_id: string | null
  service_level: ServiceLevel
  status: OitStatus
  priority: Priority
  responsible_operator: string | null
  current_owner: string | null
  vendor_value: number | null
  contracted_value: number | null
  advance_amount: number
  balance_amount: number
  pedagio: number | null
  vale_pedagio: number | null
  seguro: number | null
  ciot: string | null
  other_expenses: number | null
  estimated_margin: number | null
  margin_percentage: number | null
  financial_status: string
  financial_notes: string | null
  payment_status: PaymentStatus
  gps_tracking_active: boolean
  provider_invite_token: string | null
  provider_unlinked_at: string | null
  last_gps_lat: number | null
  last_gps_lng: number | null
  last_gps_at: string | null
  client_name: string | null
  client_document: string | null
  client_contact_name: string | null
  client_contact_phone: string | null
  client_contact_email: string | null
  cargo_description: string | null
  cargo_volumes: number | null
  cargo_weight: string | null
  cargo_dimensions: Record<string, unknown> | null
  document_number: string | null
  document_value: number | null
  provider_id: string | null
  driver_name: string | null
  driver_cpf: string | null
  driver_phone: string | null
  driver_cnh: string | null
  vehicle_type: string | null
  vehicle_body: string | null
  vehicle_plate_cavalo: string | null
  vehicle_plate_carreta: string | null
  vehicle_has_tarp: boolean | null
  vehicle_has_tracker: boolean | null
  vehicle_tracker_link: string | null
  vehicle_photos: string[]
  client_link_token: string
  provider_link_token: string
  contract_pdf_url: string | null
  signed_contract_url: string | null
  collection_order_pdf_url: string | null
  collection_order_sent_at: string | null
  next_action: string | null
  next_action_owner: string | null
  next_action_deadline: string | null
  pendencies: string | null
  restrictions: string | null
  specific_instructions: string | null
  notes: string | null
  created_at: string
  updated_at: string
  allocated_at: string | null
  finalized_at: string | null
  created_by: string | null
  // joined
  providers?: DbProvider | null
  collection_points?: DbCollectionPoint[]
  delivery_points?: DbDeliveryPoint[]
}

export interface DbProvider {
  id: string
  name: string
  phone: string | null
  cpf: string | null
  cnh: string | null
  cnh_photo_url: string | null
  vehicle_type: string | null
  vehicle_plate: string
  vehicle_photos: string[]
  status: ProviderStatus
  contract_signed: boolean
  contract_date: string | null
  total_fretes: number
  rating: number
  bank_name: string | null
  pix_key: string | null
  profile_photo_url: string | null
  created_at: string
  updated_at: string
}

export interface DbTimelineEvent {
  id: string
  oit_id: string
  event_type: string
  source: TimelineSource | null
  user_id: string | null
  description: string | null
  visible_to_client: boolean
  attachments: Array<{ url: string; type?: string; filename?: string }>
  location_text: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface DbOccurrence {
  id: string
  oit_id: string
  type: OccurrenceType | null
  description: string | null
  location: string | null
  impact: string | null
  action_taken: string | null
  new_estimate: string | null
  responsible_user: string | null
  attachments: Array<{ url: string; type?: string; filename?: string }>
  visible_to_client: boolean
  status: OccurrenceStatus
  created_at: string
  closed_at: string | null
  created_by: string | null
  // joined
  oits?: Pick<DbOit, 'number' | 'client_name' | 'status'> | null
}

export interface DbContractPerTrip {
  id: string
  oit_id: string
  provider_id: string | null
  generated_pdf_url: string | null
  signed_pdf_url: string | null
  acceptance_type: 'upload' | 'digital' | 'whatsapp' | 'manual' | null
  accepted_by: string | null
  accepted_at: string | null
  status: ContractTripStatus
  notes: string | null
  contract_value: number | null
  advance_amount: number | null
  balance_amount: number | null
  payment_terms: string | null
  created_at: string
}

export interface DbGpsPosition {
  id: string
  oit_id: string
  device_id: string | null
  latitude: number
  longitude: number
  accuracy: number | null
  speed: number | null
  battery_level: number | null
  recorded_at: string
  synced_at: string
  source: string
}

export interface DbWhatsappLog {
  id: string
  oit_id: string | null
  budget_id: string | null
  recipient_type: 'client' | 'provider' | 'operational_team' | null
  recipient_phone: string | null
  trigger_event: string | null
  message_text: string | null
  status: 'preparado' | 'copiado' | 'enviado' | 'falhou'
  sent_by: string | null
  sent_at: string | null
  created_at: string
}
