import React, { useEffect, useState } from "react";
import { obtenerResumen } from "../services/resumenService";
import ResumenIA from "../components/ResumenIA";

export default function ResumenPage() {
  const [resumen, setResumen] = useState<any>(null);

  useEffect(() => {
    async function fetchResumen() {
      const data = await obtenerResumen(23); // Cambia por el ID que necesites
      if (data.ok) setResumen(data.resumen);
    }
    fetchResumen();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {resumen ? (
        <ResumenIA resumen={resumen} />
      ) : (
        <p className="text-center text-gray-700">Cargando resumen...</p>
      )}
    </div>
  );
}
