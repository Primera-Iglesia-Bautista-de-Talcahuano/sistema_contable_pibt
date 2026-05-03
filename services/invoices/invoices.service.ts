import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"
import { auditService } from "@/services/audit/audit.service"
import type { CreateInvoiceInput } from "@/lib/validators/invoice"

type DB = SupabaseClient<Database>

export const invoicesService = {
  async list(db: DB) {
    const { data, error } = await db
      .from("invoices")
      .select(
        "id, number, date, amount, description, status, attachment_url, created_by_id, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(200)
    if (error) throw error
    return data
  },

  async create(db: DB, input: CreateInvoiceInput, userId: string) {
    const { data, error } = await db
      .from("invoices")
      .insert({
        number: input.number,
        date: input.date,
        amount: input.amount,
        description: input.description ?? null,
        attachment_url: input.attachment_url ?? null,
        created_by_id: userId
      })
      .select()
      .single()
    if (error) throw error

    await auditService.logSystem({
      entity: "INVOICE",
      action: "INVOICE_CREATED",
      user_id: userId,
      entity_id: data.id,
      new_value: { number: data.number, amount: data.amount, date: data.date }
    })

    return data
  },

  async updateStatus(db: DB, id: string, status: "PENDING" | "SETTLED", userId: string) {
    const { data: current, error: fetchError } = await db
      .from("invoices")
      .select("status, number")
      .eq("id", id)
      .single()
    if (fetchError) throw fetchError

    const { data, error } = await db
      .from("invoices")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error

    await auditService.logSystem({
      entity: "INVOICE",
      action: "INVOICE_STATUS_CHANGED",
      user_id: userId,
      entity_id: id,
      previous_value: { status: current.status },
      new_value: { status },
      note: `Boleta ${current.number}: ${current.status} → ${status}`
    })

    return data
  }
}
