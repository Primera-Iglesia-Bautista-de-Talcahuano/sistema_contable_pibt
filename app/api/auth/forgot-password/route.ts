import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { sendForgotPasswordEmail } from "@/services/email/resend.service"
import { wrapAuthLink } from "@/services/auth/link-wrapper"
import { getSiteUrl } from "@/lib/utils"
import { forgotPasswordSchema } from "@/lib/validators/auth"

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ message: "Email inválido" }, { status: 400 })
    }

    const email = parsed.data.email.toLowerCase().trim()
    const admin = createSupabaseAdminClient()

    // Check user exists — always return 200 to avoid email enumeration
    const { data: authUsers } = await admin.auth.admin.listUsers()
    const authUser = authUsers.users.find((u) => u.email === email)

    if (!authUser) {
      return NextResponse.json({ ok: true })
    }

    const { data: profile } = await admin
      .from("users")
      .select("status")
      .eq("id", authUser.id)
      .single()

    if (!profile || profile.status === "INACTIVE") {
      return NextResponse.json({ ok: true })
    }

    const callbackUrl = `${getSiteUrl()}/auth/callback`
    const { data: linkData, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: callbackUrl }
    })

    if (error) throw error

    // Mark as PENDING_RESET
    await admin
      .from("users")
      .update({ status: "PENDING_RESET", updated_at: new Date().toISOString() })
      .eq("id", authUser.id)

    await sendForgotPasswordEmail({
      to: email,
      action_link: wrapAuthLink(linkData.properties.action_link)
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Don't leak errors for security
    return NextResponse.json({ ok: true })
  }
}
