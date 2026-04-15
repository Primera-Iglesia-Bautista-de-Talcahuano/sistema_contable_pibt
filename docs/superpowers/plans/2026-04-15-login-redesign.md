# Login Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the marketing home page and the `/login` route with a single split-screen login at `/`, applying the Sage & Stone design system.

**Architecture:** `/` becomes the auth entry point — middleware redirects unauthenticated users there and sends authenticated users to `/dashboard`. The old `app/(auth)/login/` route is deleted. The `LoginForm` client component keeps all auth logic; only styling and a password-visibility toggle are added. CSS tokens are replaced globally so the rest of the app picks up the new palette automatically.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, Supabase SSR auth, React Hook Form + Zod, lucide-react, Inter + Manrope (already loaded in `app/layout.tsx`)

---

## Files

| Action | File | What changes |
|---|---|---|
| Modify | `app/globals.css` | Replace MD3 color tokens with Sage & Stone tokens |
| Modify | `app/layout.tsx` | Wire `--font-heading` to Manrope variable |
| Modify | `middleware.ts` | Auth route = `/`, redirect unauthenticated → `/`, authenticated → `/dashboard` |
| Rewrite | `app/page.tsx` | Split-screen login layout (was marketing page) |
| Modify | `components/auth/login-form.tsx` | New Sage & Stone styles + password show/hide toggle |
| Delete | `app/(auth)/login/page.tsx` | No longer needed |

---

## Task 1: Update Sage & Stone color tokens in `globals.css`

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace the `@theme inline` block**

Open `app/globals.css` and replace the entire `@theme inline { ... }` block (lines 7–128) with:

```css
@theme inline {
  /* Sage & Stone palette */
  --color-primary: #5c8a6e;
  --color-primary-light: #8fbd9f;
  --color-primary-surface: #eef5f1;
  --color-primary-border: #c8dfd0;
  --color-primary-container: #8fbd9f;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #2d4a38;
  --color-primary-fixed: #eef5f1;

  --color-background: #f8faf8;
  --color-surface: #ffffff;
  --color-surface-bright: #ffffff;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #eef5f1;
  --color-surface-container: #f8faf8;
  --color-surface-container-high: #e8f0eb;
  --color-surface-container-highest: #deeae2;
  --color-surface-dim: #deeae2;
  --color-surface-variant: #eef5f1;
  --color-surface-tint: #5c8a6e;

  --color-on-background: #2d4a38;
  --color-on-surface: #2d4a38;
  --color-on-surface-variant: #7a8c82;
  --color-inverse-surface: #2d4a38;
  --color-inverse-on-surface: #f8faf8;
  --color-inverse-primary: #8fbd9f;

  --color-outline: #7a8c82;
  --color-outline-variant: #c8dfd0;

  --color-error: #b56b5e;
  --color-error-container: #fdf0ee;
  --color-on-error: #ffffff;
  --color-on-error-container: #7a2c22;

  --color-secondary: #7a8c82;
  --color-secondary-container: #eef5f1;
  --color-on-secondary: #ffffff;
  --color-on-secondary-container: #2d4a38;
  --color-secondary-fixed: #eef5f1;
  --color-secondary-fixed-dim: #c8dfd0;
  --color-on-secondary-fixed: #2d4a38;
  --color-on-secondary-fixed-variant: #5c8a6e;

  --color-tertiary: #7c6fa0;
  --color-tertiary-container: #f5f3fa;
  --color-on-tertiary: #ffffff;
  --color-on-tertiary-container: #3d3060;
  --color-tertiary-fixed: #f5f3fa;
  --color-tertiary-fixed-dim: #d4cee8;
  --color-on-tertiary-fixed: #3d3060;
  --color-on-tertiary-fixed-variant: #7c6fa0;

  /* Expense semantic tokens */
  --color-expense: #b56b5e;
  --color-expense-surface: #fdf0ee;
  --color-expense-border: #f5c4bb;

  /* Role badge tokens */
  --color-role-purple: #7c6fa0;
  --color-role-purple-surface: #f5f3fa;

  /* Font tokens */
  --font-sans: var(--font-inter);
  --font-heading: var(--font-manrope);

  /* Radius scale */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  /* shadcn pass-through — wired to Sage & Stone */
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-primary-foreground: var(--primary-foreground);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-foreground: var(--foreground);
}
```

