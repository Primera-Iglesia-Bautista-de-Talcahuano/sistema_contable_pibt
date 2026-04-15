import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SerieItem = { name: string; ingresos: number; egresos: number };
type CategoriaItem = { categoria: string; total: number };

type DashboardPeriodo = {
  from?: string;
  to?: string;
};

export const dashboardService = {
  async getResumen(periodo: DashboardPeriodo = {}) {
    const admin = createSupabaseAdminClient();

    let query = admin
      .from("movements")
      .select("id, movement_date, movement_type, amount, category, folio, folio_display, concept, status, created_by:users!created_by_id(full_name)")
      .eq("status", "ACTIVE");

    if (periodo.from) {
      const fromDate = new Date(periodo.from);
      if (!Number.isNaN(fromDate.getTime())) {
        query = query.gte("movement_date", fromDate.toISOString());
      }
    }
    if (periodo.to) {
      const toDate = new Date(periodo.to);
      if (!Number.isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        query = query.lte("movement_date", toDate.toISOString());
      }
    }

    const { data: activos, error } = await query.order("movement_date", { ascending: true });
    if (error) throw error;

    const ultimosMovimientos = [...activos]
      .sort((a, b) => new Date(b.movement_date).getTime() - new Date(a.movement_date).getTime() || b.folio - a.folio)
      .slice(0, 8);

    const totalIngresos = activos
      .filter((m) => m.movement_type === "INCOME")
      .reduce((acc, m) => acc + Number(m.amount), 0);
    const totalEgresos = activos
      .filter((m) => m.movement_type === "EXPENSE")
      .reduce((acc, m) => acc + Number(m.amount), 0);

    const serieMap = new Map<string, SerieItem>();
    for (const m of activos) {
      const month = new Date(m.movement_date).toLocaleDateString("es-CL", {
        month: "short",
        year: "2-digit",
      });
      const current = serieMap.get(month) ?? { name: month, ingresos: 0, egresos: 0 };
      if (m.movement_type === "INCOME") current.ingresos += Number(m.amount);
      if (m.movement_type === "EXPENSE") current.egresos += Number(m.amount);
      serieMap.set(month, current);
    }

    const categoriaMap = new Map<string, number>();
    for (const m of activos) {
      categoriaMap.set(m.category, (categoriaMap.get(m.category) ?? 0) + Number(m.amount));
    }

    const resumenPorCategoria: CategoriaItem[] = Array.from(categoriaMap.entries())
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    return {
      kpis: {
        totalIngresos,
        totalEgresos,
        saldoActual: totalIngresos - totalEgresos,
        cantidadMovimientos: activos.length,
      },
      serieIngresosEgresos: Array.from(serieMap.values()),
      resumenPorCategoria,
      ultimosMovimientos,
    };
  },
};
