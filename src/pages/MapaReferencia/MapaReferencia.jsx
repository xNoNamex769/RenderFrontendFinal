import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './MapaReferencia.css';
import { FaMapMarkerAlt, FaSearch, FaRoute, FaInfoCircle, FaQuestionCircle, FaCalendarAlt, FaRunning, FaLocationArrow, FaTimes } from 'react-icons/fa';
import GuiaUso from './GuiaUso';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Iconos personalizados para diferentes tipos de lugares
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <span style="transform: rotate(45deg); color: white; font-size: 18px;">${icon}</span>
          </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Sitios dentro del SENA Centro de Teleinformática - Popayán
// Dirección: Calle 4 #2-67, Barrio Sena Centro, Popayán, Cauca
// Coordenadas GPS: 2.4832482, -76.5617734
const sitiosReferencia = [
  {
    id: 1,
    nombre: 'Entrada Principal',
    categoria: 'entrada',
    descripcion: 'Portería y recepción del centro - Calle 4 #2-67',
    coordenadas: [2.4832482, -76.5617734],
    icono: '🚪',
    color: '#39A900',
    servicios: ['Registro de ingreso', 'Información', 'Seguridad'],
    imagen: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    nombre: 'Biblioteca',
    categoria: 'academico',
    descripcion: 'Centro de recursos bibliográficos',
    coordenadas: [2.4834, -76.5619],
    icono: '📚',
    color: '#2196F3',
    servicios: ['Préstamo de libros', 'Salas de estudio', 'Computadores', 'Internet WiFi'],
    imagen: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    nombre: 'Cafetería',
    categoria: 'alimentacion',
    descripcion: 'Zona de alimentación y descanso',
    coordenadas: [2.4830, -76.5616],
    icono: '☕',
    color: '#FF9800',
    servicios: ['Desayunos', 'Almuerzos', 'Refrigerios', 'Bebidas calientes'],
    imagen: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    nombre: 'Laboratorios de Sistemas',
    categoria: 'academico',
    descripcion: 'Salas de cómputo y programación',
    coordenadas: [2.4835, -76.5618],
    icono: '💻',
    color: '#9C27B0',
    servicios: ['Computadores', 'Software especializado', 'Internet de alta velocidad'],
    imagen: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    nombre: 'Auditorio Principal',
    categoria: 'eventos',
    descripcion: 'Espacio para eventos y conferencias',
    coordenadas: [2.4833, -76.5620],
    icono: '🎭',
    color: '#E91E63',
    servicios: ['Capacidad 200 personas', 'Proyector', 'Sistema de audio', 'Aire acondicionado'],
    imagen: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    nombre: 'Zona Deportiva',
    categoria: 'recreacion',
    descripcion: 'Canchas y espacios recreativos',
    coordenadas: [2.4829, -76.5619],
    icono: '⚽',
    color: '#4CAF50',
    servicios: ['Cancha de fútbol', 'Cancha de baloncesto', 'Zona de ejercicios'],
    imagen: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=300&fit=crop'
  },
  {
    id: 7,
    nombre: 'Coordinación Académica',
    categoria: 'administrativo',
    descripcion: 'Oficinas de coordinación y gestión',
    coordenadas: [2.4834, -76.5617],
    icono: '🏢',
    color: '#607D8B',
    servicios: ['Atención a aprendices', 'Certificados', 'Horarios', 'Información académica'],
    imagen: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
  },
  {
    id: 8,
    nombre: 'Talleres Prácticos',
    categoria: 'academico',
    descripcion: 'Espacios para prácticas técnicas',
    coordenadas: [2.4831, -76.5621],
    icono: '🔧',
    color: '#FF5722',
    servicios: ['Herramientas', 'Equipos especializados', 'Instructor de apoyo'],
    imagen: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop'
  },
  {
    id: 9,
    nombre: 'Zona Verde',
    categoria: 'recreacion',
    descripcion: 'Área de descanso al aire libre',
    coordenadas: [2.4828, -76.5618],
    icono: '🌳',
    color: '#8BC34A',
    servicios: ['Bancas', 'Sombra', 'WiFi', 'Zona de estudio'],
    imagen: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop'
  },
  {
    id: 10,
    nombre: 'Enfermería',
    categoria: 'salud',
    descripcion: 'Atención de primeros auxilios',
    coordenadas: [2.4833, -76.5615],
    icono: '🏥',
    color: '#F44336',
    servicios: ['Primeros auxilios', 'Medicamentos básicos', 'Atención de emergencias'],
    imagen: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop'
  },
  {
    id: 11,
    nombre: 'Aulas de Clase - Bloque A',
    categoria: 'academico',
    descripcion: 'Salones de formación teórica',
    coordenadas: [2.4836, -76.5617],
    icono: '📖',
    color: '#3F51B5',
    servicios: ['Tablero digital', 'Proyector', 'Aire acondicionado', 'Capacidad 30 personas'],
    imagen: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=300&fit=crop'
  },
  {
    id: 12,
    nombre: 'Parqueadero',
    categoria: 'servicios',
    descripcion: 'Zona de estacionamiento',
    coordenadas: [2.4827, -76.5617],
    icono: '🅿️',
    color: '#795548',
    servicios: ['Bicicletas', 'Motos', 'Carros', 'Vigilancia'],
    imagen: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&h=300&fit=crop'
  }
];

