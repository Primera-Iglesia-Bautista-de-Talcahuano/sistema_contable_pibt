import { Resend } from "resend"
import { settingsService } from "@/services/settings/settings.service"

const ORG_NAME = "Primera Iglesia Bautista de Talcahuano"
const ORG_SHORT = "Sistema Contable PIBT"
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Sistema contable PIBT <hola@pibtalcahuano.com>"
const UNSUBSCRIBE_EMAIL = "hola@pibtalcahuano.com"
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

const TRANSACTIONAL_HEADERS = {
  "List-Unsubscribe": `<mailto:${UNSUBSCRIBE_EMAIL}?subject=unsubscribe>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  "X-Entity-Ref-ID": "sistema-contable-pibt"
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(amount)
}

function buildHeader(): string {
  return `
    <tr>
      <td style="background:#1a3a5c;padding:20px 32px;">
        <p style="margin:0;color:#fff;font-size:18px;font-weight:700;">${ORG_SHORT}</p>
        <p style="margin:4px 0 0;color:#a8c4e0;font-size:13px;">${ORG_NAME}</p>
      </td>
    </tr>`
}

function buildFooter(): string {
  return `
    <tr>
      <td style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eee;">
        <p style="margin:0;font-size:12px;color:#999;">${ORG_NAME}</p>
      </td>
    </tr>`
}

function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
        ${buildHeader()}
        ${content}
        ${buildFooter()}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildButton(label: string, url: string, color = "#1a3a5c"): string {
  return `<a href="${url}" style="display:inline-block;background:${color};color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">${label}</a>`
}

// ── New intention submitted → tesorería ─────────────────────

export async function sendIntentionNotification(
  intention: { id: string; amount: number; description: string; token: string },
  isOverBudget: boolean
): Promise<void> {
  const settings = await settingsService.getAll()
  const to = settings.tesoreria_notification_email
  if (!to) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const reviewUrl = `${BASE_URL}/solicitudes/${intention.id}`
  const overBudgetBadge = isOverBudget
    ? `<span style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:700;margin-left:8px;">SOBRE PRESUPUESTO</span>`
    : ""

  const html = wrapEmail(`
    <tr><td style="padding:24px 32px 8px;">
      <h2 style="margin:0;font-size:18px;color:#222;">Nueva solicitud de intención de presupuesto ${overBudgetBadge}</h2>
    </td></tr>
    <tr><td style="padding:8px 32px;">
      <table width="100%" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#555;border-bottom:1px solid #eee;width:40%">Monto solicitado</td>
          <td style="padding:8px 12px;color:#222;border-bottom:1px solid #eee;">${formatAmount(intention.amount)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#555;">Descripción</td>
          <td style="padding:8px 12px;color:#222;">${intention.description}</td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:24px 32px;">
      ${buildButton("Revisar solicitud", reviewUrl)}
      <p style="margin:12px 0 0;font-size:12px;color:#999;">Se requiere inicio de sesión para acceder.</p>
    </td></tr>`)

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${isOverBudget ? "[SOBRE PRESUPUESTO] " : ""}Nueva solicitud de presupuesto — ${ORG_SHORT}`,
    html,
    headers: TRANSACTIONAL_HEADERS
  })
}

// ── Intention reviewed → minister ────────────────────────────

export async function sendIntentionReviewNotification(
  intention: { id: string; amount: number; description: string },
  minister: { email: string; full_name: string },
  action: "APPROVED" | "REJECTED"
): Promise<void> {
  const settings = await settingsService.getAll()
  const to = settings.voucher_email || minister.email
  const resend = new Resend(process.env.RESEND_API_KEY)

  const isApproved = action === "APPROVED"
  const statusLabel = isApproved ? "aprobada" : "rechazada"
  const statusColor = isApproved ? "#16a34a" : "#dc2626"
  const detailUrl = `${BASE_URL}/solicitudes/${intention.id}`

  const html = wrapEmail(`
    <tr><td style="padding:24px 32px 8px;">
      <h2 style="margin:0;font-size:18px;color:#222;">Tu solicitud fue <span style="color:${statusColor};">${statusLabel}</span></h2>
      <p style="margin:8px 0 0;color:#555;font-size:14px;">Hola ${minister.full_name}, tu solicitud de intención de presupuesto ha sido revisada.</p>
    </td></tr>
    <tr><td style="padding:8px 32px;">
      <table width="100%" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#555;border-bottom:1px solid #eee;width:40%">Monto</td>
          <td style="padding:8px 12px;color:#222;border-bottom:1px solid #eee;">${formatAmount(intention.amount)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#555;">Descripción</td>
          <td style="padding:8px 12px;color:#222;">${intention.description}</td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:24px 32px;">
      ${buildButton("Ver detalle", detailUrl)}
      <p style="margin:12px 0 0;font-size:12px;color:#999;">Se requiere inicio de sesión para acceder.</p>
    </td></tr>`)

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Solicitud ${statusLabel} — ${ORG_SHORT}`,
    html,
    headers: TRANSACTIONAL_HEADERS
  })
}

// ── Transfer registered → minister ───────────────────────────

