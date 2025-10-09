import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./styles/style.css";
import Feedbacks from "../Feedback/FeedbacksEventos"; // o la ruta correcta

// Imágenes por defecto (fallbacks)
import img2 from "./img/img2.jpeg";
import img3 from "./img/img3.jpg";
import img4 from "./img/img4.jpg";
import img5 from "./img/img5.jpg";
import img6 from "./img/img6.jpg";
import img7 from "./img/img2.jpg";

// Tipos
interface Usuario {
  IdUsuario: number;
  Nombre: string;
  Apellido: string;
  perfilInstructor?: {
    imagen: string; // ahora vendrá como URL de Cloudinary
  };
}

interface PlanificacionEvento {
  IdPlanificarE: number;
  usuario?: Usuario;
  ImagenUrl?: string; // ahora vendrá como URL de Cloudinary
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

const imagenes = [img2, img3, img4, img5, img6, img7];

// ✅ Ahora usamos directamente Cloudinary o fallback
const obtenerRutaImagenEvento = (url: string | undefined, idx: number) =>
  url || imagenes[idx % imagenes.length];

const obtenerRutaImagenPerfil = (url: string | undefined) =>
  url || img6;

const Aplicacion = () => {
  const [eventosPublicos, setEventosPublicos] = useState<EventoConDatos[]>([]);
  const [modalEvento, setModalEvento] = useState<EventoConDatos | null>(null);
  const [reacciones, setReacciones] = useState<Record<number, { like: number; dislike: number }>>({});
  const [miReaccion, setMiReaccion] = useState<Record<number, "like" | "dislike" | null>>({});
  const [eventoSeleccionado, setEventoSeleccionado] = useState<number | null>(null);
  const [feedbacksModal, setFeedbacksModal] = useState<any[]>([]);
  const [detallesReacciones, setDetallesReacciones] = useState<
    { IdUsuario: number; Nombre: string; Apellido: string; Tipo: "like" | "dislike" }[]
  >([]);

  // Obtener ID del usuario desde localStorage (simulación de sesión)
  const token = localStorage.getItem("token");
  const decoded: any = token ? JSON.parse(atob(token.split(".")[1])) : {};
  const idUsuario = decoded?.IdUsuario;

 const cargarEventosYReacciones = async () => {
  try {
    const res = await axios.get("https://render-hhyo.onrender.com/api/evento/publicos");

    // 🔹 Obtenemos la fecha actual
    const ahora = new Date();

    // 🔹 Filtrar eventos futuros o actuales
    const eventosFiltrados = res.data.filter((evento: EventoConDatos) => {
      const fechaFin = new Date(`${evento.FechaFin}T${evento.HoraFin}`);
      return fechaFin >= ahora; // Mantener solo los que no han terminado
    });

    setEventosPublicos(eventosFiltrados);

    // Cargar reacciones solo de los eventos filtrados
    const reaccionesPorEvento = await Promise.all(
      eventosFiltrados.map((evento: EventoConDatos) =>
        axios.get(`https://render-hhyo.onrender.com/api/reacciones/evento/${evento.IdEvento}`)
      )
    );

    const reaccionesMap: Record<number, { like: number; dislike: number }> = {};
    const misReacciones: Record<number, "like" | "dislike" | null> = {};

    eventosFiltrados.forEach((evento: EventoConDatos, idx: number) => {
      const { likes, dislikes, detalles } = reaccionesPorEvento[idx].data;
      reaccionesMap[evento.IdEvento] = { like: likes, dislike: dislikes };
      const yo = detalles.find((r: any) => r.usuario?.IdUsuario === idUsuario);
      misReacciones[evento.IdEvento] = yo?.Tipo || null;
    });

    setReacciones(reaccionesMap);
    setMiReaccion(misReacciones);
  } catch (err) {
    console.error("❌ Error al cargar eventos o reacciones:", err);
  }
};


  const cargarFeedbacksEvento = async (idEvento: number) => {
    try {
      const res = await axios.get(`https://render-hhyo.onrender.com/api/feedback/evento/${idEvento}`);
      setFeedbacksModal(res.data);
    } catch (err) {
      console.error("❌ Error al cargar feedbacks del modal:", err);
    }
  };

  const cargarDetallesReacciones = async (idEvento: number) => {
    try {
      const res = await axios.get(`https://render-hhyo.onrender.com/api/reacciones/evento/${idEvento}/detalles`);
      const data = res.data.map((r: any) => ({
        IdUsuario: r.usuario.IdUsuario,
        Nombre: r.usuario.Nombre,
        Apellido: r.usuario.Apellido,
        Tipo: r.Tipo,
      }));
      setDetallesReacciones(data);
    } catch (error) {
      console.error("❌ Error al cargar detalles de reacciones:", error);
    }
  };

  const manejarReaccion = async (idEvento: number, tipo: "like" | "dislike") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "https://render-hhyo.onrender.com/api/reacciones",
        { IdEvento: idEvento, Tipo: tipo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMiReaccion((prev) => ({ ...prev, [idEvento]: tipo }));

      setReacciones((prev) => {
        const actual = prev[idEvento] || { like: 0, dislike: 0 };
        const anterior = miReaccion[idEvento];
        const nuevo = { ...actual };

        if (tipo === "like") {
          if (anterior === "dislike") nuevo.dislike--;
          if (anterior !== "like") nuevo.like++;
        } else {
          if (anterior === "like") nuevo.like--;
          if (anterior !== "dislike") nuevo.dislike++;
        }

        return { ...prev, [idEvento]: nuevo };
      });
    } catch (err) {
      console.error("❌ Error al reaccionar:", err);
    }
  };

