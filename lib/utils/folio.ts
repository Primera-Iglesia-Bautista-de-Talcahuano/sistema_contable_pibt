import { createSupabaseAdminClient } from "@/lib/supabase/admin"

export function formatFolio(folio: number): string {
  return folio.toString().padStart(6, "0")
}

export async function increment_and_get_folio(): Promise<number> {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.rpc("increment_and_get_folio")
  if (error) throw error
  return data as number
}
