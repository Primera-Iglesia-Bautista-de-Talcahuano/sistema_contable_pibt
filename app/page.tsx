import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-[100dvh] flex flex-col md:flex-row">
      {/* ── Left panel: verse (green) ─────────────────────────────── */}
      <div
        className="relative flex flex-col justify-center items-center overflow-hidden
                   px-8 py-10 md:py-0 md:w-1/2
                   bg-[#5c8a6e] text-white"
      >
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5" />

        <div className="relative z-10 max-w-sm text-center space-y-5">
          {/* Cross icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 text-3xl">
            ✝
          </div>

          {/* Church name */}
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
            Primera Iglesia Bautista de Talcahuano
          </p>

          {/* Divider */}
          <div className="mx-auto h-px w-10 bg-white/30" />

          {/* Bible verse */}
          <blockquote className="space-y-3">
            <p className="text-sm italic leading-relaxed text-white/85 md:text-base">
              &ldquo;Evitamos que alguien nos censure en cuanto a esta ofrenda generosa…
              procurando hacer lo que es honesto, no sólo delante del Señor, sino también
              delante de los hombres.&rdquo;
            </p>
            <cite className="block text-[10px] font-bold uppercase tracking-widest text-white/50 not-italic">
              2 Corintios 8:20–21
            </cite>
          </blockquote>
        </div>
      </div>

      {/* ── Right panel: login form (white) ──────────────────────── */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 md:px-16 bg-white">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#2d4a38]">
              Bienvenido
            </h1>
            <p className="text-sm text-[#7a8c82]">Ingresa tus credenciales para continuar</p>
          </div>

          <LoginForm />

          <p className="text-center text-[11px] text-[#7a8c82]">
            Acceso restringido a personal autorizado
          </p>
        </div>
      </div>
    </main>
  )
}
