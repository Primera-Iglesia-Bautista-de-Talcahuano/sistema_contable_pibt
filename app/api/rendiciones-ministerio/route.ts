import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canViewWorkflow } from "@/lib/permissions/rbac"
import { settlementsService } from "@/services/settlements/settlements.service"
import { createSettlementSchema } from "@/lib/validators/settlement"

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user || !canViewWorkflow(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const intentionId = searchParams.get("intention_id") ?? undefined
  const status = searchParams.get("status") ?? undefined

  const data = await settlementsService.list({ intentionId, status })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ message: "No autorizado" }, { status: 401 })

  if (user.role !== "MINISTER") {
    return NextResponse.json(
      { message: "Solo los ministros pueden enviar rendiciones" },
      { status: 403 }
    )
  }

  try {
    const body: unknown = await request.json()
    const parsed = createSettlementSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = await settlementsService.create(parsed.data, user.id)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 500 })
  }
}
