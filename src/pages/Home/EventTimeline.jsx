import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { MdEventAvailable } from 'react-icons/md';
import { Link } from 'react-router-dom';
import './styles/EventTimeline.css';

export default function EventTimeline() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const timelineRef = useRef(null);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await axios.get('https://render-hhyo.onrender.com/api/evento/publicos');
        const ahora = new Date();

        // Filtrar solo eventos futuros y ordenar por fecha
        const eventosFuturos = response.data
          .filter(evento => {
            const fechaEvento = new Date(`${evento.FechaInicio}T${evento.HoraInicio || '00:00'}`);
            return fechaEvento >= ahora;
          })
          .sort((a, b) => {
            const fechaA = new Date(`${a.FechaInicio}T${a.HoraInicio || '00:00'}`);
            const fechaB = new Date(`${b.FechaInicio}T${b.HoraInicio || '00:00'}`);
            return fechaA - fechaB;
          })
          .slice(0, 6); // Máximo 6 eventos

        setEventos(eventosFuturos);
        console.log('📅 Eventos próximos cargados:', eventosFuturos.length);
      } catch (error) {
        console.error('❌ Error cargando eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  // Intersection Observer para animaciones al scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, entry.target.dataset.index]));
          }
        });
      },
      { threshold: 0.2 }
    );

    const items = document.querySelectorAll('.timeline-item');
    items.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, [eventos]);

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const opciones = { day: '2-digit', month: 'short' };
    return date.toLocaleDateString('es-ES', opciones).replace('.', '');
  };

  // Obtener día de la semana
  const obtenerDiaSemana = (fecha) => {
    const date = new Date(fecha);
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[date.getDay()];
  };

  if (loading) {
    return (
      <section className="timeline-section">
        <div className="timeline-container">
          <div className="timeline-header">
            <h2 className="timeline-title">Próximos Eventos</h2>
            <p className="timeline-loading">Cargando eventos...</p>
          </div>
        </div>
      </section>
    );
  }

  if (eventos.length === 0) {
    return (
      <section className="timeline-section">
        <div className="timeline-container">
          <div className="timeline-header">
            <h2 className="timeline-title">Próximos Eventos</h2>
            <p className="timeline-subtitle">No hay eventos próximos programados</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="timeline-section" ref={timelineRef}>
      <div className="timeline-container">
        <div className="timeline-header">
          <div className="timeline-header-content">
            <MdEventAvailable className="timeline-header-icon" />
            <div>
              <h2 className="timeline-title">Próximos Eventos</h2>
              <p className="timeline-subtitle">
                Descubre las actividades que tenemos preparadas para ti
              </p>
            </div>
          </div>
          <Link to="/actividades" className="timeline-view-all">
            Ver todos <FaArrowRight />
          </Link>
        </div>

        <div className="timeline-wrapper">
          <div className="timeline-line"></div>
          
          {eventos.map((evento, index) => (
            <div
              key={evento.IdEvento}
              className={`timeline-item ${visibleItems.has(String(index)) ? 'timeline-item-visible' : ''}`}
              data-index={index}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="timeline-date-badge">
                <div className="timeline-date-day">{formatearFecha(evento.FechaInicio).split(' ')[0]}</div>
                <div className="timeline-date-month">{formatearFecha(evento.FechaInicio).split(' ')[1]}</div>
                <div className="timeline-date-weekday">{obtenerDiaSemana(evento.FechaInicio)}</div>
              </div>

              <div className="timeline-node">
                <div className="timeline-node-inner"></div>
                <div className="timeline-node-pulse"></div>
              </div>

              <div className="timeline-content">
                <div className="timeline-card">
                  <div className="timeline-card-header">
                    <h3 className="timeline-event-title">{evento.NombreEvento}</h3>
                    {evento.TipoEvento && (
                      <span className="timeline-event-type">{evento.TipoEvento}</span>
                    )}
                  </div>

                  {evento.DescripcionEvento && (
                    <p className="timeline-event-description">
                      {evento.DescripcionEvento.length > 100
                        ? evento.DescripcionEvento.substring(0, 100) + '...'
                        : evento.DescripcionEvento}
                    </p>
                  )}

                  <div className="timeline-event-details">
                    <div className="timeline-detail-item">
                      <FaClock className="timeline-detail-icon" />
                      <span>{evento.HoraInicio || 'Por confirmar'}</span>
                    </div>
                    <div className="timeline-detail-item">
                      <FaMapMarkerAlt className="timeline-detail-icon" />
                      <span>{evento.UbicacionEvento || 'Por confirmar'}</span>
                    </div>
                  </div>

                  <Link to="/actividades" className="timeline-event-link">
                    Ver detalles <FaArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {eventos.length >= 6 && (
          <div className="timeline-footer">
            <Link to="/actividades" className="timeline-footer-btn">
              Ver más eventos <FaArrowRight />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
