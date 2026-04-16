import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/")
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U"

  return (
    <SidebarProvider>
      <AppSidebar user={{ name: user.name ?? "", initials, role: user.role }} />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-0 overflow-x-hidden">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
