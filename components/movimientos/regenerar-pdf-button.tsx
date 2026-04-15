"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegenerarPdfButton({ movimientoId }: { movimientoId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onClick() {
    setLoading(true);
    const res = await fetch(`/api/movimientos/${movimientoId}/regenerar-pdf`, {
      method: "POST",
    });
    setLoading(false);

    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { message?: string };
      window.alert(payload.message ?? "No se pudo regenerar el PDF.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="inline-flex h-11 items-center px-5 rounded-xl border-none bg-surface-container-low hover:bg-surface-container-high text-on-surface text-sm font-bold transition-colors disabled:opacity-60"
    >
      {loading ? "Procesando..." : "Regenerar PDF"}
    </button>
  );
}
