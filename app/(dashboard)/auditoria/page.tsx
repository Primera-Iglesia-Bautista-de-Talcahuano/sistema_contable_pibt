import { redirect } from "next/navigation"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageUsers } from "@/lib/permissions/rbac"
import { auditoriaService } from "@/services/auditoria/auditoria.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemHeader
} from "@/components/ui/item"
import { ClipboardList } from "lucide-react"

function entityClass(entity: string) {
  const e = entity.toUpperCase()
  if (e === "MOVIMIENTO" || e === "MOVEMENT") return "bg-primary/10 text-primary"
  if (e === "USUARIO" || e === "USER") return "bg-[#f5f3fa] text-[#7c6fa0]"
  if (e === "CANCELADO" || e === "CANCELLED" || e === "ANULADO")
    return "bg-destructive/10 text-destructive"
  return "bg-muted text-muted-foreground"
}

export default async function AuditoriaPage() {
  const user = await getCurrentUser()
  if (!user || !canManageUsers(user.role)) {
    redirect("/dashboard")
  }

  const events = await auditoriaService.listSystem(50)

  return (
    <section className="mx-auto max-w-6xl flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Auditoría</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historial de auditoría del sistema — usuarios y eventos globales.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-border">
          <CardTitle className="text-xl">Registro de Auditoría</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* ── Desktop table ── */}
          <div className="hidden sm:block overflow-x-auto px-6 pb-6">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-left align-middle">
                    Fecha
                  </th>
                  <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-left align-middle">
                    Entidad
                  </th>
                  <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-left align-middle">
                    Acción
                  </th>
                  <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-left align-middle">
                    Usuario
                  </th>
                  <th className="px-4 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-left align-middle">
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
                    <td className="px-4 py-4 align-middle whitespace-nowrap text-muted-foreground font-medium tabular-nums text-xs">
                      {new Date(event.event_date).toLocaleString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest",
                          entityClass(event.entity)
                        )}
                      >
                        {event.entity}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle font-bold text-foreground uppercase tracking-tight text-xs">
                      {event.action}
                    </td>
                    <td className="px-4 py-4 align-middle text-muted-foreground font-medium text-sm">
                      {event.users?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-4 align-middle text-muted-foreground italic truncate max-w-xs text-xs">
                      {event.note ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile list ── */}
          <div className="sm:hidden px-4 pb-4">
            <ItemGroup>
              {events.map((event) => (
                <Item key={event.id} variant="muted" size="sm">
                  <ItemContent>
                    <ItemHeader>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                          entityClass(event.entity)
                        )}
                      >
                        {event.entity}
                      </span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {new Date(event.event_date).toLocaleString("es-CL", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </ItemHeader>
                    <ItemTitle className="uppercase tracking-tight">{event.action}</ItemTitle>
                    <ItemDescription>
                      {event.users?.full_name ?? "—"}
                      {event.note && <span className="italic"> · {event.note}</span>}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </div>

          {/* ── Empty state ── */}
          {!events.length && (
            <Empty className="border-0 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardList />
                </EmptyMedia>
                <EmptyTitle>Sin eventos</EmptyTitle>
                <EmptyDescription>No hay eventos de auditoría registrados.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
