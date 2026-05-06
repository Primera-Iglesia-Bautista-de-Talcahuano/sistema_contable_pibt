import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { auditService } from "@/services/audit/audit.service"
import type {
  CreateBudgetPeriodInput,
  UpdateBudgetPeriodInput,
  UpsertMinistryBudgetInput,
  CreateBudgetItemInput,
  UpdateBudgetItemInput,
  CreateBudgetItemAllocationInput,
  UpdateBudgetItemAllocationInput
} from "@/lib/validators/budget"

type DB = SupabaseClient<Database>

export const budgetService = {
  async listPeriods(db: DB) {
    const { data, error } = await db
      .from("budget_periods")
      .select("*")
      .order("start_date", { ascending: false })
    if (error) throw error
    return data
  },

  async getPeriodById(db: DB, id: string) {
    const { data, error } = await db.from("budget_periods").select("*").eq("id", id).single()
    if (error) throw error
    return data
  },

  async getActivePeriod(db: DB) {
    const { data, error } = await db
      .from("budget_periods")
      .select("*")
      .eq("status", "ACTIVE")
      .maybeSingle()
    if (error) throw error
    return data
  },

  async createPeriod(db: DB, input: CreateBudgetPeriodInput, userId: string) {
    const { data, error } = await db
      .from("budget_periods")
      .insert({ ...input, created_by: userId })
      .select()
      .single()
    if (error) throw error

    await auditService.logSystem({
      entity: "BUDGET_PERIOD",
      action: "PERIOD_CREATED",
      user_id: userId,
      entity_id: data.id,
      new_value: { name: data.name, start_date: data.start_date, end_date: data.end_date }
    })

    return data
  },

  async updatePeriod(db: DB, id: string, input: UpdateBudgetPeriodInput, userId: string) {
    const { data, error } = await db
      .from("budget_periods")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error

    await auditService.logSystem({
      entity: "BUDGET_PERIOD",
      action: "PERIOD_UPDATED",
      user_id: userId,
      entity_id: id,
      new_value: input
    })

    return data
  },

  async releasePeriod(db: DB, id: string, userId: string) {
    const now = new Date().toISOString()
    const { data, error } = await db
      .from("budget_periods")
      .update({ status: "ACTIVE", released_at: now, released_by: userId, updated_at: now })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error

    // Also release all DRAFT budgets in this period
    await db
      .from("ministry_budgets")
      .update({ status: "RELEASED", released_at: now, released_by: userId, updated_at: now })
      .eq("period_id", id)
      .eq("status", "DRAFT")

    await auditService.logSystem({
      entity: "BUDGET_PERIOD",
      action: "PERIOD_RELEASED",
      user_id: userId,
      entity_id: id
    })

    return data
  },

  async closePeriod(db: DB, id: string, userId: string) {
    const now = new Date().toISOString()
    const { data, error } = await db
      .from("budget_periods")
      .update({ status: "CLOSED", updated_at: now })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error

    await auditService.logSystem({
      entity: "BUDGET_PERIOD",
      action: "PERIOD_CLOSED",
      user_id: userId,
      entity_id: id
    })

    return data
  },

  async listBudgetsByPeriod(db: DB, periodId: string) {
    const { data, error } = await db
      .from("ministry_budgets")
      .select("*, ministries(id, name)")
      .eq("period_id", periodId)
      .order("created_at")
    if (error) throw error
    return data
  },

  async upsertMinistryBudget(db: DB, input: UpsertMinistryBudgetInput, userId: string) {
    const now = new Date().toISOString()

    const { data, error } = await db
      .from("ministry_budgets")
      .upsert(
        {
          ministry_id: input.ministry_id,
          period_id: input.period_id,
          amount: input.amount,
          created_by: userId,
          updated_at: now
        },
        { onConflict: "ministry_id,period_id" }
      )
      .select()
      .single()
    if (error) throw error

    await auditService.logSystem({
      entity: "MINISTRY_BUDGET",
      action: "BUDGET_UPSERTED",
      user_id: userId,
      entity_id: data.id,
      new_value: {
        ministry_id: input.ministry_id,
        period_id: input.period_id,
        amount: input.amount
      }
    })

    return data
  },

  // get_ministry_budget_summary RPC is service_role only (granted in M11 migration).
  // Uses admin client internally — callers do not need to pass db.
  async getBudgetSummary(ministryId: string, periodId: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin.rpc("get_ministry_budget_summary", {
      p_ministry_id: ministryId,
      p_period_id: periodId
    })
    if (error) throw error
    return data as { allocated: number; used: number; remaining: number }
  },

  // ── Budget items ──────────────────────────────────────────────

  async listItemsByPeriod(db: DB, periodId: string) {
    const { data, error } = await db
      .from("budget_items")
      .select("*, ministries(id, name), budget_item_allocations(*, ministries(id, name))")
      .eq("period_id", periodId)
      .order("created_at", { ascending: true })
    if (error) throw error
    return data
  },

  async createItem(
    db: DB,
    input: CreateBudgetItemInput,
    userId: string,
    periodStatus: string
  ) {
    const now = new Date().toISOString()
    const { data, error } = await db
      .from("budget_items")
      .insert({ ...input, created_by: userId, updated_at: now })
      .select()
      .single()
    if (error) throw error

    if (periodStatus === "ACTIVE") {
      await auditService.logSystem({
        entity: "BUDGET_ITEM",
        action: "ITEM_CREATED",
        user_id: userId,
        entity_id: data.id,
        new_value: { description: data.description, amount: data.amount, ministry_id: data.ministry_id }
      })
    }

    return data
  },

  async updateItem(
    db: DB,
    id: string,
    input: UpdateBudgetItemInput,
    userId: string,
    periodStatus: string
  ) {
    let previous: Record<string, unknown> | undefined
    if (periodStatus === "ACTIVE") {
      const { data: prev } = await db
        .from("budget_items")
        .select("description, amount, ministry_id, notes")
        .eq("id", id)
        .single()
      previous = prev ?? undefined
    }

    const { data, error } = await db
      .from("budget_items")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error

    if (periodStatus === "ACTIVE") {
      await auditService.logSystem({
        entity: "BUDGET_ITEM",
        action: "ITEM_UPDATED",
        user_id: userId,
        entity_id: id,
        previous_value: previous,
        new_value: input
      })
    }

    return data
  },

  async deleteItem(db: DB, id: string, userId: string, periodStatus: string) {
    let previous: Record<string, unknown> | undefined
    if (periodStatus === "ACTIVE") {
      const { data: prev } = await db
        .from("budget_items")
        .select("description, amount, ministry_id, notes")
        .eq("id", id)
        .single()
      previous = prev ?? undefined
    }

    const { error } = await db.from("budget_items").delete().eq("id", id)
    if (error) throw error

    if (periodStatus === "ACTIVE") {
      await auditService.logSystem({
        entity: "BUDGET_ITEM",
        action: "ITEM_DELETED",
        user_id: userId,
        entity_id: id,
        previous_value: previous
      })
    }
  },

  // ── Budget item allocations (sub-ítems) ───────────────────────

  async listAllocations(db: DB, itemId: string) {
    const { data, error } = await db
      .from("budget_item_allocations")
      .select("*, ministries(id, name)")
      .eq("item_id", itemId)
      .order("created_at", { ascending: true })
    if (error) throw error
    return data
  },

  async createAllocation(
    db: DB,
    input: CreateBudgetItemAllocationInput,
    userId: string,
    periodStatus: string
  ) {
    const now = new Date().toISOString()
    const { data, error } = await db
      .from("budget_item_allocations")
      .insert({ ...input, updated_at: now })
      .select()
      .single()
    if (error) throw error

    if (periodStatus === "ACTIVE") {
      await auditService.logSystem({
        entity: "BUDGET_ITEM_ALLOCATION",
        action: "ALLOCATION_CREATED",
        user_id: userId,
        entity_id: data.id,
        new_value: { item_id: data.item_id, allocation_type: data.allocation_type, value: data.value, ministry_id: data.ministry_id }
      })
    }

    return data
  },

  async updateAllocation(
    db: DB,
    id: string,
    input: UpdateBudgetItemAllocationInput,
    userId: string,
    periodStatus: string
  ) {
    let previous: Record<string, unknown> | undefined
    if (periodStatus === "ACTIVE") {
      const { data: prev } = await db
        .from("budget_item_allocations")
        .select("description, value, ministry_id")
        .eq("id", id)
        .single()
      previous = prev ?? undefined
    }

    const { data, error } = await db
      .from("budget_item_allocations")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error

    if (periodStatus === "ACTIVE") {
      await auditService.logSystem({
        entity: "BUDGET_ITEM_ALLOCATION",
        action: "ALLOCATION_UPDATED",
        user_id: userId,
        entity_id: id,
        previous_value: previous,
        new_value: input
      })
    }

    return data
  },

  async deleteAllocation(db: DB, id: string, userId: string, periodStatus: string) {
    let previous: Record<string, unknown> | undefined
    if (periodStatus === "ACTIVE") {
      const { data: prev } = await db
        .from("budget_item_allocations")
        .select("description, value, ministry_id, allocation_type")
        .eq("id", id)
        .single()
      previous = prev ?? undefined
    }

    const { error } = await db.from("budget_item_allocations").delete().eq("id", id)
    if (error) throw error

    if (periodStatus === "ACTIVE") {
      await auditService.logSystem({
        entity: "BUDGET_ITEM_ALLOCATION",
        action: "ALLOCATION_DELETED",
        user_id: userId,
        entity_id: id,
        previous_value: previous
      })
    }
  }
}
