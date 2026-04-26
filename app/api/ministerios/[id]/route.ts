import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageMinistries } from "@/lib/permissions/rbac"
import { ministriesService } from "@/services/ministries/ministries.service"
import { updateMinistrySchema } from "@/lib/validators/ministry"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || !canManageMinistries(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }
  const { id } = await params
  const data = await ministriesService.getById(id)
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || !canManageMinistries(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateMinistrySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 400 })
    }
    const data = await ministriesService.update(id, parsed.data, user.id)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 500 })
  }
}
