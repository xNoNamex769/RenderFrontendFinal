import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Actividades({ setContenidoActual, setIdSeleccionada }) {
  const [actividades, setActividades] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const res = await axios.get("https://render-hhyo.onrender.com/api/asistencia", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setActividades(res.data);
      } catch (err) {
        console.error("Error al cargar actividades:", err);
      }
    };

    fetchActividades();
  }, [token]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📚 Actividades</h2>
      <div className="grid gap-4">
        {actividades.map((actividad) => (
          <div key={actividad.IdActividad} className="p-4 bg-white shadow rounded border">
            <h3 className="text-lg font-semibold">{actividad.NombreEvento}</h3>
            <p>📍 Ubicación: {actividad.UbicacionEvento}</p>
            <p>🗓️ Fecha: {new Date(actividad.FechaInicio).toLocaleDateString()}</p>
            <p>🕒 Hora: {actividad.HoraInicio} - {actividad.HoraFin}</p>

            <button
              className="btn-ver-asistencias mt-2"
              onClick={() => {
                setContenidoActual("asistenciasactividad");
                setIdSeleccionada(actividad.IdActividad);
              }}
            >
              📋 Ver Asistencias
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
