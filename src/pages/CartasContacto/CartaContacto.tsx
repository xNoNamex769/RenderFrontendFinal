import React, { useEffect, useState } from "react";
import "./style/CartaContacto.css";
import logoSena from './img/logo-sena.png';
import defaultImg from './img/defecto.png';
import axios from "axios";

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
    <div className="pagina-contacto-unica">
      <header className="header-contacto-unico">
        <img src={logoSena} alt="logo sena" className="logo-nosotros-contacto" />
        <h1 className="texto-instructor-contacto">
          Contactos Instructores y Funcionarios SENA
        </h1>
      </header>

      {/* Filtros */}
      <div className="filtros-multicampo-contacto">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="input-busqueda-contacto"
        />
        <input
          type="text"
          placeholder="Buscar por ubicación..."
          value={filtroUbicacion}
          onChange={(e) => setFiltroUbicacion(e.target.value)}
          className="input-busqueda-contacto"
        />
        <input
          type="text"
          placeholder="Buscar por profesión..."
          value={filtroProfesion}
          onChange={(e) => setFiltroProfesion(e.target.value)}
          className="input-busqueda-contacto"
        />
      </div>

      {/* Tarjetas */}
      <div className="card-container-contacto">
        {filtrados.map((perfil, idx) => (
          <div
            key={idx}
            className="card-instructor-modal"
            onClick={() => setPerfilActivo(perfil)}
          >
            <span className={`badge-contacto ${perfil.profesion.toLowerCase().replace(/\s+/g, '-')}`}>
              {perfil.profesion}
            </span>
            <img
              src={getImagenValida(perfil.imagen)}
              alt={perfil.nombre}
              className="card-image-contacto"
              onError={(e) => (e.currentTarget.src = defaultImg)}
            />
            <h3>{perfil.nombre}</h3>
          </div>
        ))}
      </div>

      {/* Modal */}
      {perfilActivo && (
        <div className="modal-overlay" onClick={() => setPerfilActivo(null)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <button className="cerrar-modal" onClick={() => setPerfilActivo(null)}>×</button>
            <img
              src={getImagenValida(perfilActivo.imagen)}
              className="imagen-modal"
              alt="Instructor"
              onError={(e) => (e.currentTarget.src = defaultImg)}
            />
            <h2>{perfilActivo.nombre}</h2>
            <p><strong>Correo:</strong> {perfilActivo.correo}</p>
            <p><strong>Teléfono:</strong> {perfilActivo.telefono}</p>
            <p><strong>Profesión:</strong> {perfilActivo.profesion}</p>
            <p><strong>Ubicación:</strong> {perfilActivo.ubicacion}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerContactosInstructores;
