import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageMinistries } from "@/lib/permissions/rbac"
import { ministriesService } from "@/services/ministries/ministries.service"
import { MinistriesClient } from "@/components/ministries/ministries-client"

export default async function MinisteriosPage() {
  const user = await getCurrentUser()
  if (!user || !canManageMinistries(user.role)) redirect("/dashboard")

  const ministries = await ministriesService.list()
  return <MinistriesClient initialMinistries={ministries} />
}
