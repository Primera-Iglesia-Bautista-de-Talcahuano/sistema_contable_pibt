import { NextResponse } from "next/server"
import { updateInvoiceSchema } from "@/lib/validators/invoice"
import { invoicesService } from "@/services/invoices/invoices.service"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body: unknown = await request.json()
    const parsed = updateInvoiceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const db = await createSupabaseServerClient()
    const updated = await invoicesService.updateStatus(db, id, parsed.data.status, user.id)
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
