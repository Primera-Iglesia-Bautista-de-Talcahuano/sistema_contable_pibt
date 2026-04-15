"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

type UsuarioRow = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string | Date;
};

type NewUserForm = {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
};

const defaultNewUser: NewUserForm = {
  full_name: "",
  email: "",
  password: "",
  role: "OPERATOR",
  active: true,
};

export function UsuariosManager({ initialUsers }: { initialUsers: UsuarioRow[] }) {
  const [users, setUsers] = useState<UsuarioRow[]>(initialUsers);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<NewUserForm>(defaultNewUser);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    setSubmitting(false);
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { message?: string };
      setError(payload.message ?? "No se pudo crear usuario.");
      return;
    }

    const created = (await res.json()) as UsuarioRow;
    setUsers((prev) => [...prev, created]);
    setNewUser(defaultNewUser);
    setOpen(false);
  }

  async function saveUser(user: UsuarioRow) {
    setError(null);
    const res = await fetch(`/api/usuarios/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: user.full_name,
        role: user.role,
        active: user.active,
      }),
    });
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { message?: string };
      setError(payload.message ?? `No se pudo actualizar ${user.email}.`);
      return;
    }
  }

  function updateUserLocal(id: string, patch: Partial<UsuarioRow>) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active).length;
  const adminUsers = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-8">
      {/* Header with Search and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 pb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">Administración de Equipo</h2>
          <p className="text-sm text-on-surface-variant font-medium">Control de accesos y roles para la gestión ministerial.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="primary" className="h-10 px-6 shadow-lg shadow-primary/10">
                <Plus className="mr-2 h-5 w-5" />
                Invitar Usuario
              </Button>
            }
          />
          <DialogContent className="w-[95vw] sm:max-w-xl bg-surface-container-lowest p-0 border-none shadow-[0px_40px_80px_-20px_rgba(25,28,30,0.15)] rounded-[2rem] overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-on-surface-variant/10">
            <div className="p-6 sm:p-12 space-y-8 sm:space-y-10">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold tracking-tight text-on-surface">Nuevo Usuario</DialogTitle>
                <DialogDescription className="text-on-surface-variant font-medium text-base mt-2">
                  Ingrese las credenciales para invitar a un nuevo colaborador al sistema.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={createUser} className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 px-1">
                    <div className="h-px flex-1 bg-on-surface-variant/10" />
                    <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant opacity-50">
                      Datos del Colaborador
                    </h3>
                    <div className="h-px flex-1 bg-on-surface-variant/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-full_name" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Nombre Completo</Label>
                    <Input
                      id="new-full_name"
                      placeholder="Ej: Juan Pérez"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser((s) => ({ ...s, full_name: e.target.value }))}
                      className="h-12 sm:h-14 bg-surface-container-low border-none shadow-none rounded-2xl px-5 text-base font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Correo Electrónico de Envío</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))}
                      className="h-12 sm:h-14 bg-surface-container-low border-none shadow-none rounded-2xl px-5 text-base font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Contraseña de Activación</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={newUser.password}
                      onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
                      className="h-12 sm:h-14 bg-surface-container-low border-none shadow-none rounded-2xl px-5 text-base font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-role" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Nivel de Acceso Ministerial</Label>
                    <select
                      id="new-role"
                      className="flex h-12 sm:h-14 w-full rounded-2xl border-none bg-surface-container-low px-5 py-2 text-base font-medium text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                      value={newUser.role}
                      onChange={(e) => setNewUser((s) => ({ ...s, role: e.target.value as UserRole }))}
                    >
                      <option value="ADMIN">ADMIN - Control del Sistema</option>
                      <option value="OPERATOR">OPERATOR - Ingreso de Datos</option>
                      <option value="VIEWER">VIEWER - Solo Lectura</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-on-surface-variant/5">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={submitting}
                    className="h-10 sm:h-11 text-sm sm:text-base shadow-lg shadow-primary/20 rounded-xl"
                  >
                    {submitting ? "Procesando Invitación..." : "Confirmar & Registrar Usuario"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-10 sm:h-11 border-none bg-surface-container-low hover:bg-surface-container-high transition-colors rounded-xl"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card className="bg-surface-container-lowest p-5 sm:p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.05)] border-none">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Personal Activo</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-4xl font-bold tracking-tight text-primary">{activeUsers}</h3>
            <span className="text-sm font-bold text-on-surface-variant">de {totalUsers} usuarios</span>
          </div>
        </Card>
        <Card className="bg-surface-container-lowest p-5 sm:p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.05)] border-none">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Administradores</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-4xl font-bold tracking-tight text-on-surface">{adminUsers}</h3>
            <span className="text-sm font-bold text-on-surface-variant">cuentas de control</span>
          </div>
        </Card>
        <Card className="bg-surface-container-lowest p-5 sm:p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.05)] border-none">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Auditoría de Acceso</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-4xl font-bold tracking-tight text-on-surface">100%</h3>
            <span className="text-sm font-bold text-on-surface-variant text-primary">Trazabilidad</span>
          </div>
        </Card>
      </div>

      {error && <p className="rounded-2xl bg-error-container/50 border border-error/10 px-4 py-3 text-sm font-bold text-on-error-container text-center">{error}</p>}

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Usuarios Registrados</h2>
          <span className="text-sm font-medium text-on-surface-variant">
            Mostrando {users.length} integrantes
          </span>
        </div>

        <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0px_4px_24px_-4px_rgba(25,28,30,0.06)] border border-outline/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-on-surface-variant/40 border-none">
                  <th className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Nombre & Estado</th>
                  <th className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Correo Electrónico</th>
                  <th className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Rol de Acceso</th>
                  <th className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Estado Cuenta</th>
                  <th className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-[10px] uppercase tracking-[0.2em] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={cn(
                      "group transition-all duration-300 hover:bg-surface-container-low/60",
                      index % 2 === 0 ? "bg-transparent" : "bg-surface-container-low/20"
                    )}
                  >
                    <td className="px-4 sm:px-8 py-4 sm:py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${user.active ? "bg-primary shadow-[0_0_8px_rgba(13,148,136,0.4)]" : "bg-on-surface-variant/30"}`} />
                        <Input
                          value={user.full_name}
                          onChange={(e) => updateUserLocal(user.id, { full_name: e.target.value })}
                          className="bg-transparent border-none shadow-none p-0 h-auto text-base font-bold text-on-surface focus-visible:ring-0 w-full min-w-[150px]"
                        />
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-5 text-sm font-medium text-on-surface-variant truncate max-w-[200px]">
                      {user.email}
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-5">
                      <div className="relative inline-block group/select">
                        <select
                          className="bg-surface-container-low/50 hover:bg-surface-container-low border-none rounded-full px-4 py-1.5 text-[11px] font-black text-primary uppercase tracking-widest outline-none cursor-pointer appearance-none transition-colors"
                          value={user.role}
                          onChange={(e) => updateUserLocal(user.id, { role: e.target.value as UserRole })}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="OPERATOR">OPERATOR</option>
                          <option value="VIEWER">VIEWER</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-5">
                      <label className="flex items-center gap-3 cursor-pointer group/toggle inline-flex">
                        <div className={`w-10 h-5 rounded-full p-1 transition-all duration-300 ${user.active ? "bg-primary" : "bg-on-surface-variant/20"}`}>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={user.active}
                            onChange={(e) => updateUserLocal(user.id, { active: e.target.checked })}
                          />
                          <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${user.active ? "translate-x-5" : "translate-x-0"}`} />
                        </div>
                        <span className="text-[10px] font-black text-on-surface-variant/60 tracking-widest">{user.active ? "ACTIVO" : "INACTIVO"}</span>
                      </label>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-5 text-right">
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => void saveUser(user)}
                        className="sm:opacity-0 sm:group-hover:opacity-100 sm:scale-95 sm:group-hover:scale-100 transition-all rounded-full px-6 shadow-lg shadow-primary/10"
                      >
                        Guardar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!users.length && (
            <div className="p-20 text-center">
              <p className="text-sm font-medium text-on-surface-variant/60">No hay usuarios registrados en el equipo ministerial.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
