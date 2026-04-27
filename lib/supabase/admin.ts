import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Service role client — bypasses RLS. Server-side only, never expose to the browser.
export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
