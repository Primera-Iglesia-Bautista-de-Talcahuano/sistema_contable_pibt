# Redesign Spec — Sistema Contable PIBT

**Date:** 2026-04-15  
**Status:** Approved  

---

## Context

The current app was built quickly for function, not usability. It has oversized components, a public marketing landing page that serves no purpose for an internal tool, and a layout that doesn't adapt well to mobile. The finance team (3+ people, primarily mobile users) needs a professional, accessible interface that feels as comfortable on a phone as on a desktop.

The redesign replaces all pages with a consistent design system built on **shadcn + Base UI primitives** (already configured via `components.json` with `style: "base-vega"`). No Radix UI is introduced — Base UI remains the headless primitive layer throughout.

---

## Design System

### Color Palette — Sage & Stone

| Token | Value | Usage |
|---|---|---|
| Primary | `#5c8a6e` | Buttons, active states, hero cards, FAB |
| Primary light | `#8fbd9f` | Chart bars (income), chart legend |
| Primary surface | `#eef5f1` | Active nav items, category chips selected, tag backgrounds |
| Primary border | `#c8dfd0` | Card borders, input borders |
| Background | `#f8faf8` | Page background |
| Surface | `white` | Cards, sidebar, inputs |
| Dark text | `#2d4a38` | Headings, primary content |
| Muted text | `#7a8c82` | Labels, secondary content, placeholders |
| Expense red | `#b56b5e` | Expense amounts, destructive actions |
| Expense surface | `#fdf0ee` | Expense icon backgrounds |
| Expense border | `#f5c4bb` | Expense-related borders |
| Role purple | `#7c6fa0` | Operator role badge |
| Role purple surface | `#f5f3fa` | Operator role badge background |

### Typography

- **Headings:** Manrope, `font-weight: 700`, tight tracking
- **Body / UI:** Inter, `font-weight: 400–600`
- **Labels:** 8–10px, `text-transform: uppercase`, `letter-spacing: 0.5px`, `font-weight: 600–700`
- **Monospace** (folios, dates in tables): system monospace

### Spacing & Shape

- **Border radius:** `rounded-lg` (8px) for inputs/chips, `rounded-xl` (10–12px) for cards, `rounded-full` for badges/avatars
- **Card borders:** `1px solid #e0ebe5` — no heavy shadows, subtle definition
- **Inactive elements:** `opacity: 0.55` (cancelled movements, inactive users)

### Component Conventions

- **Badges/status pills:** `rounded-full`, small caps, color-coded by semantic meaning
- **Cancelled rows:** dimmed at 55% opacity + strikethrough on concept text
- **Active/selected states:** green border (`1.5px solid #5c8a6e`) on focused inputs
- **Destructive actions:** `#b56b5e` text on `#fdf0ee` background — never red buttons
- **Form labels:** 9–10px uppercase, `color: #7a8c82`, above the input

---

## Shell / Global Layout

### Desktop
- **Sidebar** (220px, always visible): brand name + church subtitle → "Nuevo Movimiento" CTA → nav links (Dashboard, Movimientos, Usuarios, Config) → user profile card at bottom
- **Page header strip** (sticky): page title + subtitle on the left, contextual controls on the right
- **Content area:** scrollable, `padding: 20px 24px`, max-width container

### Mobile
- **Sticky top bar:** hamburger icon (left) → app name (center) → user avatar (right)
- **Hamburger drawer:** full-height slide-in from left, same nav as sidebar + user profile at bottom. Semi-transparent overlay behind.
- **FAB:** `#5c8a6e` circle, bottom-right, `position: fixed`, `z-index: 50`. Opens new movement form. Hidden on desktop (`md:hidden`).
- **No "Nuevo Movimiento" in the drawer** — FAB is the mobile entry point for this action.

### Navigation links (role-filtered)
- ⊞ Dashboard (all roles)
- ↕ Movimientos (all roles)
- 👥 Usuarios (ADMIN only)
- ⚙ Configuración (ADMIN only)

---

## Pages

### `/` — Login

**Route behavior:** Unauthenticated → renders login. Authenticated → redirect to `/dashboard`. The `/login` route is removed; middleware handles the redirect.

**Desktop layout:** Split screen — left half green verse panel, right half white form.

**Left panel (green `#5c8a6e`):**
- Cross icon (✝) in a semi-transparent rounded square
- Church name: "Primera Iglesia Bautista de Talcahuano" (small caps, muted)
- Short divider line
- Bible verse (italic, semi-transparent white): *"Evitamos que alguien nos censure en cuanto a esta ofrenda generosa… procurando hacer lo que es honesto, no sólo delante del Señor, sino también delante de los hombres."*
- Citation: `2 Corintios 8:20-21`
- Subtle decorative circles (rgba white, 5% opacity) in corners for depth

