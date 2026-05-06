import { redirect } from "next/navigation"
import { MovementForm } from "@/components/movements/movement-form"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"

export default async function VoucherBookPage() {
  const user = await getCurrentUser()
  if (!(can(user?.permissions, PERMISSIONS.CREATE_MOVEMENT) ?? false)) {
    redirect("/movements")
  }

  return (
    <section className="mx-auto max-w-5xl flex flex-col gap-8">
      <div className="rounded-xl bg-card border border-border p-6 sm:p-10">
        <MovementForm mode="create" />
      </div>
    </section>
  )
}
