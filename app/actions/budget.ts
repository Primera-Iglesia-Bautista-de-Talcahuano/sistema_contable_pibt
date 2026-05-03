"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { budgetService } from "@/services/budget/budget.service"
import { sendBudgetChangeNotification } from "@/services/email/workflow-emails.service"
import type {
  CreateBudgetPeriodInput,
  UpsertMinistryBudgetInput,
  CreateBudgetItemInput,
  UpdateBudgetItemInput,
  CreateBudgetItemAllocationInput,
  UpdateBudgetItemAllocationInput
} from "@/lib/validators/budget"

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

// ── Budget items ──────────────────────────────────────────────

export async function listBudgetItems(periodId: string) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_BUDGETS)) {
    throw new Error("Sin permisos")
  }
  const db = await createSupabaseServerClient()
  return budgetService.listItemsByPeriod(db, periodId)
}

export async function createBudgetItem(input: CreateBudgetItemInput) {
  const user = assertBudgetAccess(await getCurrentUser())
  const db = await createSupabaseServerClient()
  const period = await budgetService.getPeriodById(db, input.period_id)
  const data = await budgetService.createItem(db, input, user.id, period.status)
  revalidatePath(`/budget/${input.period_id}`)

  if (period.status === "ACTIVE") {
    void sendBudgetChangeNotification({
      action: "CREATED",
      item: { description: data.description, amount: Number(data.amount) },
      periodId: period.id,
      periodName: period.name,
      changedByName: user.name
    })
  }

  return data
}

export async function updateBudgetItem(id: string, input: UpdateBudgetItemInput) {
  const user = assertBudgetAccess(await getCurrentUser())
  const db = await createSupabaseServerClient()
  const existing = await db.from("budget_items").select("period_id, description, amount").eq("id", id).single()
  if (existing.error) throw existing.error
  const period = await budgetService.getPeriodById(db, existing.data.period_id)
  const data = await budgetService.updateItem(db, id, input, user.id, period.status)
  revalidatePath(`/budget/${period.id}`)

  if (period.status === "ACTIVE") {
    void sendBudgetChangeNotification({
      action: "UPDATED",
      item: {
        description: input.description ?? existing.data.description,
        amount: Number(input.amount ?? existing.data.amount)
      },
      periodId: period.id,
      periodName: period.name,
      changedByName: user.name
    })
  }

  return data
}

export async function deleteBudgetItem(id: string) {
  const user = assertBudgetAccess(await getCurrentUser())
  const db = await createSupabaseServerClient()
  const existing = await db.from("budget_items").select("period_id, description, amount").eq("id", id).single()
  if (existing.error) throw existing.error
  const period = await budgetService.getPeriodById(db, existing.data.period_id)
  await budgetService.deleteItem(db, id, user.id, period.status)
  revalidatePath(`/budget/${period.id}`)

  if (period.status === "ACTIVE") {
    void sendBudgetChangeNotification({
      action: "DELETED",
      item: { description: existing.data.description, amount: Number(existing.data.amount) },
      periodId: period.id,
      periodName: period.name,
      changedByName: user.name
    })
  }
}

// ── Budget item allocations (sub-ítems) ───────────────────────

export async function listBudgetItemAllocations(itemId: string) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_BUDGETS)) {
    throw new Error("Sin permisos")
  }
  const db = await createSupabaseServerClient()
  return budgetService.listAllocations(db, itemId)
}

export async function createBudgetItemAllocation(input: CreateBudgetItemAllocationInput) {
  const user = assertBudgetAccess(await getCurrentUser())
  const db = await createSupabaseServerClient()
  const item = await db.from("budget_items").select("period_id").eq("id", input.item_id).single()
  if (item.error) throw item.error
  const period = await budgetService.getPeriodById(db, item.data.period_id)
  const data = await budgetService.createAllocation(db, input, user.id, period.status)
  revalidatePath(`/budget/${period.id}`)
  return data
}

export async function updateBudgetItemAllocation(
  id: string,
  input: UpdateBudgetItemAllocationInput
) {
  const user = assertBudgetAccess(await getCurrentUser())
  const db = await createSupabaseServerClient()
  const existing = await db
    .from("budget_item_allocations")
    .select("item_id")
    .eq("id", id)
    .single()
  if (existing.error) throw existing.error
  const item = await db
    .from("budget_items")
    .select("period_id")
    .eq("id", existing.data.item_id)
    .single()
  if (item.error) throw item.error
  const period = await budgetService.getPeriodById(db, item.data.period_id)
  const data = await budgetService.updateAllocation(db, id, input, user.id, period.status)
  revalidatePath(`/budget/${period.id}`)
  return data
}

export async function deleteBudgetItemAllocation(id: string) {
  const user = assertBudgetAccess(await getCurrentUser())
  const db = await createSupabaseServerClient()
  const existing = await db
    .from("budget_item_allocations")
    .select("item_id")
    .eq("id", id)
    .single()
  if (existing.error) throw existing.error
  const item = await db
    .from("budget_items")
    .select("period_id")
    .eq("id", existing.data.item_id)
    .single()
  if (item.error) throw item.error
  const period = await budgetService.getPeriodById(db, item.data.period_id)
  await budgetService.deleteAllocation(db, id, user.id, period.status)
  revalidatePath(`/budget/${period.id}`)
}