**Right panel (white):**
- "Bienvenido" heading + subtitle
- Email field, Password field (with show/hide toggle)
- "¿Olvidaste tu contraseña?" link inline next to password label
- Full-width green "Ingresar" button
- "Acceso restringido a personal autorizado" note at bottom

**Mobile layout:** Verse panel stacked on top (compact), form below. Same content.

---

### `/dashboard` — Dashboard

**Header:** Page title "Dashboard" + month picker (top-right, applies to all cards).

**KPIs:**
- **Hero card** (green background): Saldo Actual — large amount, income/expense nested chips inside on mobile, inline on desktop
- Income card (white, green amount + count of movements)
- Expense card (white, red amount + count of movements)

**Charts (desktop: side by side, mobile: stacked):**
- Bar chart: monthly income vs expense trend (4–6 months), green/red bars
- Category breakdown: horizontal progress bars with percentage labels

**Recent movements:**
- Section header with "Ver todos →" link
- Mobile: card list (icon + concept + folio + date + signed amount)
- Desktop: mini table (folio, concept, date, amount, status)
- Limited to 5–10 most recent

---

### `/movimientos` — Movements List

**Desktop toolbar (single row):**
- Search bar (full flex, placeholder: "Buscar por folio, concepto, persona...")
- Segmented type toggle: Todos / ↑ Ingresos / ↓ Egresos
- Date picker (month/range)
- "Más filtros" button (opens a filter panel for status, category, amount range)

**Mobile toolbar:**
- Search bar + "Filtros ▾" button on same row
- Active filters shown as dismissible chips below

**Results count** below toolbar: "N movimientos encontrados"

**Mobile:** Card list. Each card: type icon (green ↑ or red ↓ in colored bg) + concept + folio + date/category + signed amount + status badge. Cancelled: 55% opacity + strikethrough.

**Desktop:** Table with columns: Folio, Concepto (+ type sub-label), Categoría, Fecha, Monto (right-aligned, color-coded), Estado, chevron. Alternating very subtle row tint. Pagination footer.

**Clicking a row** → navigates to `/movimientos/[id]` (not a modal).

---

### `/movimientos/nuevo` and `/movimientos/[id]/editar` — Movement Form

**Full page layout.** Back arrow (top-left) + page title + "Guardar movimiento" button (top-right, always visible).

**Type selector:** Small inline segmented control at top: "Registrar como: [Ingreso] [Egreso]". Selecting a type updates the category chips below.

**Amount:** Centered, large underlined input — `$` prefix + large bold number. Border-bottom highlight in green when focused.

**Required fields** (above a dashed divider):
- Date (date picker) + Category (chips that match selected type) — side by side
- Concept — full width

**Optional fields** (collapsed by default):
- Toggle: `+ Agregar campos opcionales` with hint text "persona, pago, notas..."
- When expanded: Floating-label inputs in a grid:
  - Persona referencia, Recibido por, Entregado por, Beneficiario (people section)
  - Medio de pago (select), N° Comprobante (text) — side by side
  - Notas (textarea)

**Desktop:** Two columns — required fields left, optional fields right (always visible on desktop, no collapse needed).

**Validation:** Required field labels show a red `*`. On error, input border turns red with an inline error message below.

---

### `/movimientos/[id]` — Movement Detail

**Top bar:** Breadcrumb "← Movimientos / #XXXXXX — Concepto". Status badge (Activo/Anulado). Edit + Anular buttons (only for ADMIN/OPERATOR, only when ACTIVE).

**Hero card** (green background, full width): Type + category + folio (muted, top) → large amount → date. PDF actions (Ver PDF + Regenerar) inside the hero on the right side (desktop).

**Fields grid** (2 columns): Concepto, Medio de pago, Recibido por, Persona referencia, N° Comprobante, Notas. Empty fields shown as "—".

**Cancellation notice** (if CANCELLED): red-tinted box with cancellation reason below the fields grid.

**Audit timeline:** Vertical timeline with green dots and connecting line. Each event: action label (bold) + user + timestamp.

**Right sidebar** (desktop only):
- Traceability card: Creado por (avatar + name + datetime), Última edición, Anulado por
- Technical status card: PDF status badge, Google Sheets badge, Notificación badge

**Mobile:** All sections stacked. Technical status at the bottom.

---

### `/usuarios` — User Management (ADMIN only)

