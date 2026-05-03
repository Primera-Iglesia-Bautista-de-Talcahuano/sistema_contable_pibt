import { NextResponse } from "next/server"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { ministriesService } from "@/services/ministries/ministries.service"
import { assignMinisterSchema } from "@/lib/validators/ministry"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_MINISTRIES)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const db = await createSupabaseServerClient()
  const data = await ministriesService.getAssignments(db, id)
  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_MINISTRIES)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body: unknown = await request.json()
    const parsed = assignMinisterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const db = await createSupabaseServerClient()
    const data = await ministriesService.assign(db, id, parsed.data, user.id)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
