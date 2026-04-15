import { redirect } from "next/navigation";
import { MovimientoForm } from "@/components/movimientos/movimiento-form";
import { getCurrentUser } from "@/lib/supabase/server";
import { canCreateOrEditMovements } from "@/lib/permissions/rbac";

export default async function NuevoMovimientoPage() {
  const user = await getCurrentUser();
  if (!canCreateOrEditMovements(user?.role)) {
    redirect("/movimientos");
  }

  return (
    <section className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">Registro de Movimiento</h1>
        <p className="text-sm font-medium text-on-surface-variant">Formulario ministerial para el control de ingresos y egresos.</p>
      </div>
      <MovimientoForm mode="create" />
    </section>
  );
}
