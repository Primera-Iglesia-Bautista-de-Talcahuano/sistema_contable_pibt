import { postToAppsScript } from "@/services/google/client"
import type { AppsScriptResponse, MovementIntegrationPayload } from "@/services/google/types"
import { movimientosService } from "@/services/movimientos/movimientos.service"

export async function syncMovementToSheet(
  /* eslint-disable @typescript-eslint/no-unused-vars */
  _movement: MovementIntegrationPayload
): Promise<AppsScriptResponse> {
  const allMovements = await movimientosService.list({ status: "ACTIVE" })

  const movementsPayload = allMovements.map((m) => {
    const createdBy = m.users as { full_name: string; email: string } | null
    return {
      movimientoId: m.id,
      folio: m.folio_display,
      tipo: m.movement_type === "INCOME" ? "INGRESO" : "EGRESO",
      fechaMovimiento: m.movement_date,
      fecha: m.movement_date,
      tipoMovimiento: m.movement_type === "INCOME" ? "INGRESO" : "EGRESO",
      monto: Number(m.amount),
      categoria: m.category,
      concepto: m.concept,
      descripcion: m.concept,
      referente: m.reference_person,
      recibidoPor: m.received_by,
      entregadoPor: m.delivered_by,
      beneficiario: m.beneficiary,
      medioPago: m.payment_method,
      numeroRespaldo: m.support_number,
      observaciones: m.notes,
      registradoPor: createdBy?.full_name ?? "",
      usuario: createdBy?.full_name ?? "",
      registradoEmail: createdBy?.email ?? "",
      registradoEn: m.created_at,
      nombreOrganizacion: "Sistema contable PIBT"
    }
  })

  return postToAppsScript("SYNC_SHEET", { movements: movementsPayload })
}
