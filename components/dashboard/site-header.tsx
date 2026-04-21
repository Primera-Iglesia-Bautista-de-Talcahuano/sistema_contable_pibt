"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PanelLeft } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/movimientos": "Movimientos",
  "/movimientos/nuevo": "Nuevo Movimiento",
  "/eventos": "Eventos",
  "/rendiciones": "Rendiciones",
  "/usuarios": "Usuarios",
  "/auditoria": "Auditoría"
}

function usePageLabel() {
  const pathname = usePathname()
  // Check for detail pages like /movimientos/[id]
  if (pathname.startsWith("/movimientos/") && pathname !== "/movimientos/nuevo") {
    return { parent: { label: "Movimientos", href: "/movimientos" }, current: "Detalle" }
  }
  const label = PAGE_LABELS[pathname]
  // For /movimientos/nuevo show parent
  if (pathname === "/movimientos/nuevo") {
    return { parent: { label: "Movimientos", href: "/movimientos" }, current: "Nuevo" }
  }
  return { parent: null, current: label ?? "..." }
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const { parent, current } = usePageLabel()

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-14 w-full items-center gap-2 px-4">
        <Button
          className="size-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <PanelLeft />
        </Button>
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-auto"
        />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>Sistema Contable</BreadcrumbLink>
            </BreadcrumbItem>
            {parent && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href={parent.href} />}>
                    {parent.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{current}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <span className="font-mono text-[10px] text-muted-foreground/50 select-none">
            {process.env.NEXT_PUBLIC_COMMIT_SHA}
          </span>
        </div>
      </div>
    </header>
  )
}
