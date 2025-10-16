import React, { useEffect, useState } from "react";
import logo from "./img/image.png";
import defaultImg from "./img/avatar.png";
import {
  FaUserTie,
  FaMapMarkerAlt,
  FaUserShield,
  FaPhone,
  FaEnvelope,
  FaRunning,
  FaCalendarCheck,
  FaStar,
  FaTrophy,
  FaFire,
} from "react-icons/fa";

import "./styles/UserView.css";
import axios from "axios";

// helpers para fechas/horas
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-");
  const fechaLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return fechaLocal.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatearHora = (horaStr) => {
  if (!horaStr) return "";
  const [hora, min] = horaStr.split(":");
  let h = parseInt(hora, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
};

export default function InstructorView({ setContenidoActual, actualizarPerfil }) {
  const [usuario, setUsuario] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalContenido, setModalContenido] = useState({
    titulo: "",
    contenido: null,
  });

  const [actividades, setActividades] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [promedioCalificacion, setPromedioCalificacion] = useState(0);

  const abrirModal = (titulo, contenido) => {
    setModalContenido({ titulo, contenido });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalContenido({ titulo: "", contenido: null });
  };

  // Usuario
  const fetchUsuario = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const id = payload.IdUsuario;

      const res = await axios.get(
        `https://render-hhyo.onrender.com/api/usuario/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsuario(res.data);
    } catch (err) {
      console.error("Error cargando instructor:", err);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, [actualizarPerfil]);

  // Actividades (lúdicas)
  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const res = await axios.get(
          "https://render-hhyo.onrender.com/api/actividad"
        );
        setActividades(res.data);
      } catch (error) {
        console.error("Error al obtener actividades:", error);
      }
    };
    fetchActividades();
  }, []);

  // Eventos
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await axios.get(
          "https://render-hhyo.onrender.com/api/evento"
        );
        console.log("Eventos BD:", res.data);

        const eventosData = Array.isArray(res.data) ? res.data : [res.data];
        setEventos(eventosData);
      } catch (error) {
        console.error("Error al obtener eventos:", error);
      }
    };
    fetchEventos();
  }, []);

  // Obtener estadísticas del instructor
  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        const idUsuario = payload.IdUsuario;

        // Obtener feedbacks del instructor
        const resFeedbacks = await axios.get(
          "https://render-hhyo.onrender.com/api/feedback"
        );
        const feedbacksUsuario = resFeedbacks.data.filter(
          (fb) => fb.IdUsuario === idUsuario
        );
        setTotalFeedbacks(feedbacksUsuario.length);

        // Calcular promedio de calificaciones
        if (feedbacksUsuario.length > 0) {
          const suma = feedbacksUsuario.reduce(
            (acc, fb) => acc + (fb.Calificacion || 0),
            0
          );
          const promedio = suma / feedbacksUsuario.length;
          setPromedioCalificacion(promedio.toFixed(1));
        }
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      }
    };
    fetchEstadisticas();
  }, []);

  // 👇 función para validar imagen o usar placeholder
  const getImagenValida = (img) => {
    if (!img || img.trim() === "") return defaultImg;
    return img.startsWith("http") || img.startsWith("data:image")
      ? img
      : `https://render-hhyo.onrender.com${img}`;
  };

  return (
    <section className="UserContenedor">
      {!usuario ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="UserCuadro UserInfo">
          <div className="UserProfileCard">
            <div className="profile-header">
              <img
                src={getImagenValida(usuario.perfilInstructor?.imagen)}
                alt="Foto del instructor"
                className="UserProfileAvatar"
                onError={(e) => (e.currentTarget.src = defaultImg)}
              />
              <div className="UserProfileName">
                {usuario.Nombre} {usuario.Apellido}
              </div>
              <div className="user-rol-badge">
                <FaUserShield /> {usuario?.rol?.NombreRol || "Sin rol"}
              </div>
            </div>

            {/* Estadísticas del instructor */}
            <div className="user-stats-grid">
              <div className="user-stat-card">
                <div className="stat-icon stat-icon-green">
                  <FaRunning />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{actividades.length}</div>
                  <div className="stat-label">Actividades</div>
                </div>
              </div>
              <div className="user-stat-card">
                <div className="stat-icon stat-icon-blue">
                  <FaCalendarCheck />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{eventos.length}</div>
                  <div className="stat-label">Eventos</div>
                </div>
              </div>
              <div className="user-stat-card">
                <div className="stat-icon stat-icon-yellow">
                  <FaStar />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{totalFeedbacks}</div>
                  <div className="stat-label">Feedbacks</div>
                </div>
              </div>
              <div className="user-stat-card">
                <div className="stat-icon stat-icon-orange">
                  <FaTrophy />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{promedioCalificacion || "0.0"}</div>
                  <div className="stat-label">Promedio</div>
                </div>
              </div>
            </div>

            <ul className="UserProfileList">
              <li>
                <FaUserTie /> <b>Profesión:</b>{" "}
                {usuario.perfilInstructor?.profesion || "No asignada"}
              </li>
              <li>
                <FaMapMarkerAlt /> <b>Ubicación:</b>{" "}
                {usuario.perfilInstructor?.ubicacion || "No asignada"}
              </li>
              <li>
                <FaPhone /> <b>Teléfono:</b> {usuario.Telefono || "No aplica"}
              </li>
              <li>
                <FaEnvelope /> <b>Correo:</b> {usuario.Correo}
              </li>
            </ul>
            <img src={logo} className="UserProfileLogo" alt="Logo SENA" />
            <button className="UserProfileBtn">
              <FaFire /> Gestiona y Participa
            </button>
          </div>
        </div>
      )}

      <div className="UserMainContent">
        {/* Lúdicas */}
        <div className="UserCuadro UserLudicas">
          <h3 className="UserTitulo">
                      <FaRunning className="titulo-icono estilo-iconos-user" /> Actividades Disponibles
                    </h3>
          <div className="UserTarjetas">
            {actividades.length === 0 ? (
              <p>No hay actividades disponibles.</p>
            ) : (
              actividades.map((actividad) => (
                <div
                  key={actividad.IdActividad}
                  className="UserTarjeta"
                  onClick={() =>
                    abrirModal(
                      actividad.NombreActi,
                      <>
                        <p>📅 Fecha: {formatearFecha(actividad.FechaInicio)}</p>
                        <p>
                          🕒 Hora: {formatearHora(actividad.HoraInicio)} -{" "}
                          {formatearHora(actividad.HoraFin)}
                        </p>
                        <p>📍 Lugar: {actividad.Ubicacion}</p>
                        <p>🎯 Tipo: {actividad.Tipo}</p>
                        <p>{actividad.Descripcion}</p>
                      </>
                    )
                  }
                >
                  <img
                    src={actividad.ImagenUrl || defaultImg}
                    alt={actividad.NombreActi}
                    className="UserTarjetaImg"
                    onError={(e) => (e.currentTarget.src = defaultImg)}
                  />
                  <div className="UserTarjetaTexto">{actividad.NombreActi}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Eventos */}
        <div className="UserCuadro UserEventos">
          <h3 className="UserTitulo">
                      <FaCalendarCheck className="titulo-icono estilo-iconos-user" /> Eventos SENA
                    </h3>
          <div className="UserTarjetas">
            {eventos.length === 0 ? (
              <p>No hay eventos disponibles.</p>
            ) : (
              eventos.map((evento) => (
                <div
                  key={evento.IdEvento}
                  className="UserTarjeta"
                  onClick={() =>
                    abrirModal(
                      evento.NombreEvento,
                      <>
                        <p>
                          📅 Fecha: {formatearFecha(evento.FechaInicio)} -{" "}
                          {formatearFecha(evento.FechaFin)}
                        </p>
                        <p>
                          🕒 Hora: {formatearHora(evento.HoraInicio)} -{" "}
                          {formatearHora(evento.HoraFin)}
                        </p>
                        <p>📍 Lugar: {evento.UbicacionEvento}</p>
                        <p>{evento.DescripcionEvento}</p>
                      </>
                    )
                  }
                >
                  <img
                    src={evento.PlanificacionEvento?.ImagenUrl || defaultImg}
                    alt={evento.NombreEvento}
                    className="UserTarjetaImg"
                    onError={(e) => (e.currentTarget.src = defaultImg)}
                  />
                  <div className="UserTarjetaTexto">{evento.NombreEvento}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div className="UserModalOverlay" onClick={cerrarModal}>
          <div
            className="UserModalContenido"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="UserModalCerrar" onClick={cerrarModal}>
              ✖
            </button>
            <h3>{modalContenido.titulo}</h3>
            <div>{modalContenido.contenido}</div>
          </div>
        </div>
      )}
    </section>
  );
}
