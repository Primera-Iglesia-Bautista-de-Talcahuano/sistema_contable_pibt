import { NextRequest, NextResponse } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"

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
  const token = searchParams.get("token")
  const type = searchParams.get("type")

  if (!token || !type || !VALID_TYPES.includes(type as EmailOtpType)) {
    return NextResponse.redirect(new URL("/auth/login?error=invalid_link", req.nextUrl.origin))
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const verifyUrl = new URL(`${supabaseUrl}/auth/v1/verify`)
  verifyUrl.searchParams.set("token", token)
  verifyUrl.searchParams.set("type", type)
  verifyUrl.searchParams.set("redirect_to", `${req.nextUrl.origin}/auth/callback`)

  return NextResponse.redirect(verifyUrl)
}
