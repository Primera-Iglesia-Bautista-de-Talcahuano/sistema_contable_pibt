import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageBudgets } from "@/lib/permissions/rbac"
import { budgetService } from "@/services/budget/budget.service"
import { upsertMinistryBudgetSchema } from "@/lib/validators/budget"

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user || !canManageBudgets(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const periodId = searchParams.get("period_id")
  if (!periodId) {
    return NextResponse.json({ message: "period_id requerido" }, { status: 400 })
  }
  const data = await budgetService.listBudgetsByPeriod(periodId)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !canManageBudgets(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = upsertMinistryBudgetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = await budgetService.upsertMinistryBudget(parsed.data, user.id)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 500 })
  }
}
