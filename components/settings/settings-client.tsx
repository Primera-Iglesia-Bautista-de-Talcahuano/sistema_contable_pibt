"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { updateSettingsSchema } from "@/lib/validators/settings"
import type { UpdateSettingsInput } from "@/lib/validators/settings"
import type { AppSettings } from "@/services/settings/settings.service"
import { updateSettings } from "@/app/actions/settings"

export function SettingsClient({ initialSettings }: { initialSettings: AppSettings }) {
  const form = useForm<z.input<typeof updateSettingsSchema>, unknown, UpdateSettingsInput>({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues: {
      tesoreria_notification_email: initialSettings.tesoreria_notification_email,
      voucher_email: initialSettings.voucher_email,
      budget_notification_email: initialSettings.budget_notification_email,
      reminder_interval_days: String(initialSettings.reminder_interval_days),
      budget_period_start_month: String(initialSettings.budget_period_start_month)
    }
  })

  async function handleSave(values: UpdateSettingsInput) {
    try {
      await updateSettings(values)
      toast.success("Configuración guardada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar")
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Ajustes del flujo de aprobación de presupuesto
        </p>
      </div>

      <Card className="p-5">
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5">
          <Field>
            <FieldLabel htmlFor="tesoreria-email">Email de notificación — Tesorería</FieldLabel>
            <Input
              id="tesoreria-email"
              type="email"
              placeholder="tesoreria@pibtalcahuano.com"
              {...form.register("tesoreria_notification_email")}
            />
            <p className="text-xs text-muted-foreground">
              Recibe alertas de nuevas solicitudes y recordatorios de pendientes.
            </p>
            <FieldError errors={[form.formState.errors.tesoreria_notification_email]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="budget-email">Email notificaciones — Cambios de presupuesto</FieldLabel>
            <Input
              id="budget-email"
              type="email"
              placeholder="finanzas@pibtalcahuano.com"
              {...form.register("budget_notification_email")}
            />
            <p className="text-xs text-muted-foreground">
              Recibe un correo cada vez que se agrega, modifica o elimina un ítem en un presupuesto
              aprobado. Si está vacío, se usa el email de Tesorería.
            </p>
            <FieldError errors={[form.formState.errors.budget_notification_email]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="voucher-email">Email de comprobante — Ministros</FieldLabel>
            <Input
              id="voucher-email"
              type="email"
              placeholder="notificaciones@pibtalcahuano.com"
              {...form.register("voucher_email")}
            />
            <p className="text-xs text-muted-foreground">
              Si está vacío, los correos se envían al email registrado de cada ministro.
            </p>
            <FieldError errors={[form.formState.errors.voucher_email]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="reminder-days">Intervalo de recordatorios (días)</FieldLabel>
            <Input
              id="reminder-days"
              type="number"
              min={1}
              max={30}
              {...form.register("reminder_interval_days")}
            />
            <p className="text-xs text-muted-foreground">
              Si una solicitud lleva este número de días sin respuesta, se envía un recordatorio a
              tesorería.
            </p>
            <FieldError errors={[form.formState.errors.reminder_interval_days]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="start-month">Mes de inicio del período presupuestario</FieldLabel>
            <Input
              id="start-month"
              type="number"
              min={1}
              max={12}
              {...form.register("budget_period_start_month")}
            />
            <p className="text-xs text-muted-foreground">
              1 = Enero, 5 = Mayo, 12 = Diciembre. Valor por defecto: 5 (mayo).
            </p>
            <FieldError errors={[form.formState.errors.budget_period_start_month]} />
          </Field>

          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
            {form.formState.isSubmitting ? "Guardando..." : "Guardar configuración"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
