import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style/Ludicas.css';

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
        <h1 className="ludicas-title">Actividades Lúdicas</h1>
        <p className="ludicas-subtitle">¡Encuentra tu actividad favorita y únete a la diversión!</p>

        <div className="search-barr">
          <input
            type="text"
            placeholder="Buscar Ludica..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
     
        </div>

        <div className="categorias-filter">
          {tipos.map((tipo) => (
            <button
              key={tipo}
              className={`categoria-btn ${tipoSeleccionado === tipo ? 'active' : ''}`}
              onClick={() => {
                setTipoSeleccionado(tipo);
                setPaginaActual(1); // reinicia a la página 1 al cambiar filtro
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
            <div className="card-image-container">
              <img
                className="ludicas-card-image"
                src={ludica.ImagenUrl || "https://via.placeholder.com/300x200?text=Sin+Imagen"}
                alt={ludica.NombreActi}
              />
              <div className="image-overlay"></div>
            </div>
            <div className="ludicas-card-content">
              <span className="categoria-badge">{ludica.TipoLudica}</span>
              <h3 className="card-title">{ludica.NombreActi}</h3>
              <div className="card-info">
                <p className="info-item">
                  <i className="fas fa-map-marker-alt"></i> {ludica.Ubicacion}
                </p>
                <div className="schedule-section">
                  <p className="schedule-title">
                    <i className="far fa-clock"></i> Horario:
                  </p>
                  <ul className="schedule-list">
                    <li>{ludica.HoraInicio} - {ludica.HoraFin}</li>
                  </ul>
                </div>
              </div>
              <button className="ludicas-btn" onClick={() => setLudicaSeleccionada(ludica)}>
                <i className="fas fa-info-circle"></i> Más Detalles
              </button>
              <button
                className={`interesado-btn 
                  ${miReaccion[ludica.IdActividad] === 'like' ? 'active' : ''} 
                  ${animando[ludica.IdActividad] ? 'animating' : ''}`}
                disabled={miReaccion[ludica.IdActividad] === 'like'}
                onClick={() => marcarMeInteresa(ludica.IdActividad)}
              >
                ❤️ Me interesa ({reacciones[ludica.IdActividad] || 0})
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="pagination">
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual(prev => prev - 1)}
          >
            ◀ Anterior
          </button>
          <span>Página {paginaActual} de {totalPaginas}</span>
          <button
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual(prev => prev + 1)}
          >
            Siguiente ▶
          </button>
        </div>
      )}

      {/* MODAL */}
      {ludicaSeleccionada && (
        <div className="modal-overlay" onClick={() => setLudicaSeleccionada(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setLudicaSeleccionada(null)}>×</button>
            <h2>{ludicaSeleccionada.NombreActi}</h2>
            <p><strong>Tipo:</strong> {ludicaSeleccionada.TipoLudica}</p>
            <p><strong>Ubicación:</strong> {ludicaSeleccionada.Ubicacion}</p>
            <p><strong>Horario:</strong> {ludicaSeleccionada.HoraInicio} - {ludicaSeleccionada.HoraFin}</p>
            <p><strong>Descripción:</strong> {ludicaSeleccionada.Descripcion}</p>
            <img
              className="modal-img"
              src={ludicaSeleccionada.ImagenUrl || "https://via.placeholder.com/300x200?text=Sin+Imagen"}
              alt={`Imagen de ${ludicaSeleccionada.NombreActi}`}
            />
          </div>
        </div>
      )}

      <footer className="ludicas-footer"></footer>
    </div>
  );
};

export default ListaLudicas;
