import React, { useEffect, useState, useRef } from "react";
import avatar from "../DashBoard/img/avatar.png";
import logo from "./img/image.png";
import {
  FaUserGraduate,
  FaPhone,
  FaEnvelope,
  FaRunning,
  FaCalendarCheck,
  FaStar,
  FaTrophy,
  FaFire,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBullseye,
  FaClock,
} from "react-icons/fa";
import "./styles/UserView.css";
import axios from "axios";
import imgFallback from "./img/avatar.png";

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

export default function UserViewAp({ setContenidoActual }) {
  const fetched = useRef(false);
  const [usuario, setUsuario] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalContenido, setModalContenido] = useState({ titulo: "", contenido: null });

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

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        const id = payload.IdUsuario;

        const usuarioGuardado = sessionStorage.getItem("usuario");
        if (usuarioGuardado) {
          const usuarioCache = JSON.parse(usuarioGuardado);
          if (usuarioCache.IdUsuario === id) {
            setUsuario(usuarioCache);
            return;
          } else {
            sessionStorage.removeItem("usuario");
          }
        }

        const res = await axios.get(`https://render-hhyo.onrender.com/api/usuario/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsuario(res.data);
        sessionStorage.setItem("usuario", JSON.stringify(res.data));
      } catch (err) {
        console.error("Error cargando usuario:", err);
      }
    };

    fetchUsuario();
  }, []);

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const res = await axios.get("https://render-hhyo.onrender.com/api/actividad");
        setActividades(res.data);
      } catch (error) {
        console.error("Error al obtener actividades:", error);
      }
    };
    fetchActividades();
  }, []);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await axios.get("https://render-hhyo.onrender.com/api/evento");
        const eventosData = Array.isArray(res.data) ? res.data : [res.data];
        setEventos(eventosData);
      } catch (error) {
        console.error("Error al obtener eventos:", error);
      }
    };
    fetchEventos();
  }, []);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        const idUsuario = payload.IdUsuario;

        const resFeedbacks = await axios.get("https://render-hhyo.onrender.com/api/feedback");
        const feedbacksUsuario = resFeedbacks.data.filter((fb) => fb.IdUsuario === idUsuario);
        setTotalFeedbacks(feedbacksUsuario.length);

        if (feedbacksUsuario.length > 0) {
          const suma = feedbacksUsuario.reduce((acc, fb) => acc + (fb.Calificacion || 0), 0);
          const promedio = suma / feedbacksUsuario.length;
          setPromedioCalificacion(promedio.toFixed(1));
        }
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      }
    };
    fetchEstadisticas();
  }, []);

  return (
    <section className="UserContenedor">
      {/* Usuario */}
      {!usuario ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="UserCuadro UserInfo">
          <div className="UserProfileCard">
            <div className="profile-header">
              <img src={avatar} alt="Avatar" className="UserProfileAvatar" />
              <div className="UserProfileName">{usuario.Nombre} {usuario.Apellido}</div>
              <div className="user-rol-badge">
                <FaUserGraduate /> {usuario?.rol?.NombreRol || "Sin rol"}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="user-stats-grid">
              <div className="user-stat-card">
                <div className="stat-icon stat-icon-green"><FaRunning /></div>
                <div className="stat-content">
                  <div className="stat-number">{actividades.length}</div>
                  <div className="stat-label">Actividades</div>
                </div>
              </div>
              <div className="user-stat-card">
                <div className="stat-icon stat-icon-blue"><FaCalendarCheck /></div>
                <div className="stat-content">
                  <div className="stat-number">{eventos.length}</div>
                  <div className="stat-label">Eventos</div>
                </div>
              </div>
              <div className="user-stat-card">
                <div className="stat-icon stat-icon-yellow"><FaStar /></div>
                <div className="stat-content">
                  <div className="stat-number">{totalFeedbacks}</div>
                  <div className="stat-label">Feedbacks</div>
                </div>
              </div>
              <div className="user-stat-card">
                <div className="stat-icon stat-icon-orange"><FaTrophy /></div>
                <div className="stat-content">
                  <div className="stat-number">{promedioCalificacion || "0.0"}</div>
                  <div className="stat-label">Promedio</div>
                </div>
              </div>
            </div>

            <ul className="UserProfileList">
              <li><FaPhone /> <b>Teléfono:</b> {usuario.Telefono}</li>
              <li><FaEnvelope /> <b>Correo:</b> {usuario.Correo}</li>
            </ul>

            <img src={logo} className="UserProfileLogo" alt="Logo SENA" />
            <button className="UserProfileBtn"><FaFire /> Explora y Participa</button>
          </div>
        </div>
      )}

      {/* Actividades y Eventos */}
      <div className="UserMainContent">
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
                        <p><FaCalendarAlt className="modal-icono" /> <b>Fecha:</b> {formatearFecha(actividad.FechaInicio)}</p>
                        <p><FaClock className="modal-icono" /> <b>Hora:</b> {formatearHora(actividad.HoraInicio)} - {formatearHora(actividad.HoraFin)}</p>
                        <p><FaMapMarkerAlt className="modal-icono" /> <b>Lugar:</b> {actividad.Ubicacion}</p>
                        <p><FaBullseye className="modal-icono" /> <b>Tipo:</b> {actividad.Tipo}</p>
                        <p>{actividad.Descripcion}</p>
                      </>
                    )
                  }
                >
                  <img
                    src={actividad.ImagenUrl || imgFallback}
                    alt={actividad.NombreActi}
                    className="UserTarjetaImg"
                    onError={(e) => (e.target.src = imgFallback)}
                  />
                  <div className="UserTarjetaTexto">{actividad.NombreActi}</div>
                </div>
              ))
            )}
          </div>
        </div>

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
                        <p><FaCalendarAlt className="modal-icono" /> <b>Fecha:</b> {formatearFecha(evento.FechaInicio)} - {formatearFecha(evento.FechaFin)}</p>
                        <p><FaClock className="modal-icono" /> <b>Hora:</b> {formatearHora(evento.HoraInicio)} - {formatearHora(evento.HoraFin)}</p>
                        <p><FaMapMarkerAlt className="modal-icono" /> <b>Lugar:</b> {evento.UbicacionEvento}</p>
                        <p>{evento.DescripcionEvento}</p>
                      </>
                    )
                  }
                >
                  <img
                    src={evento.PlanificacionEvento?.ImagenUrl || imgFallback}
                    alt={evento.NombreEvento}
                    className="UserTarjetaImg"
                    onError={(e) => (e.target.src = imgFallback)}
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
          <div className="UserModalContenido" onClick={(e) => e.stopPropagation()}>
            <button className="UserModalCerrar" onClick={cerrarModal}>✖</button>
            <h3>{modalContenido.titulo}</h3>
            <div>{modalContenido.contenido}</div>
          </div>
        </div>
      )}
    </section>
  );
}
