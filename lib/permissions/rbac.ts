import type { UserRole } from "@/types/auth"

export const roles = ["ADMIN", "OPERATOR", "VIEWER", "MINISTER"] as const

export function canManageUsers(role?: UserRole) {
  return role === "ADMIN"
}

export function canCreateOrEditMovements(role?: UserRole) {
  return role === "ADMIN" || role === "OPERATOR"
}

export function canViewMovements(role?: UserRole) {
  return role === "ADMIN" || role === "OPERATOR" || role === "VIEWER"
}

// ── Ministry & budget workflow ────────────────────────────────

export function canManageMinistries(role?: UserRole) {
  return role === "ADMIN" || role === "OPERATOR"
}

export function canManageBudgets(role?: UserRole) {
  return role === "ADMIN" || role === "OPERATOR"
}

export function canReviewIntentions(role?: UserRole) {
  return role === "ADMIN" || role === "OPERATOR"
}

export function canSubmitIntentions(role?: UserRole) {
  return role === "MINISTER"
}

export function canManageSettings(role?: UserRole) {
  return role === "ADMIN"
}

export function canViewWorkflow(role?: UserRole) {
  return role === "ADMIN" || role === "OPERATOR" || role === "MINISTER"
}
