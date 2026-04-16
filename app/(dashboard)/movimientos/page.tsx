import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements } from "@/lib/permissions/rbac"
import { movimientosService } from "@/services/movimientos/movimientos.service"
import { NewMovimientoDialog } from "@/components/movimientos/new-movimiento-dialog"
import { MovimientosTable } from "@/components/movimientos/movimientos-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  searchParams: Promise<{
    search?: string
    movement_type?: "INCOME" | "EXPENSE" | "ALL"
    status?: "ACTIVE" | "CANCELLED" | "ALL"
  }>
}

export default async function MovimientosPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  const canWrite = canCreateOrEditMovements(user?.role)
  const params = await searchParams
  const search = params.search?.trim() ?? ""
  const movement_type = params.movement_type ?? "ALL"
  const status = params.status ?? "ALL"

  const rows = await movimientosService.list({ search, movement_type, status })

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Movimientos
          </h1>
          <p className="text-sm text-muted-foreground">
            Registro de ingresos y egresos
          </p>
        </div>
        {canWrite && <NewMovimientoDialog />}
      </div>

      {/* ── Filter form ──────────────────────────────────────────── */}
      <form
        className="rounded-xl bg-card border border-border p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        method="get"
      >
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="search"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Buscar
          </Label>
          <Input
            id="search"
            name="search"
            defaultValue={search}
            placeholder="Folio, concepto..."
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="movement_type"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Tipo
          </Label>
          <select
            id="movement_type"
            name="movement_type"
            defaultValue={movement_type}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Egreso</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="status"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Estado
          </Label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="CANCELLED">Anulado</option>
          </select>
        </div>
        <Button type="submit" className="h-10">
          Aplicar filtros
        </Button>
      </form>

      {/* ── Table ───────────────────────────────────────────────── */}
      <MovimientosTable
        canWrite={canWrite}
        rows={rows.map((row) => ({
          id: row.id,
          folio_display: row.folio_display ?? String(row.folio),
          movement_date: row.movement_date,
          movement_type: row.movement_type,
          amount: String(row.amount),
          category: row.category,
          concept: row.concept,
          reference_person: row.reference_person,
          received_by: row.received_by,
          delivered_by: row.delivered_by,
          beneficiary: row.beneficiary,
          payment_method: row.payment_method,
          support_number: row.support_number,
          notes: row.notes,
          cancellation_reason: row.cancellation_reason,
          status: row.status,
          created_by: {
            full_name: (row.users as { full_name: string } | null)?.full_name ?? "",
          },
        }))}
      />
    </div>
  )
}
