import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { auditService } from "@/services/audit/audit.service"
import type { UpdateSettingsInput } from "@/lib/validators/settings"

export type AppSettings = {
  tesoreria_notification_email: string
  voucher_email: string
  reminder_interval_days: number
  budget_period_start_month: number
}

export const settingsService = {
  async getAll(): Promise<AppSettings> {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin.from("app_settings").select("key, value")
    if (error) throw error

    const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]))
    return {
      tesoreria_notification_email: map["tesoreria_notification_email"] ?? "",
      voucher_email: map["voucher_email"] ?? "",
      reminder_interval_days: parseInt(map["reminder_interval_days"] ?? "2", 10),
      budget_period_start_month: parseInt(map["budget_period_start_month"] ?? "5", 10)
    }
  },

  async update(input: UpdateSettingsInput, userId: string) {
    const admin = createSupabaseAdminClient()
    const now = new Date().toISOString()

    const entries = Object.entries(input).filter(([, v]) => v !== undefined) as [
      string,
      string | number
    ][]

    for (const [key, value] of entries) {
      await admin
        .from("app_settings")
        .update({ value: String(value), updated_by: userId, updated_at: now })
        .eq("key", key)
    }

    await auditService.logSystem({
      entity: "APP_SETTINGS",
      action: "SETTINGS_UPDATED",
      user_id: userId,
      new_value: input
    })

    return this.getAll()
  }
}