  useEffect(() => {
    cargarEventosYReacciones();
  }, []);

  const feedbackRef = useRef<HTMLDivElement>(null);

  const irAFeedback = () => {
    feedbackRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="evento-app-body">
      <div className="evento-app-contenedor-principal">
        <main className="evento-app-contenido-principal">
          <header className="evento-app-cabecera">
            <h2 className="evento-app-titulo-seccion">Novedades</h2>
            <div ref={feedbackRef} id="seccion-feedback" className="feedback-seccion-container">
              <h2 className="color-eventoa" style={{ textAlign: "center", marginBottom: "20px" }}>Eventos </h2>
              {eventoSeleccionado && (
                <Feedbacks key={eventoSeleccionado} idEventoSeleccionado={eventoSeleccionado} />
              )}
            </div>
          </header>

          {/* Historias */}
          <section className="evento-app-seccion-historias">
            <div className="evento-app-carrusel-historias">
              {eventosPublicos.map((evento, idx) => (
                <div
                  key={evento.IdEvento}
                  className="evento-app-historia"
                  onClick={() => {
                    setModalEvento(evento);
                    setEventoSeleccionado(evento.IdEvento);
                    cargarDetallesReacciones(evento.IdEvento);
                    cargarFeedbacksEvento(evento.IdEvento);
                  }}
                >
                  <img
                    src={obtenerRutaImagenEvento(evento.PlanificacionEvento?.ImagenUrl, idx)}
                    alt={evento.NombreEvento}
                    style={{ width: "100%", height: "120px", objectFit: "cover" }}
                  />
                  <p>{evento.NombreEvento}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Eventos Semanales */}
          <h2 className="evento-app-titulo-seccion">Eventos Semanales</h2>
          <section className="evento-app-seccion-feed">
            <div className="evento-app-lista-eventos">
              {eventosPublicos.map((evento, idx) => (
                <div
                  key={evento.IdEvento}
                  className="evento-app-tarjeta-evento"
                  onClick={() => {
                    setModalEvento(evento);
                    setEventoSeleccionado(evento.IdEvento);
                    cargarFeedbacksEvento(evento.IdEvento);
                    cargarDetallesReacciones(evento.IdEvento);
                  }}
                >
                  <div className="evento-app-cabecera-evento">
                    <img
                      src={obtenerRutaImagenEvento(evento.PlanificacionEvento?.ImagenUrl, idx)}
                      alt={evento.NombreEvento}
                      className="evento-app-foto-usuario"
                      style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div className="evento-app-info-usuario">
                      <p className="evento-app-nombre-usuario">{evento.NombreEvento}</p>
                      <p className="evento-app-fecha-evento">
                        {new Date(evento.FechaInicio).toLocaleDateString("es-CO")} - {evento.HoraInicio} a {evento.HoraFin}
                      </p>
                    </div>
                  </div>

                  <div className="evento-app-contenido-evento">
                    <p>{evento.DescripcionEvento}</p>
                    <p> {evento.UbicacionEvento}</p>
                  </div>

                  <div className="evento-app-acciones-evento">
                    <button
                      className={`evento-app-boton-me-gusta ${miReaccion[evento.IdEvento] === "like" ? "activo" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        manejarReaccion(evento.IdEvento, "like");
                      }}
                    >
                       Me gusta ({reacciones[evento.IdEvento]?.like || 0})
                    </button>
                    <button
                      className={`evento-app-boton-disgusto ${miReaccion[evento.IdEvento] === "dislike" ? "activo" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        manejarReaccion(evento.IdEvento, "dislike");
                      }}
                    >
                       No me gusta ({reacciones[evento.IdEvento]?.dislike || 0})
                    </button>
                    <button
                      className="evento-app-boton-comentar"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventoSeleccionado(evento.IdEvento);
                        setTimeout(() => {
                          irAFeedback();
                        }, 100);
                      }}
                    >
                       Feedback
                    </button>
                    {miReaccion[evento.IdEvento] && (
                      <div className="estado-reaccion">
                        {miReaccion[evento.IdEvento] === "like" && <span>💚 Te gustó</span>}
                        {miReaccion[evento.IdEvento] === "dislike" && <span>💔 No te gustó</span>}
                      </div>
                    )}
                  </div>

                  {feedbacksModal && evento.IdEvento === eventoSeleccionado && (
                    <div className="estado-feedback">
                      {feedbacksModal
                        .filter((fb) => fb.usuario?.IdUsuario === idUsuario)
                        .map((fb, i) => (
                          <div key={i}>
                            <p>📝 Ya comentaste: "{fb.ComentarioFeedback}"</p>
                            <p>{"⭐".repeat(fb.Calificacion || 0)}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* MODAL DETALLE */}
      {modalEvento && (
        <div className="evento-app-modal">
          <div className="evento-app-modal-contenido">
            <button className="evento-app-modal-cerrar" onClick={() => setModalEvento(null)}>❌</button>

            <div className="evento-app-modal-banner">
              <img
                src={obtenerRutaImagenEvento(
                  modalEvento.PlanificacionEvento?.ImagenUrl,
                  eventosPublicos.findIndex((e) => e.IdEvento === modalEvento.IdEvento)
                )}
                alt={modalEvento.NombreEvento}
                style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
              />
            </div>

            <h2 className="evento-app-modal-titulo">{modalEvento.NombreEvento}</h2>
            <div className="evento-app-modal-detalles">
              <p><strong>📅 Fecha:</strong> {new Date(modalEvento.FechaInicio).toLocaleDateString()}</p>
              <p><strong>🕒 Hora:</strong> {modalEvento.HoraInicio} a {modalEvento.HoraFin}</p>
              <p><strong>📍 Lugar:</strong> {modalEvento.UbicacionEvento}</p>
            </div>

            <div className="evento-app-modal-descripcion">
              <p>{modalEvento.DescripcionEvento}</p>
            </div>

            <div className="evento-app-modal-organizador">
              <h4>👤 Planificado por:</h4>
              {modalEvento.PlanificacionEvento?.usuario ? (
                <div className="evento-app-modal-perfil">
                  <img
                    src={obtenerRutaImagenPerfil(modalEvento.PlanificacionEvento.usuario.perfilInstructor?.imagen)}
                    alt="Imagen del planificador"
                    style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <p>
                    {modalEvento.PlanificacionEvento.usuario.Nombre}{" "}
                    {modalEvento.PlanificacionEvento.usuario.Apellido}
                  </p>
                </div>
              ) : (
                <p>No disponible</p>
              )}
            </div>

            <div className="evento-app-modal-reacciones">
              <div className="evento-app-modal-feedbacks">
                <h4> Comentarios de los asistentes:</h4>
                {feedbacksModal.length === 0 ? (
                  <p>No hay comentarios aún.</p>
                ) : (
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {feedbacksModal.map((fb, i) => (
                      <li key={i} style={{ marginBottom: "1rem", borderBottom: "1px solid #ccc", paddingBottom: "0.5rem" }}>
                        <p><strong>{fb.usuario?.Nombre || "Anónimo"} {fb.usuario?.Apellido || ""}</strong></p>
                        <p>{fb.ComentarioFeedback}</p>
                        <p>{"⭐".repeat(fb.Calificacion || 0)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <h4> Usuarios que dieron Me gusta:</h4>
              <ul>
                {detallesReacciones.filter((r) => r.Tipo === "like").map((u) => (
                  <li key={u.IdUsuario}>{u.Nombre} {u.Apellido}</li>
                ))}
              </ul>
              <h4> Usuarios que dieron No me gusta:</h4>
              <ul>
                {detallesReacciones.filter((r) => r.Tipo === "dislike").map((u) => (
                  <li key={u.IdUsuario}>{u.Nombre} {u.Apellido}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aplicacion;
