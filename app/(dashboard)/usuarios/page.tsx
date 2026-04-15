import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { canManageUsers } from "@/lib/permissions/rbac";
import { UsuariosManager } from "@/components/usuarios/usuarios-manager";
import { usuariosService } from "@/services/usuarios/usuarios.service";
import { Card } from "@/components/ui/card";

export default async function UsuariosPage() {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user.role)) {
    redirect("/dashboard");
  }
  const users = await usuariosService.list();

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <Card className="bg-surface-container-lowest p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Usuarios</h1>
            <p className="mt-1 text-sm text-on-surface-variant font-medium">Gestión de usuarios del sistema (solo administradores).</p>
          </div>
        </div>
      </Card>
      
      <UsuariosManager initialUsers={users} />
    </section>
  );
}
