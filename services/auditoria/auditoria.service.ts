import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type LogSystemInput = {
  entity: string;
  action: string;
  user_id: string;
  entity_id?: string | null;
  previous_value?: unknown;
  new_value?: unknown;
  note?: string | null;
};

type LogMovementInput = {
  movement_id: string;
  action: "CREATED" | "EDITED" | "CANCELLED" | "PDF_REGENERATED" | "NOTIFICATION_SENT" | "NOTIFICATION_ERROR";
  user_id: string;
  previous_value?: unknown;
  new_value?: unknown;
  note?: string | null;
};

export const auditoriaService = {
  async logSystem(input: LogSystemInput) {
    const admin = createSupabaseAdminClient();
    return admin.from("system_audit_log").insert({
      entity: input.entity,
      action: input.action,
      entity_id: input.entity_id ?? null,
      user_id: input.user_id,
      previous_value: (input.previous_value ?? null) as Parameters<typeof admin.from>[0] extends never ? never : unknown,
      new_value: (input.new_value ?? null) as Parameters<typeof admin.from>[0] extends never ? never : unknown,
      note: input.note ?? null,
    });
  },

  async logMovement(input: LogMovementInput) {
    const admin = createSupabaseAdminClient();
    return admin.from("movement_audit_log").insert({
      movement_id: input.movement_id,
      action: input.action,
      user_id: input.user_id,
      previous_value: (input.previous_value ?? null) as Parameters<typeof admin.from>[0] extends never ? never : unknown,
      new_value: (input.new_value ?? null) as Parameters<typeof admin.from>[0] extends never ? never : unknown,
      note: input.note ?? null,
    });
  },

  async listSystem(limit = 80) {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("system_audit_log")
      .select("*, users(id, full_name, email, role)")
      .order("event_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};
