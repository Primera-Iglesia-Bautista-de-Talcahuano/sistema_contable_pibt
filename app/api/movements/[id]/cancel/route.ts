import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements } from "@/lib/permissions/rbac"
import { movementsService } from "@/services/movements/movements.service"
import { cancelMovementSchema } from "@/lib/validators/movement"
import { processMovimientoIntegrations } from "@/services/google/movement-postprocess"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user || !canCreateOrEditMovements(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body: unknown = await request.json()
    const parsed = cancelMovementSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos invalidos", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await movementsService.cancel(id, parsed.data, user.id)
    void processMovimientoIntegrations(result.id, user.id).catch(() => {
      // Mantener regla de negocio: si falla integración externa, movimiento queda guardado.
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 400 })
  }
}
