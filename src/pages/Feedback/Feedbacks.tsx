import React, { useEffect, useState } from "react";
import './styles/FeedbackStyle.css';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";

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
      alert("Completa el feedback y selecciona una calificación.");
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
      alert("✅ Feedback enviado");
      setFeedback("");
      setCalificacion(0);
      obtenerFeedbacks(actividadActual.IdActividad);
    } catch (err) {
      console.error("Error al enviar feedback:", err);
      alert("❌ No se pudo enviar el feedback.");
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
    <div className="carousel-container">
      <h2>FEEDBACK DE ACTIVIDADES</h2>

      {actividadActual && (
        <div className="carousel">
          {/* Imagen de la actividad */}
          <img
            src={actividadActual.Imagen || "https://via.placeholder.com/300x200"}
            alt={actividadActual.NombreActi}
            className="carousel-image"
          />

          {/* Información + comentarios */}
          <div className="actividad-info">
            <div>
              <h3>{actividadActual.NombreActi} ⭐ {promedio()}/5</h3>
              <p>{actividadActual.Descripcion}</p>
              <p>📍 {actividadActual.Ubicacion}</p>
              <p>🗓️ {formatearFecha(actividadActual.FechaInicio)} — {formatearFecha(actividadActual.FechaFin)}</p>
              <p>🕒 {formatearHora(actividadActual.HoraInicio)} - {formatearHora(actividadActual.HoraFin)}</p>
            </div>

            {/* Lista de comentarios */}
            <div className="feedback-lista">
              <h4>🗣️ Comentarios:</h4>
              {feedbacks.length === 0 ? (
                <p className="text-muted">Aún no hay comentarios.</p>
              ) : (
                feedbacks.map((fb, i) => (
                  <div key={i} className="feedback-item">
                    <img
                      src={fb.usuario?.Imagen || "https://via.placeholder.com/50"}
                      alt={fb.usuario?.Nombre || "Anónimo"}
                      className="feedback-user-img"
                    />
                    <p><strong>{fb.usuario?.Nombre || "Anónimo"}:</strong> {fb.ComentarioFeedback}</p>
                    <p>{"⭐".repeat(fb.Calificacion || 0)}</p>
                  </div>
                ))
              )}
            </div>

            {/* Formulario para dejar feedback */}
            {actividadActiva() ? (
              <div className="feedback-form">
                <h4>📝 Deja tu feedback:</h4>
                <div className="estrellas-selector">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={n <= calificacion ? "estrella activa" : "estrella"}
                      onClick={() => setCalificacion(n)}
                    >★</span>
                  ))}
                </div>
                <textarea
                  rows={3}
                  placeholder="Escribe tu opinión..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <button onClick={enviarFeedback}>Enviar Feedback</button>
              </div>
            ) : (
              <p className="text-muted">🔒 Actividad terminada - se cerraron los comentarios.</p>
            )}
          </div>
        </div>
      )}

      {/* Indicadores de slide */}
      <div className="carousel-indicators">
        {actividades.map((_, i) => (
          <button key={i} className={i === index ? "active" : ""} onClick={() => cambiarSlide(i)}></button>
        ))}
      </div>
    </div>
  );
}
