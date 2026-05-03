import { NextResponse } from "next/server"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { budgetService } from "@/services/budget/budget.service"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_BUDGETS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const db = await createSupabaseServerClient()
    const data = await budgetService.releasePeriod(db, id, user.id)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
