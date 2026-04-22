import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import type { CreateInvoiceInput } from "@/lib/validators/invoice"

export const invoicesService = {
  async list() {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("invoices")
      .select(
        "id, number, date, amount, description, status, attachment_url, created_by_id, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(200)
    if (error) throw error
    return data
  },

  async create(input: CreateInvoiceInput, userId: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
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
    return data
  },

  async updateStatus(id: string, status: "PENDING" | "SETTLED") {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("invoices")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  }
}
