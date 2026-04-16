import { redirect } from "next/navigation"
import { MovimientoForm } from "@/components/movimientos/movimiento-form"
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements } from "@/lib/permissions/rbac"

export default async function TalonarioPage() {
  const user = await getCurrentUser()
  if (!canCreateOrEditMovements(user?.role)) {
    redirect("/movimientos")
  }

  return (
    <section className="mx-auto max-w-5xl flex flex-col gap-8">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Talonario Unificado
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestión ágil para el registro de ingresos y egresos ministeriales.
        </p>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 sm:p-10">
        <MovimientoForm mode="create" />
      </div>
    </section>
  )
}
