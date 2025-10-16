import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PanelFeedback.css";

const PanelFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    setIsLoading(true);
    axios
      .get("https://render-hhyo.onrender.com/api/feedback")
      .then((res) => {
        setFeedbacks(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar feedbacks:", err);
        setIsLoading(false);
      });
  }, []);

  const getFilteredFeedbacks = () => {
    if (filter === "actividad") return feedbacks.filter((f: any) => f.IdActividad);
    if (filter === "solicitud") return feedbacks.filter((f: any) => !f.IdActividad);
    return feedbacks;
  };

  const filteredData = getFilteredFeedbacks();
  const totalFeedbacks = feedbacks.length;
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc: number, f: any) => acc + f.Calificacion, 0) / feedbacks.length).toFixed(1)
    : 0;
  const actividades = feedbacks.filter((f: any) => f.IdActividad).length;
  const solicitudes = feedbacks.filter((f: any) => !f.IdActividad).length;

  return (
    <div className="panel-feedbacks-container">
      {/* Header con título y descripción */}
      <div className="feedback-header-section">
        <div className="feedback-title-wrapper">
          <h1 className="feedback-main-title">Panel de Feedbacks</h1>
          <p className="feedback-subtitle">Gestiona y analiza los comentarios de tus estudiantes</p>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="feedback-stats-grid">
        <div className="feedback-stat-card feedback-stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Total Feedbacks</span>
            <span className="stat-value">{totalFeedbacks}</span>
          </div>
        </div>
        <div className="feedback-stat-card feedback-stat-rating">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <span className="stat-label">Calificación Promedio</span>
            <span className="stat-value">{avgRating}/5</span>
          </div>
        </div>
        <div className="feedback-stat-card feedback-stat-activities">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <span className="stat-label">Actividades</span>
            <span className="stat-value">{actividades}</span>
          </div>
        </div>
        <div className="feedback-stat-card feedback-stat-requests">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <span className="stat-label">Solicitudes</span>
            <span className="stat-value">{solicitudes}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="feedback-filters-section">
        <div className="filter-label">Filtrar por:</div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === "todos" ? "active" : ""}`}
            onClick={() => setFilter("todos")}
          >
            Todos ({totalFeedbacks})
          </button>
          <button 
            className={`filter-btn ${filter === "actividad" ? "active" : ""}`}
            onClick={() => setFilter("actividad")}
          >
            Actividades ({actividades})
          </button>
          <button 
            className={`filter-btn ${filter === "solicitud" ? "active" : ""}`}
            onClick={() => setFilter("solicitud")}
          >
            Solicitudes ({solicitudes})
          </button>
        </div>
      </div>

      {/* Tabla de feedbacks */}
      {isLoading ? (
        <div className="feedback-loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando feedbacks...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="feedback-empty-state">
          <div className="empty-icon">📭</div>
          <p>No hay feedbacks disponibles</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-feedbacks">
            <thead>
              <tr className="bg-gray-100 text-left text-sm uppercase">
                <th className="p-3">Usuario</th>
                <th className="p-3">Comentario</th>
                <th className="p-3">Calificación</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Nombre Actividad / Tipo Ayuda</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((f: any) => (
                <tr key={f.IdFeedback} className="border-t hover:bg-gray-50 feedback-row">
                  <td className="p-3 user-cell">
                    <div className="user-avatar">
                      {f.usuario?.Nombre?.charAt(0)}{f.usuario?.Apellido?.charAt(0)}
                    </div>
                    <span className="user-name">{f.usuario?.Nombre} {f.usuario?.Apellido}</span>
                  </td>
                  <td className="p-3 comment-cell">
                    <div className="comment-bubble">
                      {f.ComentarioFeedback}
                    </div>
                  </td>
                  <td className="p-3 rating-cell">
                    <div className="rating-display">
                      <span className="stars">{"⭐".repeat(f.Calificacion)}</span>
                      <span className="rating-number">{f.Calificacion}/5</span>
                    </div>
                  </td>
                  <td className="p-3 date-cell">
                    {new Date(f.FechaEnvio).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="p-3 type-cell">
                    <span className={`type-badge ${f.IdActividad ? 'badge-activity' : 'badge-request'}`}>
                      {f.IdActividad ? "🎯 Actividad" : "💬 Solicitud"}
                    </span>
                  </td>
                  <td className="p-3 activity-cell">
                    {f.actividad?.NombreActi || f.solicitud?.TipoAyuda || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PanelFeedbacks;
