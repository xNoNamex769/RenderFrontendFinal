import React from "react";
import "./style/Inventario.css"


//  Esta función agrupa los elementos por tipo y cuenta los disponibles
const agruparPorTipo = (elementos) => {
  const resumen = {};

  elementos.forEach((el) => {
    if (el.disponible) {
      const tipo = el.tipo || "Otros";
      resumen[tipo] = (resumen[tipo] || 0) + 1;
    }
  });

  return resumen;
};

const InventarioResumen = ({ elementos = [] }) => {
  const resumen = agruparPorTipo(elementos);

  return (
    <section className="inventario-resumen">
    <h1 className="inventario-actual">inventario Actual</h1>
<svg role="img" aria-label="Caja" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"  className="icono-actual">
  <path d="M21 16V8a2 2 0 0 0-1-1.73L13 3.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  <path d="M12 3v9"/>
  <path d="M3.5 8.5l8 4 8-4"/>
</svg>


      <ul>
        {Object.entries(resumen).map(([tipo, cantidad], index) => (
          <li key={index}>
            <strong>{tipo}:</strong> {cantidad} disponibles
          </li>
        ))}
      </ul>
    </section>
  );
};

export default InventarioResumen;