**Stats row** (3 cards): Personal activo (N de M), Administradores (N), Trazabilidad (100%).

**Search + invite bar:** Search input (full width) + "Invitar usuario" green button — on the same row, directly above the list. Count label below.

**User list** (horizontal cards):
- Avatar (initials, colored circle) + Name (bold) + Email (muted) — left side
- Role badge (color-coded: green=Admin, purple=Operator, grey=Viewer) + active toggle + "Editar" button — right side
- Inactive users: 55% opacity

**Clicking "Editar"** opens a dialog to change: full name, role (select), active toggle.

**Clicking "Invitar usuario"** opens a dialog with: full name, email, password, role select.

**Mobile:** Same card layout — each card stacks naturally. Tapping a card opens the edit dialog.

---

### `/configuracion` — System Audit Log (ADMIN only)

**Page subtitle:** "Registro de auditoría del sistema · Últimos 50 eventos"

**Table columns:** Fecha (monospace, compact) | Entidad (color-coded badge: green=MOVIMIENTO, purple=USUARIO, red=CANCELLED) | Acción (bold) | Usuario | Observación (truncated)

**Alternating row tints** (very subtle `#fafcfa` on even rows).

**Mobile:** Compact list — each row shows date + action + user on one line, observation below.

---

## Interaction Patterns

| Pattern | Implementation |
|---|---|
| New movement (mobile) | FAB → full page form |
| New movement (desktop) | Sidebar button → full page form |
| View movement detail | Click row → navigate to `/movimientos/[id]` |
| Edit movement | "Editar" button in detail page top bar → `/movimientos/[id]/editar` |
| Cancel movement | "Anular" button → confirmation dialog with reason input |
| Invite user | "Invitar usuario" button → dialog |
| Edit user | "Editar" button on card → dialog |
| Filter movements | Segmented toggle (type) + date picker + "Más filtros" panel |
| Search | Debounced input, filters list in real time |

---

## Accessibility

- All interactive elements have `min-height: 44px` touch targets on mobile
- Color is never the only differentiator — badges have text labels, amounts have +/- signs
- Focus rings visible on all keyboard-navigable elements
- Cancelled/inactive states use opacity + text decoration, not color alone
- Form errors shown inline below the field, not only as color
- Drawer overlay dismissible via tap-outside or Escape key

---

## Files to Create / Modify

### Styling
- `app/globals.css` — replace MD3 tokens with Sage & Stone tokens

### Layout
- `app/(dashboard)/layout.tsx` — new sidebar + mobile drawer shell
- `app/layout.tsx` — keep Inter + Manrope fonts
- `middleware.ts` — update redirect logic, remove `/login` route

### Pages
- `app/page.tsx` — replace with login (remove marketing page, move auth check here)
- `app/(auth)/login/page.tsx` — remove (login moves to `/`)
- `app/(dashboard)/dashboard/page.tsx` — redesigned dashboard
- `app/(dashboard)/movimientos/page.tsx` — redesigned list
- `app/(dashboard)/movimientos/nuevo/page.tsx` — redesigned form
- `app/(dashboard)/movimientos/[id]/page.tsx` — redesigned detail
- `app/(dashboard)/movimientos/[id]/editar/page.tsx` — redesigned edit form
- `app/(dashboard)/usuarios/page.tsx` — redesigned user management
- `app/(dashboard)/configuracion/page.tsx` — redesigned audit log

### Components
- `components/ui/` — audit existing components, add missing shadcn/Base UI ones as needed
- `components/dashboard/dashboard-nav.tsx` — new sidebar + drawer
- `components/dashboard/dashboard-charts.tsx` — restyle with new palette
- `components/movimientos/movimiento-form.tsx` — new form with floating labels + collapsible optional
- `components/movimientos/movimientos-table.tsx` — new table + mobile card list
- `components/usuarios/usuarios-manager.tsx` — new card list + dialogs

---

## Verification

1. `pnpm dev` — run local dev server
2. Test login at `/` — unauthenticated renders verse + form; authenticated redirects to `/dashboard`
3. Test all nav links from sidebar (desktop) and drawer (mobile)
4. Test FAB on mobile viewport — opens new movement form
5. Create a new Ingreso movement — verify required fields, optional field collapse/expand, save
6. Create a new Egreso movement — verify category chips switch correctly
7. View movement detail — verify hero card, fields, audit timeline
8. Filter movements by type, date, status
9. Search movements by folio and concept
10. Admin: invite a new user, edit role, deactivate
11. Admin: check configuración audit log
12. `pnpm typecheck && pnpm lint` — must pass
