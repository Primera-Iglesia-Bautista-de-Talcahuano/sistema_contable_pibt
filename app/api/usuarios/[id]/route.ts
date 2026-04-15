import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { canManageUsers } from "@/lib/permissions/rbac";
import { usuariosService } from "@/services/usuarios/usuarios.service";
import { updateUsuarioSchema } from "@/lib/validators/usuario";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateUsuarioSchema.safeParse({ ...body, id });
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos invalidos", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await usuariosService.update(parsed.data, user.id);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ message }, { status: 400 });
  }
}
