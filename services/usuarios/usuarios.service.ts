import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { auditoriaService } from "@/services/auditoria/auditoria.service";
import type { CreateUsuarioInput, UpdateUsuarioInput } from "@/lib/validators/usuario";

export const usuariosService = {
  async list() {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("users")
      .select("id, full_name, role, active, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Merge email from auth.users
    const { data: authUsers } = await admin.auth.admin.listUsers();
    const emailMap = new Map(authUsers.users.map((u) => [u.id, u.email ?? ""]));

    return data.map((u) => ({ ...u, email: emailMap.get(u.id) ?? "" }));
  },

  async create(input: CreateUsuarioInput, actingUserId: string) {
    const admin = createSupabaseAdminClient();
    const email = input.email.toLowerCase().trim();

    const { data: newUser, error } = await admin.rpc("create_user_with_role", {
      p_email: email,
      p_password: input.password,
      p_full_name: input.full_name.trim(),
      p_role: input.role,
    });

    if (error) throw error;

    await auditoriaService.logSystem({
      entity: "users",
      action: "CREATED",
      entity_id: newUser as string,
      user_id: actingUserId,
      new_value: { email, full_name: input.full_name.trim(), role: input.role },
      note: "User created",
    });

    const { data: profile } = await admin
      .from("users")
      .select("id, full_name, role, active, created_at, updated_at")
      .eq("id", newUser as string)
      .single();

    return { ...profile, email };
  },

  async update(input: UpdateUsuarioInput, actingUserId: string) {
    const admin = createSupabaseAdminClient();

    const { data: current, error: fetchError } = await admin
      .from("users")
      .select()
      .eq("id", input.id)
      .single();

    if (fetchError || !current) throw new Error("Usuario no encontrado");

    const { data: updated, error } = await admin
      .from("users")
      .update({
        full_name: input.full_name.trim(),
        role: input.role,
        active: input.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)
      .select("id, full_name, role, active, created_at, updated_at")
      .single();

    if (error) throw error;

    await auditoriaService.logSystem({
      entity: "users",
      action: "UPDATED",
      entity_id: input.id,
      user_id: actingUserId,
      previous_value: current,
      new_value: updated,
      note: "User updated",
    });

    return updated;
  },
};
