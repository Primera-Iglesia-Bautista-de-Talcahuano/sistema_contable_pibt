"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.email("Ingresa un email valido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: values.email.toLowerCase().trim(),
      password: values.password,
    });

    if (authError) {
      setError("Credenciales invalidas o usuario inactivo.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form className="mt-8 space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1" htmlFor="email">
            Correo Electrónico
          </label>
          <Input
            id="email"
            type="email"
            placeholder="admin@iglesia.local"
            className="h-14 bg-surface-container-low border-none rounded-2xl px-5 text-base font-medium"
            {...register("email")}
          />
          {errors.email && <p className="mt-1.5 text-[10px] font-bold text-error ml-1 uppercase">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1" htmlFor="password">
            Contraseña Segura
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-14 bg-surface-container-low border-none rounded-2xl px-5 text-base font-medium"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1.5 text-[10px] font-bold text-error ml-1 uppercase">{errors.password.message}</p>
          )}
        </div>
      </div>

      {error && <p className="rounded-2xl bg-error-container/50 border border-error/10 px-4 py-3 text-sm font-bold text-on-error-container text-center">{error}</p>}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="h-12 w-full text-base sm:text-lg shadow-xl shadow-primary/20 rounded-xl"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Verificando Acceso...
          </>
        ) : (
          "Acceder al Sistema"
        )}
      </Button>
    </form>
  );
}
