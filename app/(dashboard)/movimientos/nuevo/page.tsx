import { redirect } from "next/navigation"
import { MovimientoForm } from "@/components/movimientos/movimiento-form"
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements } from "@/lib/permissions/rbac"

export default async function NuevoMovimientoPage() {
  const user = await getCurrentUser()
  if (!canCreateOrEditMovements(user?.role)) {
    redirect("/movimientos")
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Registro de Movimiento
        </h1>
        <p className="text-sm text-muted-foreground">
          Formulario para el control de ingresos y egresos.
        </p>
      </div>
      <div className="rounded-xl bg-card border border-border p-6 sm:p-10">
        <MovimientoForm mode="create" />
      </div>
    </div>
  )
}
