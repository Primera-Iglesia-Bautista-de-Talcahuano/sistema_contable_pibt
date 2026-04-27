import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageSettings } from "@/lib/permissions/rbac"
import { settingsService } from "@/services/settings/settings.service"
import { updateSettingsSchema } from "@/lib/validators/settings"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !canManageSettings(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }
  const data = await settingsService.getAll()
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user || !canManageSettings(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = updateSettingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = await settingsService.update(parsed.data, user.id)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 500 })
  }
}
