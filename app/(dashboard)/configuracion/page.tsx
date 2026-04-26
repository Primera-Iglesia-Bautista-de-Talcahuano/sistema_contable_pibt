import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageSettings } from "@/lib/permissions/rbac"
import { settingsService } from "@/services/settings/settings.service"
import { ConfiguracionClient } from "@/components/configuracion/configuracion-client"

export default async function ConfiguracionPage() {
  const user = await getCurrentUser()
  if (!user || !canManageSettings(user.role)) redirect("/dashboard")

  const settings = await settingsService.getAll()
  return <ConfiguracionClient initialSettings={settings} />
}
