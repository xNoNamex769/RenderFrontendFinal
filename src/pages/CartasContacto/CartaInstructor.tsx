/* PerfilInstructorForm.tsx */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style/CartaInstructor.css';
import { obtenerIdUsuario } from '../../utils/getDecodedToken';
import defaultImg from './img/defecto.png';
import { FaUserTie, FaMapMarkerAlt, FaCamera, FaSave, FaSearch, FaEnvelope, FaPhone, FaBriefcase, FaTimes } from 'react-icons/fa'; 

interface FormData {
  profesion: string;
  ubicacion: string;
  imagen: string;
}

interface Instructor {
  UsuarioId: number;
  nombre: string;
  correo: string;
  telefono: string;
  profesion: string;
  ubicacion: string;
  imagen: string;
  rol: string;
}

const PerfilInstructorForm = () => {
  const [formData, setFormData] = useState<FormData>({
    profesion: '',
    ubicacion: '',
    imagen: '',
  });

  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [instructorActivo, setInstructorActivo] = useState<Instructor | null>(null);
  const [filtroUbicacion, setFiltroUbicacion] = useState('');

  // 👉 Función para validar imagen
  const getImagenValida = (img: string) => {
    return img && img.trim() !== "" ? img : defaultImg;
  };

  // Cargar mi perfil + lista de instructores
  useEffect(() => {
    const id = obtenerIdUsuario();
    setUsuarioId(id);

    const fetchPerfilExistente = async () => {
      if (!id) return;
      try {
        const res = await axios.get(`https://render-hhyo.onrender.com/api/perfil-instructor/${id}`);
        if (res.data) {
          const imagenEsBase64 = res.data.imagen?.startsWith("data:image");
          setFormData({
            profesion: res.data.profesion || '',
            ubicacion: res.data.ubicacion || '',
            imagen: imagenEsBase64
              ? res.data.imagen
              : res.data.imagen
              ? `https://render-hhyo.onrender.com${res.data.imagen}`
              : '',
          });
        }
      } catch {
        console.warn("⚠️ Aún no existe perfil.");
      }
    };

    const fetchInstructores = async () => {
      try {
        const res = await axios.get(`https://render-hhyo.onrender.com/api/perfil-instructor`);
        const instructoresConImagenUrl = res.data.map((inst: Instructor) => ({
          ...inst,
          imagen: inst.imagen?.startsWith("data:image")
            ? inst.imagen
            : inst.imagen
            ? `https://render-hhyo.onrender.com${inst.imagen}`
            : '',
        }));
        setInstructores(instructoresConImagenUrl);
      } catch {
        console.error("❌ Error al cargar instructores.");
      }
    };

    fetchPerfilExistente();
    fetchInstructores();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        const canvas = document.createElement('canvas');
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        const sizeInKB = (compressed.length * 0.75) / 1024;

        if (sizeInKB > 200) {
          setMensaje('⚠️ Imagen muy pesada, selecciona otra más liviana.');
          return;
        }

        setFormData({ ...formData, imagen: compressed });
        setMensaje('');
      };
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioId) return;

    try {
      await axios.get(`https://render-hhyo.onrender.com/api/perfil-instructor/${usuarioId}`);
      await axios.put(`https://render-hhyo.onrender.com/api/perfil-instructor/${usuarioId}`, formData);
      setMensaje('✅ Perfil actualizado correctamente');
    } catch {
      await axios.post(`https://render-hhyo.onrender.com/api/perfil-instructor`, {
        UsuarioId: usuarioId,
        ...formData,
      });
      setMensaje('✅ Perfil creado correctamente');
    }

    // Refrescar lista de instructores
    const res = await axios.get(`https://render-hhyo.onrender.com/api/perfil-instructor`);
    setInstructores(res.data);
  };

  const instructoresFiltrados = instructores.filter(inst =>
    (inst.nombre ?? "").toLowerCase().includes(filtroNombre.toLowerCase()) &&
    (inst.ubicacion ?? "").toLowerCase().includes(filtroUbicacion.toLowerCase())
  );

  return (
    <div className="cartainst-wrapper">
      <div className="cartainst-header">
        <h2 className="cartainst-titulo">Perfil de Instructor</h2>
        <p className="cartainst-descripcion">
          Crea o edita tu perfil profesional y conecta con otros instructores del SENA.
        </p>
      </div>

      {formData && formData.profesion && (
        <div className="cartainst-mi-perfil">
          <h3 className="cartainst-mi-perfil-titulo">
            <FaUserTie className="cartainst-icono" /> Mi Perfil Actual
          </h3>
          <div className="cartainst-mi-perfil-contenido">
            <img
              src={getImagenValida(formData.imagen)}
              alt="Mi imagen"
              className="cartainst-mi-perfil-imagen"
              onError={(e) => (e.currentTarget.src = defaultImg)}
            />
            <div className="cartainst-mi-perfil-info">
              <p><FaBriefcase className="cartainst-info-icono" /> <strong>Profesión:</strong> {formData.profesion}</p>
              <p><FaMapMarkerAlt className="cartainst-info-icono" /> <strong>Ubicación:</strong> {formData.ubicacion}</p>
            </div>
          </div>
        </div>
      )}

      <div className="cartainst-formulario-contenedor">
        <h3 className="cartainst-formulario-titulo">Crear o Editar Mi Perfil</h3>
        <form onSubmit={handleSubmit} className="cartainst-formulario">
          <div className="cartainst-campo">
            <label className="cartainst-label">
              <FaBriefcase className="cartainst-label-icono" /> Profesión:
            </label>
            <input
              type="text"
              name="profesion"
              value={formData.profesion}
              onChange={handleInputChange}
              className="cartainst-input"
              placeholder="Ej: Instructor de Programación"
              required
            />
          </div>

          <div className="cartainst-campo">
            <label className="cartainst-label">
              <FaMapMarkerAlt className="cartainst-label-icono" /> Ubicación:
            </label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleInputChange}
              className="cartainst-input"
              placeholder="Ej: Bogotá, Colombia"
              required
            />
          </div>

          <div className="cartainst-campo">
            <label className="cartainst-label">
              <FaCamera className="cartainst-label-icono" /> Imagen (foto):
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="cartainst-input-file"
            />
          </div>

          {formData.imagen && (
            <div className="cartainst-preview">
              <img
                src={formData.imagen}
                alt="Vista previa"
                className="cartainst-preview-imagen"
                onError={(e) => (e.currentTarget.src = defaultImg)}
              />
            </div>
          )}

          <button type="submit" className="cartainst-btn-guardar">
            <FaSave className="cartainst-btn-icono" /> Guardar Perfil
          </button>
        </form>

        {mensaje && <p className="cartainst-mensaje">{mensaje}</p>}
      </div>

      <div className="cartainst-instructores-seccion">
        <h3 className="cartainst-instructores-titulo">
          <FaUserTie className="cartainst-icono" /> Instructores Registrados
        </h3>

        <div className="cartainst-filtros">
          <div className="cartainst-filtro-item">
            <FaSearch className="cartainst-filtro-icono" />
            <input
              type="text"
              placeholder="Buscar por nombre"
              value={filtroNombre}
              onChange={e => setFiltroNombre(e.target.value)}
              className="cartainst-filtro-input"
            />
          </div>
          <div className="cartainst-filtro-item">
            <FaMapMarkerAlt className="cartainst-filtro-icono" />
            <input
              type="text"
              placeholder="Buscar por ciudad"
              value={filtroUbicacion}
              onChange={e => setFiltroUbicacion(e.target.value)}
              className="cartainst-filtro-input"
            />
          </div>
        </div>

        <div className="cartainst-grid">
          {instructoresFiltrados.map((inst) => (
            <div key={inst.UsuarioId} className="cartainst-card">
              <img
                src={getImagenValida(inst.imagen)}
                alt={`Foto de ${inst.nombre}`}
                className="cartainst-card-imagen"
                onError={(e) => (e.currentTarget.src = defaultImg)}
              />
              <h4 className="cartainst-card-nombre">{inst.nombre}</h4>
              <div className="cartainst-card-info">
                <p><FaBriefcase className="cartainst-card-icono" /> {inst.profesion || 'Sin definir'}</p>
                <p><FaMapMarkerAlt className="cartainst-card-icono" /> {inst.ubicacion || 'No especificada'}</p>
              </div>
              <button
                className="cartainst-btn-ver-mas"
                onClick={() => setInstructorActivo(inst)}
              >
                Ver más
              </button>
            </div>
          ))}
        </div>
      </div>

      {instructorActivo && (
        <div className="cartainst-modal-overlay" onClick={() => setInstructorActivo(null)}>
          <div className="cartainst-modal-contenido" onClick={e => e.stopPropagation()}>
            <button className="cartainst-modal-cerrar" onClick={() => setInstructorActivo(null)}>
              <FaTimes />
            </button>
            <img
              src={getImagenValida(instructorActivo.imagen)}
              className="cartainst-modal-imagen"
              alt="Instructor"
              onError={(e) => (e.currentTarget.src = defaultImg)}
            />
            <h3 className="cartainst-modal-nombre">{instructorActivo.nombre}</h3>
            <div className="cartainst-modal-info">
              <p><FaEnvelope className="cartainst-modal-icono" /> <strong>Correo:</strong> {instructorActivo.correo}</p>
              <p><FaPhone className="cartainst-modal-icono" /> <strong>Teléfono:</strong> {instructorActivo.telefono}</p>
              <p><FaBriefcase className="cartainst-modal-icono" /> <strong>Profesión:</strong> {instructorActivo.profesion}</p>
              <p><FaMapMarkerAlt className="cartainst-modal-icono" /> <strong>Ubicación:</strong> {instructorActivo.ubicacion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilInstructorForm;
