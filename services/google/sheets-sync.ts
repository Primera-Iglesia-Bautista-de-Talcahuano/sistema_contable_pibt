import { postToAppsScript } from "@/services/google/client"
import type { AppsScriptResponse, MovementIntegrationPayload } from "@/services/google/types"
import { movementsService } from "@/services/movements/movements.service"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

export async function syncMovementToSheet(
  /* eslint-disable @typescript-eslint/no-unused-vars */
  _movement: MovementIntegrationPayload
): Promise<AppsScriptResponse> {
  const { data: allMovements } = await movementsService.list(createSupabaseAdminClient(), {
    status: "ACTIVE",
    pageSize: 10000
  })

  const movementsPayload = allMovements.map((m) => {
    const createdBy = m.users as { full_name: string; email: string } | null
    return {
      movementId: m.id,
      folio: m.folio_display,
      movementTypeLabel: m.movement_type === "INCOME" ? "INGRESO" : "EGRESO",
      movementDate: m.movement_date,
      amount: Number(m.amount),
      category: m.category,
      concept: m.concept,
      description: m.concept,
      reference: m.reference_person,
      receivedBy: m.received_by,
      deliveredBy: m.delivered_by,
      beneficiary: m.beneficiary,
      paymentMethod: m.payment_method,
      supportNumber: m.support_number,
      notes: m.notes,
      registeredBy: createdBy?.full_name ?? "",
      user: createdBy?.full_name ?? "",
      registeredEmail: createdBy?.email ?? "",
      registeredAt: m.created_at,
      organizationName: "Sistema contable PIBT"
    }
  })

  return postToAppsScript("SYNC_SHEET", { movements: movementsPayload })
}
