import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageUsers } from "@/lib/permissions/rbac"
import { usersService } from "@/services/users/users.service"
import { updateUserSchema } from "@/lib/validators/user"

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user || !canManageUsers(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    await usersService.delete(id, user.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 400 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user || !canManageUsers(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body: unknown = await request.json()
    const parsed = updateUserSchema.safeParse({ ...(body as Record<string, unknown>), id })
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updated = await usersService.update(parsed.data, user.id)
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 400 })
  }
}