export async function sendTransferNotification(
  intention: { id: string; amount: number; description: string },
  minister: { email: string; full_name: string }
): Promise<void> {
  const settings = await settingsService.getAll()
  const to = settings.voucher_email || minister.email
  const resend = new Resend(process.env.RESEND_API_KEY)
  const detailUrl = `${BASE_URL}/solicitudes/${intention.id}`

  const html = wrapEmail(`
    <tr><td style="padding:24px 32px 8px;">
      <h2 style="margin:0;font-size:18px;color:#222;">Transferencia registrada</h2>
      <p style="margin:8px 0 0;color:#555;font-size:14px;">Hola ${minister.full_name}, la transferencia correspondiente a tu solicitud ha sido registrada por el equipo de tesorería.</p>
    </td></tr>
    <tr><td style="padding:8px 32px;">
      <table width="100%" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#555;border-bottom:1px solid #eee;width:40%">Monto</td>
          <td style="padding:8px 12px;color:#222;border-bottom:1px solid #eee;">${formatAmount(intention.amount)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#555;">Descripción</td>
          <td style="padding:8px 12px;color:#222;">${intention.description}</td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:8px 32px 24px;">
      <p style="margin:0;color:#555;font-size:14px;">Recuerda que debes presentar tu rendición de gastos con los documentos de respaldo dentro de los próximos 30 días.</p>
    </td></tr>
    <tr><td style="padding:0 32px 24px;">
      ${buildButton("Ir a mi solicitud", detailUrl)}
      <p style="margin:12px 0 0;font-size:12px;color:#999;">Se requiere inicio de sesión para acceder.</p>
    </td></tr>`)

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Transferencia registrada — ${ORG_SHORT}`,
    html,
    headers: TRANSACTIONAL_HEADERS
  })
}

// ── Settlement reviewed → minister ───────────────────────────

export async function sendSettlementReviewNotification(
  settlement: { id: string; amount: number; description: string },
  minister: { email: string; full_name: string },
  action: "APPROVED" | "REJECTED"
): Promise<void> {
  const settings = await settingsService.getAll()
  const to = settings.voucher_email || minister.email
  const resend = new Resend(process.env.RESEND_API_KEY)

  const isApproved = action === "APPROVED"
  const statusLabel = isApproved ? "aprobada" : "rechazada"
  const statusColor = isApproved ? "#16a34a" : "#dc2626"
  const detailUrl = `${BASE_URL}/solicitudes/${settlement.id}`

  const html = wrapEmail(`
    <tr><td style="padding:24px 32px 8px;">
      <h2 style="margin:0;font-size:18px;color:#222;">Tu rendición fue <span style="color:${statusColor};">${statusLabel}</span></h2>
      <p style="margin:8px 0 0;color:#555;font-size:14px;">Hola ${minister.full_name}, tu rendición de gastos ha sido revisada por el equipo de tesorería.</p>
    </td></tr>
    <tr><td style="padding:8px 32px;">
      <table width="100%" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#555;border-bottom:1px solid #eee;width:40%">Monto</td>
          <td style="padding:8px 12px;color:#222;border-bottom:1px solid #eee;">${formatAmount(settlement.amount)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#555;">Descripción</td>
          <td style="padding:8px 12px;color:#222;">${settlement.description}</td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:24px 32px;">
      ${buildButton("Ver detalle", detailUrl)}
      <p style="margin:12px 0 0;font-size:12px;color:#999;">Se requiere inicio de sesión para acceder.</p>
    </td></tr>`)

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Rendición ${statusLabel} — ${ORG_SHORT}`,
    html,
    headers: TRANSACTIONAL_HEADERS
  })
}

// ── Reminder email → tesorería ────────────────────────────────

export async function sendReminderEmail(summary: {
  intentions: number
  settlements: number
  missing_transfers: number
}): Promise<void> {
  const settings = await settingsService.getAll()
  const to = settings.tesoreria_notification_email
  if (!to) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const total = summary.intentions + summary.settlements + summary.missing_transfers

  const html = wrapEmail(`
    <tr><td style="padding:24px 32px 8px;">
      <h2 style="margin:0;font-size:18px;color:#222;">Recordatorio: ${total} item(s) pendiente(s)</h2>
    </td></tr>
    <tr><td style="padding:8px 32px;">
      <table width="100%" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#555;border-bottom:1px solid #eee;width:60%">Intenciones pendientes de revisión</td>
          <td style="padding:8px 12px;color:#222;border-bottom:1px solid #eee;text-align:right;">${summary.intentions}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#555;border-bottom:1px solid #eee;">Rendiciones pendientes de revisión</td>
          <td style="padding:8px 12px;color:#222;border-bottom:1px solid #eee;text-align:right;">${summary.settlements}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#555;">Transferencias pendientes de registrar</td>
          <td style="padding:8px 12px;color:#222;text-align:right;">${summary.missing_transfers}</td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:24px 32px;">
      ${buildButton("Ir al sistema", `${BASE_URL}/solicitudes`)}
    </td></tr>`)

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `[Recordatorio] ${total} items pendientes — ${ORG_SHORT}`,
    html,
    headers: TRANSACTIONAL_HEADERS
  })
}
