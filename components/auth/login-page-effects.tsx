"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function LoginPageEffects() {
  const params = useSearchParams()

  useEffect(() => {
    const reason = params.get("reason")
    const error = params.get("error")

    if (reason === "password_changed") {
      toast.success("Contraseña actualizada", {
        description: "Inicia sesión con tu nueva contraseña."
      })
    }

    if (error === "link_expired") {
      toast.error("Enlace expirado", {
        description:
          "Este enlace de invitación ya no es válido. Pide al administrador que te reenvíe la invitación.",
        duration: 8000
      })
    } else if (error === "invalid_link") {
      toast.error("Enlace inválido", {
        description: "El enlace que usaste no es válido. Verifica que lo hayas copiado completo.",
        duration: 8000
      })
    }
  }, [params])

  return null
}
