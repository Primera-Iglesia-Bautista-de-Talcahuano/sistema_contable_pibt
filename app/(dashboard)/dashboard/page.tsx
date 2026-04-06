import Link from "next/link";
import { dashboardService } from "@/services/dashboard/dashboard.service";
import { IngresosEgresosChart, CategoriaChart } from "@/components/dashboard/dashboard-charts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardActive, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

type DashboardSearchParams = {
  from?: string;
  to?: string;
};

export default async function DashboardPage({ searchParams }: { searchParams?: DashboardSearchParams }) {
  const from = searchParams?.from;
  const to = searchParams?.to;
  const data = await dashboardService.getResumen({ from, to });

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <Card className="bg-surface-container-lowest p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Dashboard</h1>
            <p className="mt-1 text-sm text-on-surface-variant font-medium">Resumen financiero de actividades.</p>
          </div>
          <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold">
            Status: Activo
          </div>
        </div>

        <form className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-[minmax(220px,_1fr)_minmax(220px,_1fr)_auto_auto] items-end" method="get">
          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-wide text-on-surface" htmlFor="from">
              Desde
            </label>
            <Input id="from" name="from" type="date" defaultValue={from} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-wide text-on-surface" htmlFor="to">
              Hasta
            </label>
            <Input id="to" name="to" type="date" defaultValue={to} />
          </div>

          <Button type="submit" variant="primary" className="h-12 whitespace-nowrap px-8">
            Filtrar
          </Button>
          <Link href="/dashboard" className="inline-flex h-12 px-6 items-center justify-center rounded-xl bg-transparent border border-outline-variant/20 text-on-surface hover:bg-surface-container-low text-sm font-semibold transition-all duration-200">
            Limpiar
          </Link>
        </form>
      </Card>

      <div className="mt-4 grid gap-6 md:grid-cols-4">
        <KpiCard label="Total Ingresos" value={clp.format(data.kpis.totalIngresos)} />
        <KpiCard label="Total Egresos" value={clp.format(data.kpis.totalEgresos)} />
        <KpiCard label="Saldo Actual" value={clp.format(data.kpis.saldoActual)} />
        <KpiCard label="Cant. Movimientos" value={String(data.kpis.cantidadMovimientos)} />
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <CardActive className="p-0">
          <CardHeader>
            <CardTitle className="text-xl">Ingresos vs Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <IngresosEgresosChart data={data.serieIngresosEgresos} />
          </CardContent>
        </CardActive>
        <CardActive className="p-0">
          <CardHeader>
            <CardTitle className="text-xl">Resumen por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoriaChart data={data.resumenPorCategoria} />
          </CardContent>
        </CardActive>
      </div>

      <CardActive className="p-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">Ultimos Movimientos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto px-6 pb-6">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20 text-on-surface-variant text-left">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Folio</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Fecha</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Tipo</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Monto</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Categoria</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Concepto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {data.ultimosMovimientos.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-surface-container-low/50">
                    <td className="px-4 py-4">
                      <Link className="font-medium text-primary hover:text-primary-container transition-colors" href={`/movimientos/${row.id}`}>
                        {row.folioDisplay}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-on-surface">{new Date(row.fechaMovimiento).toLocaleDateString("es-CL")}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.tipoMovimiento === 'INGRESO' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                        {row.tipoMovimiento}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-on-surface">{clp.format(Number(row.monto))}</td>
                    <td className="px-4 py-4 text-on-surface-variant">{row.categoria}</td>
                    <td className="px-4 py-4 text-on-surface-variant">{row.concepto}</td>
                  </tr>
                ))}
                {!data.ultimosMovimientos.length && (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm font-medium text-on-surface-variant" colSpan={6}>
                      Aun no hay movimientos activos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </CardActive>
    </section>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <CardActive className="flex flex-col gap-2 p-6 transition-all hover:translate-y-[-2px] hover:shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.12)]">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">{label}</p>
      <p className="text-3xl font-extrabold tracking-tight text-on-surface">{value}</p>
    </CardActive>
  );
}
