import { NextResponse } from "next/server"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { ministriesService } from "@/services/ministries/ministries.service"
import { createMinistrySchema } from "@/lib/validators/ministry"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_MINISTRIES)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  const db = await createSupabaseServerClient()
  const data = await ministriesService.list(db)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_MINISTRIES)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = createMinistrySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const db = await createSupabaseServerClient()
    const data = await ministriesService.create(db, parsed.data, user.id)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
