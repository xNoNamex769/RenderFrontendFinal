import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style/Administrador.css';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Administrador = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [historialVisible, setHistorialVisible] = useState({});
  const [historiales, setHistoriales] = useState({});
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    axios.get('https://render-hhyo.onrender.com/api/solicitudapoyo')
      .then((res) => setSolicitudes(res.data))
      .catch((err) => console.error('Error al obtener solicitudes:', err));
  }, []);

  const resumenPorEstado = solicitudes.reduce((acc, solicitud) => {
    const estado = solicitud.Estado || 'Desconocido';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});

  const dataGrafico = Object.entries(resumenPorEstado).map(([estado, cantidad]) => ({
    name: estado,
    value: cantidad
  }));

  const colores = {
    Pendiente: '#ffcc00',
    'En Proceso': '#3399ff',
    Atendido: '#33cc33',
    Finalizado: '#999999'
  };

  const estadisticas = {
    total: solicitudes.length,
    Pendiente: solicitudes.filter(s => s.Estado === "Pendiente").length,
    "En Proceso": solicitudes.filter(s => s.Estado === "En Proceso").length,
    Atendido: solicitudes.filter(s => s.Estado === "Atendido").length,
    Finalizado: solicitudes.filter(s => s.Estado === "Finalizado").length,
  };

  const cargarHistorial = async (idSolicitud) => {
    try {
      const res = await axios.get(`https://render-hhyo.onrender.com/api/historial/solicitud/${idSolicitud}`);
      setHistoriales((prev) => ({ ...prev, [idSolicitud]: res.data }));
      setHistorialVisible((prev) => ({ ...prev, [idSolicitud]: !prev[idSolicitud] }));
    } catch (err) {
      console.error('Error al obtener historial:', err);
    }
  };

  const solicitudesFiltradas = solicitudes.filter((s) => {
    const coincideEstado = filtroEstado === 'Todos' || s.Estado === filtroEstado;
    const coincideTipo = filtroTipo === 'Todos' || s.TipoAyuda === filtroTipo;
    const coincideNombre = s.usuario?.Nombre?.toLowerCase().includes(busqueda.toLowerCase());

    return coincideEstado && coincideTipo && coincideNombre;
  });

  return (
    <div className="admin-panel">
      <h2>Panel de Administración</h2>

      <div className="admin-resumen">
        <h3>Resumen General</h3>
        <ul>
          <li><strong>Total:</strong> {estadisticas.total}</li>
          <li><strong>Pendientes:</strong> {estadisticas["Pendiente"]}</li>
          <li><strong>En Proceso:</strong> {estadisticas["En Proceso"]}</li>
          <li><strong>Atendidos:</strong> {estadisticas["Atendido"]}</li>
          <li><strong>Finalizados:</strong> {estadisticas["Finalizado"]}</li>
        </ul>
      </div>

      <div className="admin-busqueda">
        <label>Buscar por nombre:</label>
        <input
          type="text"
          placeholder="Ej: Juan Pérez"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className='admin-grafico'>
        <h3>Resumen de Solicitudes por Estado</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={dataGrafico}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {dataGrafico.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colores[entry.name] || '#8884d8'}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-filtros">
        <label>Filtrar por Estado:</label>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="Todos">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En Proceso">En Proceso</option>
          <option value="Atendido">Atendido</option>
          <option value="Finalizado">Finalizado</option>
        </select>

        <label>Filtrar por Tipo de Ayuda:</label>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="Todos">Todos</option>
          <option value="Psicologica">Psicológica</option>
          <option value="Emocional">Emocional</option>
          <option value="Economica">Económica</option>
          <option value="Otra">Otra</option>
        </select>
      </div>

      <div className="admin-lista">
        {solicitudesFiltradas.map((s) => (
          <div key={s.IdSolicitud} className="admin-solicitud">
            <strong>{s.usuario?.Nombre}</strong> - {s.TipoAyuda} -
            <span className={`admin-estado-label ${s.Estado?.toLowerCase().replace(/\s/g, '') || 'desconocido'}`}>
              {s.Estado || 'Sin estado'}
            </span>

            <p><strong>Descripción:</strong> {s.Descripcion}</p>
            <p><strong>Contacto Emergencia:</strong> {s.ContactoEmergencia || 'N/A'}</p>
            <button className='btn-historiales' onClick={() => cargarHistorial(s.IdSolicitud)}>
              {historialVisible[s.IdSolicitud] ? 'Ocultar Historial' : 'Ver Historial'}
            </button>

            {historialVisible[s.IdSolicitud] && (
              <div className="admin-historial-container">
                <h4>Historial</h4>
                {historiales[s.IdSolicitud]?.map((h, index) => (
                  <div key={index} className="admin-historial-card">
                    <div className="admin-historial-encabezado">
                      <span className={`admin-estado-label ${h.EstadoNuevo.toLowerCase().replace(/\s/g, '')}`}>
                        {h.EstadoNuevo}
                      </span>
                      <span className="admin-historial-fecha">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p><strong>Comentario:</strong> {h.Comentario || <em>Sin comentario</em>}</p>
                 <p><strong>Responsable:</strong> {h.usuario?.Nombre} ({h.usuario?.rol?.Rol})</p>

                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Administrador;
