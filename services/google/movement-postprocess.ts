import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { auditoriaService } from "@/services/auditoria/auditoria.service"
import { generateMovementPdf } from "@/services/google/apps-script-documents"
import { sendMovementEmail } from "@/services/email/resend.service"
import { syncMovementToSheet } from "@/services/google/sheets-sync"
import type { MovementIntegrationPayload } from "@/services/google/types"

function toPayload(m: {
  id: string
  folio_display: string | null
  movement_date: string
  movement_type: "INCOME" | "EXPENSE"
  amount: number
  category: string
  concept: string
  reference_person: string | null
  received_by: string | null
  delivered_by: string | null
  beneficiary: string | null
  payment_method: string | null
  support_number: string | null
  notes: string | null
  created_at: string
  created_by: { full_name: string; email: string }
}): MovementIntegrationPayload {
  return {
    movimientoId: m.id,
    folio: m.folio_display ?? "",
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
    registradoPor: m.created_by.full_name,
    usuario: m.created_by.full_name,
    registradoEmail: m.created_by.email,
    registradoEn: m.created_at,
    nombreOrganizacion: "Sistema contable PIBT"
  }
}

export async function processMovimientoIntegrations(movimientoId: string, userId: string) {
  const admin = createSupabaseAdminClient()

  const { data: movement, error } = await admin
    .from("movements")
    .select("*, created_by:users!created_by_id(full_name, email)")
    .eq("id", movimientoId)
    .single()

  if (error || !movement) throw new Error("Movimiento no encontrado para integración")

  const created_by = movement.created_by as { full_name: string; email: string }
  const payload = toPayload({ ...movement, created_by })

  // PDF generation
  const pdfResult = await generateMovementPdf(payload)
  await admin
    .from("movements")
    .update({
      pdf_status: pdfResult.ok ? "GENERATED" : "ERROR",
      pdf_url: pdfResult.pdfUrl ?? movement.pdf_url,
      drive_file_id: pdfResult.driveFileId ?? movement.drive_file_id,
      pdf_error: pdfResult.ok ? null : (pdfResult.error ?? "Fallo generación PDF")
    })
    .eq("id", movimientoId)

  await auditoriaService.logMovement({
    movement_id: movimientoId,
    user_id: userId,
    action: "PDF_REGENERATED",
    note: pdfResult.ok ? "PDF generado/regenerado" : `Error PDF: ${pdfResult.error ?? ""}`
  })

  // Sheets sync
  const sheetResult = await syncMovementToSheet(payload)
  await admin
    .from("movements")
    .update({
      synced_to_sheet: Boolean(sheetResult.ok),
      sync_error: sheetResult.ok ? null : (sheetResult.error ?? "Fallo sync Sheet")
    })
    .eq("id", movimientoId)

  // Email notification
  const mailResult = await sendMovementEmail(payload)
  await admin
    .from("movements")
    .update({
      notification_status: mailResult.ok ? "SENT" : "ERROR",
      notification_sent_at: mailResult.ok ? new Date().toISOString() : null,
      notification_error: mailResult.ok ? null : (mailResult.error ?? "Fallo envío correo")
    })
    .eq("id", movimientoId)

  await auditoriaService.logMovement({
    movement_id: movimientoId,
    user_id: userId,
    action: mailResult.ok ? "NOTIFICATION_SENT" : "NOTIFICATION_ERROR",
    note: mailResult.ok
      ? "Correo enviado por Apps Script"
      : `Error correo: ${mailResult.error ?? ""}`
  })
}
