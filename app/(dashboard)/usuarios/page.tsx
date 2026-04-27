import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageUsers } from "@/lib/permissions/rbac"
import { UsersManager } from "@/components/users/users-manager"
import { usersService } from "@/services/users/users.service"

export default async function UsuariosPage() {
  const user = await getCurrentUser()
  if (!user || !canManageUsers(user.role)) {
    redirect("/dashboard")
  }
  const users = await usersService.list()

  return (
    <section className="mx-auto max-w-6xl flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Usuarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestión de usuarios del sistema (solo administradores).
        </p>
      </div>

      <UsersManager initialUsers={users} />
    </section>
  )
}
