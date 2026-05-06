import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { UsersManager } from "@/components/users/users-manager"
import { usersService } from "@/services/users/users.service"

export default async function UsersPage() {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_USERS)) {
    redirect("/dashboard")
  }
  const users = await usersService.list()

  return (
    <section className="mx-auto max-w-6xl flex flex-col gap-8">
      <UsersManager initialUsers={users} />
    </section>
  )
}
