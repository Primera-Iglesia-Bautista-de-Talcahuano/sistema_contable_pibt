import { getSiteUrl } from "@/lib/utils"
import type { EmailOtpType } from "@supabase/supabase-js"

export function wrapAuthLink(supabaseLink: string): string {
  const url = new URL(supabaseLink)
  const token = url.searchParams.get("token")
  const type = url.searchParams.get("type") as EmailOtpType | null

  if (!token || !type) return supabaseLink

  const wrapped = new URL(`${getSiteUrl()}/api/auth/verify`)
  wrapped.searchParams.set("token", token)
  wrapped.searchParams.set("type", type)
  return wrapped.toString()
}
