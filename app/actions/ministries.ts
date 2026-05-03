"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { ministriesService } from "@/services/ministries/ministries.service"
import type { CreateMinistryInput, AssignMinisterInput } from "@/lib/validators/ministry"

function assertMinistriesAccess(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_MINISTRIES)) {
    throw new Error("Sin permisos para gestionar ministerios")
  }
  return user
}

export async function createMinistry(input: CreateMinistryInput) {
  const user = assertMinistriesAccess(await getCurrentUser())
  const db = await createSupabaseServerClient()
  const data = await ministriesService.create(db, input, user.id)
  revalidatePath("/ministries")
  return data
}

export async function getMinistryAssignments(ministryId: string) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_MINISTRIES)) {
    throw new Error("Sin permisos")
  }
  const db = await createSupabaseServerClient()
  return ministriesService.getAssignments(db, ministryId)
}

export async function assignMinister(ministryId: string, input: AssignMinisterInput) {
  const user = assertMinistriesAccess(await getCurrentUser())
  const db = await createSupabaseServerClient()
  const data = await ministriesService.assign(db, ministryId, input, user.id)
  revalidatePath("/ministries")
  return data
}
