import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { auditoriaService } from "@/services/auditoria/auditoria.service"
import { sendInviteEmail, sendResetEmail } from "@/services/email/resend.service"
import { wrapAuthLink } from "@/services/auth/link-wrapper"
import { getSiteUrl } from "@/lib/utils"
import type { CreateUsuarioInput, UpdateUsuarioInput } from "@/lib/validators/usuario"

export const usuariosService = {
  async list() {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("users")
      .select("id, full_name, role, status, created_at, updated_at")
      .order("created_at", { ascending: true })

    if (error) throw error

    const { data: authUsers } = await admin.auth.admin.listUsers()
    const emailMap = new Map(authUsers.users.map((u) => [u.id, u.email ?? ""]))

    return data.map((u) => ({ ...u, email: emailMap.get(u.id) ?? "" }))
  },

  async invite(input: CreateUsuarioInput, actingUserId: string) {
    const admin = createSupabaseAdminClient()
    const email = input.email.toLowerCase().trim()
    const callbackUrl = `${getSiteUrl()}/auth/callback`

    // generateLink creates the auth.users record and returns the invite link
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        redirectTo: callbackUrl,
        data: { full_name: input.full_name.trim() }
      }
    })

    if (linkError) throw linkError

    const userId = linkData.user.id

    // Insert into public.users with PENDING_ACTIVATION status
    const { error: insertError } = await admin.from("users").insert({
      id: userId,
      full_name: input.full_name.trim(),
      email,
      role: input.role,
      status: "PENDING_ACTIVATION"
    })

    if (insertError) throw insertError

    // Send invite email via Resend
    await sendInviteEmail({
      to: email,
      full_name: input.full_name.trim(),
      action_link: wrapAuthLink(linkData.properties.action_link)
    })

    await auditoriaService.logSystem({
      entity: "users",
      action: "CREATED",
      entity_id: userId,
      user_id: actingUserId,
      new_value: { email, full_name: input.full_name.trim(), role: input.role },
      note: "User invited (pending activation)"
    })

    const { data: profile } = await admin
      .from("users")
      .select("id, full_name, role, status, created_at, updated_at")
      .eq("id", userId)
      .single()

    return { ...profile, email }
  },

  async resetAccount(userId: string, actingUserId: string) {
    const admin = createSupabaseAdminClient()

    const { data: user, error: fetchError } = await admin
      .from("users")
      .select("id, full_name, status")
      .eq("id", userId)
      .single()

    if (fetchError || !user) throw new Error("Usuario no encontrado")

    const { data: authUserData } = await admin.auth.admin.getUserById(userId)
    if (!authUserData.user) throw new Error("Usuario de autenticación no encontrado")

    const email = authUserData.user.email!
    const callbackUrl = `${getSiteUrl()}/auth/callback`

    // Set status to PENDING_RESET
    await admin
      .from("users")
      .update({ status: "PENDING_RESET", updated_at: new Date().toISOString() })
      .eq("id", userId)

    // Generate recovery link
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: callbackUrl }
    })

    if (linkError) throw linkError

    await sendResetEmail({
      to: email,
      full_name: user.full_name,
      action_link: wrapAuthLink(linkData.properties.action_link)
    })

    await auditoriaService.logSystem({
      entity: "users",
      action: "UPDATED",
      entity_id: userId,
      user_id: actingUserId,
      previous_value: { status: user.status },
      new_value: { status: "PENDING_RESET" },
      note: "Admin-initiated account reset"
    })
  },

  async delete(userId: string, actingUserId: string) {
    if (userId === actingUserId) throw new Error("No puedes eliminar tu propia cuenta")

    const admin = createSupabaseAdminClient()

    const { data: user, error: fetchError } = await admin
      .from("users")
      .select("full_name, email, role, status")
      .eq("id", userId)
      .single()

    if (fetchError || !user) throw new Error("Usuario no encontrado")

    // Deleting from auth.users cascades to public.users
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) throw error

    await auditoriaService.logSystem({
      entity: "users",
      action: "DELETED",
      entity_id: userId,
      user_id: actingUserId,
      previous_value: user,
      note: "User deleted by admin"
    })
  },

  async resendInvite(userId: string, actingUserId: string) {
    const admin = createSupabaseAdminClient()

    const { data: user, error: fetchError } = await admin
      .from("users")
      .select("id, full_name, status")
      .eq("id", userId)
      .single()

    if (fetchError || !user) throw new Error("Usuario no encontrado")
    if (user.status !== "PENDING_ACTIVATION")
      throw new Error("Solo se puede reenviar invitación a usuarios pendientes de activación")

    const { data: authUser } = await admin.auth.admin.getUserById(userId)
    if (!authUser.user) throw new Error("Usuario de autenticación no encontrado")

    const email = authUser.user.email!
    const callbackUrl = `${getSiteUrl()}/auth/callback`

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo: callbackUrl, data: { full_name: user.full_name } }
    })

    if (linkError) throw linkError

    await sendInviteEmail({
      to: email,
      full_name: user.full_name,
      action_link: wrapAuthLink(linkData.properties.action_link)
    })

    await auditoriaService.logSystem({
      entity: "users",
      action: "UPDATED",
      entity_id: userId,
      user_id: actingUserId,
      note: "Invite resent"
    })
  },

  async update(input: UpdateUsuarioInput, actingUserId: string) {
    const admin = createSupabaseAdminClient()

    const { data: current, error: fetchError } = await admin
      .from("users")
      .select()
      .eq("id", input.id)
      .single()

    if (fetchError || !current) throw new Error("Usuario no encontrado")

    const { data: updated, error } = await admin
      .from("users")
      .update({
        full_name: input.full_name.trim(),
        role: input.role,
        status: input.status,
        updated_at: new Date().toISOString()
      })
      .eq("id", input.id)
      .select("id, full_name, role, status, created_at, updated_at")
      .single()

    if (error) throw error

    await auditoriaService.logSystem({
      entity: "users",
      action: "UPDATED",
      entity_id: input.id,
      user_id: actingUserId,
      previous_value: current,
      new_value: updated,
      note: "User updated"
    })

    return updated
  }
}
