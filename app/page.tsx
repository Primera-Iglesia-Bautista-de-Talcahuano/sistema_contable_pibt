import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-[100dvh] flex flex-col md:flex-row">
      {/* ── Left panel: verse (green) ─────────────────────────────── */}
      <div className="relative flex flex-col justify-center items-center overflow-hidden px-8 py-10 md:py-0 md:w-1/2 bg-primary text-primary-foreground">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-white/5" />

        <div className="relative z-10 max-w-sm text-center flex flex-col gap-5">
          {/* Cross icon */}
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-white/15">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-7"
              fill="currentColor"
            >
              <path d="M11 2h2v7h7v2h-7v11h-2V11H4V9h7V2z" />
            </svg>
          </div>

          {/* Church name */}
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary-foreground/60">
            Primera Iglesia Bautista de Talcahuano
          </p>

          {/* Divider */}
          <div className="mx-auto h-px w-10 bg-primary-foreground/30" />

          {/* Bible verse */}
          <blockquote className="flex flex-col gap-3">
            <p className="text-sm italic leading-relaxed text-primary-foreground/85 md:text-base [text-wrap:balance]">
              &ldquo;Evitamos que alguien nos censure en cuanto a esta ofrenda generosa… procurando
              hacer lo que es honesto, no sólo delante del Señor, sino también delante de los
              hombres.&rdquo;
            </p>
            <cite className="block text-[11px] font-bold uppercase tracking-widest text-primary-foreground/50 not-italic">
              2 Corintios 8:20–21
            </cite>
          </blockquote>
        </div>
      </div>

      {/* ── Right panel: login form ───────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 md:px-16 bg-card">
        <div className="mx-auto w-full max-w-sm flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Bienvenido
            </h1>
            <p className="text-sm text-muted-foreground">Ingresa tus credenciales para continuar</p>
          </div>

          <LoginForm />

          <p className="text-center text-xs text-muted-foreground">
            Acceso restringido a personal autorizado
          </p>
        </div>
      </div>
    </main>
  )
}
