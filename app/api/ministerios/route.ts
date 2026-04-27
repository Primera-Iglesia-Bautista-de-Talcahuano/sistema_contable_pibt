import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageMinistries } from "@/lib/permissions/rbac"
import { ministriesService } from "@/services/ministries/ministries.service"
import { createMinistrySchema } from "@/lib/validators/ministry"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !canManageMinistries(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }
  const data = await ministriesService.list()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !canManageMinistries(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = createMinistrySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = await ministriesService.create(parsed.data, user.id)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 500 })
  }
}
