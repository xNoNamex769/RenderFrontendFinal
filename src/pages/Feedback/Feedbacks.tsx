import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaStar, FaComments, FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import "./styles/FeedbackStyle.css";
import { useNavigate, useParams } from "react-router-dom";
import { FaPaperPlane, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Usuario {
  Nombre: string;
  Imagen?: string; // URL remota
}

interface Feedback {
  ComentarioFeedback: string;
  Calificacion: number;
  usuario?: Usuario;
}

interface Actividad {
  IdActividad: number;
  NombreActi: string;
  Descripcion: string;
  Imagen?: string; // URL remota
  Ubicacion: string;
  FechaInicio: string;
  FechaFin: string;
  HoraInicio: string;
  HoraFin: string;
}

export default function Feedbacks() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const { idActividad } = useParams();
  const actividadIdFromUrl = isNaN(Number(idActividad)) ? null : parseInt(idActividad!, 10);
  const navigate = useNavigate();

  // Obtener IdUsuario desde token JWT
  const obtenerIdUsuario = (): number | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.IdUsuario || null;
    } catch (error) {
      console.error("Error al decodificar token:", error);
      return null;
    }
  };
  const usuario = obtenerIdUsuario();

  // Traer todas las actividades
  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const res = await axios.get<Actividad[]>("https://render-hhyo.onrender.com/api/actividad");
        const filtradas = res.data.filter((a) => a.Imagen); // solo con imagen
        setActividades(filtradas);

        if (filtradas.length > 0) {
          const indexActividad = filtradas.findIndex(
            (a) => a.IdActividad === actividadIdFromUrl
          );
          setIndex(indexActividad >= 0 ? indexActividad : 0);
          const idBuscar = indexActividad >= 0
            ? filtradas[indexActividad].IdActividad
            : filtradas[0].IdActividad;
          obtenerFeedbacks(idBuscar);
        }
      } catch (err) {
        console.error("Error al obtener actividades:", err);
      }
    };
    fetchActividades();
  }, [actividadIdFromUrl]);

  // Traer feedbacks de una actividad
  const obtenerFeedbacks = async (idActividad: number) => {
    try {
      const res = await axios.get(`https://render-hhyo.onrender.com/api/feedback/actividad/${idActividad}`);
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Error al obtener feedbacks:", err);
    }
  };

  // Cambiar slide
  const cambiarSlide = (nuevoIndex: number) => {
    setIndex(nuevoIndex);
    setFeedback("");
    setCalificacion(0);
    if (actividades[nuevoIndex]) {
      obtenerFeedbacks(actividades[nuevoIndex].IdActividad);
    }
  };

  const actividadActual = actividades[index];

  // Verificar si la actividad está activa
  const actividadActiva = (): boolean => {
    if (!actividadActual) return false;
    const ahora = new Date();
    const [aI, mI, dI] = actividadActual.FechaInicio.split("-");
    const [aF, mF, dF] = actividadActual.FechaFin.split("-");
    const [hI, miI] = actividadActual.HoraInicio.split(":");
    const [hF, miF] = actividadActual.HoraFin.split(":");

    const inicio = new Date(Number(aI), Number(mI) - 1, Number(dI), Number(hI), Number(miI));
    const fin = new Date(Number(aF), Number(mF) - 1, Number(dF), Number(hF), Number(miF));
    return ahora >= inicio && ahora <= fin;
  };

  // Enviar feedback
  const enviarFeedback = async () => {
    if (!feedback.trim() || calificacion === 0) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Completa el feedback y selecciona una calificación.",
        confirmButtonColor: "#5eb319",
      });
      return;
    }
    try {
      await axios.post("https://render-hhyo.onrender.com/api/feedback", {
        IdActividad: actividadActual.IdActividad,
        IdUsuario: usuario,
        ComentarioFeedback: feedback,
        Calificacion: calificacion,
        FechaEnvio: new Date()
      });
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Feedback enviado",
        confirmButtonColor: "#5eb319",
        timer: 2500,
      });
      setFeedback("");
      setCalificacion(0);
      obtenerFeedbacks(actividadActual.IdActividad);
    } catch (err) {
      console.error("Error al enviar feedback:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar el feedback.",
        confirmButtonColor: "#5eb319",
      });
    }
  };

  // Formateo de fecha y hora
  const formatearFecha = (str: string) => str.split("-").reverse().join("/");
  const formatearHora = (str: string) => {
    const [h, m] = str.split(":");
    const hora = parseInt(h);
    const ampm = hora >= 12 ? "PM" : "AM";
    const h12 = hora % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  // Promedio de calificación
  const promedio = (): string => {
    if (feedbacks.length === 0) return "0.0";
    const total = feedbacks.reduce((sum, fb) => sum + (fb.Calificacion || 0), 0);
    return (total / feedbacks.length).toFixed(1);
  };

  return (
    <div className="fb-feedback-container">
      {/* Header mejorado */}
      <header className="fb-feedback-header">
       
        <div className="fb-header-content">
          <h1 className="fb-feedback-titulo"><FaComments /> Feedback de Actividades</h1>
          <p className="fb-feedback-subtitulo">
            Comparte tu experiencia y ayuda a mejorar nuestras actividades
          </p>
        </div>
      </header>

      {actividadActual && (
        <div className="fb-actividad-card">
          {/* Navegación */}
          <button 
            className="fb-nav-btn fb-nav-prev" 
            onClick={() => cambiarSlide(index > 0 ? index - 1 : actividades.length - 1)}
            disabled={actividades.length <= 1}
          >
            <FaChevronLeft />
          </button>
          <button 
            className="fb-nav-btn fb-nav-next" 
            onClick={() => cambiarSlide(index < actividades.length - 1 ? index + 1 : 0)}
            disabled={actividades.length <= 1}
          >
            <FaChevronRight />
          </button>

          {/* Imagen de la actividad */}
          <div className="fb-actividad-imagen-wrapper">
            <img
              src={actividadActual.Imagen || "https://via.placeholder.com/300x200"}
              alt={actividadActual.NombreActi}
              className="fb-actividad-imagen"
            />
            <div className="fb-imagen-overlay">
              <div className="fb-rating-badge">
                <FaStar /> {promedio()}/5
              </div>
            </div>
          </div>

          {/* Información de la actividad */}
          <div className="actividad-content">
            <div className="actividad-header">
              <h2 className="actividad-nombre">{actividadActual.NombreActi}</h2>
              {actividadActiva() ? (
                <span className="badge-activa">🟢 Activa</span>
              ) : (
                <span className="badge-finalizada">🔴 Finalizada</span>
              )}
            </div>

            <p className="actividad-descripcion">{actividadActual.Descripcion}</p>

            <div className="actividad-detalles">
              <div className="detalle-item">
                <FaMapMarkerAlt />
                <span>{actividadActual.Ubicacion}</span>
              </div>
              <div className="detalle-item">
                <FaCalendarAlt />
                <span>{formatearFecha(actividadActual.FechaInicio)} - {formatearFecha(actividadActual.FechaFin)}</span>
              </div>
              <div className="detalle-item">
                <FaClock />
                <span>{formatearHora(actividadActual.HoraInicio)} - {formatearHora(actividadActual.HoraFin)}</span>
              </div>
            </div>

            {/* Lista de comentarios mejorada */}
            <div className="comentarios-section">
              <div className="comentarios-header">
                <h3>💬 Comentarios ({feedbacks.length})</h3>
              </div>
              
              {feedbacks.length === 0 ? (
                <div className="no-comentarios">
                  <FaComments size={50} />
                  <p>Aún no hay comentarios</p>
                  <span>Sé el primero en compartir tu experiencia</span>
                </div>
              ) : (
                <div className="comentarios-lista">
                  {feedbacks.map((fb, i) => (
                    <div key={i} className="comentario-card">
                      <div className="comentario-header">
                        <img
                          src={fb.usuario?.Imagen || "https://via.placeholder.com/50"}
                          alt={fb.usuario?.Nombre || "Anónimo"}
                          className="comentario-avatar"
                        />
                        <div className="comentario-info">
                          <strong className="comentario-nombre">{fb.usuario?.Nombre || "Anónimo"}</strong>
                          <div className="comentario-rating">
                            {[...Array(5)].map((_, idx) => (
                              <FaStar 
                                key={idx} 
                                className={idx < (fb.Calificacion || 0) ? "star-filled" : "star-empty"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="comentario-texto">{fb.ComentarioFeedback}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulario para dejar feedback mejorado */}
            {actividadActiva() ? (
              <div className="form-section">
                <h3 className="form-titulo">📝 Deja tu Feedback</h3>
                <div className="form-content">
                  <div className="rating-selector">
                    <label>Tu calificación:</label>
                    <div className="stars-selector">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <FaStar
                          key={n}
                          className={n <= calificacion ? "star-selected" : "star-unselected"}
                          onClick={() => setCalificacion(n)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="textarea-wrapper">
                    <textarea
                      rows={4}
                      placeholder="Comparte tu experiencia sobre esta actividad..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="feedback-textarea"
                    />
                  </div>
                  <button className="btn-enviar" onClick={enviarFeedback}>
                    <FaPaperPlane /> Enviar Feedback
                  </button>
                </div>
              </div>
            ) : (
              <div className="actividad-cerrada">
                <p>🔒 Esta actividad ha finalizado y los comentarios están cerrados</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paginación mejorada */}
      {actividades.length > 1 && (
        <div className="paginacion-wrapper">
          <div className="paginacion-info">
            <span className="pagina-actual">{index + 1}</span>
            <span className="separador">/</span>
            <span className="total-paginas">{actividades.length}</span>
          </div>
          <div className="carousel-dots">
            {actividades.map((_, i) => (
              <button 
                key={i} 
                className={`dot ${i === index ? "dot-active" : ""}`} 
                onClick={() => cambiarSlide(i)}
                aria-label={`Ir a actividad ${i + 1}`}
              />
            ))}
          </div>
          <div className="paginacion-botones">
            <button 
              className="btn-pag btn-anterior"
              onClick={() => cambiarSlide(index > 0 ? index - 1 : actividades.length - 1)}
            >
              ← Anterior
            </button>
            <button 
              className="btn-pag btn-siguiente"
              onClick={() => cambiarSlide(index < actividades.length - 1 ? index + 1 : 0)}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
