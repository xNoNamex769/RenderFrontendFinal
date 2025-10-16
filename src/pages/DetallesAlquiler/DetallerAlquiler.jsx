import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaClipboardList, FaChartBar, FaCheckCircle, FaSearch, FaThumbtack, FaCheck, FaTimes, FaEdit, FaSave } from "react-icons/fa";
import "./styles/DetallesAlquiler.css";
const BACKEND_URL = "https://render-hhyo.onrender.com/api";

const DetallesAlquiler = () => {
  const [registrosAlquiler, setRegistrosAlquiler] = useState([]);
  const [searchNombre, setSearchNombre] = useState('');
  const [searchEstado, setSearchEstado] = useState('');

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [observacionEdit, setObservacionEdit] = useState('');
  const [alquilerEditId, setAlquilerEditId] = useState(null);

  useEffect(() => {
    const cargarAlquileres = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/alquilerelementos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
         console.log("Datos recibidos backend:", data);
        setRegistrosAlquiler(data);
      } catch (err) {
        console.error("Error cargando alquileres:", err);
      }
    };
    cargarAlquileres();
  }, []);

  const marcarComoEntregado = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BACKEND_URL}/api/alquilerelementos/alquiler/${id}/cumplido`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegistrosAlquiler((prev) => prev.map(reg =>
        reg.IdAlquiler === id ? { ...reg, CumplioConEntrega: true, Estado: 'Entregado' } : reg
      ));
    } catch (error) {
      console.error("Error marcando como entregado:", error);
    }
  };

  // Abrir modal y cargar observacion actual
  const abrirModalEdicion = (id, observacionActual) => {
    setAlquilerEditId(id);
    setObservacionEdit(observacionActual || "");
    setModalVisible(true);
  };

  // Guardar observación editada
  const guardarObservacion = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BACKEND_URL}/api/alquilerelementos/${alquilerEditId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ Observaciones: observacionEdit }),
      });
      setRegistrosAlquiler((prev) =>
        prev.map((reg) =>
          reg.IdAlquiler === alquilerEditId
            ? { ...reg, Observaciones: observacionEdit }
            : reg
        )
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Error guardando observación:", error);
    }
  };

  const filteredRegistros = registrosAlquiler.filter((registro) =>
    (registro.NombreElemento?.toLowerCase() || "").includes(searchNombre.toLowerCase()) ||
    (registro.usuario?.Nombre?.toLowerCase() || "").includes(searchNombre.toLowerCase()) ||
    (registro.usuario?.aprendiz?.Ficha?.toLowerCase() || "").includes(searchNombre.toLowerCase()) ||
    (registro.Estado?.toLowerCase() || "").includes(searchEstado.toLowerCase())
  );

  const totalEntregados = registrosAlquiler.filter(r => r.CumplioConEntrega).length;

  return (
    <div className="det-alq-wrapper">
      {/* Header */}
      <div className="det-alq-header">
        <h1 className="det-alq-title"><FaClipboardList /> Registros de Préstamos</h1>
        <p className="det-alq-subtitle">Gestiona todos los préstamos de elementos realizados por los aprendices</p>
      </div>

      {/* Estadísticas */}
      <div className="det-alq-stats">
        <div className="det-alq-stat-card">
          <div className="det-alq-stat-icon"><FaChartBar /></div>
          <div className="det-alq-stat-content">
            <span className="det-alq-stat-value">{registrosAlquiler.length}</span>
            <span className="det-alq-stat-label">Total Préstamos</span>
          </div>
        </div>
        <div className="det-alq-stat-card">
          <div className="det-alq-stat-icon"><FaCheckCircle /></div>
          <div className="det-alq-stat-content">
            <span className="det-alq-stat-value">{totalEntregados}</span>
            <span className="det-alq-stat-label">Devueltos</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="det-alq-filters">
        <div className="det-alq-filter-group">
          <label className="det-alq-filter-label"><FaSearch /> Buscar</label>
          <input
            type="text"
            className="det-alq-filter-input"
            placeholder="Buscar por elemento, aprendiz o ficha..."
            value={searchNombre}
            onChange={(e) => setSearchNombre(e.target.value)}
          />
        </div>
        <div className="det-alq-filter-group">
          <label className="det-alq-filter-label"><FaThumbtack /> Estado</label>
          <input
            type="text"
            className="det-alq-filter-input"
            placeholder="Filtrar por estado..."
            value={searchEstado}
            onChange={(e) => setSearchEstado(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="det-alq-table-container">
        <table className="det-alq-table">
          <thead className="det-alq-table-head">
            <tr>
              <th>Elemento</th>
              <th>Aprendiz</th>
              <th>Ficha</th>
              <th>Programa</th>
              <th>Estado</th>
              <th>Entrega</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="det-alq-table-body">
            {filteredRegistros.map((registro) => (
              <tr key={registro.IdAlquiler} className="det-alq-table-row">
                <td className="det-alq-table-cell">
                  <span className="det-alq-element-name">{registro.NombreElemento}</span>
                </td>
                <td className="det-alq-table-cell">{registro.usuario?.Nombre || "Sin nombre"}</td>
                <td className="det-alq-table-cell">
                  <span className="det-alq-ficha-badge">{registro.usuario?.aprendiz?.Ficha || "N/A"}</span>
                </td>
                <td className="det-alq-table-cell det-alq-programa">
                  {registro.usuario?.aprendiz?.ProgramaFormacion || "Sin programa"}
                </td>
                <td className="det-alq-table-cell">
                  {registro.Estado ? (
                    <span className={`det-alq-status-badge ${registro.Estado === 'Entregado' ? 'entregado' : 'en-uso'}`}>
                      {registro.Estado}
                    </span>
                  ) : (
                    <span className="det-alq-text-muted">-</span>
                  )}
                </td>
                <td className="det-alq-table-cell">
                  {registro.Estado ? (
                    <span className={`det-alq-check-badge ${registro.CumplioConEntrega ? 'si' : 'no'}`}>
                      {registro.CumplioConEntrega ? <><FaCheck /> Sí</> : <><FaTimes /> No</>}
                    </span>
                  ) : (
                    <span className="det-alq-text-muted">-</span>
                  )}
                </td>
                <td className="det-alq-table-cell det-alq-observaciones">
                  {registro.Observaciones || "Sin observaciones"}
                </td>
                <td className="det-alq-table-cell det-alq-actions">
                  {!registro.CumplioConEntrega && (
                    <button className='det-alq-btn det-alq-btn-entregar' onClick={() => marcarComoEntregado(registro.IdAlquiler)}>
                      <FaCheck /> Marcar como Devuelto
                    </button>
                  )}
                  <button className='det-alq-btn det-alq-btn-editar' onClick={() => abrirModalEdicion(registro.IdAlquiler, registro.Observaciones)}>
                    <FaEdit /> Editar
                  </button>
                </td>
              </tr>
            ))}
            {filteredRegistros.length === 0 && (
              <tr>
                <td colSpan="8" className="det-alq-empty-state">
                  <div className="det-alq-empty-icon"><FaSearch /></div>
                  <p>No se encontraron registros</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="det-alq-modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="det-alq-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="det-alq-modal-close" onClick={() => setModalVisible(false)}><FaTimes /></button>
            <h2 className="det-alq-modal-title"><FaEdit /> Editar Observaciones</h2>
            <textarea
              className="det-alq-modal-textarea"
              value={observacionEdit}
              onChange={(e) => setObservacionEdit(e.target.value)}
              rows={5}
              placeholder="Escribe las observaciones aquí..."
            />
            <div className="det-alq-modal-actions">
              <button className="det-alq-modal-btn det-alq-modal-btn-save" onClick={guardarObservacion}>
                <FaSave /> Guardar
              </button>
              <button className="det-alq-modal-btn det-alq-modal-btn-cancel" onClick={() => setModalVisible(false)}>
                <FaTimes /> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallesAlquiler;
