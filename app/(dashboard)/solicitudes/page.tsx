import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { canViewWorkflow } from "@/lib/permissions/rbac"
import { intentionsService } from "@/services/intentions/intentions.service"
import { ministriesService } from "@/services/ministries/ministries.service"
import { budgetService } from "@/services/budget/budget.service"
import { SolicitudesClient } from "@/components/solicitudes/solicitudes-client"
import type { ComponentProps } from "react"

type SolicitudesProps = ComponentProps<typeof SolicitudesClient>

export default async function SolicitudesPage() {
  const user = await getCurrentUser()
  if (!user || !canViewWorkflow(user.role)) redirect("/dashboard")

  if (user.role === "MINISTER") {
    const assignment = await ministriesService.getMinistryForUser(user.id)
    const activePeriod = await budgetService.getActivePeriod()

    const budgetSummary =
      assignment && activePeriod
        ? await budgetService.getBudgetSummary(assignment.ministry_id, activePeriod.id)
        : null

    const intentions = assignment
      ? await intentionsService.list({ ministryId: assignment.ministry_id })
      : []

    return (
      <SolicitudesClient
        role="MINISTER"
        intentions={intentions as unknown as SolicitudesProps["intentions"]}
        ministry={(assignment?.ministries ?? null) as unknown as SolicitudesProps["ministry"]}
        budgetSummary={budgetSummary}
        activePeriod={activePeriod}
      />
    )
  }

  const intentions = await intentionsService.list()

  return (
    <SolicitudesClient
      role={user.role}
      intentions={intentions as unknown as SolicitudesProps["intentions"]}
      ministry={null}
      budgetSummary={null}
      activePeriod={null}
    />
  )
}
