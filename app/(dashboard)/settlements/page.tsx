import { createSupabaseServerClient } from "@/lib/supabase/server"
import { invoicesService } from "@/services/invoices/invoices.service"
import { SettlementsClient } from "@/components/settlements/settlements-client"
import type { Database } from "@/types/database.types"

type Invoice = Database["public"]["Tables"]["invoices"]["Row"]

export default async function SettlementsPage() {
  const db = await createSupabaseServerClient()
  const invoices = (await invoicesService.list(db)) as Invoice[]
  return <SettlementsClient initialInvoices={invoices} />
}
