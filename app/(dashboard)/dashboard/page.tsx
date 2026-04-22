import Link from "next/link"
import { dashboardService } from "@/services/dashboard/dashboard.service"
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements } from "@/lib/permissions/rbac"
import { IngresosEgresosChart, CategoriaChart } from "@/components/dashboard/dashboard-charts"
import { MovimientosTable } from "@/components/movimientos/movimientos-table"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown } from "lucide-react"

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0
})

type DashboardSearchParams = {
  from?: string
  to?: string
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<DashboardSearchParams>
}) {
  const from = (await searchParams)?.from
  const to = (await searchParams)?.to
  const [data, user] = await Promise.all([
    dashboardService.getResumen({ from, to }),
    getCurrentUser()
  ])
  const canWrite = canCreateOrEditMovements(user?.role)

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Resumen financiero de actividades</p>
        </div>

        {/* Date filter */}
        <form className="flex flex-wrap items-end gap-3" method="get">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="from"
              className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
            >
              Desde
            </Label>
            <DatePicker name="from" defaultValue={from} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="to"
              className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
            >
              Hasta
            </Label>
            <DatePicker name="to" defaultValue={to} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="outline" className="h-9 px-4 text-sm">
              Filtrar
            </Button>
            <Button
              render={<Link href="/dashboard" />}
              nativeButton={false}
              variant="ghost"
              className="h-9 px-4 text-sm"
            >
              Limpiar
            </Button>
          </div>
        </form>
      </div>

      {/* ── Hero saldo + KPIs ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Hero — saldo actual */}
        <div className="rounded-xl bg-primary p-6 flex flex-col gap-3 text-primary-foreground">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground/70">
            Saldo actual
          </p>
          <p className="font-heading text-3xl font-bold tracking-tight tabular-nums">
            {clp.format(data.kpis.saldoActual)}
          </p>
          <div className="flex flex-wrap gap-3 mt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
              <TrendingUp className="size-3" />
              {clp.format(data.kpis.totalIngresos)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
              <TrendingDown className="size-3" />
              {clp.format(data.kpis.totalEgresos)}
            </span>
          </div>
        </div>

        {/* Income */}
        <div className="rounded-xl bg-card border border-border p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Ingresos
            </p>
            <TrendingUp className="size-4 text-income" />
          </div>
          <p className="font-heading text-2xl font-bold tracking-tight text-income tabular-nums">
            {clp.format(data.kpis.totalIngresos)}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.kpis.cantidadMovimientos} movimientos en el período
          </p>
        </div>

        {/* Expenses */}
        <div className="rounded-xl bg-card border border-border p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Egresos
            </p>
            <TrendingDown className="size-4 text-destructive" />
          </div>
          <p className="font-heading text-2xl font-bold tracking-tight text-destructive tabular-nums">
            {clp.format(data.kpis.totalEgresos)}
          </p>
          <p className="text-xs text-muted-foreground">En el período seleccionado</p>
        </div>
      </div>

      {/* ── Charts ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card border border-border p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Ingresos vs Egresos
            </h2>
            <p className="text-xs text-muted-foreground">Tendencia por período</p>
          </div>
          <IngresosEgresosChart data={data.serieIngresosEgresos} />
        </div>
        <div className="rounded-xl bg-card border border-border p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Por categoría
            </h2>
            <p className="text-xs text-muted-foreground">Distribución del período</p>
          </div>
          <CategoriaChart data={data.resumenPorCategoria} />
        </div>
      </div>

      {/* ── Recent movements ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Últimos movimientos
          </h2>
          <Link
            href="/movimientos"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Ver todos →
          </Link>
        </div>
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <MovimientosTable
            canWrite={canWrite}
            rows={data.ultimosMovimientos.map((row) => ({
              id: row.id,
              folio_display: row.folio_display,
              movement_date: row.movement_date,
              movement_type: row.movement_type,
              amount: String(row.amount),
              category: row.category,
              concept: row.concept,
              reference_person: null,
              received_by: null,
              delivered_by: null,
              beneficiary: null,
              payment_method: null,
              support_number: null,
              notes: null,
              cancellation_reason: null,
              status: row.status,
              created_by: {
                full_name: (row.created_by as { full_name: string } | null)?.full_name ?? ""
              }
            }))}
          />
        </div>
      </div>
    </div>
  )
}
