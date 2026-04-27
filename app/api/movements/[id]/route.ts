import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements, canViewMovements } from "@/lib/permissions/rbac"
import { movementsService } from "@/services/movements/movements.service"
import { updateMovementSchema } from "@/lib/validators/movement"
import { processMovimientoIntegrations } from "@/services/google/movement-postprocess"

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user || !canViewMovements(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const row = await movementsService.findById(id)
  if (!row) {
    return NextResponse.json({ message: "Movimiento no encontrado" }, { status: 404 })
  }

  return NextResponse.json(row)
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user || !canCreateOrEditMovements(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body: unknown = await request.json()
    const parsed = updateMovementSchema.safeParse({ ...(body as Record<string, unknown>), id })
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos invalidos", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updated = await movementsService.update(id, parsed.data, user.id)
    void processMovimientoIntegrations(updated.id, user.id).catch(() => {
      // Mantener regla de negocio: si falla integración externa, movimiento queda guardado.
    })
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    const status = message.includes("no encontrado") ? 404 : 400
    return NextResponse.json({ message }, { status })
  }
}
