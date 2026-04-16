"use client"

import { useState, useMemo } from "react"
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
  DialogTrigger
} from "@/components/ui/dialog"
import { NativeSelect } from "@/components/ui/native-select"
import { Plus, Users, Search } from "lucide-react"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions
} from "@/components/ui/item"

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
  active: true
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function roleBadgeClass(role: UserRole) {
  if (role === "ADMIN") return "bg-primary/10 text-primary"
  if (role === "OPERATOR") return "bg-role-purple-surface text-role-purple"
  return "bg-muted text-muted-foreground"
}

function roleLabel(role: UserRole) {
  if (role === "ADMIN") return "Admin"
  if (role === "OPERATOR") return "Operador"
  return "Visor"
}

export function UsuariosManager({ initialUsers }: { initialUsers: UsuarioRow[] }) {
  const [users, setUsers] = useState<UsuarioRow[]>(initialUsers)
  const [error, setError] = useState<string | null>(null)
  const [newUser, setNewUser] = useState<NewUserForm>(defaultNewUser)
  const [submitting, setSubmitting] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  // Search
  const [search, setSearch] = useState("")

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UsuarioRow | null>(null)
  const [editDraft, setEditDraft] = useState<{
    full_name: string
    role: UserRole
    active: boolean
  }>({ full_name: "", role: "OPERATOR", active: true })

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, search])

  function openEdit(user: UsuarioRow) {
    setEditDraft({ full_name: user.full_name, role: user.role, active: user.active })
    setEditingUser(user)
    setEditOpen(true)
  }

  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
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
    setInviteOpen(false)
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingUser) return
    setSubmitting(true)
    setError(null)

    const res = await fetch(`/api/usuarios/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editDraft)
    })

    setSubmitting(false)
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { message?: string }
      setError(payload.message ?? `No se pudo actualizar ${editingUser.email}.`)
      return
    }

    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...editDraft } : u)))
    setEditOpen(false)
  }

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.active).length
  const adminUsers = users.filter((u) => u.role === "ADMIN").length

  return (
    <div className="flex flex-col gap-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card className="p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Personal Activo
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-4xl font-bold tracking-tight text-primary">
              {activeUsers}
            </span>
            <span className="text-sm font-medium text-muted-foreground">de {totalUsers}</span>
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Administradores
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-4xl font-bold tracking-tight text-foreground">
              {adminUsers}
            </span>
            <span className="text-sm font-medium text-muted-foreground">cuentas de control</span>
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Auditoría de Acceso
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-4xl font-bold tracking-tight text-foreground">
              100%
            </span>
            <span className="text-sm font-medium text-primary">Trazabilidad</span>
          </div>
        </Card>
      </div>

      {error && (
        <p className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm font-medium text-destructive text-center">
          {error}
        </p>
      )}

      {/* Search + invite */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-muted border-none rounded-xl text-sm"
          />
        </div>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger
            render={
              <Button className="h-11 px-5 shrink-0">
                <Plus data-icon="inline-start" />
                Invitar
              </Button>
            }
          />
          <DialogContent className="w-[95vw] sm:max-w-xl bg-card p-0 overflow-y-auto max-h-[90vh]">
            <div className="p-6 sm:p-10 flex flex-col gap-8">
              <DialogHeader>
                <DialogTitle className="font-heading text-3xl font-bold tracking-tight text-foreground">
                  Nuevo Usuario
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-base mt-2">
                  Ingrese las credenciales para invitar a un nuevo colaborador al sistema.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={createUser} className="flex flex-col gap-6">
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
                  <NativeSelect
                    id="new-role"
                    className="w-full"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser((s) => ({ ...s, role: e.target.value as UserRole }))
                    }
                  >
                    <option value="ADMIN">ADMIN — Control del Sistema</option>
                    <option value="OPERATOR">OPERATOR — Ingreso de Datos</option>
                    <option value="VIEWER">VIEWER — Solo Lectura</option>
                  </NativeSelect>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button type="submit" disabled={submitting} className="h-11 text-sm">
                    {submitting ? "Procesando..." : "Confirmar & Registrar Usuario"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setInviteOpen(false)}
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

      {/* Count */}
      <p className="text-sm text-muted-foreground -mt-4">
        {filtered.length} integrante{filtered.length !== 1 ? "s" : ""}
        {search && ` — filtrando por "${search}"`}
      </p>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg bg-card p-0">
          <div className="p-6 sm:p-10 flex flex-col gap-8">
            <DialogHeader>
              <DialogTitle className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Editar Usuario
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-base mt-1">
                {editingUser?.email}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={saveEdit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="edit-full_name"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Nombre Completo
                </Label>
                <Input
                  id="edit-full_name"
                  value={editDraft.full_name}
                  onChange={(e) => setEditDraft((s) => ({ ...s, full_name: e.target.value }))}
                  className="h-12 bg-muted border-none rounded-xl px-5 text-base font-medium"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="edit-role"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Nivel de Acceso
                </Label>
                <NativeSelect
                  id="edit-role"
                  className="w-full"
                  value={editDraft.role}
                  onChange={(e) =>
                    setEditDraft((s) => ({ ...s, role: e.target.value as UserRole }))
                  }
                >
                  <option value="ADMIN">ADMIN — Control del Sistema</option>
                  <option value="OPERATOR">OPERATOR — Ingreso de Datos</option>
                  <option value="VIEWER">VIEWER — Solo Lectura</option>
                </NativeSelect>
              </div>

              <label className="flex items-center justify-between rounded-xl bg-muted px-5 h-12 cursor-pointer">
                <span className="text-sm font-medium text-foreground">Cuenta activa</span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    {editDraft.active ? "Activo" : "Inactivo"}
                  </span>
                  <div
                    className={cn(
                      "w-10 h-5 rounded-full p-0.5 transition-all duration-300 flex items-center",
                      editDraft.active ? "bg-primary" : "bg-muted-foreground/20"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={editDraft.active}
                      onChange={(e) => setEditDraft((s) => ({ ...s, active: e.target.checked }))}
                    />
                    <div
                      className={cn(
                        "size-4 rounded-full bg-white shadow-sm transition-transform duration-300",
                        editDraft.active ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </div>
                </div>
              </label>

              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Button type="submit" disabled={submitting} className="h-11">
                  {submitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="h-11"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* User list */}
      {users.length === 0 ? (
        <Card className="p-0 overflow-hidden">
          <Empty className="border-0 py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Sin usuarios</EmptyTitle>
              <EmptyDescription>
                No hay usuarios registrados en el equipo ministerial.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Card>
      ) : filtered.length === 0 ? (
        <Empty className="border-dashed py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>Sin resultados</EmptyTitle>
            <EmptyDescription>No hay usuarios que coincidan con la búsqueda.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup>
          {filtered.map((user) => (
            <Item key={user.id} variant="outline" className={cn(!user.active && "opacity-55")}>
              <div
                className={cn(
                  "size-10 rounded-full flex items-center justify-center shrink-0",
                  user.active ? "bg-primary/10" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-bold",
                    user.active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {getInitials(user.full_name || "?")}
                </span>
              </div>
              <ItemContent>
                <ItemTitle>{user.full_name}</ItemTitle>
                <ItemDescription>{user.email}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <span
                  className={cn(
                    "hidden sm:inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest",
                    roleBadgeClass(user.role)
                  )}
                >
                  {roleLabel(user.role)}
                </span>
                <div
                  className={cn(
                    "size-2 rounded-full shrink-0",
                    user.active ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => openEdit(user)}
                  className="rounded-full px-4"
                >
                  Editar
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
    </div>
  )
}
