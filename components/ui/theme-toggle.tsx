"use client"

import { Moon, Sun } from "lucide-react"
import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}

const getSnapshot = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("dark")

const getServerSnapshot = () => false

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle("dark", next)
    try {
      if (next) {
        localStorage.setItem("pibt-theme", "dark")
      } else {
        localStorage.removeItem("pibt-theme")
      }
    } catch {}
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label="Cambiar tema"
      suppressHydrationWarning
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
