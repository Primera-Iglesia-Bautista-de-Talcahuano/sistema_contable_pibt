import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { auditService } from "@/services/audit/audit.service"
import type {
  CreateMinistryInput,
  UpdateMinistryInput,
  AssignMinisterInput
} from "@/lib/validators/ministry"

export const ministriesService = {
  async list() {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin.from("ministries").select("*").order("name")
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin.from("ministries").select("*").eq("id", id).single()
    if (error) throw error
    return data
  },

  async create(input: CreateMinistryInput, userId: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("ministries")
      .insert({ name: input.name, description: input.description ?? null, created_by: userId })
      .select()
      .single()
    if (error) throw error

    await auditService.logSystem({
      entity: "MINISTRY",
      action: "MINISTRY_CREATED",
      user_id: userId,
      entity_id: data.id,
      new_value: { name: data.name }
    })

    return data
  },

  async update(id: string, input: UpdateMinistryInput, userId: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("ministries")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error

    await auditService.logSystem({
      entity: "MINISTRY",
      action: "MINISTRY_UPDATED",
      user_id: userId,
      entity_id: id,
      new_value: input
    })

    return data
  },

  async getAssignments(ministryId: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("ministry_assignments")
      .select("*, users(id, full_name, email)")
      .eq("ministry_id", ministryId)
      .order("assigned_at", { ascending: false })
    if (error) throw error
    return data
  },

  async getCurrentAssignment(ministryId: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("ministry_assignments")
      .select("*, users(id, full_name, email)")
      .eq("ministry_id", ministryId)
      .is("unassigned_at", null)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async getMinistryForUser(userId: string) {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from("ministry_assignments")
      .select("*, ministries(*)")
      .eq("user_id", userId)
      .is("unassigned_at", null)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async assign(ministryId: string, input: AssignMinisterInput, assignedBy: string) {
    const admin = createSupabaseAdminClient()

    // Close any existing active assignment
    await admin
      .from("ministry_assignments")
      .update({ unassigned_at: new Date().toISOString() })
      .eq("ministry_id", ministryId)
      .is("unassigned_at", null)

    const { data, error } = await admin
      .from("ministry_assignments")
      .insert({
        ministry_id: ministryId,
        user_id: input.user_id,
        assigned_by: assignedBy,
        notes: input.notes ?? null
      })
      .select()
      .single()
    if (error) throw error

    await auditService.logSystem({
      entity: "MINISTRY_ASSIGNMENT",
      action: "MINISTER_ASSIGNED",
      user_id: assignedBy,
      entity_id: ministryId,
      new_value: { user_id: input.user_id, ministry_id: ministryId }
    })

    return data
  },

  async unassign(ministryId: string, userId: string) {
    const admin = createSupabaseAdminClient()
    const { error } = await admin
      .from("ministry_assignments")
      .update({ unassigned_at: new Date().toISOString() })
      .eq("ministry_id", ministryId)
      .is("unassigned_at", null)
    if (error) throw error

    await auditService.logSystem({
      entity: "MINISTRY_ASSIGNMENT",
      action: "MINISTER_UNASSIGNED",
      user_id: userId,
      entity_id: ministryId,
      new_value: { ministry_id: ministryId }
    })
  }
}
