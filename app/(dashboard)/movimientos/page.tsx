import { getCurrentUser } from "@/lib/supabase/server";
import { canCreateOrEditMovements } from "@/lib/permissions/rbac";
import { movimientosService } from "@/services/movimientos/movimientos.service";
import { NewMovimientoDialog } from "@/components/movimientos/new-movimiento-dialog";
import { MovimientosTable } from "@/components/movimientos/movimientos-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  searchParams: Promise<{ search?: string; movement_type?: "INCOME" | "EXPENSE" | "ALL"; status?: "ACTIVE" | "CANCELLED" | "ALL" }>;
};

export default async function MovimientosPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const canWrite = canCreateOrEditMovements(user?.role);
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const movement_type = params.movement_type ?? "ALL";
  const status = params.status ?? "ALL";

  const rows = await movimientosService.list({ search, movement_type, status });

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <Card className="bg-surface-container-lowest p-6 sm:p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Movimientos</h1>
            <p className="mt-1 text-sm text-on-surface-variant font-medium">Registro de ingresos y egresos con trazabilidad.</p>
          </div>
          {canWrite && <NewMovimientoDialog />}
        </div>

        <form className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end" method="get">
          <Input name="search" defaultValue={search} placeholder="Buscar por folio, concepto..." />
          <select name="movement_type" defaultValue={movement_type} className="h-10 w-full rounded-xl border-none bg-surface-container-low px-3 py-2 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="ALL">Todos los tipos</option>
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Egreso</option>
          </select>
          <select name="status" defaultValue={status} className="h-10 w-full rounded-xl border-none bg-surface-container-low px-3 py-2 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="CANCELLED">Anulado</option>
          </select>
          <Button type="submit" variant="primary" className="h-10 shadow-lg shadow-primary/10 rounded-xl">
            Aplicar filtros
          </Button>
        </form>
      </Card>

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
          created_by: { full_name: (row.users as { full_name: string } | null)?.full_name ?? "" },
        }))}
      />
    </section>
  );
}
