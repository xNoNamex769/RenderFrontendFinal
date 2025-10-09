import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/Actividades.css";
import { motion } from "framer-motion";

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
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  const [feedbacksActividad, setFeedbacksActividad] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

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
      } catch (error) {
        console.error("Error al obtener actividades:", error);
      }
    };
    fetchActividades();
  }, []);

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

  // 🧩 Resto de tu código (modal, feedback, etc.) sigue igual…
  // (lo omitimos aquí para no repetirlo completo, ya que no cambia)
  return (
    <div className="actividades-contenedor">
      <header className="actividades-cabecera">
        <h1 className="actividades-titulo">Actividades - SENA</h1>
        <div className="actividades-busqueda">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o ubicación..."
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>
        <p className="actividades-descripcion">
          Explora las actividades disponibles para tu bienestar y formación integral.
        </p>
      </header>

      {actividadesFiltradas.length === 0 ? (
        <p className="actividades-vacio">😕 No hay actividades disponibles actualmente.</p>
      ) : (
        <main className="actividades-galeria">
          {actividadesPaginadas.map((actividad) => (
            <motion.article
              key={actividad.IdActividad}
              className="actividades-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <img
                src={actividad.ImagenUrl}
                alt={actividad.NombreActi}
                className="actividades-img"
                onClick={() => abrirModal(actividad)}
              />
              <div className="actividades-info">
                <h4>{actividad.NombreActi}</h4>
                <p>{actividad.Descripcion}</p>
                <p>
                  📍 {actividad.Ubicacion} - ⏰ {formatearHora(actividad.HoraInicio)} a {formatearHora(actividad.HoraFin)}
                </p>
                <p>🗓️ {formatearFecha(actividad.FechaInicio)}</p>
                <button
                  className="btn-ver-feedback"
                  onClick={() => setContenidoActual(`feedback-${actividad.IdActividad}`)}
                >
                  Ir a Feedbacks
                </button>
              </div>
            </motion.article>
          ))}
        </main>
      )}

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="paginacion">
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              className={paginaActual === i + 1 ? "active" : ""}
              onClick={() => cambiarPagina(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
