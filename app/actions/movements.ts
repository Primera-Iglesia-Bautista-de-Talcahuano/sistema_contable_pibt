"use server"

import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { movementsService } from "@/services/movements/movements.service"
import { processMovementIntegrations } from "@/services/google/movement-postprocess"
import type {
  CreateMovementInput,
  UpdateMovementInput,
  CancelMovementInput
} from "@/lib/validators/movement"

// Schedules PDF/Sheet/email integrations to run after the response is sent.
// Errors are logged so they're visible in platform logs instead of swallowed.
function scheduleIntegrations(movementId: string, userId: string) {
  after(async () => {
    try {
      await processMovementIntegrations(movementId, userId)
    } catch (error) {
      console.error("processMovementIntegrations failed", { movementId, error })
    }
  })
}

export async function createMovement(input: CreateMovementInput) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    throw new Error("Sin permisos para crear movimientos")
  }

  const db = await createSupabaseServerClient()
  const created = await movementsService.create(db, input, user.id)
  scheduleIntegrations(created.id, user.id)
  revalidatePath("/movements")
  return created
}

export async function updateMovement(id: string, input: Omit<UpdateMovementInput, "id">) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    throw new Error("Sin permisos para editar movimientos")
  }

  const db = await createSupabaseServerClient()
  const updated = await movementsService.update(db, id, { ...input, id }, user.id)
  scheduleIntegrations(updated.id, user.id)
  revalidatePath(`/movements/${id}`)
  revalidatePath("/movements")
  return updated
}

export async function cancelMovement(id: string, input: CancelMovementInput) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    throw new Error("Sin permisos para anular movimientos")
  }

  const db = await createSupabaseServerClient()
  const result = await movementsService.cancel(db, id, input, user.id)
  scheduleIntegrations(result.id, user.id)
  revalidatePath(`/movements/${id}`)
  revalidatePath("/movements")
  return result
}

export async function regeneratePdf(id: string) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    throw new Error("Sin permisos")
  }

  await processMovementIntegrations(id, user.id)
  revalidatePath(`/movements/${id}`)
}
