import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageUsers } from "@/lib/permissions/rbac"
import { auditService } from "@/services/audit/audit.service"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !canManageUsers(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  const auditoria = await auditService.listSystem(80)
  return NextResponse.json({ auditoria })
}
