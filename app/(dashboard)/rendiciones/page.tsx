import { invoicesService } from "@/services/invoices/invoices.service"
import { SettlementsClient } from "@/components/settlements/settlements-client"
import type { Database } from "@/types/database.types"

type Invoice = Database["public"]["Tables"]["invoices"]["Row"]

export default async function RendicionesPage() {
  const invoices = (await invoicesService.list()) as Invoice[]
  return <SettlementsClient initialInvoices={invoices} />
}
