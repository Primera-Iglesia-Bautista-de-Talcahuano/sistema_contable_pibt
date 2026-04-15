export type MovementType = "INCOME" | "EXPENSE";

export const INCOME_CATEGORIES = [
  "diezmos",
  "ofrendas",
  "donaciones",
  "actividades",
  "otros",
] as const;

export const EXPENSE_CATEGORIES = [
  "servicios basicos",
  "mantencion",
  "ayuda social",
  "materiales",
  "actividades",
  "administracion",
  "transporte",
  "otros",
] as const;
