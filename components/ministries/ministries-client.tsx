"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Users, ChevronDown, UserPlus, UserMinus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions
} from "@/components/ui/item"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { formatDate } from "@/lib/utils"
import {
  createMinistrySchema,
  updateMinistrySchema,
  assignMinisterSchema
} from "@/lib/validators/ministry"
import type {
  CreateMinistryInput,
  UpdateMinistryInput,
  AssignMinisterInput
} from "@/lib/validators/ministry"
import {
  createMinistry,
  getMinistryAssignments,
  assignMinister,
  unassignMinister,
  updateMinistry
} from "@/app/actions/ministries"

type Ministry = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

type MinistryUser = {
  id: string
  full_name: string
  email: string
  role: string
}

type CurrentAssignment = {
  id: string
  ministry_id: string
  user_id: string
  assigned_at: string
  users: { id: string; full_name: string; email: string } | null
}

type Props = {
  initialMinistries: Ministry[]
  users: MinistryUser[]
  initialCurrentAssignments: CurrentAssignment[]
}

export function MinistriesClient({ initialMinistries, users, initialCurrentAssignments }: Props) {
  const [ministries, setMinistries] = useState<Ministry[]>(initialMinistries)
  const [currentAssignments, setCurrentAssignments] =
    useState<CurrentAssignment[]>(initialCurrentAssignments)
  const [open, setOpen] = useState(false)

  const form = useForm<CreateMinistryInput>({
    resolver: zodResolver(createMinistrySchema),
    defaultValues: { name: "", description: "" }
  })

  function getAssignment(ministryId: string) {
    return currentAssignments.find((a) => a.ministry_id === ministryId) ?? null
  }

  function updateAssignment(assignment: CurrentAssignment | null, ministryId: string) {
    setCurrentAssignments((prev) => {
      const filtered = prev.filter((a) => a.ministry_id !== ministryId)
      return assignment ? [assignment, ...filtered] : filtered
    })
  }

  async function handleCreate(values: CreateMinistryInput) {
    try {
      const created = await createMinistry({
        name: values.name.trim(),
        description: values.description?.trim() || undefined
      })
      setMinistries((prev) => [created as unknown as Ministry, ...prev])
      form.reset()
      setOpen(false)
      toast.success("Ministerio creado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear ministerio")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ministerios</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los ministerios y sus ministros asignados
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) form.reset()
          }}
        >
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="size-4" />
                Nuevo ministerio
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo ministerio</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4 pt-2">
              <Field>
                <FieldLabel htmlFor="name">Nombre *</FieldLabel>
                <Input id="name" placeholder="Ministerio de Jóvenes" {...form.register("name")} />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Descripción</FieldLabel>
                <Input
                  id="description"
                  placeholder="Descripción opcional"
                  {...form.register("description")}
                />
                <FieldError errors={[form.formState.errors.description]} />
              </Field>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creando..." : "Crear ministerio"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {ministries.length === 0 ? (
        <Empty>
          <EmptyMedia>
            <Users className="size-10 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Sin ministerios</EmptyTitle>
            <EmptyDescription>Crea el primer ministerio para comenzar.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup>
          {ministries.map((m) => (
            <MinistryItem
              key={m.id}
              ministry={m}
              currentAssignment={getAssignment(m.id)}
              users={users}
              onMinistryUpdated={(updated) =>
                setMinistries((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
              }
              onAssignmentChanged={(assignment) => updateAssignment(assignment, m.id)}
            />
          ))}
        </ItemGroup>
      )}
    </div>
  )
}

type AssignmentRow = {
  id: string
  user_id: string
  assigned_at: string
  unassigned_at: string | null
  users: { id: string; full_name: string; email: string } | null
}

type MinistryItemProps = {
  ministry: Ministry
  currentAssignment: CurrentAssignment | null
  users: MinistryUser[]
  onMinistryUpdated: (m: Ministry) => void
  onAssignmentChanged: (a: CurrentAssignment | null) => void
}

