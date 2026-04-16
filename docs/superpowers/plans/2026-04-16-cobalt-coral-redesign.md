# Cobalt & Coral Palette Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the monochromatic Sage & Stone green palette with Cobalt & Coral — deep cobalt blue primary, coral accent, emerald green for income — and swap fonts to Roboto Slab (headings/numbers) + Roboto (body).

**Architecture:** All color values live in CSS custom properties in `app/globals.css` and the `:root` shadcn block. Font declarations live in `app/layout.tsx` via `next/font/google`. Page components use Tailwind semantic classes (`bg-primary`, `text-muted-foreground`, etc.) that resolve through these tokens — so updating tokens propagates everywhere automatically. A handful of pages hardcode income/expense colors that need new semantic tokens added.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, CSS custom properties, `next/font/google`, shadcn/Base UI components.

---

## File Map

| File | Change |
|---|---|
| `app/layout.tsx` | Swap `Manrope` + `Inter` → `Roboto_Slab` + `Roboto` |
| `app/globals.css` | Replace all color tokens; add income/accent semantic tokens; add dark mode block |
| `app/(dashboard)/dashboard/page.tsx` | Use new `text-income` / `text-accent` tokens for stat badges |
| `app/(dashboard)/movimientos/page.tsx` | Use new income/expense tokens |
| `app/(dashboard)/movimientos/[id]/page.tsx` | Use new income/expense tokens |
| `app/(dashboard)/movimientos/[id]/editar/page.tsx` | Use new tokens |
| `app/(dashboard)/movimientos/nuevo/page.tsx` | Use new tokens |
| `app/(dashboard)/rendicion-boletas/page.tsx` | Use new tokens |
| `app/(dashboard)/eventos/page.tsx` | Use new tokens |
| `app/(dashboard)/auditoria/page.tsx` | Use new tokens |
| `app/page.tsx` (login) | Use new tokens |

---

## Task 1: Swap fonts in layout.tsx

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace font imports and variables**

```tsx
import type { Metadata } from "next"
import { Roboto, Roboto_Slab } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap"
})

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-roboto-slab",
  display: "swap"
})

export const metadata: Metadata = {
  title: "Sistema Contable Iglesia",
  description: "Sistema de contabilidad para iglesia"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={cn(roboto.variable, robotoSlab.variable)}>
      <body className="antialiased min-h-screen font-sans bg-background text-on-surface">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Run typecheck to confirm no errors**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: swap fonts to Roboto Slab + Roboto"
```

---

## Task 2: Replace color tokens in globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace the full `@theme inline` block**

Replace the entire `@theme inline { ... }` block with:

