/* PerfilInstructorForm.tsx */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style/CartaInstructor.css';
import { obtenerIdUsuario } from '../../utils/getDecodedToken';
import defaultImg from './img/defecto.png'; 

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
    <div className="contenedor-form-perfil">
      {formData && (
        <div className="mi-perfil-actual">
          <h3> Mi perfil actual</h3>
          <img
            src={getImagenValida(formData.imagen)}
            alt="Mi imagen"
            className="imagen-perfil-propia"
            onError={(e) => (e.currentTarget.src = defaultImg)}
          />
          <p><strong>Profesión:</strong> {formData.profesion}</p>
          <p><strong>Ubicación:</strong> {formData.ubicacion}</p>
        </div>
      )}

      <h2>Crear o Editar Mi Perfil</h2>
      <form onSubmit={handleSubmit}>
        <label>Profesión:</label>
        <input
          type="text"
          name="profesion"
          value={formData.profesion}
          onChange={handleInputChange}
          required
        />

        <label>Ubicación:</label>
        <input
          type="text"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleInputChange}
          required
        />

        <label>Imagen (foto):</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {formData.imagen && (
          <img
            src={formData.imagen}
            alt="Vista previa"
            style={{ width: '120px', marginTop: '10px', borderRadius: '8px' }}
            onError={(e) => (e.currentTarget.src = defaultImg)}
          />
        )}

        <button type="submit">Guardar Perfil</button>
      </form>

      {mensaje && <p className="mensaje-form">{mensaje}</p>}

      <hr style={{ margin: '30px 0' }} />

      <h2>Instructores Registrados</h2>

      {/* Filtros */}
      <div className="filtros">  
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Buscar por ciudad"
          value={filtroUbicacion}
          onChange={e => setFiltroUbicacion(e.target.value)}
        />
      </div>

      <div className="grid-instructores">
        {instructoresFiltrados.map((inst) => (
          <div key={inst.UsuarioId} className="card-instructor">
            <img
              src={getImagenValida(inst.imagen)}
              alt={`Foto de ${inst.nombre}`}
              className="imagen-instructor"
              onError={(e) => (e.currentTarget.src = defaultImg)}
            />
            <h3>{inst.nombre}</h3>
            <p><strong>Profesión:</strong> {inst.profesion || 'Sin definir'}</p>
            <p><strong>Ubicación:</strong> {inst.ubicacion || 'No especificada'}</p>

            <button
              className="btn-ver-mas"
              onClick={() => setInstructorActivo(inst)}
            >
              Ver más
            </button>
          </div>
        ))}
      </div>

      {instructorActivo && (
        <div className="modal-overlay" onClick={() => setInstructorActivo(null)}>
          <div className="modal-contenido" onClick={e => e.stopPropagation()}>
            <button className="cerrar-modal" onClick={() => setInstructorActivo(null)}>×</button>
            <img
              src={getImagenValida(instructorActivo.imagen)}
              className="imagen-modal"
              alt="Instructor"
              onError={(e) => (e.currentTarget.src = defaultImg)}
            />
            <h2>{instructorActivo.nombre}</h2>
            <p><strong>Correo:</strong> {instructorActivo.correo}</p>
            <p><strong>Teléfono:</strong> {instructorActivo.telefono}</p>
            <p><strong>Profesión:</strong> {instructorActivo.profesion}</p>
            <p><strong>Ubicación:</strong> {instructorActivo.ubicacion}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilInstructorForm;
