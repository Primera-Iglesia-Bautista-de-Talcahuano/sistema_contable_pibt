import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { auditoriaService } from "@/services/auditoria/auditoria.service"
import type {
  AnularMovimientoInput,
  CreateMovimientoInput,
  UpdateMovimientoInput
} from "@/lib/validators/movimiento"

function normalizeOptional(value?: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const PAGE_SIZE = 50

type ListFilters = {
  search?: string
  movement_type?: "INCOME" | "EXPENSE" | "ALL"
  status?: "ACTIVE" | "CANCELLED" | "ALL"
  page?: number
  pageSize?: number
}

export const movimientosService = {
  async list(filters: ListFilters = {}) {
    const admin = createSupabaseAdminClient()
    const pageSize = filters.pageSize ?? PAGE_SIZE
    const page = Math.max(1, filters.page ?? 1)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = admin
      .from("movements")
      .select(
        "id, folio, folio_display, movement_date, movement_type, amount, category, concept, reference_person, received_by, delivered_by, beneficiary, payment_method, support_number, notes, cancellation_reason, status, created_by_id, created_at, users!created_by_id(id, full_name, email)",
        { count: "exact" }
      )
      .order("movement_date", { ascending: false })
      .order("folio", { ascending: false })
      .range(from, to)

    if (filters.movement_type && filters.movement_type !== "ALL") {
      query = query.eq("movement_type", filters.movement_type)
    }
    if (filters.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status)
    }
    if (filters.search?.trim()) {
      const s = filters.search.trim()
      query = query.or(
        `folio_display.ilike.%${s}%,concept.ilike.%${s}%,category.ilike.%${s}%,reference_person.ilike.%${s}%,beneficiary.ilike.%${s}%`
      )
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data: data ?? [], count: count ?? 0, page, pageSize }
  },

  async findById(id: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("movements")
      .select(
        `*,
        created_by:users!created_by_id(id, full_name, email),
        updated_by:users!updated_by_id(id, full_name, email),
        cancelled_by:users!cancelled_by_id(id, full_name, email),
        movement_audit_log(*, users(id, full_name, email))`
      )
      .eq("id", id)
      .order("event_date", { referencedTable: "movement_audit_log", ascending: false })
      .single()

    if (error) throw error
    return data
  },

  async create(input: CreateMovimientoInput, userId: string) {
    const admin = createSupabaseAdminClient()

    const { data: folioData, error: folioError } = await admin.rpc("increment_and_get_folio")
    if (folioError) throw folioError
    const folio = folioData as number

    const { data: movement, error } = await admin
      .from("movements")
      .insert({
        folio,
        movement_date: new Date(input.movement_date).toISOString(),
        movement_type: input.movement_type,
        amount: input.amount,
        category: input.category.trim(),
        concept: input.concept.trim(),
        reference_person: normalizeOptional(input.reference_person),
        received_by: normalizeOptional(input.received_by),
        delivered_by: normalizeOptional(input.delivered_by),
        beneficiary: normalizeOptional(input.beneficiary),
        payment_method: normalizeOptional(input.payment_method),
        support_number: normalizeOptional(input.support_number),
        notes: normalizeOptional(input.notes),
        attachment_url: input.attachment_url ?? null,
        created_by_id: userId
      })
      .select()
      .single()

    if (error) throw error

    await auditoriaService.logMovement({
      movement_id: movement.id,
      user_id: userId,
      action: "Movimiento creado",
      new_value: movement,
      note: "Movimiento registrado exitosamente"
    })

    return movement
  },

  async update(id: string, input: UpdateMovimientoInput, userId: string) {
    const admin = createSupabaseAdminClient()

    const { data: previous, error: fetchError } = await admin
      .from("movements")
      .select()
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError
    if (!previous) throw new Error("Movimiento no encontrado")
    if (previous.status === "CANCELLED") throw new Error("No se puede editar un movimiento anulado")

    const { data: updated, error } = await admin
      .from("movements")
      .update({
        movement_date: new Date(input.movement_date).toISOString(),
        movement_type: input.movement_type,
        amount: input.amount,
        category: input.category.trim(),
        concept: input.concept.trim(),
        reference_person: normalizeOptional(input.reference_person),
        received_by: normalizeOptional(input.received_by),
        delivered_by: normalizeOptional(input.delivered_by),
        beneficiary: normalizeOptional(input.beneficiary),
        payment_method: normalizeOptional(input.payment_method),
        support_number: normalizeOptional(input.support_number),
        notes: normalizeOptional(input.notes),
        attachment_url: input.attachment_url ?? null,
        updated_by_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    await auditoriaService.logMovement({
      movement_id: id,
      user_id: userId,
      action: "Movimiento editado",
      previous_value: previous,
      new_value: updated,
      note: "Información del movimiento actualizada"
    })

    return updated
  },

  async cancel(id: string, input: AnularMovimientoInput, userId: string) {
    const admin = createSupabaseAdminClient()

    const { data: previous, error: fetchError } = await admin
      .from("movements")
      .select()
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError
    if (!previous) throw new Error("Movimiento no encontrado")
    if (previous.status === "CANCELLED") return previous

    const now = new Date().toISOString()
    const { data: cancelled, error } = await admin
      .from("movements")
      .update({
        status: "CANCELLED",
        cancellation_reason: input.cancellation_reason.trim(),
        cancelled_by_id: userId,
        cancelled_at: now,
        updated_by_id: userId,
        updated_at: now
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    await auditoriaService.logMovement({
      movement_id: id,
      user_id: userId,
      action: "Movimiento anulado",
      previous_value: previous,
      new_value: cancelled,
      note: input.cancellation_reason.trim()
    })

    return cancelled
  }
}
