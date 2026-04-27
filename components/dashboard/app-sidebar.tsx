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
  SidebarGroupLabel,
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

type NavGroup = {
  label: string | null
  links: NavLink[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    links: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
  },
  {
    label: "Finanzas",
    links: [
      {
        href: "/movimientos",
        label: "Movimientos",
        icon: Briefcase,
        roles: ["ADMIN", "OPERATOR", "VIEWER"]
      },
      {
        href: "/rendiciones",
        label: "Rendiciones",
        icon: Receipt,
        roles: ["ADMIN", "OPERATOR", "VIEWER"]
      },
      { href: "/presupuesto", label: "Presupuesto", icon: PiggyBank, roles: ["ADMIN", "OPERATOR"] }
    ]
  },
  {
    label: "Gestión",
    links: [
      {
        href: "/eventos",
        label: "Eventos",
        icon: CalendarDays,
        roles: ["ADMIN", "OPERATOR", "VIEWER"]
      },
      { href: "/ministerios", label: "Ministerios", icon: Church, roles: ["ADMIN", "OPERATOR"] },
      {
        href: "/solicitudes",
        label: "Solicitudes",
        icon: FileCheck,
        roles: ["ADMIN", "OPERATOR", "MINISTER"]
      }
    ]
  },
  {
    label: "Administración",
    links: [
      { href: "/usuarios", label: "Usuarios", icon: Users, roles: ["ADMIN"] },
      { href: "/auditoria", label: "Auditoría", icon: ClipboardList, roles: ["ADMIN"] },
      { href: "/configuracion", label: "Configuración", icon: Settings, roles: ["ADMIN"] }
    ]
  }
]

const GROUP_THRESHOLD = 5

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

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter((l) => !l.roles || l.roles.includes(user.role))
  })).filter((group) => group.links.length > 0)

  const totalLinks = visibleGroups.reduce((sum, g) => sum + g.links.length, 0)
  const useGroups = totalLinks >= GROUP_THRESHOLD

  const renderLinks = (links: NavLink[]) =>
    links.map((link) => {
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
    })

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
        {useGroups ? (
          visibleGroups.map((group) => (
            <SidebarGroup key={group.label ?? "__general"}>
              {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>{renderLinks(group.links)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        ) : (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>{renderLinks(visibleGroups.flatMap((g) => g.links))}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
