import type { UserRole } from "@/types/auth";

export const roles = ["ADMIN", "OPERATOR", "VIEWER"] as const;

export function canManageUsers(role?: UserRole) {
  return role === "ADMIN";
}

export function canCreateOrEditMovements(role?: UserRole) {
  return role === "ADMIN" || role === "OPERATOR";
}

export function canViewMovements(role?: UserRole) {
  return role === "ADMIN" || role === "OPERATOR" || role === "VIEWER";
}
