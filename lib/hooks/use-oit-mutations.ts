'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  moveOitStatus, finalizeOit, allocateProviderToOit, saveOitCommercial,
  updatePaymentStatus, setOitNextAction, setOitPriority,
  addManualTimelineEvent, markCollectionOrderSent, generateProviderInvite,
  toggleGpsTracking,
} from '@/lib/actions/oits'
import { createOccurrence } from '@/lib/actions/occurrences'
import type { OitStatus, PaymentStatus, OccurrenceType } from '@/lib/types'

/** React Query mutation hooks for OIT-related actions.
 *  Each hook calls the corresponding Server Action, invalidates relevant
 *  query keys (so any client-mounted UI re-fetches) and triggers
 *  `router.refresh()` so Server Components re-run. */

export function useMoveOitStatus(oitId: string) {
  const router = useRouter()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (newStatus: OitStatus) => moveOitStatus(oitId, newStatus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['oit', oitId] })
      qc.invalidateQueries({ queryKey: ['oits'] })
      router.refresh()
    },
  })
}

export function useFinalizeOit(oitId: string) {
  const router = useRouter()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => finalizeOit(oitId),
    onSuccess: (res) => {
      if (res?.error) return
      qc.invalidateQueries({ queryKey: ['oit', oitId] })
      qc.invalidateQueries({ queryKey: ['oits'] })
      router.refresh()
    },
  })
}

type VehicleData = Parameters<typeof allocateProviderToOit>[2]
export function useAllocateProvider(oitId: string) {
  const router = useRouter()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ providerId, vehicleData }: { providerId: string; vehicleData: VehicleData }) =>
      allocateProviderToOit(oitId, providerId, vehicleData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['oit', oitId] })
      router.refresh()
    },
  })
}

export function useSaveCommercial(oitId: string) {
  const router = useRouter()
  return useMutation({
    mutationFn: (data: Parameters<typeof saveOitCommercial>[1]) => saveOitCommercial(oitId, data),
    onSuccess: () => router.refresh(),
  })
}

export function useUpdatePaymentStatus(oitId: string) {
  const router = useRouter()
  return useMutation({
    mutationFn: (s: PaymentStatus) => updatePaymentStatus(oitId, s),
    onSuccess: () => router.refresh(),
  })
}

export function useSetNextAction(oitId: string) {
  const router = useRouter()
  return useMutation({
    mutationFn: ({ action, deadline }: { action: string; deadline?: string }) =>
      setOitNextAction(oitId, action, deadline),
    onSuccess: () => router.refresh(),
  })
}

export function useSetPriority(oitId: string) {
  const router = useRouter()
  return useMutation({
    mutationFn: (p: 'baixa'|'normal'|'alta'|'critica') => setOitPriority(oitId, p),
    onSuccess: () => router.refresh(),
  })
}

export function useAddTimelineEvent(oitId: string) {
  const router = useRouter()
  return useMutation({
    mutationFn: ({ eventType, description, visibleToClient }: { eventType: string; description: string; visibleToClient: boolean }) =>
      addManualTimelineEvent(oitId, eventType, description, visibleToClient),
    onSuccess: () => router.refresh(),
  })
}

export function useMarkCollectionOrderSent(oitId: string) {
  const router = useRouter()
  return useMutation({
    mutationFn: () => markCollectionOrderSent(oitId),
    onSuccess: () => router.refresh(),
  })
}

export function useGenerateProviderInvite(oitId: string) {
  const router = useRouter()
  return useMutation({
    mutationFn: () => generateProviderInvite(oitId),
    onSuccess: () => router.refresh(),
  })
}

export function useToggleGps(oitId: string) {
  const router = useRouter()
  return useMutation({
    mutationFn: (active: boolean) => toggleGpsTracking(oitId, active),
    onSuccess: () => router.refresh(),
  })
}

export function useCreateOccurrence(oitId: string) {
  const router = useRouter()
  return useMutation({
    mutationFn: (payload: Omit<Parameters<typeof createOccurrence>[0], 'oit_id'>) =>
      createOccurrence({ ...payload, oit_id: oitId }),
    onSuccess: () => router.refresh(),
  })
}
