import { invoicesService } from "@/services/invoices/invoices.service"
import { RendicionesClient } from "@/components/rendiciones/rendiciones-client"
import type { Database } from "@/types/database.types"

type Invoice = Database["public"]["Tables"]["invoices"]["Row"]

export default async function RendicionesPage() {
  const invoices = (await invoicesService.list()) as Invoice[]
  return <RendicionesClient initialInvoices={invoices} />
}
