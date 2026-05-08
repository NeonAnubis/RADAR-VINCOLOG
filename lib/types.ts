export type OrderStatus = 'aguardando' | 'coletado' | 'em_rota' | 'entregue' | 'ocorrencia'
export type ProviderStatus = 'ativo' | 'adormecido'
export type ContractStatus = 'pendente' | 'assinado' | 'encerrado'
export type CheckpointType = 'aguardando_coleta' | 'coletado' | 'em_rota' | 'entregue' | 'ocorrencia'

export interface Checkpoint {
  id: string
  type: CheckpointType
  description: string
  timestamp: string
  photoUrl?: string
  city?: string
}

export interface POD {
  signedAt: string
  recipientName: string
  photoUrl: string
}

export interface Order {
  id: string
  protocol: string
  clientName: string
  clientPhone: string
  clientEmail: string
  originAddress: string
  originCity: string
  destinationAddress: string
  destinationCity: string
  cargoDescription: string
  cargoWeight: string
  status: OrderStatus
  providerId?: string
  providerName?: string
  vehiclePlate?: string
  createdAt: string
  estimatedDelivery: string
  trackingToken: string
  checkpoints: Checkpoint[]
  pod?: POD
  collectionOrderSent: boolean
  contractId?: string
  value: number
  notes?: string
}

export interface Provider {
  id: string
  name: string
  phone: string
  cpf: string
  vehicleType: string
  vehiclePlate: string
  status: ProviderStatus
  contractSigned: boolean
  contractDate?: string
  totalFretes: number
  rating: number
  createdAt: string
  lastFreteDate?: string
  bankName?: string
  pixKey?: string
  advanceAmount?: number
  balanceAmount?: number
  profilePhoto?: string
}

export interface Contract {
  id: string
  providerId: string
  providerName: string
  orderId: string
  orderProtocol: string
  clientName: string
  originCity: string
  destinationCity: string
  value: number
  advanceAmount: number
  createdAt: string
  signedAt?: string
  status: ContractStatus
}
