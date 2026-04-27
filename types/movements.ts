export type MovementType = "INCOME" | "EXPENSE"

export const INCOME_CATEGORIES = [
  "Diezmos",
  "Ofrendas",
  "Donaciones",
  "Actividades",
  "Otros"
] as const

export const EXPENSE_CATEGORIES = [
  "Servicios basicos",
  "Mantenciones",
  "Ayuda social",
  "Materiales",
  "Actividades",
  "Administracion",
  "Transporte",
  "Otros"
] as const
