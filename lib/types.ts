// ── Order ─────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'criado'       // Fase 0: pedido criado pelo operador
  | 'aceito'       // Aceite manual pelo operador
  | 'alocado'      // Prestador/veículo alocado + contrato gerado
  | 'radar_ativo'  // Monitoramento iniciado (botão "Iniciar Viagem")
  | 'em_rota'      // Em execução (checkpoints ativos)
  | 'entregue'     // POD registrado
  | 'ocorrencia'   // Ocorrência ativa (pode voltar a em_rota)
  | 'finalizado'   // Encerrado pelo operador

// ── Checkpoint ────────────────────────────────────────────────────────────────
export type CheckpointType =
  | 'saiu_coleta'      // 1. Saiu para coleta
  | 'chegou_coleta'    // 2. Chegou na coleta (portaria) + foto obrigatória
  | 'coletou'          // 3. Coletou carga + 2+ fotos
  | 'saiu_coleta_fim'  // 4. Saiu do local de coleta
  | 'em_transito'      // 5. Em trânsito (automático)
  | 'chegou_entrega'   // 6. Chegou na entrega (portaria) + foto
  | 'entregue'         // 7. Entregue + POD (canhoto/foto/assinatura)
  | 'finalizado'       // 8. Finalizado pelo operador
  | 'ocorrencia'       // Ocorrência em qualquer ponto

export type OccurrenceType =
  | 'atraso' | 'recusa' | 'avaria' | 'reentrega' | 'sem_acesso' | 'outro'

export type ProviderStatus   = 'ativo' | 'adormecido'
export type ContractStatus   = 'pendente' | 'assinado' | 'encerrado'

// ── Database row shapes (snake_case from Supabase) ────────────────────────────
export interface DbOrder {
  id: string
  protocol: string
  client_name: string
  client_phone: string | null
  client_email: string | null
  origin_address: string
  origin_city: string
  destination_address: string
  destination_city: string
  cargo_description: string | null
  cargo_weight: string | null
  status: OrderStatus
  provider_id: string | null
  frete_value: number | null
  advance_amount: number
  balance_amount: number
  payment_deadline: string | null
  tracking_token: string
  contract_id: string | null
  contract_pdf_url: string | null
  signed_contract_url: string | null
  oc_pdf_url: string | null
  collection_order_sent: boolean
  notes: string | null
  estimated_delivery: string | null
  created_at: string
  updated_at: string
  accepted_at: string | null
  allocated_at: string | null
  radar_active_at: string | null
  finalized_at: string | null
  created_by: string | null
  // joined
  providers?: DbProvider | null
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
  created_by: string | null
}

export interface DbCheckpoint {
  id: string
  order_id: string
  type: CheckpointType
  occurrence_type: OccurrenceType | null
  description: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  photo_urls: string[]
  pod_recipient_name: string | null
  pod_signature_url: string | null
  created_at: string
  created_by: string | null
}

export interface DbContract {
  id: string
  order_id: string
  provider_id: string | null
  frete_value: number | null
  advance_amount: number
  balance_amount: number
  payment_deadline: string | null
  pdf_url: string | null
  signed_url: string | null
  status: ContractStatus
  created_at: string
  signed_at: string | null
  created_by: string | null
  // joined
  providers?: DbProvider | null
  orders?: Pick<DbOrder, 'protocol' | 'client_name' | 'origin_city' | 'destination_city'> | null
}

export interface DbAuditLog {
  id: string
  entity_type: string
  entity_id: string
  action: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
  created_by: string | null
  user_email: string | null
}
