import { Resend } from "resend"

import type { AppsScriptResponse, MovementIntegrationPayload } from "@/services/google/types"

const ORG_NAME = "Primera Iglesia Bautista de Talcahuano"

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP"
  }).format(amount)
}

function buildEmailHtml(movement: MovementIntegrationPayload): string {
  const rows = [
    ["Folio", movement.folio],
    ["Fecha", movement.fechaMovimiento],
    ["Tipo", movement.tipo],
    ["Monto", formatAmount(movement.monto)],
    ["Categoría", movement.categoria],
    ["Concepto", movement.concepto],
    movement.referente ? ["Referente", movement.referente] : null,
    movement.recibidoPor ? ["Recibido por", movement.recibidoPor] : null,
    movement.entregadoPor ? ["Entregado por", movement.entregadoPor] : null,
    movement.medioPago ? ["Medio de pago", movement.medioPago] : null,
    movement.numeroRespaldo ? ["N° respaldo", movement.numeroRespaldo] : null,
    movement.observaciones ? ["Observaciones", movement.observaciones] : null,
    ["Registrado por", movement.registradoPor]
  ]
    .filter(Boolean)
    .map(
      (row) => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#555;white-space:nowrap;border-bottom:1px solid #eee;">${row![0]}</td>
        <td style="padding:8px 12px;color:#222;border-bottom:1px solid #eee;">${row![1]}</td>
      </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#1a3a5c;padding:20px 32px;">
            <p style="margin:0;color:#fff;font-size:18px;font-weight:700;">Sistema Contable</p>
            <p style="margin:4px 0 0;color:#a8c4e0;font-size:13px;">${ORG_NAME}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 8px;">
            <p style="margin:0;font-size:15px;color:#333;">Se ha registrado un nuevo movimiento:</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
              ${rows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#999;">${ORG_NAME}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendMovementEmail(
  movement: MovementIntegrationPayload
): Promise<AppsScriptResponse> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: "Sistema contable PIBT <noreply@pibt.com>",
    to: [process.env.NOTIFICATION_EMAIL, movement.registradoEmail].filter(Boolean) as string[],
    subject: `[${movement.tipo}] Folio ${movement.folio} - ${movement.concepto}`,
    html: buildEmailHtml(movement)
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true, mailSent: true }
}
