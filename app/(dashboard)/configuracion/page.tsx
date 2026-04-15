import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/supabase/server";
import { canManageUsers } from "@/lib/permissions/rbac";
import { auditoriaService } from "@/services/auditoria/auditoria.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ConfiguracionPage() {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user.role)) {
    redirect("/dashboard");
  }

  const events = await auditoriaService.listSystem(50);

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <Card className="bg-surface-container-lowest p-4 sm:p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.08)]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Configuración</h1>
        <p className="mt-1 text-sm text-on-surface-variant font-medium">Historial de auditoría del sistema (usuarios y eventos globales).</p>
      </Card>

      <Card className="p-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">Registro de Auditoría</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto px-6 pb-6">
            <table className="min-w-full text-sm">
              <thead>
                  <tr className="text-on-surface-variant/50 text-left">
                  <th className="px-4 sm:px-6 py-4 font-bold text-[10px] uppercase tracking-[0.2em]">Fecha</th>
                  <th className="px-4 sm:px-6 py-4 font-bold text-[10px] uppercase tracking-[0.2em]">Entidad</th>
                  <th className="px-4 sm:px-6 py-4 font-bold text-[10px] uppercase tracking-[0.2em]">Acción</th>
                  <th className="px-4 sm:px-6 py-4 font-bold text-[10px] uppercase tracking-[0.2em]">Usuario</th>
                  <th className="px-4 sm:px-6 py-4 font-bold text-[10px] uppercase tracking-[0.2em]">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {events.map((event, index) => (
                  <tr
                    key={event.id}
                    className={cn(
                      "transition-all duration-300 group hover:bg-surface-container-low/40",
                      index % 2 === 0 ? "bg-transparent" : "bg-surface-container-low/10"
                    )}
                  >
                    <td className="px-4 sm:px-6 py-5 whitespace-nowrap text-on-surface-variant font-medium tabular-nums text-xs">
                      {new Date(event.event_date).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span className="inline-flex rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold text-on-secondary-container uppercase tracking-widest">
                        {event.entity}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-5 font-black text-on-surface uppercase tracking-tight">{event.action}</td>
                    <td className="px-4 sm:px-6 py-5 text-on-surface-variant font-bold">{event.users?.full_name ?? "—"}</td>
                    <td className="px-4 sm:px-6 py-5 text-on-surface-variant/80 italic truncate max-w-xs text-xs">{event.note ?? "—"}</td>
                  </tr>
                ))}
                {!events.length && (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm font-medium text-on-surface-variant" colSpan={5}>
                      Sin eventos de auditoría registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
