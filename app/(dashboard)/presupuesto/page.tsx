import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageBudgets } from "@/lib/permissions/rbac"
import { budgetService } from "@/services/budget/budget.service"
import { ministriesService } from "@/services/ministries/ministries.service"
import { BudgetClient } from "@/components/budget/budget-client"

export default async function PresupuestoPage() {
  const user = await getCurrentUser()
  if (!user || !canManageBudgets(user.role)) redirect("/dashboard")

  const [periods, ministries] = await Promise.all([
    budgetService.listPeriods(),
    ministriesService.list()
  ])

  return <BudgetClient initialPeriods={periods} ministries={ministries} />
}
