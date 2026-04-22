import { NextRequest, NextResponse } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const VALID_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email"
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token_hash = searchParams.get("token")
  const type = searchParams.get("type")

  if (!token_hash || !type || !VALID_TYPES.includes(type as EmailOtpType)) {
    return NextResponse.redirect(new URL("/?error=invalid_link", req.nextUrl.origin))
  }

  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()

  const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as EmailOtpType })

  if (error) {
    return NextResponse.redirect(new URL("/?error=link_expired", req.nextUrl.origin))
  }

  return NextResponse.redirect(new URL("/activar", req.nextUrl.origin))
}
