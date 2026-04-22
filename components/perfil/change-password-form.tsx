"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validators/auth"
import { toast } from "sonner"

export function ChangePasswordForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema)
  })

  const onSubmit = async (values: ChangePasswordValues) => {
    setError(null)
    const supabase = createSupabaseBrowserClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user?.email) {
      setError("No se pudo obtener la sesión actual.")
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: values.currentPassword
    })

    if (signInError) {
      setError("La contraseña actual es incorrecta.")
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: values.newPassword
    })

    if (updateError) {
      setError("No se pudo cambiar la contraseña. Intenta nuevamente.")
      return
    }

    reset()
    await supabase.auth.signOut()
    toast.success("Contraseña actualizada", {
      description: "Tu sesión fue cerrada por seguridad. Inicia sesión nuevamente."
    })
    router.push("/?reason=password_changed")
    router.refresh()
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <Alert variant="warning">
        <AlertTitle>Aviso importante</AlertTitle>
        <AlertDescription>
          Al cambiar tu contraseña, tu sesión actual será cerrada automáticamente y deberás iniciar
          sesión nuevamente con la nueva contraseña.
        </AlertDescription>
      </Alert>

      <FieldGroup>
        <Field data-invalid={!!errors.currentPassword || undefined}>
          <FieldLabel
            htmlFor="currentPassword"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Contraseña actual
          </FieldLabel>
          <PasswordInput
            id="currentPassword"
            placeholder="••••••••"
            aria-invalid={!!errors.currentPassword}
            {...register("currentPassword")}
          />
          <FieldError errors={[errors.currentPassword]} />
        </Field>

        <Field data-invalid={!!errors.newPassword || undefined}>
          <FieldLabel
            htmlFor="newPassword"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Nueva contraseña
          </FieldLabel>
          <PasswordInput
            id="newPassword"
            placeholder="••••••••"
            aria-invalid={!!errors.newPassword}
            {...register("newPassword")}
          />
          <FieldError errors={[errors.newPassword]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword || undefined}>
          <FieldLabel
            htmlFor="confirmPassword"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Confirmar nueva contraseña
          </FieldLabel>
          <PasswordInput
            id="confirmPassword"
            placeholder="••••••••"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            Actualizando...
          </>
        ) : (
          "Cambiar contraseña"
        )}
      </Button>
    </form>
  )
}
