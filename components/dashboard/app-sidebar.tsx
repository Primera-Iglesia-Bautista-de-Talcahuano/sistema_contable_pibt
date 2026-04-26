"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ClipboardList,
  CalendarDays,
  Receipt,
  Church,
  PiggyBank,
  FileCheck,
  Settings
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
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/dashboard/nav-user"
import { ThemeToggle } from "@/components/ui/theme-toggle"

type NavLink = {
  href: string
  label: string
  icon: React.ElementType
  roles?: string[]
}

const ALL_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/movimientos", label: "Movimientos", icon: Briefcase, roles: ["ADMIN", "OPERATOR", "VIEWER"] },
  { href: "/eventos", label: "Eventos", icon: CalendarDays, roles: ["ADMIN", "OPERATOR", "VIEWER"] },
  { href: "/rendiciones", label: "Rendiciones", icon: Receipt, roles: ["ADMIN", "OPERATOR", "VIEWER"] },
  { href: "/solicitudes", label: "Solicitudes", icon: FileCheck, roles: ["ADMIN", "OPERATOR", "MINISTER"] },
  { href: "/ministerios", label: "Ministerios", icon: Church, roles: ["ADMIN", "OPERATOR"] },
  { href: "/presupuesto", label: "Presupuesto", icon: PiggyBank, roles: ["ADMIN", "OPERATOR"] },
  { href: "/usuarios", label: "Usuarios", icon: Users, roles: ["ADMIN"] },
  { href: "/auditoria", label: "Auditoría", icon: ClipboardList, roles: ["ADMIN"] },
  { href: "/configuracion", label: "Configuración", icon: Settings, roles: ["ADMIN"] }
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
  const { setOpenMobile } = useSidebar()
  const links = ALL_LINKS.filter((l) => !l.roles || l.roles.includes(user.role))

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center">
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />} className="flex-1">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboard className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Sistema Contable</span>
                <span className="truncate text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  PIBT
                </span>
              </div>
            </SidebarMenuButton>
            <ThemeToggle />
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
                      onClick={() => setOpenMobile(false)}
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
