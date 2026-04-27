import { NextResponse } from "next/server"
import { createInvoiceSchema } from "@/lib/validators/invoice"
import { invoicesService } from "@/services/invoices/invoices.service"
import { getCurrentUser } from "@/lib/supabase/server"
import { canViewMovements, canCreateOrEditMovements } from "@/lib/permissions/rbac"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !canViewMovements(user.role)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const rows = await invoicesService.list()
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !canCreateOrEditMovements(user.role)) {
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

    const created = await invoicesService.create(parsed.data, user.id)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
