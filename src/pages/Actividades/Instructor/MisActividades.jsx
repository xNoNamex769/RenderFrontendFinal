import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/MisActividades.css";

export default function MisActividades() {
  const [actividades, setActividades] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUsuarioId(decoded.IdUsuario);

      axios
        .get("https://render-hhyo.onrender.com/api/actividad")
        .then((res) => {
 const actividadesUsuario = res.data.filter(
  (a) =>
    a.IdUsuario === decoded.IdUsuario &&
    (!a.TipoLudica || a.TipoLudica.trim() === "")
);

setActividades(actividadesUsuario);
        })
        .catch((err) => console.error("❌ Error actividades:", err));
    }
  }, []);

  const obtenerAsistencias = async (idActividad) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://render-hhyo.onrender.com/api/asistencia/actividad/${idActividad}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAsistencias((prev) => ({ ...prev, [idActividad]: res.data }));
    } catch (err) {
      console.error("❌ Error obteniendo asistencia:", err);
    }
  };

  return (
    <div className="mis-actividades-contenedor">
      <h2>📋 Mis Actividades Registradas</h2>

      {actividades.length === 0 && <p>No has registrado actividades aún.</p>}

      {actividades.map((actividad) => (
        <div key={actividad.IdActividad} className="actividad-card">
          <h3>{actividad.NombreActi}</h3>
          <p>
            🗓️ {actividad.FechaInicio} | ⏰ {actividad.HoraInicio} -{" "}
            {actividad.HoraFin}
          </p>
          <p>📍 {actividad.Ubicacion}</p>

          {/* Mostrar QR entrada */}
          {actividad.CodigoQR && (
            <div className="qr-contenedor">
              <h4>📥 QR Entrada</h4>
              <img
                src={actividad.CodigoQR}
                alt="QR Entrada"
                className="qr-imagen"
              />
            </div>
          )}

          {/* Mostrar QR salida */}
          {actividad.CodigoQRSalida && (
            <div className="qr-contenedor">
              <h4>📤 QR Salida</h4>
              <img
                src={actividad.CodigoQRSalida}
                alt="QR Salida"
                className="qr-imagen"
              />
            </div>
          )}

          <button
            className="btn-ver-asistencia"
            onClick={() => obtenerAsistencias(actividad.IdActividad)}
          >
            📥 Ver asistencia
          </button>

          {asistencias[actividad.IdActividad] && (
            <div className="tabla-asistencia">
              <h4>📊 Asistencia registrada</h4>
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Ficha</th>
                    <th>Programa</th>
                    <th>Jornada</th>
                    <th>Hora Entrada</th>
                    <th>Hora Salida</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {asistencias[actividad.IdActividad].map((asistente, index) => (
                    <tr key={index}>
                      <td>
                        {asistente.usuario?.nombre} {asistente.usuario?.apellido}
                      </td>
                      <td>{asistente.usuario?.correo}</td>
                      <td>{asistente.usuario?.aprendiz?.Ficha || "—"}</td>
                      <td>{asistente.usuario?.aprendiz?.ProgramaFormacion || "—"}</td>
                      <td>{asistente.usuario?.aprendiz?.Jornada || "—"}</td>
                      <td>
                        {asistente.QREntrada
                          ? new Date(asistente.QREntrada).toLocaleTimeString("es-CO")
                          : "—"}
                      </td>
                      <td>
                        {asistente.QRSalida
                          ? new Date(asistente.QRSalida).toLocaleTimeString("es-CO")
                          : "—"}
                      </td>
                      <td>
                        {asistente.QREntrada && asistente.QRSalida
                          ? "✅ Completa"
                          : asistente.QREntrada
                          ? "🕓 Solo entrada"
                          : "❌ Sin registro"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
