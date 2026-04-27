import { NextResponse } from "next/server"
import { createMovementSchema } from "@/lib/validators/movement"
import { movementsService } from "@/services/movements/movements.service"
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements, canViewMovements } from "@/lib/permissions/rbac"
import { processMovimientoIntegrations } from "@/services/google/movement-postprocess"

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user || !canViewMovements(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") ?? undefined
  const movement_type = searchParams.get("movement_type") as "INCOME" | "EXPENSE" | "ALL" | null
  const status = searchParams.get("status") as "ACTIVE" | "CANCELLED" | "ALL" | null

  const { data } = await movementsService.list({
    search,
    movement_type: movement_type ?? "ALL",
    status: status ?? "ALL"
  })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !canCreateOrEditMovements(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = createMovementSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos invalidos", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const created = await movementsService.create(parsed.data, user.id)
    void processMovimientoIntegrations(created.id, user.id).catch(() => {
      // Mantener regla de negocio: si falla integración externa, movimiento queda guardado.
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 500 })
  }
}
