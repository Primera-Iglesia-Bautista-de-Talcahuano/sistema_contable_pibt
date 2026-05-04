"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Users, ChevronRight } from "lucide-react"
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
import { createMinistrySchema } from "@/lib/validators/ministry"
import { createMinistry, assignMinister } from "@/app/actions/ministries"
import { z } from "zod"

const createMinistryFormSchema = createMinistrySchema.extend({
  minister_id: z.string().optional()
})
type CreateMinistryForm = z.infer<typeof createMinistryFormSchema>

type Ministry = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

type CurrentAssignment = {
  ministry_id: string
  users: { full_name: string } | null
}

type Minister = {
  id: string
  full_name: string
  email: string
}

type Props = {
  initialMinistries: Ministry[]
  initialCurrentAssignments: CurrentAssignment[]
  ministers: Minister[]
}

export function MinistriesClient({ initialMinistries, initialCurrentAssignments, ministers }: Props) {
  const [ministries, setMinistries] = useState<Ministry[]>(initialMinistries)
  const [currentAssignments, setCurrentAssignments] =
    useState<CurrentAssignment[]>(initialCurrentAssignments)
  const [open, setOpen] = useState(false)

  const form = useForm<CreateMinistryForm>({
    resolver: zodResolver(createMinistryFormSchema),
    defaultValues: { name: "", description: "", minister_id: "" }
  })

  function getMinister(ministryId: string) {
    return currentAssignments.find((a) => a.ministry_id === ministryId)?.users ?? null
  }

  async function handleCreate(values: CreateMinistryForm) {
    try {
      const created = await createMinistry({
        name: values.name.trim(),
        description: values.description?.trim() || undefined
      })
      const newMinistry = created as unknown as Ministry

      if (values.minister_id) {
        await assignMinister(newMinistry.id, { user_id: values.minister_id })
        const selectedMinister = ministers.find((u) => u.id === values.minister_id)
        setCurrentAssignments((prev) => [
          ...prev,
          { ministry_id: newMinistry.id, users: selectedMinister ?? null }
        ])
      }

      setMinistries((prev) => [newMinistry, ...prev])
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
              <Field>
                <FieldLabel htmlFor="minister_id">Ministro</FieldLabel>
                <NativeSelect
                  id="minister_id"
                  className="w-full"
                  {...form.register("minister_id")}
                  defaultValue=""
                >
                  <NativeSelectOption value="">Sin asignar</NativeSelectOption>
                  {ministers.map((u) => (
                    <NativeSelectOption key={u.id} value={u.id}>
                      {u.full_name} — {u.email}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {ministers.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No hay usuarios con rol ministro.{" "}
                    <a href="/users" className="underline underline-offset-2">
                      Crear uno
                    </a>
                  </p>
                )}
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
          {ministries.map((m) => {
            const minister = getMinister(m.id)
            return (
              <Item key={m.id} variant="outline" render={<Link href={`/ministries/${m.id}`} />}>
                <ItemContent>
                  <div className="flex items-center gap-2">
                    <ItemTitle>{m.name}</ItemTitle>
                    {!m.is_active && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {m.description && <ItemDescription>{m.description}</ItemDescription>}
                </ItemContent>
                <ItemActions>
                  {minister ? (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {minister.full_name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin ministro</span>
                  )}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </ItemActions>
              </Item>
            )
          })}
        </ItemGroup>
      )}
    </div>
  )
}
