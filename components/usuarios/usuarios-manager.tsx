"use client"

import { useState, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Plus, Users, Search, RotateCcw, Trash2, Send } from "lucide-react"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions
} from "@/components/ui/item"
import { createUsuarioSchema, updateUsuarioSchema } from "@/lib/validators/usuario"
import type { CreateUsuarioInput, UpdateUsuarioInput } from "@/lib/validators/usuario"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING_ACTIVATION" | "PENDING_RESET"

type UsuarioRow = {
  id: string
  full_name: string
  email: string
  role: UserRole
  status: UserStatus
  created_at: string | Date
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

type StatusMeta = {
  label: string
  badgeClass: string | null
  rowOpacity: boolean
}

function statusMeta(status: UserStatus): StatusMeta {
  switch (status) {
    case "ACTIVE":
      return { label: "Activo", badgeClass: null, rowOpacity: false }
    case "INACTIVE":
      return {
        label: "Inactivo",
        badgeClass: "bg-muted text-muted-foreground border border-border",
        rowOpacity: true
      }
    case "PENDING_ACTIVATION":
      return {
        label: "Sin activar",
        badgeClass:
          "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
        rowOpacity: false
      }
    case "PENDING_RESET":
      return {
        label: "Reset pendiente",
        badgeClass:
          "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
        rowOpacity: false
      }
  }
}

export function UsuariosManager({ initialUsers }: { initialUsers: UsuarioRow[] }) {
  const [users, setUsers] = useState<UsuarioRow[]>(initialUsers)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UsuarioRow | null>(null)
  const [deletingUser, setDeletingUser] = useState<UsuarioRow | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, search])

  // ── Create form ──────────────────────────────────────────────────────────────
  const createForm = useForm<CreateUsuarioInput>({
    resolver: zodResolver(createUsuarioSchema),
    defaultValues: { full_name: "", email: "", role: "OPERATOR" }
  })

  const selectedRole = useWatch({ control: createForm.control, name: "role" })

  const handleCreate = async (values: CreateUsuarioInput) => {
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      toast.error(data.message ?? "No se pudo crear el usuario.")
      return
    }
    const created = (await res.json()) as UsuarioRow
    setUsers((prev) => [...prev, created])
    createForm.reset()
    setCreateOpen(false)
    toast.success("Invitación enviada", { description: `Se envió el correo a ${created.email}` })
  }

  // ── Edit form ─────────────────────────────────────────────────────────────────
  const editForm = useForm<UpdateUsuarioInput>({
    resolver: zodResolver(updateUsuarioSchema)
  })

  function openEdit(user: UsuarioRow) {
    setEditingUser(user)
    editForm.reset({
      id: user.id,
      full_name: user.full_name,
      role: user.role,
      status: user.status
    })
  }

  const handleUpdate = async (values: UpdateUsuarioInput) => {
    const res = await fetch(`/api/usuarios/${values.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      toast.error(data.message ?? "No se pudo actualizar el usuario.")
      return
    }
    const updated = (await res.json()) as UsuarioRow
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)))
    setEditingUser(null)
    toast.success("Usuario actualizado")
  }

  // ── Delete account ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingUser) return
    setDeleteLoading(true)
    const res = await fetch(`/api/usuarios/${deletingUser.id}`, { method: "DELETE" })
    setDeleteLoading(false)
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      toast.error(data.message ?? "No se pudo eliminar el usuario.")
      setDeletingUser(null)
      return
    }
    const name = deletingUser.full_name
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id))
    setDeletingUser(null)
    toast.success("Usuario eliminado", { description: name })
  }

  // ── Resend invite ─────────────────────────────────────────────────────────────
  const handleResendInvite = async (userId: string) => {
    const res = await fetch(`/api/usuarios/${userId}/resend-invite`, { method: "POST" })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      toast.error(data.message ?? "No se pudo reenviar la invitación.")
      return
    }
    toast.success("Invitación reenviada", {
      description: "Se envió un nuevo enlace de activación al correo del usuario."
    })
  }

  // ── Reset account ─────────────────────────────────────────────────────────────
  const handleReset = async (userId: string) => {
    const res = await fetch(`/api/usuarios/${userId}/reset`, { method: "POST" })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      toast.error(data.message ?? "No se pudo resetear la cuenta.")
      return
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "PENDING_RESET" as UserStatus } : u))
    )
    toast.success("Correo de restablecimiento enviado")
  }

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === "ACTIVE").length
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

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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
                  Invitar Usuario
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-base mt-2">
                  Se enviará un correo de activación. El usuario establecerá su propia contraseña.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={createForm.handleSubmit(handleCreate)}
                className="flex flex-col gap-6"
              >
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
                    aria-invalid={!!createForm.formState.errors.full_name}
                    className="h-12 bg-muted border-none shadow-none rounded-xl px-5 text-base font-medium"
                    {...createForm.register("full_name")}
                  />
                  {createForm.formState.errors.full_name && (
                    <p className="text-xs text-destructive ml-1">
                      {createForm.formState.errors.full_name.message}
                    </p>
                  )}
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
                    aria-invalid={!!createForm.formState.errors.email}
                    className="h-12 bg-muted border-none shadow-none rounded-xl px-5 text-base font-medium"
                    {...createForm.register("email")}
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-xs text-destructive ml-1">
                      {createForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="new-role"
                    className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                  >
                    Nivel de Acceso
                  </Label>
                  <NativeSelect id="new-role" className="w-full" {...createForm.register("role")}>
                    <option value="ADMIN">ADMIN — Control del Sistema</option>
                    <option value="OPERATOR">OPERATOR — Ingreso de Datos</option>
                    <option value="VIEWER">VIEWER — Solo Lectura</option>
                  </NativeSelect>
                </div>

                {selectedRole === "ADMIN" && (
                  <Alert variant="warning">
                    <AlertTitle>Acceso total al sistema</AlertTitle>
                    <AlertDescription>
                      Puede invitar y eliminar usuarios, ver todos los movimientos, crear y anular
                      registros contables, y acceder a los reportes. Asigna este rol solo a personas
                      de plena confianza.
                    </AlertDescription>
                  </Alert>
                )}
                {selectedRole === "OPERATOR" && (
                  <Alert variant="info">
                    <AlertTitle>Ingreso y gestión de movimientos</AlertTitle>
                    <AlertDescription>
                      Puede crear, editar y anular movimientos contables. No puede gestionar
                      usuarios ni acceder a configuraciones del sistema.
                    </AlertDescription>
                  </Alert>
                )}
                {selectedRole === "VIEWER" && (
                  <Alert variant="info">
                    <AlertTitle>Solo lectura</AlertTitle>
                    <AlertDescription>
                      Puede consultar movimientos y reportes, pero no puede crear, editar ni anular
                      ningún registro. Ideal para revisores o auditores externos.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button
                    type="submit"
                    disabled={createForm.formState.isSubmitting}
                    className="h-11 text-sm"
                  >
                    {createForm.formState.isSubmitting
                      ? "Enviando invitación..."
                      : "Enviar Invitación"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setCreateOpen(false)}
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
      <Dialog
        open={!!editingUser}
        onOpenChange={(o) => {
          if (!o) setEditingUser(null)
        }}
      >
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

            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="edit-full_name"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Nombre Completo
                </Label>
                <Input
                  id="edit-full_name"
                  aria-invalid={!!editForm.formState.errors.full_name}
                  className="h-12 bg-muted border-none rounded-xl px-5 text-base font-medium"
                  {...editForm.register("full_name")}
                />
                {editForm.formState.errors.full_name && (
                  <p className="text-xs text-destructive ml-1">
                    {editForm.formState.errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="edit-role"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Nivel de Acceso
                </Label>
                <NativeSelect id="edit-role" className="w-full" {...editForm.register("role")}>
                  <option value="ADMIN">ADMIN — Control del Sistema</option>
                  <option value="OPERATOR">OPERATOR — Ingreso de Datos</option>
                  <option value="VIEWER">VIEWER — Solo Lectura</option>
                </NativeSelect>
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="edit-status"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Estado de Cuenta
                </Label>
                <NativeSelect id="edit-status" className="w-full" {...editForm.register("status")}>
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                </NativeSelect>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Button type="submit" disabled={editForm.formState.isSubmitting} className="h-11">
                  {editForm.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="h-11"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deletingUser}
        onOpenChange={(o) => {
          if (!o) setDeletingUser(null)
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-sm bg-card p-0">
          <div className="p-6 sm:p-8 flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl font-bold text-foreground">
                Eliminar usuario
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mt-1">
                ¿Eliminar a <strong>{deletingUser?.full_name}</strong> ({deletingUser?.email})? Esta
                acción no se puede deshacer. Se cancelará cualquier invitación pendiente.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Button
                variant="destructive"
                className="h-10"
                disabled={deleteLoading}
                onClick={() => void handleDelete()}
              >
                {deleteLoading ? "Eliminando..." : "Sí, eliminar"}
              </Button>
              <Button variant="outline" className="h-10" onClick={() => setDeletingUser(null)}>
                Cancelar
              </Button>
            </div>
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
          {filtered.map((user) => {
            const meta = statusMeta(user.status)
            const isActive = user.status === "ACTIVE"
            return (
              <Item key={user.id} variant="outline" className={cn(meta.rowOpacity && "opacity-55")}>
                <div
                  className={cn(
                    "size-10 rounded-full flex items-center justify-center shrink-0",
                    isActive ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-bold",
                      isActive ? "text-primary" : "text-muted-foreground"
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
                  {meta.badgeClass && (
                    <span
                      className={cn(
                        "hidden sm:inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        meta.badgeClass
                      )}
                    >
                      {meta.label}
                    </span>
                  )}
                  {user.status === "PENDING_ACTIVATION" && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => void handleResendInvite(user.id)}
                      title="Reenviar invitación"
                      className="rounded-full px-2"
                    >
                      <Send className="size-3.5" />
                    </Button>
                  )}
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => void handleReset(user.id)}
                    title="Resetear contraseña"
                    className="rounded-full px-2"
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setDeletingUser(user)}
                    title="Eliminar usuario"
                    className="rounded-full px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
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
            )
          })}
        </ItemGroup>
      )}
    </div>
  )
}
