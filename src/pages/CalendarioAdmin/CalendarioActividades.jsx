import React, { useState, useEffect } from 'react';
import './style/Calendario.css';
import fondo4 from './img/fondo4.jpg';
import { FaBell, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaEnvelope, FaUser, FaCheckCircle, FaComments, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';

const CalendarioAp = () => {
  const [events, setEvents] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clickedNotifications, setClickedNotifications] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [usuarios, setUsuarios] = useState([]);

  // Cambiar de mes
  const irAlMesAnterior = () => {
    const nuevaFecha = new Date(currentDate);
    nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
    setCurrentDate(nuevaFecha);
  };

  const irAlMesSiguiente = () => {
    const nuevaFecha = new Date(currentDate);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    setCurrentDate(nuevaFecha);
  };

  // Cargar usuarios + actividades + eventos
  useEffect(() => {
    const cargarTodo = async () => {
      try {
       const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

// Ejemplo correcto:
const resUsuarios = await axios.get("https://render-hhyo.onrender.com/api/usuario", { headers });
const [resActividades, resEventos] = await Promise.all([
  axios.get("https://render-hhyo.onrender.com/api/actividad", { headers }),
  axios.get("https://render-hhyo.onrender.com/api/evento/publicos", { headers }),
]);


        // Map actividades
        const actividades = resActividades.data.map(actividad => {
          const fechaCompleta = new Date(actividad.FechaInicio);
          return {
            id: `a-${actividad.IdActividad}`,
            title: actividad.NombreActi,
            image: actividad.Imagen?.startsWith("http")
              ? actividad.Imagen
              : actividad.Imagen
              ? `http://localhost:3001/uploads/${actividad.Imagen}`
              : fondo4,
            applicant: actividad.Organizador || "SENA",
            location: actividad.Ubicacion,
            fullDate: fechaCompleta,
            date: fechaCompleta.toLocaleDateString('es-ES'),
            time: `${actividad.HoraInicio} - ${actividad.HoraFin}`,
            description: actividad.Descripcion,
            contact: "contacto@sena.edu.co",
            day: fechaCompleta.getDate(),
            asistio: false,
            feedbackDado: false,
            tipo: "actividad"
          };
        });

        // Map eventos
        const eventos = resEventos.data.map(evento => {
          const usuario = resUsuarios.data.find(u => u.IdUsuario === evento.IdUsuario);
          const fechaCompleta = new Date(evento.FechaInicio);
          return {
            id: `e-${evento.IdEvento}`,
            title: evento.NombreEvento,
            image: evento.Imagen?.startsWith("http")
              ? evento.Imagen
              : evento.Imagen
              ? `https://render-hhyo.onrender.com/uploads/${evento.Imagen}`
              : fondo4,
            applicant: usuario ? usuario.NombreCompleto : 'Desconocido',
            location: evento.UbicacionEvento,
            fullDate: fechaCompleta,
            date: fechaCompleta.toLocaleDateString('es-ES'),
            time: `${evento.HoraInicio} - ${evento.HoraFin}`,
            description: evento.DescripcionEvento,
            contact: "contacto@sena.edu.co",
            day: fechaCompleta.getDate(),
            asistio: false,
            feedbackDado: false,
            tipo: "evento"
          };
        });

        // Unir todo
        const todos = [...actividades, ...eventos];
        const mesActual = currentDate.getMonth();
        const añoActual = currentDate.getFullYear();
        const filtrados = todos.filter(
          e => e.fullDate.getMonth() === mesActual && e.fullDate.getFullYear() === añoActual
        );

        setEvents(filtrados);
        setCalendarEvents(filtrados.map(e => ({
          day: e.day,
          title: e.title,
          eventId: e.id
        })));
      } catch (err) {
        console.error("Error al cargar datos completos:", err);
      }
    };

    cargarTodo();
  }, [currentDate]);

  // Notificaciones
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  // Abrir modal
  const openEventModal = (event) => {
    setSelectedEvent(event);
    setShowInfoModal(true);
    localStorage.setItem("lastSeenActividadId", event.id);
  };

  // Click notificación
  const handleNotificationClick = (eventId) => {
    setClickedNotifications((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  // Confirmar asistencia
 const confirmarAsistencia = async (eventoId) => {
  const idNum = Number(eventoId.toString().replace(/^[ae]-/, ''));

  // Usa la clave correcta: "IdUsuario"
  let IdUsuario = localStorage.getItem("IdUsuario");
  const token = localStorage.getItem("token");

  // Si no existe IdUsuario en localStorage, intenta extraerlo del token
  if (!IdUsuario && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload?.IdUsuario) {
        IdUsuario = String(payload.IdUsuario);
        localStorage.setItem("IdUsuario", IdUsuario);
        console.log("IdUsuario extraído del token:", IdUsuario);
      }
    } catch (e) {
      console.warn("No se pudo extraer IdUsuario del token", e);
    }
  }

  const IdUsuarioNum = Number(IdUsuario);

  if (!token) {
    Swal.fire({ icon: 'error', title: 'No autenticado', text: 'Token no encontrado.' });
    return;
  }
  if (!IdUsuarioNum || Number.isNaN(IdUsuarioNum)) {
    Swal.fire({ icon: 'error', title: 'Usuario inválido', text: 'IdUsuario no válido.' });
    return;
  }

  const url = 'https://render-hhyo.onrender.com/api/relusuarioevento/confirmar-asistencia';
  const body = { IdUsuario: IdUsuarioNum, IdEvento: idNum };
  console.log("POST ->", url);
  console.log("Headers -> Authorization: Bearer <token?>", !!token);
  console.log("Body ->", body);

  try {
    const res = await axios.post(url, body, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      validateStatus: status => status < 500
    });

    console.log("Respuesta confirmar-asistencia:", res.status, res.data);

    if (res.status === 200 || res.status === 201) {
      await Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Si no asistes tendrás una penalización, tendrás un límite de uso de la plataforma.',
        confirmButtonText: 'Aceptar',
      });

      const nuevosEventos = events.map(ev => ev.id === eventoId ? { ...ev, asistio: true } : ev);
      setEvents(nuevosEventos);
      if (selectedEvent && selectedEvent.id === eventoId) setSelectedEvent(prev => ({ ...prev, asistio: true }));
    } else {
      Swal.fire({ icon: 'error', title: `Error ${res.status}`, text: res.data?.mensaje || JSON.stringify(res.data) });
    }
  } catch (err) {
    console.error("Error al confirmar asistencia:", err);
    if (err.response) {
      console.error("err.response:", err.response.status, err.response.data);
      Swal.fire({ icon: 'error', title: `Error ${err.response.status}`, text: JSON.stringify(err.response.data) });
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Error desconocido' });
    }
  }
};

  // Renderizar días del calendario
  const renderCalendarDays = () => {
    const days = [];
    const diasEnMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    let primerDiaSemana = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

    for (let i = 0; i < primerDiaSemana; i++) {
      days.push(<div key={`empty-${i}`} className="cal-dia-vacio"></div>);
    }

   for (let i = 1; i <= diasEnMes; i++) {
  const eventsOfDay = calendarEvents.filter(e => e.day === i);
  const isToday = i === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

  days.push(
    <div
      key={`day-${i}`}
      className={`cal-dia ${isToday ? 'cal-hoy' : ''}`}
      title={eventsOfDay.map(e => e.title).join('\n')} // tooltip con títulos
    >
      <span className="cal-dia-numero">{i}</span>
      <div className="cal-event-indicators">
        {eventsOfDay.map(e => {
          const fullEvent = events.find(ev => ev.id === e.eventId);
          return (
            <span
              key={e.eventId}
              className={`cal-event-dot ${fullEvent.tipo}`}
              onClick={() => openEventModal(fullEvent)}
            ></span>
          );
        })}
      </div>
    </div>
  );
}


    return days;
  };

  return (
    <div className="cal-admin-container">
      <main className="cal-main-content">
        <header className="cal-app-header">
          <h1 className="cal-app-title">
            Calendario de Actividades y Eventos <span className="cal-sena-text">SENA</span>
          </h1>

          {/* Botón de notificaciones */}
          <button className={`cal-notifications-btn ${showNotifications ? 'cal-active' : ''}`} onClick={toggleNotifications}>
            <FaBell className="cal-bell-icon" />
            <span className="cal-notification-badge">{events.length}</span>
          </button>

          {/* Panel de notificaciones */}
          {showNotifications && (
            <div className="cal-notifications-panel">
              <div className="cal-notifications-header">
                <h2>Notificaciones</h2>
                <button className="cal-close-notifications" onClick={toggleNotifications}>&times;</button>
              </div>
              <div className="cal-notifications-list">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="cal-notification-item"
                    onClick={() => {
                      openEventModal(event);
                      setShowNotifications(false);
                    }}
                  >
                    <img src={event.image} alt={event.title} className="cal-notification-img" />
                    <div className="cal-notification-content">
                      <h3>{event.title}</h3>
                      <p>{event.date} - {event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Calendario principal */}
        <section className="cal-calendar-section">
          <div className="cal-calendar-container">
            <div className="cal-calendar-controls">
              <button className="cal-month-btn cal-prev-month" onClick={irAlMesAnterior}>◀️</button>
              <h3 className="cal-current-month">
                {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
              </h3>
              <button className="cal-month-btn cal-next-month" onClick={irAlMesSiguiente}>▶️</button>
            </div>
            <div className="cal-calendar-grid">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <div key={day} className="cal-week-day">{day}</div>
              ))}
              {renderCalendarDays()}
            </div>
          </div>
        </section>
      </main>

      {/* Modal informativo */}
      {showInfoModal && selectedEvent && (
        <div className="cal-modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="cal-event-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="cal-modal-close" onClick={() => setShowInfoModal(false)}>
              <FaTimes />
            </button>
            
            {/* Badge de tipo */}
            <div className="cal-modal-badge">
              <span className={`cal-tipo-badge ${selectedEvent.tipo}`}>
                {selectedEvent.tipo === "actividad" ? "Actividad Lúdica" : "Evento SENA"}
              </span>
            </div>

            <h2 className="cal-event-modal-title">{selectedEvent.title}</h2>
            
            <div className="cal-event-modal-content">
              <img src={selectedEvent.image} alt={selectedEvent.title} className="cal-event-modal-image" />
              
              <div className="cal-event-details">
                <div className="cal-detail-item">
                  <FaCalendarAlt className="cal-detail-icon" />
                  <div>
                    <span className="cal-detail-label">Fecha</span>
                    <span className="cal-detail-value">{selectedEvent.date}</span>
                  </div>
                </div>

                <div className="cal-detail-item">
                  <FaClock className="cal-detail-icon" />
                  <div>
                    <span className="cal-detail-label">Horario</span>
                    <span className="cal-detail-value">{selectedEvent.time}</span>
                  </div>
                </div>

                <div className="cal-detail-item">
                  <FaMapMarkerAlt className="cal-detail-icon" />
                  <div>
                    <span className="cal-detail-label">Lugar</span>
                    <span className="cal-detail-value">{selectedEvent.location}</span>
                  </div>
                </div>

                <div className="cal-detail-item">
                  <FaUser className="cal-detail-icon" />
                  <div>
                    <span className="cal-detail-label">{selectedEvent.tipo === "actividad" ? "Organizador" : "Creado por"}</span>
                    <span className="cal-detail-value">{selectedEvent.applicant}</span>
                  </div>
                </div>

                <div className="cal-detail-item">
                  <FaEnvelope className="cal-detail-icon" />
                  <div>
                    <span className="cal-detail-label">Contacto</span>
                    <span className="cal-detail-value">{selectedEvent.contact}</span>
                  </div>
                </div>

                <div className="cal-description-section">
                  <h4>Descripción</h4>
                  <p>{selectedEvent.description}</p>
                </div>

                <div className="cal-event-participation">
                  {!selectedEvent.asistio ? (
                    <button className="cal-btn-confirmar" onClick={() => confirmarAsistencia(selectedEvent.id)}>
                      <FaCheckCircle /> Confirmar Asistencia
                    </button>
                  ) : (
                    <div className="cal-asistencia-confirmada">
                      <FaCheckCircle /> Asistencia Confirmada
                    </div>
                  )}

                  {!selectedEvent.feedbackDado && selectedEvent.asistio && (
                    <button className="cal-btn-feedback" onClick={() => setShowFeedback(true)}>
                      <FaComments /> Dar Feedback
                    </button>
                  )}
                </div>

                <p className="cal-description-text">{selectedEvent.description}</p>

                {showFeedback && (
                  <div className="cal-modal-overlay">
                    <div className="cal-event-modal-container">
                      <button className="cal-modal-close" onClick={() => setShowFeedback(false)}>&times;</button>
                      <h2 className="cal-event-modal-title">Feedback del evento</h2>
                      <div className="cal-event-modal-content">
                        <label>Calificación (1-5):</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={feedbackRating}
                          onChange={(e) => setFeedbackRating(Number(e.target.value))}
                        />
                        <label>Comentario:</label>
                        <textarea
                          rows="4"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            const nuevosEventos = events.map(ev =>
                              ev.id === selectedEvent.id ? { ...ev, feedbackDado: true } : ev
                            );
                            setEvents(nuevosEventos);
                            setSelectedEvent((prev) => ({ ...prev, feedbackDado: true }));
                            setShowFeedback(false);
                            setFeedbackText("");
                            setFeedbackRating(5);
                          }}
                        >
                          Enviar feedback
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioAp;