```css
@theme inline {
  /* Cobalt & Coral palette */
  --color-primary: #1558b0;
  --color-primary-light: #5a9de0;
  --color-primary-surface: #f0f7ff;
  --color-primary-border: #a8ccf0;
  --color-primary-container: #ddeeff;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #0a2a58;
  --color-primary-fixed: #f0f7ff;

  --color-background: #ffffff;
  --color-surface: #ffffff;
  --color-surface-bright: #ffffff;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f0f7ff;
  --color-surface-container: #f0f7ff;
  --color-surface-container-high: #ddeeff;
  --color-surface-container-highest: #c8dff8;
  --color-surface-dim: #ddeeff;
  --color-surface-variant: #f0f7ff;
  --color-surface-tint: #1558b0;

  --color-on-background: #0a2a58;
  --color-on-surface: #0a2a58;
  --color-on-surface-variant: #4a7ab0;
  --color-inverse-surface: #0a2a58;
  --color-inverse-on-surface: #f0f7ff;
  --color-inverse-primary: #5a9de0;

  --color-outline: #4a7ab0;
  --color-outline-variant: #ddeeff;

  --color-error: #e85040;
  --color-error-container: #fde8e6;
  --color-on-error: #ffffff;
  --color-on-error-container: #5a0a00;

  --color-secondary: #f0f7ff;
  --color-secondary-container: #f0f7ff;
  --color-on-secondary: #0a2a58;
  --color-on-secondary-container: #0a2a58;
  --color-secondary-fixed: #f0f7ff;
  --color-secondary-fixed-dim: #ddeeff;
  --color-on-secondary-fixed: #0a2a58;
  --color-on-secondary-fixed-variant: #1558b0;

  --color-tertiary: #22a060;
  --color-tertiary-container: #d8f2e8;
  --color-on-tertiary: #ffffff;
  --color-on-tertiary-container: #083820;
  --color-tertiary-fixed: #d8f2e8;
  --color-tertiary-fixed-dim: #90cca8;
  --color-on-tertiary-fixed: #083820;
  --color-on-tertiary-fixed-variant: #22a060;

  /* Income semantic tokens */
  --color-income: #22a060;
  --color-income-surface: #d8f2e8;
  --color-income-border: #90cca8;
  --color-on-income: #083820;

  /* Expense / accent semantic tokens */
  --color-expense: #e85040;
  --color-expense-surface: #fde8e6;
  --color-expense-border: #f0b0a8;

  /* Role badge tokens */
  --color-role-purple: #6010a0;
  --color-role-purple-surface: #f0e4fc;

  /* Font tokens */
  --font-sans: var(--font-roboto);
  --font-heading: var(--font-roboto-slab);

  /* Radius scale (unchanged) */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  /* shadcn pass-through — wired to Cobalt & Coral */
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

- [ ] **Step 2: Replace the `:root` shadcn block**

Replace the entire `:root { ... }` block with:

```css
:root {
  --background: #ffffff;
  --foreground: #0a2a58;
  --card: #ffffff;
  --card-foreground: #0a2a58;
  --popover: #ffffff;
  --popover-foreground: #0a2a58;
  --primary: #1558b0;
  --primary-foreground: #ffffff;
  --secondary: #f0f7ff;
  --secondary-foreground: #0a2a58;
  --muted: #f0f7ff;
  --muted-foreground: #4a7ab0;
  --accent: #f0f7ff;
  --accent-foreground: #0a2a58;
  --destructive: #e85040;
  --border: #ddeeff;
  --input: #a8ccf0;
  --ring: #1558b0;
  --radius: 0.625rem;
  --chart-1: #1558b0;
  --chart-2: #5a9de0;
  --chart-3: #e85040;
  --chart-4: #f0b0a8;
  --chart-5: #22a060;
  --sidebar: #ffffff;
  --sidebar-foreground: #0a2a58;
  --sidebar-primary: #1558b0;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #f0f7ff;
  --sidebar-accent-foreground: #0a2a58;
  --sidebar-border: #ddeeff;
  --sidebar-ring: #1558b0;
}
```

- [ ] **Step 3: Add dark mode block after `:root`**

Add this block immediately after the closing `}` of `:root`:

```css
.dark {
  --background: #0d1829;
  --foreground: #c8dff8;
  --card: #132040;
  --card-foreground: #c8dff8;
  --popover: #132040;
  --popover-foreground: #c8dff8;
  --primary: #5a9de0;
  --primary-foreground: #0a2a58;
  --secondary: #1e3a68;
  --secondary-foreground: #c8dff8;
  --muted: #1e3a68;
  --muted-foreground: #5a8abf;
  --accent: #1e3a68;
  --accent-foreground: #c8dff8;
  --destructive: #e85040;
  --border: #1e3a68;
  --input: #1e3a68;
  --ring: #5a9de0;
  --chart-1: #5a9de0;
  --chart-2: #a8ccf0;
  --chart-3: #e85040;
  --chart-4: #f0b0a8;
  --chart-5: #22a060;
  --sidebar: #0d1829;
  --sidebar-foreground: #c8dff8;
  --sidebar-primary: #5a9de0;
  --sidebar-primary-foreground: #0d1829;
  --sidebar-accent: #1e3a68;
  --sidebar-accent-foreground: #c8dff8;
  --sidebar-border: #1e3a68;
  --sidebar-ring: #5a9de0;
}
```

- [ ] **Step 4: Run CI to confirm no errors**

```bash
pnpm ci
```

Expected: lint + typecheck pass.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat: replace Sage & Stone tokens with Cobalt & Coral palette"
```

---

## Task 3: Update income/expense hardcoded colors in pages

Several pages hardcode `text-primary` for income badges, `bg-primary/10` for income pills, or `bg-expense-surface` for expense. Add new utility classes and update.

