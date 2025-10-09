import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style/MisLudicas.css";
import ReporteAsistencia from "./Reportes"; 
import { MdEvent, MdAccessTime, MdLocationOn, MdGroups, MdBarChart } from "react-icons/md";
import { FaDoorOpen, FaDoorClosed, FaTimesCircle, FaCheckCircle } from "react-icons/fa";

export default function MisActividadesYLudicas() {
  const [actividades, setActividades] = useState([]);
  const [ludicas, setLudicas] = useState([]);
  const [vista, setVista] = useState("actividades");
  const [asistencias, setAsistencias] = useState({});
  const [usuarioId, setUsuarioId] = useState(null);

  // nuevo estado para modal/reporte
  const [modalOpen, setModalOpen] = useState(false);
  const [reporteActividadId, setReporteActividadId] = useState(null);

  // Helper: devuelve true si la actividad NO ha finalizado (es futura o termina hoy)
  const isUpcoming = (actividad) => {
    if (!actividad) return false;
    const now = new Date();

    const parseToLocalDate = (dateStr) => {
      if (!dateStr) return null;
      // Si viene solo como "YYYY-MM-DD", crear la fecha en local para evitar shift UTC
      const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
      if (dateOnlyMatch) {
        const [y, m, d] = dateStr.split("-").map(Number);
        return new Date(y, m - 1, d);
      }
      // Si viene con hora/ISO, usar Date()
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    // Preferir FechaFin si existe, si no usar FechaInicio
    const fechaCompararStr = actividad.FechaFin || actividad.FechaInicio;
    const fechaComparar = parseToLocalDate(fechaCompararStr);
    if (!fechaComparar) return false;

    // Considerar evento vigente durante todo el día => llevar al final del día
    fechaComparar.setHours(23, 59, 59, 999);
    return fechaComparar >= now;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let decoded;
    try {
      decoded = JSON.parse(atob(token.split(".")[1]));
      setUsuarioId(decoded.IdUsuario);
    } catch (err) {
      console.error("❌ Error decodificando token:", err);
      return;
    }

    axios
      .get("https://render-hhyo.onrender.com/api/actividad")
      .then((res) => {
        const todas = res.data || [];

        const actividadesFiltradas = todas.filter(
          (a) =>
            a.IdUsuario === decoded.IdUsuario &&
            (!a.TipoLudica || a.TipoLudica.toString().trim() === "") &&
            isUpcoming(a) // <-- solo las que no han pasado
        );

        const ludicasFiltradas = todas.filter(
          (a) =>
            a.IdUsuario === decoded.IdUsuario &&
            a.TipoLudica &&
            a.TipoLudica.toString().trim() !== "" &&
            isUpcoming(a) // <-- solo las que no han pasado
        );

        setActividades(actividadesFiltradas);
        setLudicas(ludicasFiltradas);
      })
      .catch((err) => {
        console.error("❌ Error obteniendo actividades:", err);
      });
  }, []);

  const obtenerAsistencias = async (idActividad) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(
        `https://render-hhyo.onrender.com/api/asistencia/actividad/${idActividad}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAsistencias((prev) => ({ ...prev, [idActividad]: res.data }));
    } catch (err) {
      console.error("❌ Error obteniendo asistencia:", err);
    }
  };

  // abrir modal con el reporte
  const abrirReporte = (id) => {
    setReporteActividadId(id);
    setModalOpen(true);
  };
  const cerrarModal = () => {
    setModalOpen(false);
    setReporteActividadId(null);
  };

  return (
    <div className="mis-actividades-contenedor">
      <h2>Gestión de Actividades y Lúdicas</h2>

      <p className="descripcion-registros">
        Aquí puedes consultar tus <strong>actividades</strong> y <strong>lúdicas</strong>, 
        ver los registros de asistencia de los aprendices y generar reportes detallados 
        para cada evento.
      </p>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={vista === "actividades" ? "active-tab" : ""}
          onClick={() => setVista("actividades")}
        >
          Actividades
        </button>
        <button
          className={vista === "ludicas" ? "active-tab" : ""}
          onClick={() => setVista("ludicas")}
        >
          Lúdicas
        </button>
      </div>

      {/* Vista Actividades */}
      {vista === "actividades" &&
        actividades.map((act) => (
          <div key={act.IdActividad} className="actividad-card">
            <h3>{act.NombreActi}</h3>
            <p><MdEvent /> {act.FechaInicio} | <MdAccessTime /> {act.HoraInicio} - {act.HoraFin}</p>
            <p><MdLocationOn /> {act.Ubicacion}</p>

            <img src={`http://localhost:3001/uploads/${act.Imagen}`} alt="" width={200} />

            <div className="qr-contenedor">
              {act.CodigoQR && (
                <div className="qr-item">
                  <img src={act.CodigoQR} alt="QR Entrada" />
                  <span className="qr-label">Entrada</span>
                </div>
              )}
              {act.CodigoQRSalida && (
                <div className="qr-item">
                  <img src={act.CodigoQRSalida} alt="QR Salida" />
                  <span className="qr-label">Salida</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => obtenerAsistencias(act.IdActividad)}>
                <MdGroups /> Ver asistencia
              </button>

              <button onClick={() => abrirReporte(act.IdActividad)}>
                <MdBarChart /> Ver reporte
              </button>
            </div>

            {asistencias[act.IdActividad] && (
              <div className="tabla-asistencia">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Ficha</th>
                      <th>Programa</th>
                      <th>Jornada</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistencias[act.IdActividad].map((a, i) => (
                      <tr key={i}>
                        <td>{a.usuario?.Nombre} {a.usuario?.Apellido}</td>
                        <td>{a.usuario?.Correo}</td>
                        <td>{a.usuario?.perfilAprendiz?.Ficha || "—"}</td>
                        <td>{a.usuario?.perfilAprendiz?.ProgramaFormacion || "—"}</td>
                        <td>{a.usuario?.perfilAprendiz?.Jornada || "—"}</td>
                        <td>{a.QREntrada ? new Date(a.QREntrada).toLocaleTimeString() : "—"}</td>
                        <td>{a.QRSalida ? new Date(a.QRSalida).toLocaleTimeString() : "—"}</td>
                        <td>
                          {a.QREntrada && a.QRSalida
                            ? <><FaCheckCircle color="green" /> Completa</>
                            : a.QREntrada
                            ? <><FaDoorOpen color="orange" /> Solo entrada</>
                            : <><FaTimesCircle color="red" /> Sin registro</>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

      {/* Vista Lúdicas */}
      {vista === "ludicas" &&
        ludicas.map((ludica) => (
          <div key={ludica.IdActividad} className="actividad-card ludica-card">
            <h3>{ludica.NombreActi}</h3>
            <p><MdEvent /> {ludica.FechaInicio} | <MdAccessTime /> {ludica.HoraInicio} - {ludica.HoraFin}</p>
            <p><MdLocationOn /> {ludica.Ubicacion}</p>

            <img src={`http://localhost:3001/uploads/${ludica.Imagen}`} alt="" width={200} />

            <div className="qr-contenedor">
              {ludica.CodigoQR && (
                <div className="qr-item">
                  <img src={ludica.CodigoQR} alt="QR Entrada" />
                  <span className="qr-label">Entrada</span>
                </div>
              )}
              {ludica.CodigoQRSalida && (
                <div className="qr-item">
                  <img src={ludica.CodigoQRSalida} alt="QR Salida" />
                  <span className="qr-label">Salida</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => obtenerAsistencias(ludica.IdActividad)}>
                <MdGroups /> Ver asistentes
              </button>

              <button onClick={() => abrirReporte(ludica.IdActividad)}>
                <MdBarChart /> Ver reporte
              </button>
            </div>

            {asistencias[ludica.IdActividad] && (
              <div className="tabla-asistencia">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Ficha</th>
                      <th>Programa</th>
                      <th>Jornada</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistencias[ludica.IdActividad].map((a, i) => (
                      <tr key={i}>
                        <td>{a.usuario?.Nombre} {a.usuario?.Apellido}</td>
                        <td>{a.usuario?.Correo}</td>
                        <td>{a.usuario?.perfilAprendiz?.Ficha || "—"}</td>
                        <td>{a.usuario?.perfilAprendiz?.ProgramaFormacion || "—"}</td>
                        <td>{a.usuario?.perfilAprendiz?.Jornada || "—"}</td>
                        <td>{a.QREntrada ? new Date(a.QREntrada).toLocaleTimeString() : "—"}</td>
                        <td>{a.QRSalida ? new Date(a.QRSalida).toLocaleTimeString() : "—"}</td>
                        <td>
                          {a.QREntrada && a.QRSalida
                            ? <><FaCheckCircle color="green" /> Completa</>
                            : a.QREntrada
                            ? <><FaDoorOpen color="orange" /> Solo entrada</>
                            : <><FaTimesCircle color="red" /> Sin registro</>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

      {/* Modal overlay */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={cerrarModal}
        >
          <div
            style={{ width: "95%", maxWidth: 1100, background: "#fff", borderRadius: 8, padding: 16, maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3>Reporte - Actividad {reporteActividadId}</h3>
              <button onClick={cerrarModal}>Cerrar ✖</button>
            </div>

            {/* Componente de reporte */}
            <ReporteAsistencia actividadId={reporteActividadId} />
          </div>
        </div>
      )}
    </div>
  );
}
