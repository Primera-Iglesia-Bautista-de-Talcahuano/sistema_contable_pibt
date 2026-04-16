import { redirect } from "next/navigation"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageUsers } from "@/lib/permissions/rbac"
import { auditoriaService } from "@/services/auditoria/auditoria.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia
} from "@/components/ui/empty"
import { ClipboardList } from "lucide-react"

export default async function ConfiguracionPage() {
  const user = await getCurrentUser()
  if (!user || !canManageUsers(user.role)) {
    redirect("/dashboard")
  }

  const events = await auditoriaService.listSystem(50)

  return (
    <section className="mx-auto max-w-6xl flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historial de auditoría del sistema (usuarios y eventos globales).
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">Registro de Auditoría</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto px-6 pb-6">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-left">
                    Fecha
                  </th>
                  <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-left">
                    Entidad
                  </th>
                  <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-left">
                    Acción
                  </th>
                  <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-left">
                    Usuario
                  </th>
                  <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-left">
                    Observación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((event, index) => (
                  <tr
                    key={event.id}
                    className={cn(
                      "transition-colors hover:bg-muted/40",
                      index % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                    )}
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-muted-foreground font-medium tabular-nums text-xs">
                      {new Date(event.event_date).toLocaleString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="inline-flex rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        {event.entity}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-foreground uppercase tracking-tight">
                      {event.action}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-muted-foreground font-medium">
                      {event.users?.full_name ?? "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-muted-foreground italic truncate max-w-xs text-xs">
                      {event.note ?? "—"}
                    </td>
                  </tr>
                ))}
                {!events.length && (
                  <tr>
                    <td colSpan={5}>
                      <Empty className="border-0 py-16">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <ClipboardList />
                          </EmptyMedia>
                          <EmptyTitle>Sin eventos</EmptyTitle>
                          <EmptyDescription>No hay eventos de auditoría registrados.</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
