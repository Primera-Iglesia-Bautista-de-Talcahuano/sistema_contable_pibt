import Link from "next/link"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/auth/logout-button"
import { getCurrentUser } from "@/lib/supabase/server"
import { LayoutDashboard, Briefcase, Book, FileText, Users, Settings, Menu } from "lucide-react"

import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/")
  }

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/movimientos", label: "Movimientos", icon: <Briefcase className="h-5 w-5" /> },
    { href: "/talonario", label: "Talonario", icon: <Book className="h-5 w-5" /> },
    {
      href: "/rendicion-boletas",
      label: "Rendición Boletas",
      icon: <FileText className="h-5 w-5" />
    },
    { href: "/usuarios", label: "Usuarios", icon: <Users className="h-5 w-5" /> },
    { href: "/configuracion", label: "Configuración", icon: <Settings className="h-5 w-5" /> }
  ]

  const allowedLinks =
    user.role === "ADMIN"
      ? links
      : links.filter((link) => link.href !== "/usuarios" && link.href !== "/configuracion")

  return (
    <div className="min-h-[100dvh] bg-surface">
      <div className="grid min-h-[100dvh] grid-cols-1 md:grid-cols-[280px_1fr]">
        <aside className="hidden md:block bg-surface-bright/80 backdrop-blur-[12px] p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.05)] border-none">
          <h2 className="mb-10 font-bold tracking-tight text-xl text-primary">
            Sistema Contable Iglesia
          </h2>
          <DashboardNav links={allowedLinks} />
          <div className="mt-auto pt-8 border-t border-surface-container-highest/10">
            <blockquote>
              <p className="text-[11px] italic leading-relaxed text-on-surface-variant/50">
                &ldquo;...procurando hacer lo que es honesto, no sólo delante del Señor, sino
                también delante de los hombres.&rdquo;
              </p>
              <cite className="mt-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/30 not-italic">
                2 Corintios 8:20-21
              </cite>
            </blockquote>
          </div>
        </aside>

        <div className="flex flex-col bg-surface overflow-hidden">
          <header className="sticky top-0 z-20 bg-surface-bright/40 backdrop-blur-3xl px-6 sm:px-12 py-4 sm:py-6 border-b border-surface-container-highest/5 flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button variant="ghost" size="icon" className="hover:bg-primary/5">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    }
                  />
                  <SheetContent
                    side="left"
                    className="p-0 border-none bg-surface-bright backdrop-blur-3xl"
                  >
                    <div className="p-5 sm:p-8 h-full flex flex-col">
                      <SheetHeader className="mb-10 text-left">
                        <SheetTitle className="text-xl font-bold tracking-tight text-primary">
                          Sistema Contable
                        </SheetTitle>
                      </SheetHeader>
                      <DashboardNav links={allowedLinks} />
                      <div className="mt-auto pt-8 border-t border-surface-container-highest/10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 mb-4">
                          Tu Sesión
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">
                            {user.name?.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-on-surface truncate">
                              {user.name}
                            </p>
                            <p className="text-[10px] text-on-surface-variant truncate uppercase tracking-tighter font-medium">
                              {user.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 border border-primary/5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.1em] text-primary uppercase">
                  Ambiente de Gestión
                </span>
              </div>
              <div className="sm:hidden font-bold text-sm tracking-tight text-primary">
                Contabilidad PIBT
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-8">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="flex items-center gap-2 sm:gap-4 group cursor-pointer appearance-none bg-transparent border-none p-0 outline-none">
                      <div className="hidden sm:block text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                          Operador
                        </p>
                        <p className="text-sm font-bold text-on-surface leading-snug tracking-tight">
                          {user.name}
                        </p>
                      </div>
                      <div className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-surface-container-high border-2 border-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500 shadow-sm">
                        <span className="font-heading font-black text-[10px] sm:text-xs uppercase tracking-tighter">
                          {user.name?.charAt(0) || "U"}
                        </span>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-primary border-2 border-surface-bright" />
                      </div>
                    </button>
                  }
                />
                <DropdownMenuContent align="end" sideOffset={12}>
                  <div className="px-4 py-3 border-b border-surface-container-highest/5 mb-2">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      {user.email}
                    </p>
                    <p className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1">
                      {user.role}
                    </p>
                  </div>
                  <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                    <div className="flex items-center gap-3 w-full">
                      <Users className="h-4 w-4" />
                      <span>Mi Perfil</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:scale-[1.02] active:scale-[0.98]">
                    <Link href="/configuracion" className="flex items-center gap-3 w-full">
                      <Settings className="h-4 w-4" />
                      <span>Configuración</span>
                    </Link>
                  </DropdownMenuItem>
                  <div className="h-px bg-surface-container-highest/10 my-2" />
                  <DropdownMenuItem className="p-0 hover:bg-transparent">
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="p-4 sm:p-12 min-h-0 flex-1 overflow-x-hidden w-full max-w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
