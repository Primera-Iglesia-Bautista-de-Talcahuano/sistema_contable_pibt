import { NextResponse } from "next/server"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { settlementsService } from "@/services/settlements/settlements.service"
import { reviewSettlementSchema } from "@/lib/validators/settlement"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.REVIEW_INTENTIONS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body: unknown = await request.json()
    const parsed = reviewSettlementSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const db = await createSupabaseServerClient()
    const result = await settlementsService.review(db, id, parsed.data, user.id)

    if (result.alreadyActioned) {
      return NextResponse.json(
        { message: "This settlement has already been reviewed" },
        { status: 409 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
