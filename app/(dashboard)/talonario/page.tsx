import { redirect } from "next/navigation";
import { MovimientoForm } from "@/components/movimientos/movimiento-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/supabase/server";
import { canCreateOrEditMovements } from "@/lib/permissions/rbac";

export default async function TalonarioPage() {
  const user = await getCurrentUser();
  if (!canCreateOrEditMovements(user?.role)) {
    redirect("/movimientos");
  }

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <Card className="bg-surface-container-lowest p-4 sm:p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.08)] border-none">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Talonario Unificado</h1>
        <p className="mt-1 text-sm text-on-surface-variant font-medium">
          Gestión ágil para el registro de ingresos y egresos ministeriales.
        </p>
      </Card>

      <Card className="bg-surface-container-lowest p-5 sm:p-10 shadow-[0px_40px_80px_-20px_rgba(25,28,30,0.15)] border-none rounded-[2rem]">
        <MovimientoForm mode="create" />
      </Card>
    </section>
  );
}