function MinistryItem({
  ministry,
  currentAssignment,
  users,
  onMinistryUpdated,
  onAssignmentChanged
}: MinistryItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [history, setHistory] = useState<AssignmentRow[] | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const assignForm = useForm<AssignMinisterInput>({
    resolver: zodResolver(assignMinisterSchema),
    defaultValues: { user_id: "", notes: "" }
  })

  const editForm = useForm<UpdateMinistryInput>({
    resolver: zodResolver(updateMinistrySchema),
    defaultValues: {
      name: ministry.name,
      description: ministry.description ?? "",
      is_active: ministry.is_active
    }
  })

  async function loadHistory() {
    setLoadingHistory(true)
    try {
      const data = await getMinistryAssignments(ministry.id)
      setHistory(data as unknown as AssignmentRow[])
    } catch {
      // silently fail
    } finally {
      setLoadingHistory(false)
    }
  }

  async function handleToggle() {
    const next = !expanded
    setExpanded(next)
    if (next && history === null) loadHistory()
  }

  async function handleAssign(values: AssignMinisterInput) {
    try {
      const result = await assignMinister(ministry.id, {
        user_id: values.user_id,
        notes: values.notes?.trim() || undefined
      })
      const assignedUser = users.find((u) => u.id === values.user_id)
      onAssignmentChanged({
        id: (result as { id: string }).id,
        ministry_id: ministry.id,
        user_id: values.user_id,
        assigned_at: new Date().toISOString(),
        users: assignedUser
          ? { id: assignedUser.id, full_name: assignedUser.full_name, email: assignedUser.email }
          : null
      })
      assignForm.reset()
      setHistory(null)
      toast.success("Ministro asignado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al asignar")
    }
  }

  async function handleUnassign() {
    try {
      await unassignMinister(ministry.id)
      onAssignmentChanged(null)
      setHistory(null)
      toast.success("Ministro desasignado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al desasignar")
    }
  }

  async function handleEdit(values: UpdateMinistryInput) {
    try {
      const updated = await updateMinistry(ministry.id, {
        name: values.name?.trim(),
        description: values.description?.trim() || undefined,
        is_active: values.is_active
      })
      onMinistryUpdated(updated as unknown as Ministry)
      setEditOpen(false)
      toast.success("Ministerio actualizado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar")
    }
  }

  const availableUsers = users.filter((u) => u.id !== currentAssignment?.user_id)

  return (
    <Item>
      <ItemContent>
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <ItemTitle>{ministry.name}</ItemTitle>
            {ministry.description && <ItemDescription>{ministry.description}</ItemDescription>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {currentAssignment?.users ? (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {currentAssignment.users.full_name}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Sin ministro
              </span>
            )}
            {!ministry.is_active && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                Inactivo
              </span>
            )}
          </div>
        </div>
      </ItemContent>
      <ItemActions>
        <Dialog
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o)
            if (!o)
              editForm.reset({
                name: ministry.name,
                description: ministry.description ?? "",
                is_active: ministry.is_active
              })
          }}
        >
          <DialogTrigger
            render={
              <Button variant="ghost" size="sm">
                <Pencil className="size-4" />
                Editar
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar ministerio</DialogTitle>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4 pt-2">
              <Field>
                <FieldLabel htmlFor="edit-name">Nombre *</FieldLabel>
                <Input id="edit-name" {...editForm.register("name")} />
                <FieldError errors={[editForm.formState.errors.name]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-description">Descripción</FieldLabel>
                <Input id="edit-description" {...editForm.register("description")} />
                <FieldError errors={[editForm.formState.errors.description]} />
              </Field>
              <Field>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...editForm.register("is_active")} className="size-4" />
                  Ministerio activo
                </label>
              </Field>
              <Button
                type="submit"
                className="w-full"
                disabled={editForm.formState.isSubmitting}
              >
                {editForm.formState.isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Button variant="ghost" size="sm" onClick={handleToggle}>
          <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          Historial
        </Button>
      </ItemActions>

      {expanded && (
        <div className="col-span-full border-t bg-muted/30">
          <div className="px-4 py-4 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ministro actual
              </p>
              {currentAssignment?.users ? (
                <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{currentAssignment.users.full_name}</p>
                    <p className="text-xs text-muted-foreground">{currentAssignment.users.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Desde {formatDate(currentAssignment.assigned_at)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUnassign}
                      className="text-destructive hover:text-destructive"
                    >
                      <UserMinus className="size-4" />
                      Desasignar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin ministro asignado</p>
              )}
            </div>

            <form onSubmit={assignForm.handleSubmit(handleAssign)} className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {currentAssignment ? "Cambiar ministro" : "Asignar ministro"}
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <NativeSelect
                    className="w-full"
                    {...assignForm.register("user_id")}
                    defaultValue=""
                  >
                    <NativeSelectOption value="" disabled>
                      Seleccionar usuario…
                    </NativeSelectOption>
                    {availableUsers.map((u) => (
                      <NativeSelectOption key={u.id} value={u.id}>
                        {u.full_name} — {u.email}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldError errors={[assignForm.formState.errors.user_id]} />
                </div>
                <Button size="sm" type="submit" disabled={assignForm.formState.isSubmitting}>
                  <UserPlus className="size-4" />
                  Asignar
                </Button>
              </div>
              <Input
                placeholder="Notas opcionales"
                className="text-sm"
                {...assignForm.register("notes")}
              />
            </form>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Historial de asignaciones
              </p>
              {loadingHistory && <p className="text-xs text-muted-foreground">Cargando...</p>}
              {!loadingHistory && history && history.length === 0 && (
                <p className="text-xs text-muted-foreground">Sin asignaciones históricas</p>
              )}
              {history && history.length > 0 && (
                <div className="space-y-1">
                  {history.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                    >
                      <div>
                        <span className="font-medium">{a.users?.full_name ?? a.user_id}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {a.users?.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {a.unassigned_at ? (
                          <span>Hasta {formatDate(a.unassigned_at)}</span>
                        ) : (
                          <span className="text-green-600 font-medium">Activo</span>
                        )}
                        <span>Desde {formatDate(a.assigned_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Item>
  )
}
