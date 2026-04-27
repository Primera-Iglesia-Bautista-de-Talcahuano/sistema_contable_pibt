import Link from "next/link"
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements } from "@/lib/permissions/rbac"
import { movementsService } from "@/services/movements/movements.service"
import { MovementsTable } from "@/components/movements/movements-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  searchParams: Promise<{
    search?: string
    movement_type?: "INCOME" | "EXPENSE" | "ALL"
    status?: "ACTIVE" | "CANCELLED" | "ALL"
    page?: string
  }>
}

export default async function MovimientosPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  const canWrite = canCreateOrEditMovements(user?.role)
  const params = await searchParams
  const search = params.search?.trim() ?? ""
  const movement_type = params.movement_type ?? "ALL"
  const status = params.status ?? "ALL"
  const page = Math.max(1, Number(params.page ?? "1") || 1)

  const {
    data: rows,
    count,
    pageSize
  } = await movementsService.list({
    search,
    movement_type,
    status,
    page
  })

  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const buildUrl = (p: number) => {
    const qs = new URLSearchParams()
    if (search) qs.set("search", search)
    if (movement_type !== "ALL") qs.set("movement_type", movement_type)
    if (status !== "ALL") qs.set("status", status)
    if (p > 1) qs.set("page", String(p))
    const q = qs.toString()
    return `/movimientos${q ? `?${q}` : ""}`
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Movimientos
          </h1>
          <p className="text-sm text-muted-foreground">Registro de ingresos y egresos</p>
        </div>
        {canWrite && (
          <Button
            render={<Link href="/movimientos/nuevo" />}
            nativeButton={false}
            className="gap-2"
          >
            <Plus data-icon="inline-start" />
            Nuevo Movimiento
          </Button>
        )}
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
          <Input id="search" name="search" defaultValue={search} placeholder="Folio, concepto..." />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="movement_type"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Tipo
          </Label>
          <NativeSelect
            id="movement_type"
            name="movement_type"
            defaultValue={movement_type}
            className="w-full"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Egreso</option>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="status"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Estado
          </Label>
          <NativeSelect id="status" name="status" defaultValue={status} className="w-full">
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="CANCELLED">Anulado</option>
          </NativeSelect>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="h-10 flex-1">
            Aplicar filtros
          </Button>
          <Button
            render={<Link href="/movimientos" />}
            nativeButton={false}
            variant="outline"
            className="h-10 px-4"
          >
            Limpiar
          </Button>
        </div>
      </form>

      {/* ── Table ───────────────────────────────────────────────── */}
      <MovementsTable
        canWrite={canWrite}
        rows={rows.map((row) => ({
          id: row.id,
          folio_display: row.folio_display,
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
            full_name: (row.users as { full_name: string } | null)?.full_name ?? ""
          }
        }))}
      />

      {/* ── Pagination ──────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages} · {count} resultados
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              render={page > 1 ? <Link href={buildUrl(page - 1)} /> : undefined}
              disabled={page <= 1}
              className="gap-1"
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={page < totalPages ? <Link href={buildUrl(page + 1)} /> : undefined}
              disabled={page >= totalPages}
              className="gap-1"
            >
              Siguiente
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
