"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

type UsuarioRow = {
  id: string
  full_name: string
  email: string
  role: UserRole
  active: boolean
  created_at: string | Date
}

type NewUserForm = {
  full_name: string
  email: string
  password: string
  role: UserRole
  active: boolean
}

const defaultNewUser: NewUserForm = {
  full_name: "",
  email: "",
  password: "",
  role: "OPERATOR",
  active: true,
}

export function UsuariosManager({ initialUsers }: { initialUsers: UsuarioRow[] }) {
  const [users, setUsers] = useState<UsuarioRow[]>(initialUsers)
  const [error, setError] = useState<string | null>(null)
  const [newUser, setNewUser] = useState<NewUserForm>(defaultNewUser)
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)

  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })

    setSubmitting(false)
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { message?: string }
      setError(payload.message ?? "No se pudo crear usuario.")
      return
    }

    const created = (await res.json()) as UsuarioRow
    setUsers((prev) => [...prev, created])
    setNewUser(defaultNewUser)
    setOpen(false)
  }

  async function saveUser(user: UsuarioRow) {
    setError(null)
    const res = await fetch(`/api/usuarios/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: user.full_name,
        role: user.role,
        active: user.active,
      }),
    })
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { message?: string }
      setError(payload.message ?? `No se pudo actualizar ${user.email}.`)
      return
    }
  }

  function updateUserLocal(id: string, patch: Partial<UsuarioRow>) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.active).length
  const adminUsers = users.filter((u) => u.role === "ADMIN").length

  return (
    <div className="flex flex-col gap-8">
      {/* Header with Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Administración de Equipo</h2>
          <p className="text-sm text-muted-foreground">Control de accesos y roles para la gestión ministerial.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="h-10 px-6">
                <Plus data-icon="inline-start" />
                Invitar Usuario
              </Button>
            }
          />
          <DialogContent className="w-[95vw] sm:max-w-xl bg-card p-0 overflow-y-auto max-h-[90vh]">
            <div className="p-6 sm:p-10 flex flex-col gap-8">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
                  Nuevo Usuario
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-base mt-2">
                  Ingrese las credenciales para invitar a un nuevo colaborador al sistema.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={createUser} className="flex flex-col gap-8">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
                      Datos del Colaborador
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="new-full_name"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Nombre Completo
                    </Label>
                    <Input
                      id="new-full_name"
                      placeholder="Ej: Juan Pérez"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser((s) => ({ ...s, full_name: e.target.value }))}
                      className="h-12 bg-muted border-none shadow-none rounded-xl px-5 text-base font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="new-email"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Correo Electrónico
                    </Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))}
                      className="h-12 bg-muted border-none shadow-none rounded-xl px-5 text-base font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="new-password"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Contraseña de Activación
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={newUser.password}
                      onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
                      className="h-12 bg-muted border-none shadow-none rounded-xl px-5 text-base font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="new-role"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Nivel de Acceso
                    </Label>
                    <select
                      id="new-role"
                      className="flex h-12 w-full rounded-xl border-none bg-muted px-5 py-2 text-base font-medium text-foreground focus:ring-2 focus:ring-ring outline-none transition-all appearance-none"
                      value={newUser.role}
                      onChange={(e) => setNewUser((s) => ({ ...s, role: e.target.value as UserRole }))}
                    >
                      <option value="ADMIN">ADMIN — Control del Sistema</option>
                      <option value="OPERATOR">OPERATOR — Ingreso de Datos</option>
                      <option value="VIEWER">VIEWER — Solo Lectura</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button type="submit" disabled={submitting} className="h-11 text-sm">
                    {submitting ? "Procesando..." : "Confirmar & Registrar Usuario"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-11"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card className="p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Personal Activo
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-primary">{activeUsers}</span>
            <span className="text-sm font-medium text-muted-foreground">de {totalUsers} usuarios</span>
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Administradores
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-foreground">{adminUsers}</span>
            <span className="text-sm font-medium text-muted-foreground">cuentas de control</span>
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Auditoría de Acceso
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-foreground">100%</span>
            <span className="text-sm font-medium text-primary">Trazabilidad</span>
          </div>
        </Card>
      </div>

      {error && (
        <p className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm font-medium text-destructive text-center">
          {error}
        </p>
      )}

      {/* Users Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Usuarios Registrados</h2>
          <span className="text-sm text-muted-foreground">Mostrando {users.length} integrantes</span>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Nombre &amp; Estado
                  </th>
                  <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Correo Electrónico
                  </th>
                  <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Rol de Acceso
                  </th>
                  <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Estado Cuenta
                  </th>
                  <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "size-2 rounded-full shrink-0",
                            user.active ? "bg-primary" : "bg-muted-foreground/30"
                          )}
                        />
                        <Input
                          value={user.full_name}
                          onChange={(e) => updateUserLocal(user.id, { full_name: e.target.value })}
                          className="bg-transparent border-none shadow-none p-0 h-auto text-base font-semibold text-foreground focus-visible:ring-0 w-full min-w-[150px]"
                        />
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-muted-foreground truncate max-w-[200px]">
                      {user.email}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <select
                        className="bg-muted/50 hover:bg-muted border-none rounded-full px-4 py-1.5 text-[11px] font-bold text-primary uppercase tracking-widest outline-none cursor-pointer appearance-none transition-colors focus:ring-2 focus:ring-ring"
                        value={user.role}
                        onChange={(e) =>
                          updateUserLocal(user.id, { role: e.target.value as UserRole })
                        }
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="OPERATOR">OPERATOR</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          className={cn(
                            "w-10 h-5 rounded-full p-1 transition-all duration-300",
                            user.active ? "bg-primary" : "bg-muted-foreground/20"
                          )}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={user.active}
                            onChange={(e) => updateUserLocal(user.id, { active: e.target.checked })}
                          />
                          <div
                            className={cn(
                              "size-3 rounded-full bg-white shadow-sm transition-transform duration-300",
                              user.active ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground tracking-widest">
                          {user.active ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </label>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <Button
                        size="xs"
                        onClick={() => void saveUser(user)}
                        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-full px-5"
                      >
                        Guardar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!users.length && (
            <div className="p-16 text-center">
              <p className="text-sm text-muted-foreground">
                No hay usuarios registrados en el equipo ministerial.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
