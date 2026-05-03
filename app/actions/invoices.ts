"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { invoicesService } from "@/services/invoices/invoices.service"
import type { CreateInvoiceInput } from "@/lib/validators/invoice"

export async function createInvoice(input: CreateInvoiceInput) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    throw new Error("Sin permisos para crear boletas")
  }

  const db = await createSupabaseServerClient()
  const created = await invoicesService.create(db, input, user.id)
  revalidatePath("/rendiciones")
  return created
}

export async function updateInvoiceStatus(id: string, status: "PENDING" | "SETTLED") {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    throw new Error("Sin permisos para actualizar boletas")
  }

  const db = await createSupabaseServerClient()
  const updated = await invoicesService.updateStatus(db, id, status, user.id)
  revalidatePath("/rendiciones")
  return updated
}
