import { timingSafeEqual } from "crypto"
import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { sendReminderEmail } from "@/services/email/workflow-emails.service"

// Called by a scheduled job (cron) — protected by a shared secret
export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret")
  const expected = process.env.CRON_SECRET ?? ""
  const secretOk =
    secret !== null &&
    secret.length === expected.length &&
    timingSafeEqual(Buffer.from(secret), Buffer.from(expected))
  if (!secretOk) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin.rpc("get_pending_reminders")
    if (error) throw error

    const reminders = data as {
      intentions: unknown[]
      settlements: unknown[]
      missing_transfers: unknown[]
    }

    const summary = {
      intentions: reminders.intentions?.length ?? 0,
      settlements: reminders.settlements?.length ?? 0,
      missing_transfers: reminders.missing_transfers?.length ?? 0
    }

    if (summary.intentions + summary.settlements + summary.missing_transfers > 0) {
      await sendReminderEmail(summary)
    }

    return NextResponse.json({ ok: true, summary })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
