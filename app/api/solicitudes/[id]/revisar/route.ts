import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canReviewIntentions } from "@/lib/permissions/rbac"
import { intentionsService } from "@/services/intentions/intentions.service"
import { reviewIntentionSchema } from "@/lib/validators/intention"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || !canReviewIntentions(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body: unknown = await request.json()
    const parsed = reviewIntentionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await intentionsService.review(id, parsed.data, user.id)

    if (result.alreadyActioned) {
      return NextResponse.json(
        { message: "Esta solicitud ya fue revisada anteriormente" },
        { status: 409 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 500 })
  }
}
