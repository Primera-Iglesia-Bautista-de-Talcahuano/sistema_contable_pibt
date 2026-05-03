"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { settlementsService } from "@/services/settlements/settlements.service"
import type { CreateSettlementInput } from "@/lib/validators/settlement"

export async function createMinistrySettlement(input: CreateSettlementInput) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.SUBMIT_INTENTIONS)) {
    throw new Error("Solo los ministros pueden enviar rendiciones")
  }

  const db = await createSupabaseServerClient()
  const data = await settlementsService.create(db, input, user.id)
  revalidatePath(`/requests/${input.intention_id}`)
  return data
}
