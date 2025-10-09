import React, { useEffect, useState } from "react";
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
  ImagenEvento?: string;
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
        const eventoRes = await axios.get(`https://render-hhyo.onrender.com/api/evento/${idEventoSeleccionado}`);
        setEvento(eventoRes.data);
        console.log(" Planificador completo:", eventoRes.data.PlanificacionEvento?.usuario);
console.log(" Imagen perfil:", eventoRes.data.PlanificacionEvento?.usuario?.perfilInstructor?.imagen);

   console.log("🖼 Imagen recibida:", eventoRes.data.PlanificacionEvento?.ImagenEvento);
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
      alert("Completa el feedback y selecciona una calificación.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para enviar feedback.");
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

      alert("✅Feedback enviado");
      setFeedback("");
      setCalificacion(0);

      const updatedFeedbacks = await axios.get(`https://render-hhyo.onrender.com/api/feedback/evento/${evento.IdEvento}`);
      setFeedbacks(updatedFeedbacks.data);
    } catch (err) {
      console.error("Error al enviar feedback:", err);
      alert(" No se pudo enviar el feedback.");
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
  src={
    evento.PlanificacionEvento.usuario?.perfilInstructor?.imagen?.startsWith("data:")
      ? evento.PlanificacionEvento.usuario.perfilInstructor.imagen
      : `http://localhost:3001${evento.PlanificacionEvento.usuario?.perfilInstructor?.imagen || "/default.jpg"}`
  }
  alt="Foto del planificador"
  className="creador-imagen"
/>

    <h3 className="creador-nombre">
      {evento.PlanificacionEvento.usuario.Nombre} {evento.PlanificacionEvento.usuario.Apellido}
    </h3>
  </div>
)}

    <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: "700", marginBottom: "20px", color: "#333" }}>
  📝 Feedback de: {evento.NombreEvento} ⭐ {promedio()}/5
</h2>

<div style={{ textAlign: "center", marginBottom: "20px" }}>
  {evento.PlanificacionEvento?.usuario && (
    <p style={{ fontSize: "16px", fontWeight: "500", margin: "5px 0" }}>
         {/*coloquenlen una imagen insana aqui */}  
   🧑‍💼 <strong>Planificado por:</strong> {evento.PlanificacionEvento.usuario.Nombre} {evento.PlanificacionEvento.usuario.Apellido}
    </p>
  )}
  <p style={{ fontSize: "16px", margin: "5px 0" }}>
    📅 <strong>Fecha de inicio:</strong> {new Date(evento.FechaInicio).toLocaleDateString("es-CO")}
  </p>
</div>



      <div className="carousel">
        <img
          src={
            evento.PlanificacionEvento?.ImagenEvento
              ? `http://localhost:3001/uploads/${evento.PlanificacionEvento.ImagenEvento}`
              : "/default.jpg"
          }
          alt={evento.NombreEvento}
          className="carousel-image"
          
        />
        

      <div className="actividad-info">
 <h3 style={{ fontWeight: 700, fontSize: "20px", marginBottom: "5px" }}>
  {evento.NombreEvento.includes("Taller") ? "🛠️ Taller: " : "📢 Evento: "}
  {evento.NombreEvento}
</h3>
<p style={{ fontStyle: "italic", marginBottom: "10px" }}>
      {/*coloquenlen una imagen insana aqui */}  
  📝 Descripción: {evento.DescripcionEvento}
</p>


  <p>📍 <strong>Ubicación:</strong> {evento.UbicacionEvento}</p>
  <p>📅 <strong>Fecha:</strong> {new Date(evento.FechaInicio).toLocaleDateString("es-CO")} — {new Date(evento.FechaFin).toLocaleDateString("es-CO")}</p>
  <p>🕒 <strong>Horario:</strong> {evento.HoraInicio} - {evento.HoraFin}</p>

 
     
     
    
  
</div>

      </div>

      <div className="feedback-lista">
          {/*coloquenlen una imagen insana aqui */}  
        <h4>🗣️ Comentarios:</h4>
        {feedbacks.length === 0 ? (
          <p className="text-muted">Aún no hay comentarios.</p>
        ) : (
          feedbacks.map((fb, i) => (
            <div key={i} className="feedback-item">
              <p><strong>{fb.usuario?.Nombre || "Anónimo"}:</strong> {fb.ComentarioFeedback}</p>
              <p>{"⭐".repeat(fb.Calificacion || 0)}</p>
            </div>
          ))
        )}
      </div>

      <div className="feedback-form">
          {/*coloquenlen una imagen insana aqui */}  
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
    </div>
  );
}
