import { NextResponse } from "next/server"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { budgetService } from "@/services/budget/budget.service"
import { createBudgetPeriodSchema } from "@/lib/validators/budget"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_BUDGETS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  const db = await createSupabaseServerClient()
  const data = await budgetService.listPeriods(db)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_BUDGETS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = createBudgetPeriodSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const db = await createSupabaseServerClient()
    const data = await budgetService.createPeriod(db, parsed.data, user.id)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
