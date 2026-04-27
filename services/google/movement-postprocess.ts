import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { auditService } from "@/services/audit/audit.service"
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
    movementId: m.id,
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

export async function processMovimientoIntegrations(movementId: string, userId: string) {
  const admin = createSupabaseAdminClient()

  const { data: movement, error } = await admin
    .from("movements")
    .select("*, created_by:users!created_by_id(full_name, email)")
    .eq("id", movementId)
    .single()

  if (error || !movement) throw new Error("Movimiento no encontrado para integración")

  const created_by = movement.created_by as { full_name: string; email: string }
  const payload = toPayload({ ...movement, created_by })

  // Run PDF, Sheet, and Email integrations in parallel — each is independent.
  // allSettled ensures one failure never prevents the others from completing.
  const [pdfResult, sheetResult, mailResult] = await Promise.allSettled([
    generateMovementPdf(payload),
    syncMovementToSheet(payload),
    sendMovementEmail(payload)
  ])

  const pdf =
    pdfResult.status === "fulfilled"
      ? pdfResult.value
      : { ok: false, error: String(pdfResult.reason) }
  const sheet =
    sheetResult.status === "fulfilled"
      ? sheetResult.value
      : { ok: false, error: String(sheetResult.reason) }
  const mail =
    mailResult.status === "fulfilled"
      ? mailResult.value
      : { ok: false, error: String(mailResult.reason) }

  // Persist all three integration states in a single update
  await admin
    .from("movements")
    .update({
      pdf_status: pdf.ok ? "GENERATED" : "ERROR",
      pdf_url: pdf.ok
        ? ((pdf as { ok: true; pdfUrl?: string; driveFileId?: string }).pdfUrl ?? movement.pdf_url)
        : movement.pdf_url,
      drive_file_id: pdf.ok
        ? ((pdf as { ok: true; pdfUrl?: string; driveFileId?: string }).driveFileId ??
          movement.drive_file_id)
        : movement.drive_file_id,
      pdf_error: pdf.ok ? null : (pdf.error ?? "Fallo generación PDF"),
      synced_to_sheet: Boolean(sheet.ok),
      sync_error: sheet.ok ? null : (sheet.error ?? "Fallo sync Sheet"),
      notification_status: mail.ok ? "SENT" : "ERROR",
      notification_sent_at: mail.ok ? new Date().toISOString() : null,
      notification_error: mail.ok ? null : (mail.error ?? "Fallo envío correo")
    })
    .eq("id", movementId)

  // Audit logs for PDF and email outcomes
  await Promise.allSettled([
    auditService.logMovement({
      movement_id: movementId,
      user_id: userId,
      action: "PDF regenerado",
      note: pdf.ok ? "PDF generado exitosamente" : `Error al generar PDF: ${pdf.error ?? ""}`
    }),
    auditService.logMovement({
      movement_id: movementId,
      user_id: userId,
      action: mail.ok ? "Notificación enviada" : "Error de notificación",
      note: mail.ok
        ? "Correo de notificación enviado exitosamente"
        : `Error al enviar correo: ${mail.error ?? ""}`
    })
  ])
}
