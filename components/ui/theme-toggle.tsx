"use client"

import { Moon, Sun } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof document === "undefined") return false
    return document.documentElement.classList.contains("dark")
  })

  const toggle = () => {
    const next = !dark
    setDark(next)
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
    <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label="Cambiar tema" suppressHydrationWarning>
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