- [ ] **Step 2: Replace the `:root` shadcn vars block**

Replace the entire `:root { ... }` block (lines 145–178) with:

```css
:root {
  --background: #f8faf8;
  --foreground: #2d4a38;
  --card: #ffffff;
  --card-foreground: #2d4a38;
  --popover: #ffffff;
  --popover-foreground: #2d4a38;
  --primary: #5c8a6e;
  --primary-foreground: #ffffff;
  --secondary: #eef5f1;
  --secondary-foreground: #2d4a38;
  --muted: #eef5f1;
  --muted-foreground: #7a8c82;
  --accent: #eef5f1;
  --accent-foreground: #2d4a38;
  --destructive: #b56b5e;
  --border: #c8dfd0;
  --input: #c8dfd0;
  --ring: #5c8a6e;
  --radius: 0.625rem;
  --chart-1: #5c8a6e;
  --chart-2: #8fbd9f;
  --chart-3: #b56b5e;
  --chart-4: #f5c4bb;
  --chart-5: #7c6fa0;
  --sidebar: #ffffff;
  --sidebar-foreground: #2d4a38;
  --sidebar-primary: #5c8a6e;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #eef5f1;
  --sidebar-accent-foreground: #2d4a38;
  --sidebar-border: #c8dfd0;
  --sidebar-ring: #5c8a6e;
}
```

- [ ] **Step 3: Delete the `.dark { ... }` block**

The app is light-mode only. Remove the entire `.dark { ... }` block (lines 180–212).

- [ ] **Step 4: Run CI check**

```bash
pnpm ci
```

