"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl,
    });

    if (!result || result.error) {
      setError("Credenciales invalidas o usuario inactivo.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form className="mt-5 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium tracking-wide text-on-surface" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="admin@iglesia.local"
            {...register("email")}
          />
          {errors.email && <p className="mt-2 text-xs font-semibold text-error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium tracking-wide text-on-surface" htmlFor="password">
            Contrasena
          </label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-2 text-xs font-semibold text-error">{errors.password.message}</p>
          )}
        </div>
      </div>

      {error && <p className="rounded-xl bg-error-container px-4 py-3 text-sm font-medium text-on-error-container">{error}</p>}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Ingresando...
          </>
        ) : (
          "Ingresar"
        )}
      </Button>
    </form>
  );
}
