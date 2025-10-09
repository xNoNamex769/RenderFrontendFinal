import React, { useEffect, useState } from "react";
import "./style/Hallowen.css";

export default function DashThemed({ esTemaHalloween, setEsTemaHalloween }) {
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    if (esTemaHalloween) {
      document.body.classList.add("theme-halloween");
    } else {
      document.body.classList.remove("theme-halloween");
    }
  }, [esTemaHalloween]);

  const toggleTema = () => {
    const nuevoEstado = !esTemaHalloween;
    setEsTemaHalloween(nuevoEstado);
    localStorage.setItem("tema-halloween", nuevoEstado ? "true" : "false");

    mostrarMensaje(
      nuevoEstado
        ? "🎃 Modo Halloween activado"
        : "🎃 Modo Halloween desactivado"
    );
  };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(null), 3000);
  };

  return (
    <div className="dash-themed-panel">
      <div className="dash-themed-header">
        <h2 className="dash-themed-title">🎃 Tema Halloween</h2>
        <p className="dash-themed-sub">Preparado para este Hallowen? ¡vamos!</p>
      </div>

      <button
        onClick={toggleTema}
        className={`dash-themed-button ${esTemaHalloween ? "activo" : ""}`}
      >
        {esTemaHalloween ? "👻 Desactivar Halloween" : "🕸 Activar Halloween"}
      </button>

      {mensaje && <div className="dash-themed-toast">{mensaje}</div>}
    </div>
  );
}
