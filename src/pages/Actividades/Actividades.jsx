import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/Actividades.css";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaStar, FaComments, FaTimes, FaInfoCircle, FaRunning, FaUsers, FaHeart } from "react-icons/fa";

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-");
  const fechaLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return fechaLocal.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
};

const formatearHora = (horaStr) => {
  if (!horaStr) return "";
  const [hora, min] = horaStr.split(":");
  let h = parseInt(hora, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
};

// 🔹 Nueva función para validar si una actividad aún no ha terminado
const actividadEsFuturaOActual = (actividad) => {
  const [aF, mF, dF] = actividad.FechaFin.split("-");
  const [hF, miF] = actividad.HoraFin.split(":");
  const fechaFin = new Date(aF, mF - 1, dF, hF, miF);
  return fechaFin >= new Date(); // true si aún no ha pasado
};

export default function Actividades({ setContenidoActual }) {
  const [actividades, setActividades] = useState([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [promedioCalificacion, setPromedioCalificacion] = useState(0);
  const [totalAprendices, setTotalAprendices] = useState(0);
  const itemsPorPagina = 6;

  const obtenerIdUsuario = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.IdUsuario || null;
    } catch (error) {
      console.error("Error al decodificar token:", error);
      return null;
    }
  };

  const idUsuarioLogueado = obtenerIdUsuario();

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const res = await axios.get("https://render-hhyo.onrender.com/api/actividad");
        setActividades(res.data);
        
        // Calcular promedio de calificaciones de todos los feedbacks
        calcularPromedioGeneral();
        
        // Obtener total de aprendices registrados
        obtenerTotalAprendices();
      } catch (error) {
        console.error("Error al obtener actividades:", error);
      }
    };
    fetchActividades();
  }, []);

  // Calcular promedio de calificaciones de todas las actividades
  const calcularPromedioGeneral = async () => {
    try {
      const res = await axios.get("https://render-hhyo.onrender.com/api/feedback");
      const todosLosFeedbacks = res.data;
      
      console.log("Feedbacks obtenidos:", todosLosFeedbacks); // Debug
      
      if (todosLosFeedbacks && todosLosFeedbacks.length > 0) {
        const suma = todosLosFeedbacks.reduce((acc, fb) => acc + (fb.Calificacion || 0), 0);
        const promedio = suma / todosLosFeedbacks.length;
        console.log("Promedio calculado:", promedio); // Debug
        setPromedioCalificacion(promedio.toFixed(1));
      } else {
        console.log("No hay feedbacks disponibles"); // Debug
        setPromedioCalificacion(0);
      }
    } catch (error) {
      console.error("Error al calcular promedio:", error);
      setPromedioCalificacion(0);
    }
  };

  // Obtener total de aprendices registrados
  const obtenerTotalAprendices = async () => {
    try {
      const res = await axios.get("https://render-hhyo.onrender.com/api/aprendices/listar");
      const rawData = Array.isArray(res.data) ? res.data : res.data?.aprendices ?? [];
      setTotalAprendices(rawData.length);
    } catch (error) {
      console.error("Error al obtener aprendices:", error);
      setTotalAprendices(0);
    }
  };

  // 🔹 Solo actividades con imagen, filtro de texto y que no hayan pasado
  const actividadesFiltradas = actividades
    .filter((a) => a.ImagenUrl)
    .filter((a) =>
      a.NombreActi.toLowerCase().includes(filtro.toLowerCase()) ||
      a.Ubicacion.toLowerCase().includes(filtro.toLowerCase())
    )
    .filter(actividadEsFuturaOActual); // 👈 Aquí se filtran las actividades pasadas

  // --- PAGINACIÓN ---
  const indexUltimoItem = paginaActual * itemsPorPagina;
  const indexPrimerItem = indexUltimoItem - itemsPorPagina;
  const actividadesPaginadas = actividadesFiltradas.slice(indexPrimerItem, indexUltimoItem);
  const totalPaginas = Math.ceil(actividadesFiltradas.length / itemsPorPagina);

  const cambiarPagina = (num) => setPaginaActual(num);

  // Abrir modal con detalles
  const abrirModal = (actividad) => {
    setActividadSeleccionada(actividad);
    setModalAbierto(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false);
    setActividadSeleccionada(null);
  };

  // Ir a feedbacks de la actividad
  const irAFeedback = (idActividad) => {
    setContenidoActual(`feedback-${idActividad}`);
  };

  return (
    <div className="actividades-contenedor">
      {/* Header mejorado con iconos decorativos */}
      <header className="actividades-cabecera">
        {/* Iconos decorativos flotantes */}
        <div className="header-decoracion">
          <FaRunning className="icono-flotante icono-1" />
          <FaUsers className="icono-flotante icono-2" />
          <FaHeart className="icono-flotante icono-3" />
          <FaStar className="icono-flotante icono-4" />
        </div>

        <div className="cabecera-contenido">
          <div className="titulo-wrapper">
            <div className="titulo-icono">
              <FaRunning />
            </div>
            <div>
              <h1 className="actividades-titulo">Actividades Bienestar</h1>
              <p className="actividades-subtitulo">Centro de Desarrollo Integral SENA</p>
            </div>
          </div>
          <p className="actividades-descripcion">
            Descubre y participa en actividades diseñadas para tu crecimiento personal, 
            bienestar físico y desarrollo de habilidades blandas
          </p>
        </div>

        <div className="actividades-busqueda">
          <FaSearch className="busqueda-icono" />
          <input
            type="text"
            placeholder="🔍 Buscar actividad por nombre o ubicación..."
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>

        <div className="actividades-stats">
          <div className="stat-card">
            <div className="stat-icono">
              <FaRunning />
            </div>
            <div className="stat-info">
              <span className="stat-numero">{actividadesFiltradas.length}</span>
              <span className="stat-label">Actividades Disponibles</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icono">
              <FaUsers />
            </div>
            <div className="stat-info">
              <span className="stat-numero">{totalAprendices || "..."}</span>
              <span className="stat-label">Aprendices Participando</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icono">
              <FaStar />
            </div>
            <div className="stat-info">
              <span className="stat-numero">
                {promedioCalificacion === 0 ? "..." : `${promedioCalificacion}/5`}
              </span>
              <span className="stat-label">Calificación Promedio</span>
            </div>
          </div>
        </div>
      </header>

      {actividadesFiltradas.length === 0 ? (
        <div className="actividades-vacio">
          <div className="vacio-icono">😕</div>
          <h3>No hay actividades disponibles</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <main className="actividades-galeria">
          {actividadesPaginadas.map((actividad, index) => (
            <motion.article
              key={actividad.IdActividad}
              className="actividades-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="card-imagen-wrapper">
                <img
                  src={actividad.ImagenUrl}
                  alt={actividad.NombreActi}
                  className="actividades-img"
                />
                <div className="card-overlay">
                  <button
                    className="btn-ver-mas"
                    onClick={() => abrirModal(actividad)}
                  >
                    <FaInfoCircle /> Ver Detalles
                  </button>
                </div>
              </div>
              <div className="actividades-info">
                <h3 className="card-titulo">{actividad.NombreActi}</h3>
                <p className="card-descripcion">{actividad.Descripcion}</p>
                <div className="card-detalles">
                  <div className="detalle">
                    <FaMapMarkerAlt className="detalle-icono" />
                    <span>{actividad.Ubicacion}</span>
                  </div>
                  <div className="detalle">
                    <FaCalendarAlt className="detalle-icono" />
                    <span>{formatearFecha(actividad.FechaInicio)}</span>
                  </div>
                  <div className="detalle">
                    <FaClock className="detalle-icono" />
                    <span>{formatearHora(actividad.HoraInicio)} - {formatearHora(actividad.HoraFin)}</span>
                  </div>
                </div>
                <button
                  className="btn-feedback"
                  onClick={() => irAFeedback(actividad.IdActividad)}
                >
                  <FaComments /> Ver Feedbacks
                </button>
              </div>
            </motion.article>
          ))}
        </main>
      )}

      {/* PAGINACIÓN MEJORADA */}
      {totalPaginas > 1 && (
        <div className="paginacion-wrapper">
          <div className="paginacion-info">
            <span>Página {paginaActual} de {totalPaginas}</span>
          </div>
          <div className="paginacion">
            <button
              className="pag-btn pag-prev"
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              ← Anterior
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                className={`pag-numero ${paginaActual === i + 1 ? "active" : ""}`}
                onClick={() => cambiarPagina(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="pag-btn pag-next"
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES */}
      <AnimatePresence>
        {modalAbierto && actividadSeleccionada && (
          <motion.div
            className="actividades-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cerrarModal}
          >
            <motion.div
              className="actividades-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="actividades-modal-close" onClick={cerrarModal}>
                <FaTimes />
              </button>

              <div className="actividades-modal-imagen-wrapper">
                <img
                  src={actividadSeleccionada.ImagenUrl}
                  alt={actividadSeleccionada.NombreActi}
                  className="actividades-modal-img"
                />
              </div>

              <div className="actividades-modal-body">
                <h2 className="actividades-modal-titulo">{actividadSeleccionada.NombreActi}</h2>
                <p className="actividades-modal-descripcion">{actividadSeleccionada.Descripcion}</p>

                <div className="actividades-modal-detalles">
                  <div className="actividades-modal-detalle-item">
                    <FaMapMarkerAlt className="actividades-modal-icono" />
                    <div>
                      <strong>Ubicación</strong>
                      <p>{actividadSeleccionada.Ubicacion}</p>
                    </div>
                  </div>
                  <div className="actividades-modal-detalle-item">
                    <FaCalendarAlt className="actividades-modal-icono" />
                    <div>
                      <strong>Fecha</strong>
                      <p>{formatearFecha(actividadSeleccionada.FechaInicio)} - {formatearFecha(actividadSeleccionada.FechaFin)}</p>
                    </div>
                  </div>
                  <div className="actividades-modal-detalle-item">
                    <FaClock className="actividades-modal-icono" />
                    <div>
                      <strong>Horario</strong>
                      <p>{formatearHora(actividadSeleccionada.HoraInicio)} - {formatearHora(actividadSeleccionada.HoraFin)}</p>
                    </div>
                  </div>
                </div>

                <div className="actividades-modal-acciones">
                  <button
                    className="actividades-btn-modal-feedback"
                    onClick={() => {
                      cerrarModal();
                      irAFeedback(actividadSeleccionada.IdActividad);
                    }}
                  >
                    <FaComments /> Ver Feedbacks
                  </button>
                  <button className="actividades-btn-modal-cerrar" onClick={cerrarModal}>
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
