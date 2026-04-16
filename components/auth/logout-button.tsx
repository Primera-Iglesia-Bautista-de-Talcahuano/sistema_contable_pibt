"use client"

import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      onClick={() => void handleSignOut()}
      className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 px-3 h-10 border-none bg-transparent"
    >
      <LogOut className="h-4 w-4" />
      <span className="text-xs font-bold uppercase tracking-widest">Cerrar Sesión</span>
    </Button>
  )
}
