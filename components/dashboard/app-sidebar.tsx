"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ClipboardList,
  CalendarDays,
  Receipt
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/dashboard/nav-user"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const ALL_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/movimientos", label: "Movimientos", icon: Briefcase, adminOnly: false },
  { href: "/eventos", label: "Eventos", icon: CalendarDays, adminOnly: false },
  { href: "/rendicion-boletas", label: "Rendición", icon: Receipt, adminOnly: false },
  { href: "/usuarios", label: "Usuarios", icon: Users, adminOnly: true },
  { href: "/auditoria", label: "Auditoría", icon: ClipboardList, adminOnly: true }
]

export function AppSidebar({
  user
}: {
  user: {
    name: string
    initials: string
    role: string
  }
}) {
  const pathname = usePathname()
  const isAdmin = user.role === "ADMIN"
  const links = ALL_LINKS.filter((l) => !l.adminOnly || isAdmin)

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboard className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Sistema Contable</span>
                <span className="truncate text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  PIBT
                </span>
              </div>
              <ThemeToggle />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      render={<Link href={link.href} />}
                      isActive={isActive}
                      tooltip={link.label}
                    >
                      <link.icon />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
