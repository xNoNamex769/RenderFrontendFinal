import React, { useEffect, useState } from "react";
import "./style/CartaContacto.css";
import logoSena from './img/logo-sena.png';
import defaultImg from './img/defecto.png';
import axios from "axios";
import { FaSearch, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaUser, FaTimes } from "react-icons/fa";

interface PerfilInstructor {
  imagen: string;
  profesion: string;
  ubicacion: string;
  UsuarioId: number;
  nombre: string;
  correo: string;
  telefono: string;
}

const VerContactosInstructores = () => {
  const [perfiles, setPerfiles] = useState<PerfilInstructor[]>([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroUbicacion, setFiltroUbicacion] = useState("");
  const [filtroProfesion, setFiltroProfesion] = useState("");
  const [perfilActivo, setPerfilActivo] = useState<PerfilInstructor | null>(null);

  useEffect(() => {
    const fetchPerfiles = async () => {
      try {
        const res = await axios.get("https://render-hhyo.onrender.com/api/perfil-instructor");
        setPerfiles(res.data);
      } catch (error) {
        console.error("❌ Error al cargar perfiles:", error);
      }
    };
    fetchPerfiles();
  }, []);

  const filtrados = perfiles.filter((perfil) =>
    (perfil.nombre ?? "").toLowerCase().includes(filtroNombre.toLowerCase()) &&
    (perfil.ubicacion ?? "").toLowerCase().includes(filtroUbicacion.toLowerCase()) &&
    (perfil.profesion ?? "").toLowerCase().includes(filtroProfesion.toLowerCase())
  );

  // Devuelve la imagen válida o un placeholder si está vacía
  const getImagenValida = (img: string) => {
    return img && img.trim() !== "" ? img : defaultImg;
  };

  return (
    <div className="contacto-container">
      {/* Header mejorado */}
      <header className="contacto-header">
        <div className="header-icon-wrapper">
          <img src={logoSena} alt="logo sena" className="logo-sena" />
        </div>
        <div className="header-content">
          <h1 className="contacto-titulo">📞 Directorio de Contactos</h1>
          <p className="contacto-subtitulo">
            Instructores y Funcionarios del SENA - Encuentra la persona que necesitas
          </p>
        </div>
      </header>

      {/* Barra de búsqueda mejorada */}
      <section className="busqueda-section">
        <div className="busqueda-header">
          <FaSearch size={24} />
          <h2>Buscar Contactos</h2>
        </div>
        <div className="filtros-grid">
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="input-busqueda"
            />
          </div>
          <div className="input-wrapper">
            <FaMapMarkerAlt className="input-icon" />
            <input
              type="text"
              placeholder="Buscar por ubicación..."
              value={filtroUbicacion}
              onChange={(e) => setFiltroUbicacion(e.target.value)}
              className="input-busqueda"
            />
          </div>
          <div className="input-wrapper">
            <FaBriefcase className="input-icon" />
            <input
              type="text"
              placeholder="Buscar por profesión..."
              value={filtroProfesion}
              onChange={(e) => setFiltroProfesion(e.target.value)}
              className="input-busqueda"
            />
          </div>
        </div>
        <div className="resultados-info">
          <span className="resultados-count">
            {filtrados.length} {filtrados.length === 1 ? 'contacto encontrado' : 'contactos encontrados'}
          </span>
        </div>
      </section>

      {/* Grid de tarjetas mejorado */}
      <section className="contactos-section">
        {filtrados.length === 0 ? (
          <div className="no-resultados">
            <FaSearch size={60} />
            <h3>No se encontraron contactos</h3>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <div className="contactos-grid">
            {filtrados.map((perfil, idx) => (
              <div
                key={idx}
                className="contacto-card"
                onClick={() => setPerfilActivo(perfil)}
              >
                <div className="card-header">
                  <div className="avatar-wrapper">
                    <img
                      src={getImagenValida(perfil.imagen)}
                      alt={perfil.nombre}
                      className="avatar-imagen"
                      onError={(e) => (e.currentTarget.src = defaultImg)}
                    />
                  </div>
                  <span className={`badge-profesion ${perfil.profesion.toLowerCase().replace(/\s+/g, '-')}`}>
                    {perfil.profesion}
                  </span>
                </div>
                <div className="card-body">
                  <h3 className="contacto-nombre">{perfil.nombre}</h3>
                  <div className="contacto-info-preview">
                    <div className="info-item">
                      <FaMapMarkerAlt />
                      <span>{perfil.ubicacion}</span>
                    </div>
                    <div className="info-item">
                      <FaEnvelope />
                      <span>{perfil.correo.substring(0, 20)}...</span>
                    </div>
                  </div>
                  <button className="btn-ver-mas">
                    Ver detalles completos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal mejorado */}
      {perfilActivo && (
        <div className="modal-overlay" onClick={() => setPerfilActivo(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="btn-cerrar-modal" onClick={() => setPerfilActivo(null)}>
              <FaTimes />
            </button>
            
            <div className="modal-header">
              <div className="modal-avatar-wrapper">
                <img
                  src={getImagenValida(perfilActivo.imagen)}
                  className="modal-avatar"
                  alt="Instructor"
                  onError={(e) => (e.currentTarget.src = defaultImg)}
                />
              </div>
              <h2 className="modal-nombre">{perfilActivo.nombre}</h2>
              <span className={`modal-badge ${perfilActivo.profesion.toLowerCase().replace(/\s+/g, '-')}`}>
                {perfilActivo.profesion}
              </span>
            </div>

            <div className="modal-body">
              <div className="modal-info-item">
                <div className="info-icon">
                  <FaEnvelope />
                </div>
                <div className="info-content">
                  <span className="info-label">Correo Electrónico</span>
                  <a href={`mailto:${perfilActivo.correo}`} className="info-value link">
                    {perfilActivo.correo}
                  </a>
                </div>
              </div>

              <div className="modal-info-item">
                <div className="info-icon">
                  <FaPhone />
                </div>
                <div className="info-content">
                  <span className="info-label">Teléfono</span>
                  <a href={`tel:${perfilActivo.telefono}`} className="info-value link">
                    {perfilActivo.telefono}
                  </a>
                </div>
              </div>

              <div className="modal-info-item">
                <div className="info-icon">
                  <FaBriefcase />
                </div>
                <div className="info-content">
                  <span className="info-label">Profesión</span>
                  <span className="info-value">{perfilActivo.profesion}</span>
                </div>
              </div>

              <div className="modal-info-item">
                <div className="info-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="info-content">
                  <span className="info-label">Ubicación</span>
                  <span className="info-value">{perfilActivo.ubicacion}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-contactar" onClick={() => window.location.href = `mailto:${perfilActivo.correo}`}>
                <FaEnvelope /> Enviar Correo
              </button>
              <button className="btn-llamar" onClick={() => window.location.href = `tel:${perfilActivo.telefono}`}>
                <FaPhone /> Llamar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerContactosInstructores;
