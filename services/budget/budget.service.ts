import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { auditService } from "@/services/audit/audit.service"
import type {
  CreateBudgetPeriodInput,
  UpdateBudgetPeriodInput,
  UpsertMinistryBudgetInput
} from "@/lib/validators/budget"

export const budgetService = {
  // ── Budget periods ────────────────────────────────────────

  async listPeriods() {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("budget_periods")
      .select("*")
      .order("start_date", { ascending: false })
    if (error) throw error
    return data
  },

  async getPeriodById(id: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin.from("budget_periods").select("*").eq("id", id).single()
    if (error) throw error
    return data
  },

  async getActivePeriod() {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("budget_periods")
      .select("*")
      .eq("status", "ACTIVE")
      .maybeSingle()
    if (error) throw error
    return data
  },

  async createPeriod(input: CreateBudgetPeriodInput, userId: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
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

  async updatePeriod(id: string, input: UpdateBudgetPeriodInput, userId: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
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

  async releasePeriod(id: string, userId: string) {
    const admin = createSupabaseAdminClient()
    const now = new Date().toISOString()
    const { data, error } = await admin
      .from("budget_periods")
      .update({ status: "ACTIVE", released_at: now, released_by: userId, updated_at: now })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error

    // Also release all DRAFT budgets in this period
    await admin
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

  async closePeriod(id: string, userId: string) {
    const admin = createSupabaseAdminClient()
    const now = new Date().toISOString()
    const { data, error } = await admin
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

  // ── Ministry budgets ───────────────────────────────────────

  async listBudgetsByPeriod(periodId: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("ministry_budgets")
      .select("*, ministries(id, name)")
      .eq("period_id", periodId)
      .order("created_at")
    if (error) throw error
    return data
  },

  async upsertMinistryBudget(input: UpsertMinistryBudgetInput, userId: string) {
    const admin = createSupabaseAdminClient()
    const now = new Date().toISOString()

    const { data, error } = await admin
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

  async getBudgetSummary(ministryId: string, periodId: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin.rpc("get_ministry_budget_summary", {
      p_ministry_id: ministryId,
      p_period_id: periodId
    })
    if (error) throw error
    return data as { allocated: number; used: number; remaining: number }
  }
}
