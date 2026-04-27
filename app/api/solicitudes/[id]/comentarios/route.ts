import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canViewWorkflow } from "@/lib/permissions/rbac"
import { intentionsService } from "@/services/intentions/intentions.service"
import { addCommentSchema } from "@/lib/validators/intention"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || !canViewWorkflow(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const data = await intentionsService.getComments(id, "INTENTION")
  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || !canViewWorkflow(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body: unknown = await request.json()
    const parsed = addCommentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = await intentionsService.addComment(id, "INTENTION", parsed.data, user.id)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 500 })
  }
}