// Componente para centrar el mapa en una ubicación
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 19);
    }
  }, [coords, map]);
  return null;
}

function MapaReferencia() {
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarInfo, setMostrarInfo] = useState(true);
  const [mostrarGuia, setMostrarGuia] = useState(false);
  const [eventosAPI, setEventosAPI] = useState([]);
  const [actividadesAPI, setActividadesAPI] = useState([]);
  const [ludicasAPI, setLudicasAPI] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Centro por defecto (SENA Centro de Teleinformática - Popayán)
  // Dirección: Calle 4 #2-67, Barrio Sena Centro, Popayán, Cauca
  const centroDefault = [2.4832482, -76.5617734];

  // Cargar eventos, actividades y lúdicas desde la API
  useEffect(() => {
    const cargarDatosAPI = async () => {
      try {
        setCargando(true);
        
        // Cargar eventos
        const resEventos = await axios.get('https://render-hhyo.onrender.com/api/evento/publicos');
        const ahora = new Date();
        const eventosFuturos = resEventos.data.filter(evento => {
          const fechaFin = new Date(`${evento.FechaFin}T${evento.HoraFin}`);
          return fechaFin >= ahora;
        });
        setEventosAPI(eventosFuturos);

        // Cargar actividades
        const resActividades = await axios.get('https://render-hhyo.onrender.com/api/actividad');
        const actividadesFuturas = resActividades.data.filter(actividad => {
          const [aF, mF, dF] = actividad.FechaFin.split('-');
          const [hF, miF] = actividad.HoraFin.split(':');
          const fechaFin = new Date(aF, mF - 1, dF, hF, miF);
          return fechaFin >= new Date();
        });
        setActividadesAPI(actividadesFuturas);

        // Cargar lúdicas
        const resLudicas = await axios.get('https://render-hhyo.onrender.com/api/ludica');
        const soloLudicas = resLudicas.data.filter(item => 
          item.TipoLudica && item.TipoLudica.toLowerCase().includes('lúdica')
        );
        setLudicasAPI(soloLudicas);

        setCargando(false);
      } catch (error) {
        console.error('Error cargando datos de la API:', error);
        setCargando(false);
      }
    };

    cargarDatosAPI();
  }, []);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacionUsuario([
            position.coords.latitude,
            position.coords.longitude
          ]);
        },
        (error) => {
          console.log('No se pudo obtener la ubicación:', error);
        }
      );
    }
  }, []);

  // Generar coordenadas aleatorias dentro del SENA
  const generarCoordenadaAleatoria = (base, rango = 0.0008) => {
    return base + (Math.random() - 0.5) * rango;
  };

  // Convertir eventos de la API a formato de sitios
  const eventosComoSitios = eventosAPI.map((evento, idx) => ({
    id: `evento-${evento.IdEvento}`,
    nombre: evento.NombreEvento,
    categoria: 'eventos',
    descripcion: evento.DescripcionEvento || 'Evento próximo',
    coordenadas: [
      generarCoordenadaAleatoria(centroDefault[0]),
      generarCoordenadaAleatoria(centroDefault[1])
    ],
    icono: '🎭',
    color: '#E91E63',
    detalles: [
      `📅 Fecha: ${evento.FechaInicio} al ${evento.FechaFin}`,
      `🕐 Horario: ${evento.HoraInicio} - ${evento.HoraFin}`,
      `📍 Lugar: ${evento.UbicacionEvento || 'Por confirmar'}`,
      `👥 Abierto al público`,
    ],
    tituloDetalles: 'Detalles del Evento',
    imagen: evento.PlanificacionEvento?.ImagenUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    tipo: 'evento'
  }));

  // Convertir actividades de la API a formato de sitios
  const actividadesComoSitios = actividadesAPI.map((actividad, idx) => ({
    id: `actividad-${actividad.IdActividad}`,
    nombre: actividad.NombreActividad,
    categoria: 'academico',
    descripcion: actividad.DescripcionActividad || 'Actividad académica',
    coordenadas: [
      generarCoordenadaAleatoria(centroDefault[0]),
      generarCoordenadaAleatoria(centroDefault[1])
    ],
    icono: '📚',
    color: '#2196F3',
    detalles: [
      `📅 Fecha: ${actividad.FechaInicio} al ${actividad.FechaFin}`,
      `🕐 Horario: ${actividad.HoraInicio} - ${actividad.HoraFin}`,
      `📍 Lugar: ${actividad.UbicacionActividad || 'Salón por asignar'}`,
      `🎯 Actividad formativa`,
    ],
    tituloDetalles: 'Detalles de la Actividad',
    imagen: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop',
    tipo: 'actividad'
  }));

  // Convertir lúdicas de la API a formato de sitios
  const ludicasComoSitios = ludicasAPI.map((ludica, idx) => ({
    id: `ludica-${ludica.IdActividad}`,
    nombre: ludica.NombreActividad,
    categoria: 'recreacion',
    descripcion: ludica.DescripcionActividad || 'Actividad lúdica',
    coordenadas: [
      generarCoordenadaAleatoria(centroDefault[0]),
      generarCoordenadaAleatoria(centroDefault[1])
    ],
    icono: '⚽',
    color: '#4CAF50',
    detalles: [
      `📅 Fecha: ${ludica.FechaInicio} al ${ludica.FechaFin}`,
      `🕐 Horario: ${ludica.HoraInicio} - ${ludica.HoraFin}`,
      `📍 Lugar: ${ludica.UbicacionActividad || 'Zona deportiva'}`,
      `🎯 Tipo: ${ludica.TipoLudica || 'Actividad recreativa'}`,
      `🏃 Participación libre`,
    ],
    tituloDetalles: 'Detalles de la Lúdica',
    imagen: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=300&fit=crop',
    tipo: 'ludica'
  }));

  // Combinar todos los sitios
  const todosSitios = [...sitiosReferencia, ...eventosComoSitios, ...actividadesComoSitios, ...ludicasComoSitios];

  // Filtrar sitios según categoría y búsqueda
  const sitiosFiltrados = todosSitios.filter(sitio => {
    const coincideCategoria = filtroCategoria === 'todos' || sitio.categoria === filtroCategoria;
    const coincideBusqueda = sitio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                             sitio.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const categorias = [
    { id: 'todos', nombre: 'Todos', icono: '🗺️' },
    { id: 'entrada', nombre: 'Entrada', icono: '🚪' },
    { id: 'academico', nombre: 'Académico', icono: '📚' },
    { id: 'recreacion', nombre: 'Recreación', icono: '⚽' },
    { id: 'salud', nombre: 'Salud', icono: '🏥' },
    { id: 'alimentacion', nombre: 'Alimentación', icono: '☕' },
    { id: 'administrativo', nombre: 'Administrativo', icono: '🏢' },
    { id: 'eventos', nombre: 'Eventos', icono: '🎭' },
    { id: 'servicios', nombre: 'Servicios', icono: '🅿️' }
  ];

  const calcularDistancia = (coord1, coord2) => {
    if (!coord1 || !coord2) return null;
    const R = 6371; // Radio de la Tierra en km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distancia = R * c;
    return distancia < 1 ? `${Math.round(distancia * 1000)} m` : `${distancia.toFixed(2)} km`;
  };

  return (
    <div className="mapa-referencia-container">
      {mostrarGuia && <GuiaUso onClose={() => setMostrarGuia(false)} />}
      
      <div className="mapa-header">
        <h1 className="mapa-titulo">
          <FaMapMarkerAlt /> Mapa de Referencia
        </h1>
        <p className="mapa-subtitulo">Encuentra lugares importantes cerca de ti</p>
        <button className="btn-ayuda" onClick={() => setMostrarGuia(true)}>
          <FaQuestionCircle /> ¿Cómo usar el mapa?
        </button>
      </div>

      {cargando && (
        <div className="mapa-info-banner" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <FaInfoCircle />
          <span>Cargando eventos, actividades y lúdicas desde la API...</span>
        </div>
      )}

      {!cargando && mostrarInfo && (
        <div className="mapa-info-banner">
          <FaInfoCircle />
          <span>
            📍 {sitiosReferencia.length} lugares | 
            🎭 {eventosAPI.length} eventos | 
            📚 {actividadesAPI.length} actividades | 
            ⚽ {ludicasAPI.length} lúdicas
          </span>
          <button onClick={() => setMostrarInfo(false)}>✕</button>
        </div>
      )}

      <div className="mapa-controles">
        <div className="mapa-busqueda-container">
          <div className="mapa-busqueda">
            <FaSearch />
            <input
              type="text"
              placeholder="Buscar lugar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button 
                className="btn-limpiar-busqueda"
                onClick={() => setBusqueda('')}
                title="Limpiar búsqueda"
              >
                <FaTimes />
              </button>
            )}
          </div>
          {ubicacionUsuario && (
            <button 
              className="btn-mi-ubicacion"
              onClick={() => setSitioSeleccionado({ coordenadas: ubicacionUsuario })}
              title="Ir a mi ubicación"
            >
              <FaLocationArrow /> Mi ubicación
            </button>
          )}
        </div>
        
        {(busqueda || filtroCategoria !== 'todos') && (
          <div className="mapa-resultados">
            <span>🔍 {sitiosFiltrados.length} resultado{sitiosFiltrados.length !== 1 ? 's' : ''} encontrado{sitiosFiltrados.length !== 1 ? 's' : ''}</span>
            {(busqueda || filtroCategoria !== 'todos') && (
              <button 
                className="btn-limpiar-filtros"
                onClick={() => {
                  setBusqueda('');
                  setFiltroCategoria('todos');
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        <div className="mapa-filtros">
          {categorias.map(cat => (
            <button
              key={cat.id}
              className={`filtro-btn ${filtroCategoria === cat.id ? 'activo' : ''}`}
              onClick={() => setFiltroCategoria(cat.id)}
            >
              <span className="filtro-icono">{cat.icono}</span>
              <span className="filtro-nombre">{cat.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mapa-contenido">
        <div className="mapa-wrapper">
          {!ubicacionUsuario && (
            <div className="mapa-alerta-ubicacion">
              <FaInfoCircle />
              <span>Activa tu ubicación para ver lugares cercanos</span>
            </div>
          )}
          <MapContainer
            center={centroDefault}
            zoom={19}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {sitioSeleccionado && (
              <ChangeMapView coords={sitioSeleccionado.coordenadas} />
            )}

            {/* Marcador de ubicación del usuario */}
            {ubicacionUsuario && (
              <Marker position={ubicacionUsuario}>
                <Popup>
                  <div className="popup-content">
                    <h3>📍 Tu ubicación</h3>
                    <p>Estás aquí</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Marcadores de sitios de referencia */}
            {sitiosFiltrados.map(sitio => (
              <Marker
                key={sitio.id}
                position={sitio.coordenadas}
                icon={createCustomIcon(sitio.color, sitio.icono)}
              >
                <Popup maxWidth={350}>
                  <div className="popup-content">
                    {sitio.imagen && (
                      <img 
                        src={sitio.imagen} 
                        alt={sitio.nombre}
                        className="popup-imagen"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <h3>{sitio.icono} {sitio.nombre}</h3>
                    {sitio.tipo && (
                      <div className="popup-tipo-badge">
                        {sitio.tipo === 'evento' && <span className="badge-api evento">🎭 Evento en vivo</span>}
                        {sitio.tipo === 'actividad' && <span className="badge-api actividad">📚 Actividad programada</span>}
                        {sitio.tipo === 'ludica' && <span className="badge-api ludica">⚽ Lúdica disponible</span>}
                      </div>
                    )}
                    <p className="popup-descripcion">{sitio.descripcion}</p>
                    <div className="popup-categoria">
                      <span className="categoria-badge" style={{ backgroundColor: sitio.color }}>
                        {sitio.categoria}
                      </span>
                    </div>
                    {ubicacionUsuario && (
                      <p className="popup-distancia">
                        <FaRoute /> Distancia: {calcularDistancia(ubicacionUsuario, sitio.coordenadas)}
                      </p>
                    )}
                    <div className="popup-servicios">
                      <strong>{sitio.tituloDetalles || 'Servicios disponibles'}:</strong>
                      <ul>
                        {(sitio.detalles || sitio.servicios || []).map((item, idx) => (
                          <li key={idx}>✓ {item}</li>
                        ))}
                      </ul>
                    </div>
                    <button
                      className="btn-como-llegar"
                      onClick={() => window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${sitio.coordenadas[0]},${sitio.coordenadas[1]}`,
                        '_blank'
                      )}
                    >
                      <FaRoute /> Cómo llegar
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="mapa-lista">
          <h3>Lugares cercanos ({sitiosFiltrados.length})</h3>
          <div className="lista-sitios">
            {sitiosFiltrados.map(sitio => (
              <div
                key={sitio.id}
                className={`sitio-card ${sitioSeleccionado?.id === sitio.id ? 'seleccionado' : ''}`}
                onClick={() => setSitioSeleccionado(sitio)}
              >
                <div className="sitio-icono" style={{ backgroundColor: sitio.color }}>
                  {sitio.icono}
                </div>
                <div className="sitio-info">
                  <h4>{sitio.nombre}</h4>
                  <p>{sitio.descripcion}</p>
                  {ubicacionUsuario && (
                    <span className="sitio-distancia">
                      📍 {calcularDistancia(ubicacionUsuario, sitio.coordenadas)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapaReferencia;
