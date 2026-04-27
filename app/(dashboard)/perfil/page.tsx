import { Card } from "@/components/ui/card"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { KeyRound } from "lucide-react"

export default function PerfilPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona la seguridad de tu cuenta.</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <KeyRound className="size-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Cambiar contraseña</p>
            <p className="text-xs text-muted-foreground">
              Se cerrará tu sesión al confirmar el cambio.
            </p>
          </div>
        </div>
        <ChangePasswordForm />
      </Card>
    </div>
  )
}
