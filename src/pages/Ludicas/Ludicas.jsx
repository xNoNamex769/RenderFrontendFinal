import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style/Ludicas.css';
import { FaSearch, FaRunning, FaHeart, FaUsers, FaStar, FaMapMarkerAlt, FaClock, FaInfoCircle, FaTimes, FaMusic, FaDumbbell } from 'react-icons/fa';

const ListaLudicas = () => {
  const [ludicas, setLudicas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('Todos');
  const [ludicaSeleccionada, setLudicaSeleccionada] = useState(null);
  const [reacciones, setReacciones] = useState({});
  const [miReaccion, setMiReaccion] = useState({});
  const [animando, setAnimando] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  useEffect(() => {
  axios.get('https://render-hhyo.onrender.com/api/ludica')
    .then(res => {
      const soloLudicas = res.data.filter(item => 
        item.TipoLudica && item.TipoLudica.toLowerCase().includes("lúdica")
      );
      setLudicas(soloLudicas);
    })
    .catch(err => console.error(" Error cargando lúdicas:", err));
}, []);


  useEffect(() => {
    const fetchReacciones = async () => {
      try {
        const nuevasReacciones = {};
        const misReacciones = {};

        for (const ludica of ludicas) {
          const res = await axios.get(`https://render-hhyo.onrender.com/api/reacciones/${ludica.IdActividad}`);
          nuevasReacciones[ludica.IdActividad] = res.data.likes;

          const miRes = await axios.get(`https://render-hhyo.onrender.com/api/reacciones/usuario/${ludica.IdActividad}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });

          misReacciones[ludica.IdActividad] = miRes.data.Tipo;
        }

        setReacciones(nuevasReacciones);
        setMiReaccion(misReacciones);
      } catch (err) {
        console.error("❌ Error cargando reacciones:", err);
      }
    };

    if (ludicas.length > 0) fetchReacciones();
  }, [ludicas]);

  const marcarMeInteresa = async (IdActividad) => {
    if (miReaccion[IdActividad] === 'like') return;

    try {
      setAnimando(prev => ({ ...prev, [IdActividad]: true }));

      await axios.post(`https://render-hhyo.onrender.com/api/reacciones`, {
        IdEvento: IdActividad,
        Tipo: 'like'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setMiReaccion(prev => ({ ...prev, [IdActividad]: 'like' }));
      setReacciones(prev => ({
        ...prev,
        [IdActividad]: (prev[IdActividad] || 0) + 1
      }));
    } catch (error) {
      console.error("❌ Error al marcar interés:", error);
    } finally {
      setTimeout(() => {
        setAnimando(prev => ({ ...prev, [IdActividad]: false }));
      }, 400);
    }
  };

  const tipos = ['Todos', ...new Set(ludicas.map(l => l.TipoLudica))];

  const ludicasFiltradas = ludicas.filter((ludica) => {
    const coincideNombre = ludica.NombreActi.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = tipoSeleccionado === 'Todos' || ludica.TipoLudica === tipoSeleccionado;
    return coincideNombre && coincideTipo;
  });

  // ====== PAGINACIÓN ======
  const totalPaginas = Math.ceil(ludicasFiltradas.length / elementosPorPagina);
  const indexInicio = (paginaActual - 1) * elementosPorPagina;
  const indexFin = indexInicio + elementosPorPagina;
  const ludicasPaginadas = ludicasFiltradas.slice(indexInicio, indexFin);

  return (
    <div className="ludicas-container">
      <header className="ludicas-header">
        {/* Título principal */}
        <div className="ludicas-header-top">
          <div className="ludicas-icon-wrapper">
            <FaRunning />
          </div>
          <div>
            <h1 className="ludicas-title">🏃 Actividades Lúdicas</h1>
            <p className="ludicas-subtitle">¡Deporte, Música, Danza y más! Encuentra tu actividad favorita</p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="ludicas-stats-grid">
          <div className="ludicas-stat-card">
            <div className="ludicas-stat-icon ludicas-stat-icon-green">
              <FaDumbbell />
            </div>
            <div className="ludicas-stat-info">
              <span className="ludicas-stat-number">{ludicasFiltradas.length}</span>
              <span className="ludicas-stat-label">Actividades Disponibles</span>
            </div>
          </div>
          <div className="ludicas-stat-card">
            <div className="ludicas-stat-icon ludicas-stat-icon-blue">
              <FaUsers />
            </div>
            <div className="ludicas-stat-info">
              <span className="ludicas-stat-number">{tipos.length - 1}</span>
              <span className="ludicas-stat-label">Tipos de Actividades</span>
            </div>
          </div>
          <div className="ludicas-stat-card">
            <div className="ludicas-stat-icon ludicas-stat-icon-red">
              <FaHeart />
            </div>
            <div className="ludicas-stat-info">
              <span className="ludicas-stat-number">
                {Object.values(reacciones).reduce((a, b) => a + b, 0)}
              </span>
              <span className="ludicas-stat-label">Personas Interesadas</span>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="ludicas-search-barr">
          <FaSearch className="ludicas-search-icon" />
          <input
            type="text"
            placeholder="🔍 Buscar lúdica por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Filtros de categorías */}
        <div className="ludicas-categorias-filter">
          {tipos.map((tipo) => (
            <button
              key={tipo}
              className={`ludicas-categoria-btn ${tipoSeleccionado === tipo ? 'ludicas-categoria-active' : ''}`}
              onClick={() => {
                setTipoSeleccionado(tipo);
                setPaginaActual(1);
              }}
            >
              {tipo}
            </button>
          ))}
        </div>
      </header>

      <section className="ludicas-grid">
        {ludicasPaginadas.map((ludica) => (
          <div className="ludicas-card" key={ludica.IdActividad}>
            <div className="ludicas-card-image-container">
              <img
                className="ludicas-card-image"
                src={ludica.ImagenUrl || "https://via.placeholder.com/300x200?text=Sin+Imagen"}
                alt={ludica.NombreActi}
              />
              <div className="ludicas-image-overlay"></div>
            </div>
            <div className="ludicas-card-content">
              <span className="ludicas-categoria-badge">{ludica.TipoLudica}</span>
              <h3 className="ludicas-card-title">{ludica.NombreActi}</h3>
              <div className="ludicas-card-info">
                <p className="ludicas-info-item">
                  <FaMapMarkerAlt /> {ludica.Ubicacion}
                </p>
                <div className="ludicas-schedule-section">
                  <p className="ludicas-schedule-title">
                    <FaClock /> Horario:
                  </p>
                  <ul className="ludicas-schedule-list">
                    <li>{ludica.HoraInicio} - {ludica.HoraFin}</li>
                  </ul>
                </div>
              </div>
              <button className="ludicas-btn" onClick={() => setLudicaSeleccionada(ludica)}>
                <FaInfoCircle /> Más Detalles
              </button>
              <button
                className={`ludicas-interesado-btn 
                  ${miReaccion[ludica.IdActividad] === 'like' ? 'ludicas-interesado-active' : ''} 
                  ${animando[ludica.IdActividad] ? 'ludicas-interesado-animating' : ''}`}
                disabled={miReaccion[ludica.IdActividad] === 'like'}
                onClick={() => marcarMeInteresa(ludica.IdActividad)}
              >
                <FaHeart /> Me interesa ({reacciones[ludica.IdActividad] || 0})
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="ludicas-pagination">
          <button
            className="ludicas-pag-btn"
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual(prev => prev - 1)}
          >
            ← Anterior
          </button>
          <span className="ludicas-pag-info">Página {paginaActual} de {totalPaginas}</span>
          <button
            className="ludicas-pag-btn"
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual(prev => prev + 1)}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* MODAL */}
      {ludicaSeleccionada && (
        <div className="ludicas-modal-overlay" onClick={() => setLudicaSeleccionada(null)}>
          <div className="ludicas-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ludicas-modal-close" onClick={() => setLudicaSeleccionada(null)}>
              <FaTimes />
            </button>
            <div className="ludicas-modal-image-wrapper">
              <img
                className="ludicas-modal-img"
                src={ludicaSeleccionada.ImagenUrl || "https://via.placeholder.com/300x200?text=Sin+Imagen"}
                alt={`Imagen de ${ludicaSeleccionada.NombreActi}`}
              />
            </div>
            <div className="ludicas-modal-body">
              <h2 className="ludicas-modal-title">{ludicaSeleccionada.NombreActi}</h2>
              <span className="ludicas-modal-badge">{ludicaSeleccionada.TipoLudica}</span>
              <div className="ludicas-modal-details">
                <p><FaMapMarkerAlt /> <strong>Ubicación:</strong> {ludicaSeleccionada.Ubicacion}</p>
                <p><FaClock /> <strong>Horario:</strong> {ludicaSeleccionada.HoraInicio} - {ludicaSeleccionada.HoraFin}</p>
                <p><FaInfoCircle /> <strong>Descripción:</strong> {ludicaSeleccionada.Descripcion}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="ludicas-footer"></footer>
    </div>
  );
};

export default ListaLudicas;