**Files:**
- Modify: `app/globals.css` (add utilities)
- Modify: `app/(dashboard)/movimientos/page.tsx`
- Modify: `app/(dashboard)/movimientos/[id]/page.tsx`
- Modify: `app/(dashboard)/movimientos/[id]/editar/page.tsx`
- Modify: `app/(dashboard)/movimientos/nuevo/page.tsx`
- Modify: `app/(dashboard)/rendicion-boletas/page.tsx`
- Modify: `app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Add semantic utility classes to globals.css**

Add this block inside `@layer base` in `app/globals.css`, after the existing `html` rule:

```css
/* Income / expense semantic helpers */
.badge-income {
  background-color: var(--color-income-surface);
  color: var(--color-on-income);
  border: 1px solid var(--color-income-border);
}
.badge-expense {
  background-color: var(--color-expense-surface);
  color: var(--color-expense);
  border: 1px solid var(--color-expense-border);
}
.text-income {
  color: var(--color-income);
}
.text-expense {
  color: var(--color-expense);
}
.bg-income-surface {
  background-color: var(--color-income-surface);
}
.bg-expense-surface {
  background-color: var(--color-expense-surface);
}
```

- [ ] **Step 2: In all pages, replace income/expense color classes**

For every file listed above, apply these find-and-replace rules:

| Find | Replace |
|---|---|
| `bg-primary/10 text-primary` (income badge) | `badge-income` |
| `bg-expense-surface text-expense` (expense badge) | `badge-expense` |
| `text-primary` on income amount | `text-income` |
| `text-expense` on expense amount | `text-expense` |
| `bg-primary/5 border border-primary/10` (file preview) | `bg-income-surface border border-[--color-income-border]` |

> Note: `text-primary` used for non-income purposes (links, buttons, dates) stays as `text-primary` — only change instances that represent income/financial positive values.

- [ ] **Step 3: Run CI**

```bash
pnpm ci
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/(dashboard)/movimientos app/(dashboard)/rendicion-boletas/page.tsx app/(dashboard)/dashboard/page.tsx
git commit -m "feat: use semantic income/expense tokens across pages"
```

---

## Task 4: Add dark mode toggle

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/ui/theme-toggle.tsx`
- Modify: `components/dashboard/app-sidebar.tsx`

- [ ] **Step 1: Add theme script to layout to prevent flash**

In `app/layout.tsx`, add a blocking script before `<body>` that reads localStorage and applies `.dark` class immediately:

```tsx
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={cn(roboto.variable, robotoSlab.variable)}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pibt-theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();`
          }}
        />
      </head>
      <body className="antialiased min-h-screen font-sans bg-background text-on-surface">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create ThemeToggle component**

Create `components/ui/theme-toggle.tsx`:

```tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem("pibt-theme", next ? "dark" : "light")
    } catch {}
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label="Cambiar tema">
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
```

- [ ] **Step 3: Add ThemeToggle to sidebar header**

In `components/dashboard/app-sidebar.tsx`, import and add the toggle to the `SidebarHeader`:

```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle"

// Inside SidebarHeader, after the existing SidebarMenu:
<SidebarHeader>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LayoutDashboard className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">Sistema Contable</span>
          <span className="truncate text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            PIBT
          </span>
        </div>
        <ThemeToggle />
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarHeader>
```

- [ ] **Step 4: Run CI**

```bash
pnpm ci
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx components/ui/theme-toggle.tsx components/dashboard/app-sidebar.tsx
git commit -m "feat: add dark mode toggle with localStorage persistence"
```

---

## Task 5: Verify visually and push

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Check these pages visually**

Open `http://localhost:3000` and verify:
- Login page: cobalt button, white background
- Dashboard: cobalt sidebar, cobalt stat card border, green income card, coral expense card
- Movimientos table: income badges green, expense badges coral, amounts in cobalt
- Rendición de Boletas: status badges use new colors
- Eventos: date labels in `text-primary` (cobalt), not green
- Dark mode toggle works — surfaces go dark, primary becomes `#5a9de0` lighter blue

- [ ] **Step 3: Run final CI**

```bash
pnpm ci
```

Expected: pass.

- [ ] **Step 4: Push branch**

```bash
git push origin feature/remaining-pages-redesign
```
