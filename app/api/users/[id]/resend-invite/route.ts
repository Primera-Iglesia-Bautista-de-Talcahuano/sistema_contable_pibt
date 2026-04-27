import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageUsers } from "@/lib/permissions/rbac"
import { usersService } from "@/services/users/users.service"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || !canManageUsers(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const result = await usersService.resendInvite(id, user.id)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 400 })
  }
}
