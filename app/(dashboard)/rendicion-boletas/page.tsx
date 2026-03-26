"use client";

import { useState } from "react";

type Boleta = {
  id: string;
  numero: string;
  fecha: string;
  monto: number;
  descripcion: string;
  rendida: boolean;
};

export default function RendicionBoletasPage() {
  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!numero || !fecha || !monto) {
      return;
    }

    const nuevaBoleta: Boleta = {
      id: crypto.randomUUID(),
      numero,
      fecha,
      monto: parseFloat(monto),
      descripcion,
      rendida: false,
    };

    setBoletas((prev) => [nuevaBoleta, ...prev]);
    setNumero("");
    setFecha("");
    setMonto("");
    setDescripcion("");
  };

  const toggleRendida = (id: string) => {
    setBoletas((prev) =>
      prev.map((boleta) =>
        boleta.id === id ? { ...boleta, rendida: !boleta.rendida } : boleta
      )
    );
  };

  const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

  return (
    <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Rendición de Boletas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestiona la rendición de boletas. <strong>Plazo máximo: 30 de cada mes.</strong>
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Agregar Boleta</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="boleta-numero">
              Número de Boleta
            </label>
            <input
              id="boleta-numero"
              type="text"
              className="input"
              placeholder="Ej: BOL-001"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="boleta-fecha">
              Fecha
            </label>
            <input
              id="boleta-fecha"
              type="date"
              className="input"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="boleta-monto">
              Monto
            </label>
            <input
              id="boleta-monto"
              type="number"
              className="input"
              placeholder="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="boleta-descripcion">
              Descripción
            </label>
            <input
              id="boleta-descripcion"
              type="text"
              className="input"
              placeholder="Descripción de la boleta"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <button type="submit" className="btn-primary px-4 py-2">
              Agregar Boleta
            </button>
            <button
              type="button"
              className="btn-secondary px-4 py-2"
              onClick={() => {
                setNumero("");
                setFecha("");
                setMonto("");
                setDescripcion("");
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Boletas Registradas</h2>
        {boletas.length === 0 ? (
          <p className="text-sm text-slate-500">No hay boletas registradas aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">Número</th>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Monto</th>
                  <th className="px-3 py-2 text-left">Descripción</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2 text-left">Acción</th>
                </tr>
              </thead>
              <tbody>
                {boletas.map((boleta) => (
                  <tr key={boleta.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{boleta.numero}</td>
                    <td className="px-3 py-2">{boleta.fecha}</td>
                    <td className="px-3 py-2">{clp.format(boleta.monto)}</td>
                    <td className="px-3 py-2">{boleta.descripcion || "Sin descripción"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          boleta.rendida
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {boleta.rendida ? "Rendida" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => toggleRendida(boleta.id)}
                        className={`px-3 py-1 text-xs font-medium rounded ${
                          boleta.rendida
                            ? "bg-yellow-500 text-white hover:bg-yellow-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        {boleta.rendida ? "Marcar Pendiente" : "Marcar Rendida"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
