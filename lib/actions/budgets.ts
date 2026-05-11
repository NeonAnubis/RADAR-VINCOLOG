'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { BudgetStatus, ServiceLevel } from '@/lib/types'
import { notifyNewOit } from './notifications'

async function audit(supabase: ReturnType<typeof createClient>, entityId: string, action: string, newData: Record<string, unknown>) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('audit_logs').insert({
    entity_type: 'budget',
    entity_id: entityId,
    action,
    new_data: newData,
    created_by: user?.id,
    user_email: user?.email,
  })
}

export async function createBudget(payload: Record<string, unknown>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Generate number
  const { data: numberData } = await supabase.rpc('generate_budget_number')
  const number = numberData as string

  const collectionPoints = (payload.collection_points as Array<Record<string, unknown>>) ?? []
  const deliveryPoints   = (payload.delivery_points as Array<Record<string, unknown>>) ?? []

  // Extract budget data (remove arrays)
  const { collection_points, delivery_points, ...budgetData } = payload as Record<string, unknown>
  void collection_points; void delivery_points

  const { data: budget, error } = await supabase
    .from('budgets')
    .insert({ ...budgetData, number, created_by: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  // Insert collection points
  if (collectionPoints.length > 0) {
    const pointsToInsert = collectionPoints.map((p, i) => ({ ...p, budget_id: budget.id, sequence: i + 1 }))
    await supabase.from('collection_points').insert(pointsToInsert)
  }

  // Insert delivery points
  if (deliveryPoints.length > 0) {
    const pointsToInsert = deliveryPoints.map((p, i) => ({ ...p, budget_id: budget.id, sequence: i + 1 }))
    await supabase.from('delivery_points').insert(pointsToInsert)
  }

  await audit(supabase, budget.id, 'BUDGET_CREATED', { number: budget.number })
  revalidatePath('/orcamentos')
  redirect(`/orcamentos/${budget.id}`)
}

export async function updateBudgetStatus(budgetId: string, status: BudgetStatus) {
  const supabase = createClient()
  const { error } = await supabase.from('budgets').update({ status }).eq('id', budgetId)
  if (error) return { error: error.message }
  await audit(supabase, budgetId, `STATUS_${status.toUpperCase()}`, { status })
  revalidatePath(`/orcamentos/${budgetId}`)
  revalidatePath('/orcamentos')
  return { ok: true }
}

export async function approveBudget(budgetId: string, approvedLevel: ServiceLevel, approvedValue: number, evidenceUrl?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Mark budget as approved
  const { data: budget, error: bErr } = await supabase
    .from('budgets')
    .update({
      status: 'aprovado',
      approved_at: new Date().toISOString(),
      approved_level: approvedLevel,
      approved_value: approvedValue,
      approval_evidence_url: evidenceUrl ?? null,
    })
    .eq('id', budgetId)
    .select('*')
    .single()

  if (bErr) return { error: bErr.message }

  // Auto-create OIT
  const { data: oitNumberData } = await supabase.rpc('generate_oit_number')
  const oitNumber = oitNumberData as string

  const { data: oit, error: oErr } = await supabase
    .from('oits')
    .insert({
      number: oitNumber,
      budget_id: budgetId,
      client_id: budget.client_id,
      service_level: approvedLevel,
      status: 'novos_aprovados',
      priority: 'normal',
      vendor_value: approvedValue,
      client_name: budget.client_name,
      client_document: budget.client_document,
      client_contact_name: budget.client_contact_name,
      client_contact_phone: budget.client_contact_phone,
      client_contact_email: budget.client_contact_email,
      cargo_description: budget.cargo_description,
      cargo_volumes: budget.cargo_volumes,
      cargo_weight: budget.cargo_weight,
      cargo_dimensions: budget.cargo_dimensions,
      document_number: budget.document_number,
      document_value: budget.document_value,
      vehicle_type: budget.vehicle_suggested_type,
      vehicle_body: budget.vehicle_body_type,
      notes: budget.general_notes,
      created_by: user.id,
    })
    .select()
    .single()

  if (oErr) return { error: oErr.message }

  // Copy collection points
  const { data: bps } = await supabase.from('collection_points').select('*').eq('budget_id', budgetId)
  if (bps?.length) {
    const cps = bps.map((p, i) => {
      const { id, budget_id, oit_id, created_at, arrived_at, collected_at, ...rest } = p
      void id; void budget_id; void oit_id; void created_at; void arrived_at; void collected_at
      return { ...rest, oit_id: oit.id, sequence: i + 1 }
    })
    await supabase.from('collection_points').insert(cps)
  }

  // Copy delivery points
  const { data: dps } = await supabase.from('delivery_points').select('*').eq('budget_id', budgetId)
  if (dps?.length) {
    const newDps = dps.map((p, i) => {
      const { id, budget_id, oit_id, created_at, arrived_at, delivered_at, pod_recipient, pod_url, ...rest } = p
      void id; void budget_id; void oit_id; void created_at; void arrived_at; void delivered_at; void pod_recipient; void pod_url
      return { ...rest, oit_id: oit.id, sequence: i + 1 }
    })
    await supabase.from('delivery_points').insert(newDps)
  }

  // Timeline event
  await supabase.from('timeline_events').insert({
    oit_id: oit.id,
    event_type: 'oit_criada',
    source: 'sistema',
    user_id: user.id,
    description: `OIT criada automaticamente após aprovação do orçamento ${budget.number}`,
    visible_to_client: false,
  })

  // Notify operational team per spec §8.1
  await notifyNewOit(oit.id)

  await audit(supabase, budgetId, 'BUDGET_APPROVED', { approved_level: approvedLevel, oit_id: oit.id })
  revalidatePath('/orcamentos')
  revalidatePath('/oits')
  return { ok: true, oitId: oit.id, oitNumber }
}

export async function setProposalUrl(budgetId: string, url: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('budgets')
    .update({ proposal_pdf_url: url, status: 'proposta_gerada' })
    .eq('id', budgetId)
  if (error) return { error: error.message }
  revalidatePath(`/orcamentos/${budgetId}`)
  return { ok: true }
}

export async function markProposalSent(budgetId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('budgets')
    .update({ status: 'proposta_enviada', proposal_sent_at: new Date().toISOString() })
    .eq('id', budgetId)
  if (error) return { error: error.message }
  revalidatePath(`/orcamentos/${budgetId}`)
  return { ok: true }
}
