import { createSupabaseAdminClient } from "@/lib/supabase/admin"

type SerieItem = { name: string; ingresos: number; egresos: number }
type CategoriaItem = { categoria: string; total: number }

type DashboardPeriodo = {
  from?: string
  to?: string
}

type RpcResult = {
  totalIngresos: number
  totalEgresos: number
  cantidadMovimientos: number
  series: Array<{ month: string; ingresos: number; egresos: number }>
  resumenPorCategoria: CategoriaItem[]
}

// Converts 'YYYY-MM' ISO month string to Spanish short locale label ("ene. 26").
function formatMonthES(isoMonth: string): string {
  const [year, month] = isoMonth.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString("es-CL", { month: "short", year: "2-digit" })
}

export const dashboardService = {
  async getResumen(periodo: DashboardPeriodo = {}) {
    const admin = createSupabaseAdminClient()

    let pFrom: string | null = null
    let pTo: string | null = null

    if (periodo.from) {
      const d = new Date(periodo.from)
      if (!Number.isNaN(d.getTime())) pFrom = d.toISOString()
    }
    if (periodo.to) {
      const d = new Date(periodo.to)
      if (!Number.isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999)
        pTo = d.toISOString()
      }
    }

    // Run aggregation RPC and recent-movements query in parallel
    const [rpcResponse, recentResponse] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      admin.rpc("get_dashboard_summary" as any, { p_from: pFrom, p_to: pTo }),
      admin
        .from("movements")
        .select(
          "id, folio, folio_display, movement_date, movement_type, amount, category, concept, status, created_by:users!created_by_id(full_name)"
        )
        .eq("status", "ACTIVE")
        .order("movement_date", { ascending: false })
        .order("folio", { ascending: false })
        .limit(8)
    ])

    if (rpcResponse.error) throw rpcResponse.error
    if (recentResponse.error) throw recentResponse.error

    const summary = rpcResponse.data as unknown as RpcResult

    const serieIngresosEgresos: SerieItem[] = summary.series.map((s) => ({
      name: formatMonthES(s.month),
      ingresos: Number(s.ingresos),
      egresos: Number(s.egresos)
    }))

    return {
      kpis: {
        totalIngresos: Number(summary.totalIngresos),
        totalEgresos: Number(summary.totalEgresos),
        saldoActual: Number(summary.totalIngresos) - Number(summary.totalEgresos),
        cantidadMovimientos: Number(summary.cantidadMovimientos)
      },
      serieIngresosEgresos,
      resumenPorCategoria: summary.resumenPorCategoria.map((c) => ({
        categoria: c.categoria,
        total: Number(c.total)
      })),
      ultimosMovimientos: recentResponse.data
    }
  }
}
