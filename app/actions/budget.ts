"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { budgetService } from "@/services/budget/budget.service"
import type { CreateBudgetPeriodInput, UpsertMinistryBudgetInput } from "@/lib/validators/budget"

function assertBudgetAccess(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_BUDGETS)) {
    throw new Error("Sin permisos para gestionar presupuesto")
  }
  return user
}

export async function createBudgetPeriod(input: CreateBudgetPeriodInput) {
  const user = assertBudgetAccess(await getCurrentUser())
  const db = await createSupabaseServerClient()
  const data = await budgetService.createPeriod(db, input, user.id)
  revalidatePath("/budget")
  return data
}

export async function releaseBudgetPeriod(id: string) {
  const user = assertBudgetAccess(await getCurrentUser())
  const db = await createSupabaseServerClient()
  const data = await budgetService.releasePeriod(db, id, user.id)
  revalidatePath("/budget")
  return data
}

export async function closeBudgetPeriod(id: string) {
  const user = assertBudgetAccess(await getCurrentUser())
  const db = await createSupabaseServerClient()
  const data = await budgetService.closePeriod(db, id, user.id)
  revalidatePath("/budget")
  return data
}

export async function listBudgetsByPeriod(periodId: string) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_BUDGETS)) {
    throw new Error("Sin permisos")
  }
  const db = await createSupabaseServerClient()
  return budgetService.listBudgetsByPeriod(db, periodId)
}

export async function upsertMinistryBudget(input: UpsertMinistryBudgetInput) {
  const user = assertBudgetAccess(await getCurrentUser())
  const db = await createSupabaseServerClient()
  const data = await budgetService.upsertMinistryBudget(db, input, user.id)
  revalidatePath("/budget")
  return data
}
