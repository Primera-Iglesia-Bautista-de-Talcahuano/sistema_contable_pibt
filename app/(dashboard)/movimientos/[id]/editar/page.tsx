type Props = { params: Promise<{ id: string }> };
import { notFound, redirect } from "next/navigation";
import { MovimientoForm } from "@/components/movimientos/movimiento-form";
import { Card } from "@/components/ui/card";
import { movimientosService } from "@/services/movimientos/movimientos.service";
import { getCurrentUser } from "@/lib/supabase/server";
import { canCreateOrEditMovements } from "@/lib/permissions/rbac";

export default async function EditarMovimientoPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!canCreateOrEditMovements(user?.role)) {
    redirect(`/movimientos/${id}`);
  }

  let row: Awaited<ReturnType<typeof movimientosService.findById>>;
  try {
    row = await movimientosService.findById(id);
  } catch {
    notFound();
  }

  if (row.status === "CANCELLED") redirect(`/movimientos/${id}`);

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <Card className="bg-surface-container-lowest p-4 sm:p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.08)] border-none">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Editar Movimiento</h1>
        <p className="mt-1 text-sm text-on-surface-variant font-medium">Solo se permite editar movimientos en estado activo.</p>
      </Card>

      <Card className="bg-surface-container-lowest p-5 sm:p-10 shadow-[0px_40px_80px_-20px_rgba(25,28,30,0.15)] border-none rounded-[2rem]">
        <MovimientoForm
          mode="edit"
          movimientoId={id}
          initialValues={{
            movement_date: row.movement_date.slice(0, 10),
            movement_type: row.movement_type,
            amount: Number(row.amount),
            category: row.category,
            concept: row.concept,
            reference_person: row.reference_person ?? "",
            received_by: row.received_by ?? "",
            delivered_by: row.delivered_by ?? "",
            beneficiary: row.beneficiary ?? "",
            payment_method: row.payment_method ?? "",
            support_number: row.support_number ?? "",
            notes: row.notes ?? "",
          }}
        />
      </Card>
    </section>
  );
}
