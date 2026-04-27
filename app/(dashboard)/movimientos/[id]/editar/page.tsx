type Props = { params: Promise<{ id: string }> }
import { notFound, redirect } from "next/navigation"
import { MovementForm } from "@/components/movements/movement-form"
import { movementsService } from "@/services/movements/movements.service"
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements } from "@/lib/permissions/rbac"
import { toMovimientoFormValues } from "@/lib/utils"

export default async function EditarMovimientoPage({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!canCreateOrEditMovements(user?.role)) {
    redirect(`/movimientos/${id}`)
  }

  const movement = await movementsService.findById(id).catch(() => null)
  if (!movement) notFound()
  if (movement.status === "CANCELLED") redirect(`/movimientos/${id}`)

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Editar Movimiento
        </h1>
        <p className="text-sm text-muted-foreground">
          Solo se permite editar movimientos en estado activo.
        </p>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 sm:p-10">
        <MovementForm
          mode="edit"
          movementId={id}
          initialValues={toMovimientoFormValues(movement)}
        />
      </div>
    </div>
  )
}