Expected: no errors (token names haven't changed, just values).

---

## Task 2: Wire Manrope as heading font in `app/layout.tsx`

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update font variable names**

The current `inter` font uses `variable: "--font-sans"`. Change it to `--font-inter` so both fonts get their own CSS variables, and add `--font-manrope` as the heading variable:

```tsx
import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistema Contable Iglesia",
  description: "Sistema de contabilidad para iglesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn(inter.variable, manrope.variable)}>
      <body className="antialiased min-h-screen font-sans bg-background text-on-surface">
        {children}
      </body>
    </html>
  );
}
```

> Note: `globals.css` now maps `--font-sans → --font-inter` and `--font-heading → --font-manrope`. Tailwind's `font-sans` and `font-heading` utilities will pick them up automatically.

- [ ] **Step 2: Run CI**

```bash
pnpm ci
```

Expected: passes.

---

## Task 3: Update `middleware.ts` — auth route is now `/`

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Replace middleware contents**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/";

  // Unauthenticated user trying to access a protected page → send to login
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Authenticated user landing on login → send to dashboard
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

- [ ] **Step 2: Run CI**

```bash
pnpm ci
```

Expected: passes.

---

## Task 4: Rewrite `app/page.tsx` as split-screen login

**Files:**
- Rewrite: `app/page.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
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
          {/* Heading */}
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
  );
}
```

- [ ] **Step 2: Run CI**

```bash
pnpm ci
```

Expected: passes.

---

## Task 5: Update `LoginForm` — new styles + password visibility toggle

**Files:**
- Modify: `components/auth/login-form.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.email("Ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      setError("Credenciales inválidas o usuario inactivo.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Email */}
      <div className="space-y-1.5">
        <label
          className="block text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7a8c82]"
          htmlFor="email"
        >
          Correo electrónico
        </label>
        <Input
          id="email"
          type="email"
          placeholder="correo@iglesia.cl"
          className="h-10 rounded-lg border border-[#c8dfd0] bg-white px-3 text-sm text-[#2d4a38]
                     placeholder:text-[#7a8c82]/60 focus:border-[#5c8a6e] focus:ring-0
                     focus-visible:ring-0 focus-visible:outline-none"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-[11px] text-[#b56b5e]">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            className="block text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7a8c82]"
            htmlFor="password"
          >
            Contraseña
          </label>
          <button
            type="button"
            className="text-[11px] text-[#5c8a6e] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="h-10 rounded-lg border border-[#c8dfd0] bg-white px-3 pr-10 text-sm text-[#2d4a38]
                       placeholder:text-[#7a8c82]/60 focus:border-[#5c8a6e] focus:ring-0
                       focus-visible:ring-0 focus-visible:outline-none"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a8c82] hover:text-[#5c8a6e]"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[11px] text-[#b56b5e]">{errors.password.message}</p>
        )}
      </div>

      {/* Auth error */}
      {error && (
        <p className="rounded-lg bg-[#fdf0ee] border border-[#f5c4bb] px-4 py-2.5 text-sm text-[#b56b5e] text-center">
          {error}
        </p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-10 w-full rounded-lg bg-[#5c8a6e] text-sm font-semibold text-white
                   hover:bg-[#4d7a5e] disabled:opacity-60 transition-colors"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verificando...
          </>
        ) : (
          "Ingresar"
        )}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Run CI**

```bash
pnpm ci
```

Expected: passes.

---

## Task 6: Delete the old `/login` route

**Files:**
- Delete: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Check for any remaining `/login` references in the codebase**

```bash
grep -r '"/login"' app/ components/ lib/ --include="*.tsx" --include="*.ts"
```

Expected: zero results (middleware no longer references it; it was the only caller).

- [ ] **Step 2: Delete the file**

```bash
rm app/\(auth\)/login/page.tsx
```

If `app/(auth)/` is now empty (no other routes in it), remove the directory:

```bash
rmdir app/\(auth\) 2>/dev/null || true
```

- [ ] **Step 3: Run CI**

```bash
pnpm ci
```

Expected: passes.

---

## Task 7: Smoke-test in the browser

**Files:** none — verification only

- [ ] **Step 1: Start the dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Test unauthenticated flow**

Open `http://localhost:3000` in the browser.

Expected:
- Split-screen layout: green left panel with cross icon + Bible verse, white right panel with "Bienvenido" heading + form.
- Mobile viewport (≤768px): green verse block stacked on top, form below.
- Password field has eye/EyeOff toggle icon.
- "¿Olvidaste tu contraseña?" link appears inline next to the password label.
- Background is `#f8faf8` (very light sage green tint — visibly different from pure white).

- [ ] **Step 3: Test redirect with bad credentials**

Enter any email + wrong password → click "Ingresar".

Expected: error banner appears with sage green border focus state, red tinted error message.

- [ ] **Step 4: Test authenticated redirect**

Log in with valid credentials.

Expected: browser immediately redirects to `/dashboard`.

- [ ] **Step 5: Test authenticated → login redirect**

While logged in, navigate to `http://localhost:3000` directly.

Expected: middleware immediately redirects to `/dashboard` with no flash.

- [ ] **Step 6: Final CI**

```bash
pnpm ci
```

Expected: `pnpm lint` and `pnpm typecheck` both pass with zero warnings.

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Split-screen layout (left green, right white) — Task 4
- ✅ Cross icon in rounded square — Task 4
- ✅ Church name small caps — Task 4
- ✅ Divider line — Task 4
- ✅ Bible verse italic, semi-transparent — Task 4
- ✅ Decorative circles — Task 4
- ✅ "Bienvenido" heading + subtitle — Task 4
- ✅ Password show/hide toggle — Task 5
- ✅ "¿Olvidaste tu contraseña?" inline link — Task 5
- ✅ Full-width "Ingresar" button — Task 5
- ✅ "Acceso restringido" note — Task 4
- ✅ Mobile: verse stacked on top — Task 4 (`flex-col md:flex-row`)
- ✅ `/login` route removed — Task 6
- ✅ Middleware updated — Task 3
- ✅ Sage & Stone tokens — Task 1
- ✅ Manrope heading font — Task 2

**No placeholders:** All steps have actual code or exact commands.

**Token consistency:** All color references use literal hex values or CSS vars from Task 1. `font-heading` defined in Task 1 globals, used in Task 4 page.
