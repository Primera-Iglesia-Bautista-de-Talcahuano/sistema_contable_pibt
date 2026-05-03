import { NextResponse } from "next/server"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { settingsService } from "@/services/settings/settings.service"
import { updateSettingsSchema } from "@/lib/validators/settings"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_SETTINGS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  const db = await createSupabaseServerClient()
  const data = await settingsService.getAll(db)
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_SETTINGS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = updateSettingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const db = await createSupabaseServerClient()
    const data = await settingsService.update(db, parsed.data, user.id)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
