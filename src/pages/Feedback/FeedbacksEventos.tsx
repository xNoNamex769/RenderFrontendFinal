import React, { useEffect, useState } from "react";
import { FaEdit, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUser, FaStar, FaComments } from "react-icons/fa";
import Swal from "sweetalert2";
import "./styles/FeedbackStyle.css";
import axios from "axios";

interface Usuario {
  IdUsuario: number;
  Nombre: string;
  Apellido: string;
  perfilInstructor?: {
    imagen: string;
  };
}

interface PlanificacionEvento {
  IdPlanificarE: number;
  usuario?: Usuario;
  ImagenUrl?: string;
}

interface EventoConDatos {
  IdEvento: number;
  NombreEvento: string;
  FechaInicio: string;
  FechaFin: string;
  HoraInicio: string;
  HoraFin: string;
  UbicacionEvento: string;
  DescripcionEvento: string;
  PlanificacionEvento?: PlanificacionEvento;
}

export default function FeedbackEventos({ idEventoSeleccionado }: { idEventoSeleccionado?: number }) {
  const [evento, setEvento] = useState<EventoConDatos | null>(null);
  const [feedback, setFeedback] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const fetchEventoYFeedbacks = async () => {
      if (!idEventoSeleccionado) return;

      try {
        // Primero intentamos obtener desde eventos públicos (que incluye PlanificacionEvento)
        const eventosPublicosRes = await axios.get("https://render-hhyo.onrender.com/api/evento/publicos");
        const eventoEncontrado = eventosPublicosRes.data.find((e: any) => e.IdEvento === idEventoSeleccionado);
        
        if (eventoEncontrado) {
          setEvento(eventoEncontrado);
          console.log("✅ Evento encontrado con planificación:", eventoEncontrado);
          console.log("👤 Usuario instructor:", eventoEncontrado.PlanificacionEvento?.usuario);
          console.log("🖼️ Imagen instructor:", eventoEncontrado.PlanificacionEvento?.usuario?.perfilInstructor?.imagen);
        } else {
          // Fallback: obtener evento individual (sin planificación)
          const eventoRes = await axios.get(`https://render-hhyo.onrender.com/api/evento/${idEventoSeleccionado}`);
          setEvento(eventoRes.data);
          console.log("⚠️ Evento sin planificación:", eventoRes.data);
        }
        
        const feedbackRes = await axios.get(`https://render-hhyo.onrender.com/api/feedback/evento/${idEventoSeleccionado}`);
        setFeedbacks(feedbackRes.data);
      } catch (err) {
        console.error("Error al obtener evento o feedbacks:", err);
      }
    };

    fetchEventoYFeedbacks();
  }, [idEventoSeleccionado]);

  const enviarFeedback = async () => {
    if (!feedback.trim() || calificacion === 0 || !evento) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Completa el feedback y selecciona una calificación.",
        confirmButtonColor: "#5eb319",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Sesión requerida",
        text: "Debes iniciar sesión para enviar feedback.",
        confirmButtonColor: "#5eb319",
      });
      return;
    }

    try {
      await axios.post(
        "https://render-hhyo.onrender.com/api/feedback/evento",
        {
          IdEvento: evento.IdEvento,
          ComentarioFeedback: feedback,
          Calificacion: calificacion,
          FechaEnvio: new Date()
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Feedback enviado",
        confirmButtonColor: "#5eb319",
        timer: 2500,
      });
      setFeedback("");
      setCalificacion(0);

      const updatedFeedbacks = await axios.get(`https://render-hhyo.onrender.com/api/feedback/evento/${evento.IdEvento}`);
      setFeedbacks(updatedFeedbacks.data);
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

  const promedio = () => {
    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((sum, fb) => sum + (fb.Calificacion || 0), 0);
    return (total / feedbacks.length).toFixed(1);
  };

  if (!evento) return null;

  return (
    
    <div className="glass-feedback">
        {evento.PlanificacionEvento?.usuario && (
  <div className="creador-header">
  <img
  src={evento.PlanificacionEvento.usuario?.perfilInstructor?.imagen || "/default.jpg"}
  alt="Foto del planificador"
  className="creador-imagen"
/>

    <h3 className="creador-nombre">
      {evento.PlanificacionEvento.usuario.Nombre} {evento.PlanificacionEvento.usuario.Apellido}
    </h3>
  </div>
)}

    <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: "700", marginBottom: "20px", color: "#333" }}>
  <FaEdit /> Feedback de: {evento.NombreEvento} <FaStar /> {promedio()}/5
</h2>

<div style={{ textAlign: "center", marginBottom: "20px" }}>
  {evento.PlanificacionEvento?.usuario && (
    <p style={{ fontSize: "16px", fontWeight: "500", margin: "5px 0" }}>
         {/*coloquenlen una imagen insana aqui */}  
   <FaUser /> <strong>Planificado por:</strong> {evento.PlanificacionEvento.usuario.Nombre} {evento.PlanificacionEvento.usuario.Apellido}
    </p>
  )}
  <p style={{ fontSize: "16px", margin: "5px 0" }}>
    <FaCalendarAlt /> <strong>Fecha de inicio:</strong> {new Date(evento.FechaInicio).toLocaleDateString("es-CO")}
  </p>
</div>



      <div className="carousel">
        <img
          src={evento.PlanificacionEvento?.ImagenUrl || "/default.jpg"}
          alt={evento.NombreEvento}
          className="carousel-image"
        />
        

      <div className="actividad-info">
 <h3 style={{ fontWeight: 700, fontSize: "20px", marginBottom: "5px" }}>
  {evento.NombreEvento}
</h3>
<p style={{ fontStyle: "italic", marginBottom: "10px" }}>
      {/*coloquenlen una imagen insana aqui */}  
  <FaEdit /> Descripción: {evento.DescripcionEvento}
</p>


  <p><FaMapMarkerAlt /> <strong>Ubicación:</strong> {evento.UbicacionEvento}</p>
  <p><FaCalendarAlt /> <strong>Fecha:</strong> {new Date(evento.FechaInicio).toLocaleDateString("es-CO")} — {new Date(evento.FechaFin).toLocaleDateString("es-CO")}</p>
  <p><FaClock /> <strong>Horario:</strong> {evento.HoraInicio} - {evento.HoraFin}</p>

 
     
     
    
  
</div>

      </div>

      <div className="feedback-lista">
          {/*coloquenlen una imagen insana aqui */}  
        <h4><FaComments /> Comentarios:</h4>
        {feedbacks.length === 0 ? (
          <p className="text-muted">Aún no hay comentarios.</p>
        ) : (
          feedbacks.map((fb, i) => (
            <div key={i} className="feedback-item">
              <p><strong>{fb.usuario?.Nombre || "Anónimo"}:</strong> {fb.ComentarioFeedback}</p>
              <p>{Array(fb.Calificacion || 0).fill(null).map((_, i) => <FaStar key={i} />)}</p>
            </div>
          ))
        )}
      </div>

      <div className="feedback-form">
          {/*coloquenlen una imagen insana aqui */}  
        <h4><FaEdit /> Deja tu feedback:</h4>
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
    </div>
  );
}
