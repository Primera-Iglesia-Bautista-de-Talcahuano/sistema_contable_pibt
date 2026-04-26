import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { canViewWorkflow } from "@/lib/permissions/rbac"
import { intentionsService } from "@/services/intentions/intentions.service"
import { settlementsService } from "@/services/settlements/settlements.service"
import { ministriesService } from "@/services/ministries/ministries.service"
import { IntentionDetailClient } from "@/components/solicitudes/intention-detail-client"
import type { ComponentProps } from "react"

type DetailProps = ComponentProps<typeof IntentionDetailClient>

export default async function SolicitudDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  if (!user || !canViewWorkflow(user.role)) redirect("/dashboard")

  const { id } = await params
  let intention

  try {
    intention = await intentionsService.getById(id)
  } catch {
    notFound()
  }

  if (user.role === "MINISTER") {
    const assignment = await ministriesService.getMinistryForUser(user.id)
    if (!assignment || assignment.ministry_id !== intention.ministry_id) {
      redirect("/solicitudes")
    }
  }

  const [comments, transfer, settlements] = await Promise.all([
    intentionsService.getComments(id, "INTENTION"),
    intentionsService.getTransfer(id),
    settlementsService.list({ intentionId: id })
  ])

  return (
    <IntentionDetailClient
      intention={intention as unknown as DetailProps["intention"]}
      comments={comments as unknown as DetailProps["comments"]}
      transfer={transfer as unknown as DetailProps["transfer"]}
      settlements={settlements as unknown as DetailProps["settlements"]}
      userRole={user.role}
    />
  )
}
