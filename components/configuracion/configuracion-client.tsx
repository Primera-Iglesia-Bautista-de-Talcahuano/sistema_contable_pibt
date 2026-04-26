"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AppSettings } from "@/services/settings/settings.service"

export function ConfiguracionClient({ initialSettings }: { initialSettings: AppSettings }) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)

  function handleChange(key: keyof AppSettings, value: string) {
    setSettings((prev) => ({
      ...prev,
      [key]: ["reminder_interval_days", "budget_period_start_month"].includes(key)
        ? parseInt(value, 10) || prev[key]
        : value
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/configuracion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })
      if (!res.ok) throw new Error((await res.json()).message)
      toast.success("Configuración guardada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground">Ajustes del flujo de aprobación de presupuesto</p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="tesoreria-email">Email de notificación — Tesorería</Label>
            <Input
              id="tesoreria-email"
              type="email"
              value={settings.tesoreria_notification_email}
              onChange={(e) => handleChange("tesoreria_notification_email", e.target.value)}
              placeholder="tesoreria@pibtalcahuano.com"
            />
            <p className="text-xs text-muted-foreground">
              Recibe alertas de nuevas solicitudes y recordatorios de pendientes.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="voucher-email">Email de comprobante — Ministros</Label>
            <Input
              id="voucher-email"
              type="email"
              value={settings.voucher_email}
              onChange={(e) => handleChange("voucher_email", e.target.value)}
              placeholder="notificaciones@pibtalcahuano.com"
            />
            <p className="text-xs text-muted-foreground">
              Si está vacío, los correos se envían al email registrado de cada ministro.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reminder-days">Intervalo de recordatorios (días)</Label>
            <Input
              id="reminder-days"
              type="number"
              min={1}
              max={30}
              value={settings.reminder_interval_days}
              onChange={(e) => handleChange("reminder_interval_days", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Si una solicitud lleva este número de días sin respuesta, se envía un recordatorio a tesorería.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="start-month">Mes de inicio del período presupuestario</Label>
            <Input
              id="start-month"
              type="number"
              min={1}
              max={12}
              value={settings.budget_period_start_month}
              onChange={(e) => handleChange("budget_period_start_month", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              1 = Enero, 5 = Mayo, 12 = Diciembre. Valor por defecto: 5 (mayo).
            </p>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Guardando..." : "Guardar configuración"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
