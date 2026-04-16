"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DashboardNav, type NavLink } from "./dashboard-nav"
import { LogoutButton } from "@/components/auth/logout-button"

export function MobileNav({
  links,
  initials,
  name,
  role,
}: {
  links: NavLink[]
  initials: string
  name: string
  role: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-card border-r border-border">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-5 pt-6 pb-4 text-left">
              <SheetTitle className="font-heading text-base font-bold text-foreground leading-tight">
                Sistema Contable
                <span className="block text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-semibold mt-0.5">
                  PIBT
                </span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex-1 px-3">
              <DashboardNav links={links} onSelect={() => setOpen(false)} />
            </nav>
            <div className="px-4 py-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-primary">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide truncate">
                    {role}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <LogoutButton />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
