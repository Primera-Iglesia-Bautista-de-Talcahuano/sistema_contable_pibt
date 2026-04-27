import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { auditService } from "@/services/audit/audit.service"
import { ministriesService } from "@/services/ministries/ministries.service"
import { budgetService } from "@/services/budget/budget.service"
import { movementsService } from "@/services/movements/movements.service"
import {
  sendIntentionNotification,
  sendIntentionReviewNotification,
  sendTransferNotification
} from "@/services/email/workflow-emails.service"
import type {
  CreateIntentionInput,
  ReviewIntentionInput,
  RegisterTransferInput,
  AddCommentInput
} from "@/lib/validators/intention"

export const intentionsService = {
  async list(filters?: { ministryId?: string; status?: string }) {
    const admin = createSupabaseAdminClient()
    let query = admin
      .from("budget_intentions")
      .select(
        "*, ministries(id, name), budget_periods(id, name), users!budget_intentions_requested_by_fkey(id, full_name, email)"
      )
      .order("created_at", { ascending: false })

    if (filters?.ministryId) query = query.eq("ministry_id", filters.ministryId)
    if (filters?.status)
      query = query.eq("status", filters.status as "PENDING" | "APPROVED" | "REJECTED")

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("budget_intentions")
      .select(
        "*, ministries(id, name), budget_periods(id, name), users!budget_intentions_requested_by_fkey(id, full_name, email)"
      )
      .eq("id", id)
      .single()
    if (error) throw error
    return data
  },

  async getByToken(token: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("budget_intentions")
      .select(
        "*, ministries(id, name), budget_periods(id, name), users!budget_intentions_requested_by_fkey(id, full_name, email)"
      )
      .eq("token", token)
      .single()
    if (error) throw error
    return data
  },

  async create(input: CreateIntentionInput, userId: string, ministryId: string) {
    const admin = createSupabaseAdminClient()

    const summary = await budgetService.getBudgetSummary(ministryId, input.period_id)
    const isOverBudget = input.amount > summary.remaining

    const { data, error } = await admin
      .from("budget_intentions")
      .insert({
        ministry_id: ministryId,
        period_id: input.period_id,
        requested_by: userId,
        amount: input.amount,
        description: input.description,
        purpose: input.purpose ?? null,
        date_needed: input.date_needed ?? null,
        is_over_budget: isOverBudget
      })
      .select()
      .single()
    if (error) throw error

    await auditService.logSystem({
      entity: "BUDGET_INTENTION",
      action: "INTENTION_CREATED",
      user_id: userId,
      entity_id: data.id,
      new_value: { amount: data.amount, ministry_id: ministryId, is_over_budget: isOverBudget }
    })

    await sendIntentionNotification(data, isOverBudget).catch(() => null)

    return data
  },

  async review(id: string, input: ReviewIntentionInput, reviewerId: string) {
    const admin = createSupabaseAdminClient()
    const now = new Date().toISOString()

    const { data: current } = await admin
      .from("budget_intentions")
      .select("status, users!budget_intentions_requested_by_fkey(email, full_name)")
      .eq("id", id)
      .single()

    if (current?.status !== "PENDING") {
      return { alreadyActioned: true }
    }

    const { data, error } = await admin
      .from("budget_intentions")
      .update({
        status: input.action,
        reviewed_by: reviewerId,
        reviewed_at: now,
        review_message: input.message,
        updated_at: now
      })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error

    await auditService.logSystem({
      entity: "BUDGET_INTENTION",
      action: `INTENTION_${input.action}`,
      user_id: reviewerId,
      entity_id: id,
      previous_value: { status: "PENDING" },
      new_value: { status: input.action, message: input.message }
    })

    const ministerUser = (
      current as unknown as { users: { email: string; full_name: string } | null }
    ).users
    if (ministerUser?.email) {
      await sendIntentionReviewNotification(data, ministerUser, input.action).catch(() => null)
    }

    return { alreadyActioned: false, data }
  },

  async registerTransfer(intentionId: string, input: RegisterTransferInput, userId: string) {
    const admin = createSupabaseAdminClient()

    const { data, error } = await admin
      .from("intention_transfers")
      .insert({
        intention_id: intentionId,
        amount: input.amount,
        transfer_date: input.transfer_date,
        reference: input.reference ?? null,
        notes: input.notes ?? null,
        registered_by: userId
      })
      .select()
      .single()
    if (error) throw error

    await auditService.logSystem({
      entity: "INTENTION_TRANSFER",
      action: "TRANSFER_REGISTERED",
      user_id: userId,
      entity_id: intentionId,
      new_value: { amount: input.amount, transfer_date: input.transfer_date }
    })

    const intention = await this.getById(intentionId)
    const ministerUser = (
      intention as unknown as { users: { email: string; full_name: string } | null }
    ).users
    if (ministerUser?.email) {
      await sendTransferNotification(intention, ministerUser).catch(() => null)
    }

    return data
  },

  async getTransfer(intentionId: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("intention_transfers")
      .select("*")
      .eq("intention_id", intentionId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async addComment(
    entityId: string,
    entityType: "INTENTION" | "SETTLEMENT",
    input: AddCommentInput,
    userId: string
  ) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("request_comments")
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        user_id: userId,
        message: input.message
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getComments(entityId: string, entityType: "INTENTION" | "SETTLEMENT") {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("request_comments")
      .select("*, users(id, full_name, role)")
      .eq("entity_id", entityId)
      .eq("entity_type", entityType)
      .order("created_at")
    if (error) throw error
    return data
  },

  async getPendingCount(ministryId?: string) {
    const admin = createSupabaseAdminClient()
    let query = admin
      .from("budget_intentions")
      .select("id", { count: "exact", head: true })
      .eq("status", "PENDING")

    if (ministryId) query = query.eq("ministry_id", ministryId)

    const { count, error } = await query
    if (error) throw error
    return count ?? 0
  },

  async getMissingTransfersCount() {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("budget_intentions")
      .select("id")
      .eq("status", "APPROVED")

    if (error) throw error
    if (!data || data.length === 0) return 0

    const approvedIds = data.map((d) => d.id)
    const { data: transfers, error: tErr } = await admin
      .from("intention_transfers")
      .select("intention_id")
      .in("intention_id", approvedIds)
    if (tErr) throw tErr

    const transferredIds = new Set((transfers ?? []).map((t) => t.intention_id))
    return approvedIds.filter((id) => !transferredIds.has(id)).length
  }
}

// Avoid circular dependency — import movementsService only in settlement service
export { movementsService }
export { ministriesService }
