import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canViewWorkflow } from "@/lib/permissions/rbac"
import { intentionsService } from "@/services/intentions/intentions.service"
import { settlementsService } from "@/services/settlements/settlements.service"
import { ministriesService } from "@/services/ministries/ministries.service"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !canViewWorkflow(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  if (user.role === "MINISTER") {
    const assignment = await ministriesService.getMinistryForUser(user.id)
    if (!assignment) return NextResponse.json({ count: 0, items: [] })

    const [intentionsPending, settlementsPending] = await Promise.all([
      intentionsService.list({ ministryId: assignment.ministry_id, status: "APPROVED" }),
      settlementsService.list({ status: "PENDING" })
    ])

    const items = [
      ...intentionsPending.map((i) => ({
        type: "INTENTION_APPROVED" as const,
        id: i.id,
        message: `Solicitud aprobada: ${i.description}`,
        href: `/solicitudes/${i.id}`,
        created_at: i.updated_at
      })),
      ...settlementsPending.map((s) => ({
        type: "SETTLEMENT_PENDING" as const,
        id: s.id,
        message: `Rendición en revisión: ${s.description}`,
        href: `/solicitudes/${(s.budget_intentions as unknown as { id: string }).id}`,
        created_at: s.created_at
      }))
    ]

    return NextResponse.json({ count: items.length, items })
  }

  const [intentionCount, settlementCount, missingTransfers] = await Promise.all([
    intentionsService.getPendingCount(),
    settlementsService.getPendingCount(),
    intentionsService.getMissingTransfersCount()
  ])

  const count = intentionCount + settlementCount + missingTransfers
  return NextResponse.json({
    count,
    items: [
      intentionCount > 0
        ? { type: "INTENTIONS_PENDING", count: intentionCount, message: `${intentionCount} solicitud(es) pendiente(s)`, href: "/solicitudes?status=PENDING" }
        : null,
      settlementCount > 0
        ? { type: "SETTLEMENTS_PENDING", count: settlementCount, message: `${settlementCount} rendición(es) pendiente(s)`, href: "/solicitudes?tab=rendiciones&status=PENDING" }
        : null,
      missingTransfers > 0
        ? { type: "MISSING_TRANSFERS", count: missingTransfers, message: `${missingTransfers} transferencia(s) sin registrar`, href: "/solicitudes?tab=transferencias" }
        : null
    ].filter(Boolean)
  })
}
