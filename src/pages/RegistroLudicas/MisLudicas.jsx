import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style/MisLudicas.css";
import "./style/GestionLudicasModerno.css";
import ReporteAsistencia from "./Reportes"; 
import { MdEvent, MdAccessTime, MdLocationOn, MdGroups, MdBarChart, MdSearch, MdFilterList, MdQrCode2, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaDoorOpen, FaDoorClosed, FaTimesCircle, FaCheckCircle, FaCalendarAlt, FaUsers, FaTrophy, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function MisActividadesYLudicas() {
  const [actividades, setActividades] = useState([]);
  const [ludicas, setLudicas] = useState([]);
  const [vista, setVista] = useState("actividades");
  const [asistencias, setAsistencias] = useState({});
  const [usuarioId, setUsuarioId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("todas");

  // nuevo estado para modal/reporte
  const [modalOpen, setModalOpen] = useState(false);
  const [reporteActividadId, setReporteActividadId] = useState(null);
  
  // Estado para mostrar/ocultar QR
  const [qrVisible, setQrVisible] = useState({});
  
  // Estado para expandir/colapsar tarjetas
  const [expandedCards, setExpandedCards] = useState({});

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
  
  // Toggle QR visibility
  const toggleQR = (id) => {
    setQrVisible(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  // Toggle card expansion
  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtrar actividades por búsqueda
  const filtrarActividades = (lista) => {
    return lista.filter(item => {
      const coincideBusqueda = item.NombreActi?.toLowerCase().includes(busqueda.toLowerCase()) ||
                               item.Ubicacion?.toLowerCase().includes(busqueda.toLowerCase());
      return coincideBusqueda;
    });
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const totalActividades = actividades.length;
    const totalLudicas = ludicas.length;
    const totalEventos = totalActividades + totalLudicas;
    return { totalActividades, totalLudicas, totalEventos };
  };

  const stats = calcularEstadisticas();
  const actividadesFiltradas = filtrarActividades(actividades);
  const ludicasFiltradas = filtrarActividades(ludicas);

  return (
    <div className="gestlud-wrapper">
      <div className="gestlud-header">
        <h2 className="gestlud-titulo-principal">📊 Gestión de Actividades y Lúdicas</h2>
        <p className="gestlud-subtitulo">
          Aquí puedes consultar tus <strong>actividades</strong> y <strong>lúdicas</strong>, 
          ver los registros de asistencia de los aprendices y generar reportes detallados 
          para cada evento.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="gestlud-stats-container">
        <div className="gestlud-stat-card">
          <div className="gestlud-stat-icon gestlud-stat-icon-total">
            <FaTrophy />
          </div>
          <div className="gestlud-stat-content">
            <span className="gestlud-stat-number">{stats.totalEventos}</span>
            <span className="gestlud-stat-label">Total Eventos</span>
          </div>
        </div>
        <div className="gestlud-stat-card">
          <div className="gestlud-stat-icon gestlud-stat-icon-actividades">
            <FaCalendarAlt />
          </div>
          <div className="gestlud-stat-content">
            <span className="gestlud-stat-number">{stats.totalActividades}</span>
            <span className="gestlud-stat-label">Actividades</span>
          </div>
        </div>
        <div className="gestlud-stat-card">
          <div className="gestlud-stat-icon gestlud-stat-icon-ludicas">
            <FaUsers />
          </div>
          <div className="gestlud-stat-content">
            <span className="gestlud-stat-number">{stats.totalLudicas}</span>
            <span className="gestlud-stat-label">Lúdicas</span>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="gestlud-search-container">
        <div className="gestlud-search-wrapper">
          <MdSearch className="gestlud-search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre o ubicación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="gestlud-search-input"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="gestlud-tabs-container">
        <button
          className={`gestlud-tab-btn ${vista === "actividades" ? "gestlud-tab-active" : ""}`}
          onClick={() => setVista("actividades")}
        >
          🎯 Actividades
        </button>
        <button
          className={`gestlud-tab-btn ${vista === "ludicas" ? "gestlud-tab-active" : ""}`}
          onClick={() => setVista("ludicas")}
        >
          💃 Lúdicas
        </button>
      </div>

      {/* Vista Actividades */}
      {vista === "actividades" && (
        <>
          {actividadesFiltradas.length === 0 ? (
            <div className="gestlud-no-resultados">
              <FaCalendarAlt className="gestlud-no-resultados-icon" />
              <h3>No se encontraron actividades</h3>
              <p>Intenta con otros términos de búsqueda o crea una nueva actividad.</p>
            </div>
          ) : (
            actividadesFiltradas.map((act) => (
          <div key={act.IdActividad} className="gestlud-actividad-card">
            <h3 className="gestlud-card-titulo">{act.NombreActi}</h3>
            
            <div className="gestlud-info-grid">
              <div className="gestlud-info-item">
                <MdEvent /> {act.FechaInicio}
              </div>
              <div className="gestlud-info-item">
                <MdAccessTime /> {act.HoraInicio} - {act.HoraFin}
              </div>
              <div className="gestlud-info-item">
                <MdLocationOn /> {act.Ubicacion}
              </div>
            </div>

            {act.Imagen && (
              <div className="gestlud-imagen-container">
                <img src={act.Imagen} alt={act.NombreActi} className="gestlud-imagen" />
              </div>
            )}

            <div className="gestlud-qr-section">
              <button 
                className="gestlud-qr-toggle-btn-modern"
                onClick={() => toggleQR(act.IdActividad)}
              >
                <div className="gestlud-qr-toggle-content">
                  <div className="gestlud-qr-toggle-left">
                    <MdQrCode2 className="gestlud-qr-icon" />
                    <span className="gestlud-qr-toggle-text">Códigos QR de Asistencia</span>
                  </div>
                  <div className="gestlud-qr-toggle-right">
                    {qrVisible[act.IdActividad] ? (
                      <>
                        <MdVisibilityOff className="gestlud-toggle-icon" />
                        <span className="gestlud-toggle-label">Ocultar</span>
                      </>
                    ) : (
                      <>
                        <MdVisibility className="gestlud-toggle-icon" />
                        <span className="gestlud-toggle-label">Mostrar</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
              
              <div className={`gestlud-qr-content ${qrVisible[act.IdActividad] ? 'gestlud-qr-visible' : 'gestlud-qr-hidden'}`}>
                <div className="gestlud-qr-grid">
                  {act.CodigoQR && (
                    <div className="gestlud-qr-card">
                      <div className="gestlud-qr-badge">Entrada</div>
                      <img src={act.CodigoQR} alt="QR Entrada" />
                      <div className="gestlud-qr-info">
                        <FaDoorOpen className="gestlud-qr-info-icon" />
                        <span>Escanear al ingresar</span>
                      </div>
                    </div>
                  )}
                  {act.CodigoQRSalida && (
                    <div className="gestlud-qr-card">
                      <div className="gestlud-qr-badge gestlud-qr-badge-salida">Salida</div>
                      <img src={act.CodigoQRSalida} alt="QR Salida" />
                      <div className="gestlud-qr-info">
                        <FaDoorClosed className="gestlud-qr-info-icon" />
                        <span>Escanear al salir</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="gestlud-acciones">
              <button className="gestlud-btn gestlud-btn-asistencia" onClick={() => obtenerAsistencias(act.IdActividad)}>
                <MdGroups /> Ver Asistencia
              </button>

              <button className="gestlud-btn gestlud-btn-reporte" onClick={() => abrirReporte(act.IdActividad)}>
                <MdBarChart /> Ver Reporte
              </button>
            </div>

            {asistencias[act.IdActividad] && (
              <div className="gestlud-tabla-wrapper">
                <h4 className="gestlud-tabla-titulo">👥 Registro de Asistencia</h4>
                <table className="gestlud-tabla">
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
                            ? <span className="gestlud-estado gestlud-estado-completa"><FaCheckCircle /> Completa</span>
                            : a.QREntrada
                            ? <span className="gestlud-estado gestlud-estado-parcial"><FaDoorOpen /> Solo entrada</span>
                            : <span className="gestlud-estado gestlud-estado-sin"><FaTimesCircle /> Sin registro</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
            ))
          )}
        </>
      )}

      {/* Vista Lúdicas */}
      {vista === "ludicas" && (
        <>
          {ludicasFiltradas.length === 0 ? (
            <div className="gestlud-no-resultados">
              <FaUsers className="gestlud-no-resultados-icon" />
              <h3>No se encontraron lúdicas</h3>
              <p>Intenta con otros términos de búsqueda o crea una nueva lúdica.</p>
            </div>
          ) : (
            ludicasFiltradas.map((ludica) => (
          <div key={ludica.IdActividad} className="gestlud-actividad-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h3 className="gestlud-card-titulo" style={{ margin: 0 }}>{ludica.NombreActi}</h3>
              <span className="gestlud-badge-ludica">💃 {ludica.TipoLudica}</span>
            </div>
            
            <div className="gestlud-info-grid">
              <div className="gestlud-info-item">
                <MdEvent /> {ludica.FechaInicio}
              </div>
              <div className="gestlud-info-item">
                <MdAccessTime /> {ludica.HoraInicio} - {ludica.HoraFin}
              </div>
              <div className="gestlud-info-item">
                <MdLocationOn /> {ludica.Ubicacion}
              </div>
            </div>

            {ludica.Imagen && (
              <div className="gestlud-imagen-container">
                <img src={ludica.Imagen} alt={ludica.NombreActi} className="gestlud-imagen" />
              </div>
            )}

            <div className="gestlud-qr-section">
              <button 
                className="gestlud-qr-toggle-btn-modern"
                onClick={() => toggleQR(ludica.IdActividad)}
              >
                <div className="gestlud-qr-toggle-content">
                  <div className="gestlud-qr-toggle-left">
                    <MdQrCode2 className="gestlud-qr-icon" />
                    <span className="gestlud-qr-toggle-text">Códigos QR de Asistencia</span>
                  </div>
                  <div className="gestlud-qr-toggle-right">
                    {qrVisible[ludica.IdActividad] ? (
                      <>
                        <MdVisibilityOff className="gestlud-toggle-icon" />
                        <span className="gestlud-toggle-label">Ocultar</span>
                      </>
                    ) : (
                      <>
                        <MdVisibility className="gestlud-toggle-icon" />
                        <span className="gestlud-toggle-label">Mostrar</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
              
              <div className={`gestlud-qr-content ${qrVisible[ludica.IdActividad] ? 'gestlud-qr-visible' : 'gestlud-qr-hidden'}`}>
                <div className="gestlud-qr-grid">
                  {ludica.CodigoQR && (
                    <div className="gestlud-qr-card">
                      <div className="gestlud-qr-badge">Entrada</div>
                      <img src={ludica.CodigoQR} alt="QR Entrada" />
                      <div className="gestlud-qr-info">
                        <FaDoorOpen className="gestlud-qr-info-icon" />
                        <span>Escanear al ingresar</span>
                      </div>
                    </div>
                  )}
                  {ludica.CodigoQRSalida && (
                    <div className="gestlud-qr-card">
                      <div className="gestlud-qr-badge gestlud-qr-badge-salida">Salida</div>
                      <img src={ludica.CodigoQRSalida} alt="QR Salida" />
                      <div className="gestlud-qr-info">
                        <FaDoorClosed className="gestlud-qr-info-icon" />
                        <span>Escanear al salir</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="gestlud-acciones">
              <button className="gestlud-btn gestlud-btn-asistencia" onClick={() => obtenerAsistencias(ludica.IdActividad)}>
                <MdGroups /> Ver Asistentes
              </button>

              <button className="gestlud-btn gestlud-btn-reporte" onClick={() => abrirReporte(ludica.IdActividad)}>
                <MdBarChart /> Ver Reporte
              </button>
            </div>

            {asistencias[ludica.IdActividad] && (
              <div className="gestlud-tabla-wrapper">
                <h4 className="gestlud-tabla-titulo">👥 Registro de Asistencia</h4>
                <table className="gestlud-tabla">
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
                            ? <span className="gestlud-estado gestlud-estado-completa"><FaCheckCircle /> Completa</span>
                            : a.QREntrada
                            ? <span className="gestlud-estado gestlud-estado-parcial"><FaDoorOpen /> Solo entrada</span>
                            : <span className="gestlud-estado gestlud-estado-sin"><FaTimesCircle /> Sin registro</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
          )}
        </>
      )}

      {/* Modal overlay */}
      {modalOpen && (
        <div 
          className="gestlud-modal-overlay" 
          onClick={cerrarModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
            margin: 0,
            maxWidth: 'none',
            transform: 'none'
          }}
        >
          <div 
            className="gestlud-modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '98%',
              maxWidth: '1600px',
              margin: 'auto',
              position: 'relative',
              left: 'auto',
              right: 'auto',
              transform: 'none'
            }}
          >
            <div className="gestlud-modal-header">
              <h3 className="gestlud-modal-titulo">📊 Reporte de Asistencia</h3>
              <button className="gestlud-modal-close" onClick={cerrarModal}>✖ Cerrar</button>
            </div>

            {/* Componente de reporte */}
            <ReporteAsistencia actividadId={reporteActividadId} />
          </div>
        </div>
      )}
    </div>
  );
}
