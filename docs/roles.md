# Roles and Permissions

The system has four roles, enforced at the API level in `lib/permissions/rbac.ts`
and on every table via Supabase Row Level Security (RLS).

## Role overview

| Role       | Spanish label | Description                                                         |
| ---------- | ------------- | ------------------------------------------------------------------- |
| `ADMIN`    | Admin         | Full system access — user management, configuration, all operations |
| `OPERATOR` | Operador      | Create and manage movements and fund request reviews                |
| `VIEWER`   | Visor         | Read-only access to all modules                                     |
| `MINISTER` | Ministro      | Submit fund requests and settle expenses for their ministry         |

## Permission matrix

| Action                            | ADMIN | OPERATOR | VIEWER | MINISTER |
| --------------------------------- | :---: | :------: | :----: | :------: |
| View movements                    |   ✓   |    ✓     |   ✓    |    —     |
| Create / edit movements           |   ✓   |    ✓     |   —    |    —     |
| View fund request workflow        |   ✓   |    ✓     |   —    |    ✓     |
| Submit fund requests (intentions) |   —   |    —     |   —    |    ✓     |
| Review / approve intentions       |   ✓   |    ✓     |   —    |    —     |
| Register transfer                 |   ✓   |    ✓     |   —    |    —     |
| Submit settlements                |   —   |    —     |   —    |    ✓     |
| Review settlements                |   ✓   |    ✓     |   —    |    —     |
| Manage ministries & budgets       |   ✓   |    ✓     |   —    |    —     |
| Manage users                      |   ✓   |    —     |   —    |    —     |
| Manage system settings            |   ✓   |    —     |   —    |    —     |

## Role source of truth

```
types/auth.ts                    → UserRole type
lib/permissions/rbac.ts          → Permission check functions
lib/validators/usuario.ts        → Zod enum for create/update
```

## Creating users

Only `ADMIN` users can create accounts. There is no public sign-up.

Flow:

1. ADMIN opens **Users** (`/usuarios`) and clicks **Invite user**.
2. Fills name, email, and role — all four roles are available.
3. System sends an invite email via Resend (24 h link).
4. User activates their account by setting a password.

## Changing a role

ADMIN can change a user's role at any time from the Users page.
The change takes effect on the user's next request (session token is validated server-side on each call).

## MINISTER role specifics

`MINISTER` is a restricted role for ministry leaders:

- Access granted: `/solicitudes` (fund requests), `/rendiciones` (settlements).
- Access denied: `/movimientos`, `/presupuesto`, `/ministerios`, `/usuarios`, `/configuracion`.
- Can only view and act on their **own** requests — enforced by RLS.
- Cannot see other ministries' requests or budget allocations.

## Adding a new role

1. Add the value to `UserRole` in `types/auth.ts`.
2. Add it to the `roles` array and add permission check functions in `lib/permissions/rbac.ts`.
3. Add it to the Zod enums in `lib/validators/usuario.ts`.
4. Add the `<option>` to both selects in `components/usuarios/usuarios-manager.tsx`.
5. Add `roleLabel` and `roleBadgeClass` cases in the same file.
6. Update RLS policies in Supabase if the role needs row-level isolation.
