"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export type NavLink = {
  href: string
  label: string
  icon: React.ReactNode
}

export function DashboardNav({
  links,
  onSelect,
}: {
  links: NavLink[]
  onSelect?: () => void
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onSelect}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
