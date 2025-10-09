import React, { useState, useEffect } from 'react';
import './style/Calendario.css';
import fondo3 from './img/fondo3.jpg';
import fondo4 from './img/fondo4.jpg';
import { FaBell } from 'react-icons/fa';

const CalendarioAp = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState('Marzo 2023');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [clickedNotifications, setClickedNotifications] = useState([]);

  const [events] = useState([
    {
      id: 1,
      title: 'Día de la Mujer',
      image: fondo3,
      applicant: 'Andres urbano',
      location: 'Auditorio Principal',
      date: '28 de Marzo, 2023',
      time: '10:00 AM - 12:00 PM',
      description: 'Evento de inteligencia Artificial con charlas y actividades culturales.',
      contact: 'contacto@institutogenero.com',
    },
    {
      id: 2,
      title: 'Conferencia de Tecnología',
      image: fondo4,
      applicant: 'Carlos Pérez',
      location: 'Sala de Conferencias A',
      date: '15 de Marzo, 2023',
      time: '2:00 PM - 4:00 PM',
      description: 'Conferencia sobre las últimas tendencias en tecnología.',
      contact: 'contacto@tecnologia.com',
    },
  ]);

  const calendarEvents = [
    { day: 8, title: 'Día de la Mujer', eventId: 1 },
    { day: 15, title: 'Conferencia de Tecnología', eventId: 2 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhotoIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [events.length]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setShowInfoModal(true);
  };

  const handleApprove = () => {
    setModalTitle('Evento Aprobado');
    setModalMessage('El evento ha sido aprobado exitosamente.');
    setShowRejectionInput(false);
    setShowModal(true);
    setShowInfoModal(false);
  };

  const handleReject = () => {
    setModalTitle('Evento Rechazado');
    setModalMessage('Especifica el motivo del rechazo:');
    setShowRejectionInput(true);
    setShowModal(true);
  };

  const handleModalAction = () => {
    if (modalTitle === 'Evento Rechazado' && rejectionReason.trim() === '') {
      alert('Por favor, especifica el motivo del rechazo.');
      return;
    }

    alert(
      modalTitle === 'Evento Aprobado'
        ? 'Evento aprobado exitosamente.'
        : `Evento rechazado. Motivo: ${rejectionReason}`
    );

    setShowModal(false);
    setRejectionReason('');
  };

  const handleNotificationClick = (eventId) => {
    setClickedNotifications((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const renderCalendarDays = () => {
    const days = [];

    days.push(<div key="empty-1" className="dia-vacio"></div>);
    days.push(<div key="empty-2" className="dia-vacio"></div>);

    for (let i = 1; i <= 31; i++) {
      const event = calendarEvents.find((e) => e.day === i);
      if (event) {
        const fullEvent = events.find((e) => e.id === event.eventId);
        const isClicked = clickedNotifications.includes(fullEvent.id);
        days.push(
          <div key={`day-${i}`} className="dia evento">
            <div onClick={() => openEventModal(fullEvent)} className="dia-clickable">
              <span className="dia-numero">{i}</span>
              <span className="nombre-evento">{event.title}</span>
            </div>
            <FaBell
              className={`noti-icon ${isClicked ? 'clicked' : ''}`}
              onClick={() => handleNotificationClick(fullEvent.id)}
              title="Notificación"
            />
          </div>
        );
      } else {
        days.push(
          <div key={i} className="dia">
            <span className="dia-numero">{i}</span>
          </div>
        );
      }
    }

    return days;
  };

  return (
    <div className="admin-container">
      <main className="main-content">
        <header className="app-header">
          <h1 className="app-title">Calendario del Aprendiz <span className="sena-text">SENA</span></h1>
          <button className={`notifications-btn ${showNotifications ? 'active' : ''}`} onClick={toggleNotifications}>
            <i className="bell-icon">🔔</i>
            <span className="notification-badge">{events.length}</span>
          </button>

          {showNotifications && (
            <div className="notifications-panel">
              <div className="notifications-header">
                <h2>Notificaciones</h2>
                <button className="close-notifications" onClick={toggleNotifications}>
                  &times;
                </button>
              </div>
              <div className="notifications-list">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="notification-item"
                    onClick={() => {
                      openEventModal(event);
                      setShowNotifications(false);
                    }}
                  >
                    <img src={event.image} alt={event.title} className="notification-img" />
                    <div className="notification-content">
                      <h3>{event.title}</h3>
                      <p>{event.date} - {event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        <section className="calendar-section">
          <h2 className="section-title">Calendario de Eventos</h2>
          <div className="calendar-container">
            <div className="calendar-controls">
              <button className="month-btn prev-month">◀️</button>
              <h3 className="current-month">{currentMonth}</h3>
              <button className="month-btn next-month">▶️</button>
            </div>

            <div className="calendar-grid">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <div key={day} className="week-day">{day}</div>
              ))}
              {renderCalendarDays()}
            </div>
          </div>
        </section>
      </main>

      {/* Modal aprobación/rechazo */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="modal-title">{modalTitle}</h2>
            <p className="modal-message">{modalMessage}</p>

            {showRejectionInput && (
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ingresa el motivo del rechazo..."
                className="rejection-textarea"
              />
            )}

            <div className="modal-actions">
              <button className="modal-confirm-btn" onClick={handleModalAction}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de información */}
      {showInfoModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="event-modal-container">
            <button className="modal-close" onClick={() => setShowInfoModal(false)}>&times;</button>
            <h2 className="event-modal-title">{selectedEvent.title}</h2>
            <div className="event-modal-content">
              <img src={selectedEvent.image} alt={selectedEvent.title} className="event-modal-image" />
              <div className="event-details">
                <p><strong>Fecha:</strong> {selectedEvent.date}</p>
                <p><strong>Hora:</strong> {selectedEvent.time}</p>
                <p><strong>Lugar:</strong> {selectedEvent.location}</p>
                <p><strong>Solicitante:</strong> {selectedEvent.applicant}</p>
                <p><strong>Contacto:</strong> {selectedEvent.contact}</p>
                <p>{selectedEvent.description}</p>
              </div>
              <div className="event-modal-actions">
                <button className="btn-approve" onClick={handleApprove}>✅ Aprobar</button>
                <button className="btn-reject" onClick={handleReject}>❌ Rechazar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioAp;
