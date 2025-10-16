import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaEdit, FaStar, FaFire, FaCheckCircle, FaTimes, FaThumbsUp, FaThumbsDown, FaComments, FaHeart, FaHeartBroken, FaBullhorn } from "react-icons/fa";
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
            <h2 className="evento-app-titulo-seccion"><FaBullhorn /> Descubre Eventos Increíbles</h2>
            <p style={{ color: '#374151', fontSize: '1.1rem', marginTop: '0.5rem', fontWeight: '500' }}>
              Explora, participa y comparte tus experiencias
            </p>
            <div ref={feedbackRef} id="seccion-feedback" className="feedback-seccion-container">
              <h2 className="color-eventoa" style={{ textAlign: "center", marginBottom: "20px" }}>Eventos </h2>
              {eventoSeleccionado && (
                <Feedbacks key={eventoSeleccionado} idEventoSeleccionado={eventoSeleccionado} />
              )}
            </div>
          </header>

          {/* Historias */}
          <section className="evento-app-seccion-historias">
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              marginBottom: '1rem', 
              color: 'var(--negro)',
              textAlign: 'left'
            }}>
              <FaFire /> Eventos Destacados
            </h3>
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
          <h2 className="evento-app-titulo-seccion" style={{ color: 'black', marginTop: '2rem' }}>
            <FaCalendarAlt /> Eventos Semanales
          </h2>
          <section className="evento-app-seccion-feed">
            <div className="evento-app-lista-eventos">
              {eventosPublicos.map((evento, idx) => {
                const totalReacciones = (reacciones[evento.IdEvento]?.like || 0) + (reacciones[evento.IdEvento]?.dislike || 0);
                const esPopular = totalReacciones > 5;
                const ahora = Date.now();
                const fechaInicio = new Date(evento.FechaInicio).getTime();
                const esProximo = fechaInicio > ahora && (fechaInicio - ahora) < 7 * 24 * 60 * 60 * 1000;
                
                return (
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
                      />
                      <div className="evento-app-info-usuario">
                        <p className="evento-app-nombre-usuario">
                          {evento.NombreEvento}
                          {esPopular && <span className="evento-badge evento-badge-popular"><FaFire /> Popular</span>}
                          {esProximo && <span className="evento-badge evento-badge-proximo"><FaClock /> Próximo</span>}
                        </p>
                        <p className="evento-app-fecha-evento">
                          <FaCalendarAlt /> {new Date(evento.FechaInicio).toLocaleDateString("es-CO")}
                        </p>
                        <p className="evento-app-fecha-evento">
                          <FaClock /> {evento.HoraInicio} - {evento.HoraFin}
                        </p>
                      </div>
                    </div>

                    <div className="evento-app-contenido-evento">
                      <p><strong><FaEdit /> Descripción:</strong> {evento.DescripcionEvento}</p>
                      <p><strong><FaMapMarkerAlt /> Ubicación:</strong> {evento.UbicacionEvento}</p>
                    </div>

                    {/* Estadísticas del evento */}
                    <div className="evento-stats">
                      <div className="evento-stat-item">
                        <span><FaThumbsUp /></span>
                        <strong>{reacciones[evento.IdEvento]?.like || 0}</strong>
                        <span>Me gusta</span>
                      </div>
                      <div className="evento-stat-item">
                        <span><FaThumbsDown /></span>
                        <strong>{reacciones[evento.IdEvento]?.dislike || 0}</strong>
                        <span>No me gusta</span>
                      </div>
                      <div className="evento-stat-item">
                        <span><FaComments /></span>
                        <strong>{feedbacksModal.filter(fb => fb.IdEvento === evento.IdEvento).length}</strong>
                        <span>Comentarios</span>
                      </div>
                    </div>

                    <div className="evento-app-acciones-evento">
                      <button
                        className={`evento-app-boton-me-gusta ${miReaccion[evento.IdEvento] === "like" ? "activo" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          manejarReaccion(evento.IdEvento, "like");
                        }}
                      >
                        <FaThumbsUp /> Me gusta ({reacciones[evento.IdEvento]?.like || 0})
                      </button>
                      <button
                        className={`evento-app-boton-disgusto ${miReaccion[evento.IdEvento] === "dislike" ? "activo" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          manejarReaccion(evento.IdEvento, "dislike");
                        }}
                      >
                        <FaThumbsDown /> No me gusta ({reacciones[evento.IdEvento]?.dislike || 0})
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
                        <FaComments /> Feedback
                      </button>
                      {miReaccion[evento.IdEvento] && (
                        <div className="estado-reaccion">
                          {miReaccion[evento.IdEvento] === "like" && <span><FaHeart /> Te gustó</span>}
                          {miReaccion[evento.IdEvento] === "dislike" && <span><FaHeartBroken /> No te gustó</span>}
                        </div>
                      )}
                    </div>

                    {feedbacksModal && evento.IdEvento === eventoSeleccionado && (
                      <div className="estado-feedback">
                        {feedbacksModal
                          .filter((fb) => fb.usuario?.IdUsuario === idUsuario)
                          .map((fb, i) => (
                            <div key={i}>
                              <p><FaEdit /> Ya comentaste: "{fb.ComentarioFeedback}"</p>
                              <p>{Array(fb.Calificacion || 0).fill(<FaStar />)}</p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* MODAL DETALLE */}
      {modalEvento && (
        <div className="evento-app-modal">
          <div className="evento-app-modal-contenido">
            <button className="evento-app-modal-cerrar" onClick={() => setModalEvento(null)}><FaTimes /></button>

            <div className="evento-app-modal-banner">
              <img
                src={obtenerRutaImagenEvento(
                  modalEvento.PlanificacionEvento?.ImagenUrl,
                  eventosPublicos.findIndex((e) => e.IdEvento === modalEvento.IdEvento)
                )}
                alt={modalEvento.NombreEvento}
              />
            </div>

            <h2 className="evento-app-modal-titulo"><FaBullhorn /> {modalEvento.NombreEvento}</h2>
            
            <div className="evento-app-modal-detalles">
              <p><strong><FaCalendarAlt /> Fecha de Inicio:</strong> {new Date(modalEvento.FechaInicio).toLocaleDateString("es-CO", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong><FaCalendarAlt /> Fecha de Fin:</strong> {new Date(modalEvento.FechaFin).toLocaleDateString("es-CO", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong><FaClock /> Horario:</strong> {modalEvento.HoraInicio} - {modalEvento.HoraFin}</p>
              <p><strong><FaMapMarkerAlt /> Ubicación:</strong> {modalEvento.UbicacionEvento}</p>
            </div>

            <div className="evento-app-modal-descripcion">
              <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '700' }}><FaEdit /> Descripción del Evento</h4>
              <p>{modalEvento.DescripcionEvento}</p>
            </div>

            {/* Estadísticas del modal */}
            <div className="evento-stats" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: '1rem' }}>
              <div className="evento-stat-item">
                <span style={{ fontSize: '1.5rem' }}><FaThumbsUp /></span>
                <div>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--sena-verde)' }}>{reacciones[modalEvento.IdEvento]?.like || 0}</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Me gusta</p>
                </div>
              </div>
              <div className="evento-stat-item">
                <span style={{ fontSize: '1.5rem' }}><FaThumbsDown /></span>
                <div>
                  <strong style={{ fontSize: '1.5rem', color: '#c9302c' }}>{reacciones[modalEvento.IdEvento]?.dislike || 0}</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>No me gusta</p>
                </div>
              </div>
              <div className="evento-stat-item">
                <span style={{ fontSize: '1.5rem' }}><FaComments /></span>
                <div>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--sena-azul)' }}>{feedbacksModal.length}</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Comentarios</p>
                </div>
              </div>
            </div>

            <div className="evento-app-modal-organizador">
              <h4><FaCheckCircle /> Planificado por:</h4>
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
                <h4><FaComments /> Comentarios de los asistentes ({feedbacksModal.length})</h4>
                {feedbacksModal.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    Aún no hay comentarios. ¡Sé el primero en compartir tu opinión!
                  </p>
                ) : (
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {feedbacksModal.map((fb, i) => (
                      <li key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, var(--sena-verde), var(--sena-azul))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                          }}>
                            {(fb.usuario?.Nombre?.[0] || "A").toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: '700', color: 'var(--negro)' }}>
                              {fb.usuario?.Nombre || "Anónimo"} {fb.usuario?.Apellido || ""}
                            </p>
                            <p style={{ margin: 0, fontSize: '1.2rem' }}>{Array(fb.Calificacion || 0).fill(null).map((_, i) => <FaStar key={i} />)}</p>
                          </div>
                        </div>
                        <p style={{ marginLeft: '3rem', color: '#4b5563', lineHeight: '1.6' }}>{fb.ComentarioFeedback}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ marginTop: '2rem' }}>
                <h4><FaThumbsUp /> Usuarios que les gustó ({detallesReacciones.filter((r) => r.Tipo === "like").length})</h4>
                {detallesReacciones.filter((r) => r.Tipo === "like").length === 0 ? (
                  <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Nadie ha dado "Me gusta" aún</p>
                ) : (
                  <ul>
                    {detallesReacciones.filter((r) => r.Tipo === "like").map((u) => (
                      <li key={u.IdUsuario}><FaCheckCircle /> {u.Nombre} {u.Apellido}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h4><FaThumbsDown /> Usuarios que no les gustó ({detallesReacciones.filter((r) => r.Tipo === "dislike").length})</h4>
                {detallesReacciones.filter((r) => r.Tipo === "dislike").length === 0 ? (
                  <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Nadie ha dado "No me gusta"</p>
                ) : (
                  <ul>
                    {detallesReacciones.filter((r) => r.Tipo === "dislike").map((u) => (
                      <li key={u.IdUsuario}><FaTimes /> {u.Nombre} {u.Apellido}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aplicacion;
