"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, Users, ChevronDown, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { Item, ItemGroup, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item"
import { formatDate } from "@/lib/utils"

type Ministry = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

export function MinistriesClient({ initialMinistries }: { initialMinistries: Ministry[] }) {
  const [ministries, setMinistries] = useState<Ministry[]>(initialMinistries)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/ministerios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined })
      })
      if (!res.ok) throw new Error((await res.json()).message)
      const created = await res.json()
      setMinistries((prev) => [created, ...prev])
      setName("")
      setDescription("")
      setOpen(false)
      toast.success("Ministerio creado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear ministerio")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ministerios</h1>
          <p className="text-sm text-muted-foreground">Gestiona los ministerios y sus ministros asignados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm"><Plus className="size-4" />Nuevo ministerio</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo ministerio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ministerio de Jóvenes"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creando..." : "Crear ministerio"}
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
            <MinistryItem key={m.id} ministry={m} />
          ))}
        </ItemGroup>
      )}
    </div>
  )
}

function MinistryItem({ ministry }: { ministry: Ministry }) {
  const [expanded, setExpanded] = useState(false)
  const [userId, setUserId] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [assignments, setAssignments] = useState<AssignmentRow[] | null>(null)
  const [loadingAssignments, setLoadingAssignments] = useState(false)

  type AssignmentRow = {
    id: string
    user_id: string
    assigned_at: string
    unassigned_at: string | null
    users: { id: string; full_name: string; email: string } | null
  }

  async function loadAssignments() {
    setLoadingAssignments(true)
    try {
      const res = await fetch(`/api/ministerios/${ministry.id}/asignaciones`)
      if (!res.ok) return
      setAssignments(await res.json())
    } finally {
      setLoadingAssignments(false)
    }
  }

  async function handleToggle() {
    const next = !expanded
    setExpanded(next)
    if (next && assignments === null) loadAssignments()
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!userId.trim()) return
    setAssigning(true)
    try {
      const res = await fetch(`/api/ministerios/${ministry.id}/asignaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId.trim() })
      })
      if (!res.ok) throw new Error((await res.json()).message)
      toast.success("Ministro asignado")
      setUserId("")
      loadAssignments()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al asignar")
    } finally {
      setAssigning(false)
    }
  }

  return (
    <Item>
      <ItemContent>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ItemTitle>{ministry.name}</ItemTitle>
            {ministry.description && (
              <ItemDescription>{ministry.description}</ItemDescription>
            )}
          </div>
          {!ministry.is_active && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Inactivo</span>
          )}
        </div>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="sm" onClick={handleToggle}>
          <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          Asignaciones
        </Button>
      </ItemActions>
      {expanded && (
        <div className="col-span-full border-t px-4 py-3 space-y-3 bg-muted/30">
          <form onSubmit={handleAssign} className="flex gap-2">
            <Input
              placeholder="ID del usuario"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button size="sm" type="submit" disabled={assigning}>
              <UserPlus className="size-4" />
              Asignar
            </Button>
          </form>
          {loadingAssignments && <p className="text-xs text-muted-foreground">Cargando...</p>}
          {assignments && assignments.length === 0 && (
            <p className="text-xs text-muted-foreground">Sin asignaciones históricas</p>
          )}
          {assignments && assignments.length > 0 && (
            <div className="space-y-1">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm py-1">
                  <div>
                    <span className="font-medium">{a.users?.full_name ?? a.user_id}</span>
                    <span className="text-muted-foreground ml-2">{a.users?.email}</span>
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
      )}
    </Item>
  )
}
