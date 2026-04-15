import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { canManageUsers } from "@/lib/permissions/rbac";
import { usuariosService } from "@/services/usuarios/usuarios.service";
import { createUsuarioSchema } from "@/lib/validators/usuario";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const rows = await usuariosService.list();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createUsuarioSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos invalidos", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const created = await usuariosService.create(parsed.data, user.id);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ message }, { status: 400 });
  }
}
