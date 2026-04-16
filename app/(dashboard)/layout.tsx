import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { LogoutButton } from "@/components/auth/logout-button"
import { LayoutDashboard, Briefcase, Users, Settings, Plus } from "lucide-react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { Button } from "@/components/ui/button"

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

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
    { href: "/movimientos", label: "Movimientos", icon: <Briefcase className="size-4" /> },
    ...(user.role === "ADMIN"
      ? [
          { href: "/usuarios", label: "Usuarios", icon: <Users className="size-4" /> },
          { href: "/configuracion", label: "Configuración", icon: <Settings className="size-4" /> }
        ]
      : [])
  ]

  return (
    <div className="min-h-[100dvh] bg-background flex">
      {/* ── Desktop sidebar ───────────────────────────────────────── */}
      <aside className="hidden md:flex w-[220px] shrink-0 flex-col bg-card border-r border-border min-h-[100dvh] sticky top-0">
        {/* Brand */}
        <div className="px-5 pt-6 pb-4 flex flex-col gap-0.5">
          <span className="font-heading text-base font-bold text-foreground leading-tight">
            Sistema Contable
          </span>
          <span className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">
            PIBT
          </span>
        </div>

        {/* New movement CTA */}
        <div className="px-4 pb-4">
          <Button render={<Link href="/movimientos/nuevo" />} className="w-full gap-2 text-sm">
            <Plus className="size-4" data-icon="inline-start" />
            Nuevo Movimiento
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3">
          <DashboardNav links={links} />
        </nav>

        {/* User profile */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide truncate">
                {user.role}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
          <MobileNav
            links={links}
            initials={initials}
            name={user.name ?? ""}
            role={user.role}
          />

          <span className="font-heading text-sm font-bold text-foreground">Sistema Contable</span>

          {/* Mobile avatar */}
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-[11px] font-bold text-primary">{initials}</span>
          </div>
        </header>

        {/* FAB — mobile only */}
        <Link
          href="/movimientos/nuevo"
          className="md:hidden fixed bottom-6 right-6 z-50 size-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Nuevo movimiento"
        >
          <Plus className="size-6" />
        </Link>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
