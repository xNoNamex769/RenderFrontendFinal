import React, { useEffect, useState, useRef } from "react";
import avatar from "../DashBoard/img/avatar.png";
import logo from "./img/image.png";
import { FaUserGraduate, FaPhone, FaEnvelope } from "react-icons/fa";
import "./styles/UserView.css";
import axios from "axios";

// Imagen de respaldo si falla
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
  const [modalContenido, setModalContenido] = useState({
    titulo: "",
    contenido: null,
  });

  const [actividades, setActividades] = useState([]);
  const [eventos, setEventos] = useState([]);

  const abrirModal = (titulo, contenido) => {
    setModalContenido({ titulo, contenido });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalContenido({ titulo: "", contenido: null });
  };

  // Traer usuario
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

        const res = await axios.get(
          `https://render-hhyo.onrender.com/api/usuario/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsuario(res.data);
        sessionStorage.setItem("usuario", JSON.stringify(res.data));
      } catch (err) {
        console.error("Error cargando usuario:", err);
      }
    };

    fetchUsuario();
  }, []);

  // Traer actividades
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

  // Traer eventos
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await axios.get(
          "https://render-hhyo.onrender.com/api/evento"
        );
        const eventosData = Array.isArray(res.data) ? res.data : [res.data];
        setEventos(eventosData);
      } catch (error) {
        console.error("Error al obtener eventos:", error);
      }
    };
    fetchEventos();
  }, []);

  return (
    <section className="UserContenedor">
      {/* Info usuario */}
      {!usuario ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="UserCuadro UserInfo">
          <div className="UserProfileCard">
            <img src={avatar} alt="Avatar" className="UserProfileAvatar" />
            <div className="UserProfileName">
              {usuario.Nombre} {usuario.Apellido}
            </div>
            <ul className="UserProfileList">
              <li>
                <FaUserGraduate /> <b>Rol:</b>{" "}
                {usuario?.rol?.NombreRol || "Sin rol"}
              </li>
              <li>
                <FaPhone /> <b>Teléfono:</b> {usuario.Telefono}
              </li>
              <li>
                <FaEnvelope /> <b>Correo:</b> {usuario.Correo}
              </li>
            </ul>
            <img src={logo} className="UserProfileLogo" alt="Logo SENA" />
            <button className="UserProfileBtn">
              Gestiona, Diviértete en la plataforma más innovadora
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="UserMainContent">
        {/* Actividades */}
        <div className="UserCuadro UserLudicas">
          <h3 className="UserTitulo">Lúdicas</h3>
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
                    src={actividad.ImagenUrl || imgFallback}
                    alt={actividad.NombreActi}
                    className="UserTarjetaImg"
                    onError={(e) => (e.target.src = imgFallback)}
                  />
                  <div className="UserTarjetaTexto">
                    {actividad.NombreActi}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Eventos */}
        <div className="UserCuadro UserEventos">
          <h3 className="UserTitulo">Eventos Semanales!</h3>
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
