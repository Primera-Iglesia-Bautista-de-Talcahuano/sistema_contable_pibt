import { NextResponse } from "next/server"
import { createInvoiceSchema } from "@/lib/validators/invoice"
import { invoicesService } from "@/services/invoices/invoices.service"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.VIEW_MOVEMENT)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const db = await createSupabaseServerClient()
  const rows = await invoicesService.list(db)
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = createInvoiceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const db = await createSupabaseServerClient()
    const created = await invoicesService.create(db, parsed.data, user.id)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
