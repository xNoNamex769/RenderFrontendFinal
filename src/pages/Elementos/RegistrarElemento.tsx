import React, { useState } from 'react';
import axios from 'axios';
import "./style/Elemento.css";
import toast from 'react-hot-toast';

export default function SubirElemento() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !imagen || !cantidad) {
      setMensaje('Nombre, imagen y cantidad son obligatorios');
      return;
    }

    const formData = new FormData();
    formData.append('Nombre', nombre);
    formData.append('Descripcion', descripcion);
    formData.append('Cantidad', cantidad);
    formData.append('imagen', imagen);

    try {
    const response = await axios.post('https://render-hhyo.onrender.com/api/alquilerelementos/catalogo', formData, {

        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMensaje(response.data.mensaje || 'Elemento subido correctamente');
      setNombre('');
      setDescripcion('');
      setCantidad('');
      setImagen(null);
    } catch (error) {
      console.error(error);
      toast.success('Elemento subido');
    }
  };

  return (
    <div className="formulario-subir">
      <h2>Agregar nuevo elemento al catálogo</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre del Elemento:
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </label>

        <label>
          Descripción (opcional):
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </label>

        <label>
          Cantidad Total:
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            min={1}
            required
          />
        </label>

        <label>
          Imagen:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files?.[0] || null)}
            required
          />
        </label>

        <button type="submit">Subir Elemento</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}
