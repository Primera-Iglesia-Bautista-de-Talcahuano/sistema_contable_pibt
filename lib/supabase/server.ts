import { cache } from "react"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/database.types"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — cookies can't be set,
            // but middleware handles session refresh so this is safe to ignore.
          }
        }
      }
    }
  )
}

// cache() deduplicates calls within a single React render tree (one request).
// Layout + page both call getCurrentUser — this ensures it only runs once.
export const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, role, status")
    .eq("id", user.id)
    .single()

  if (!profile || profile.status !== "ACTIVE") return null

  return {
    id: profile.id,
    email: user.email ?? "",
    name: profile.full_name,
    role: profile.role,
    status: profile.status
  }
})
