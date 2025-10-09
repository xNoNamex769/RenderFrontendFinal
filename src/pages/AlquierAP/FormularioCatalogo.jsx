import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./style/FormularioCatalogo.css";

const socket = io("https://render-hhyo.onrender.com"); //  Cambia la IP si usas otra

const FormularioCatalogo = () => {
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [preview, setPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !imagen) {
      setMensaje("Debes ingresar el nombre del elemento y seleccionar una imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("NombreElemento", nombre);
    formData.append("imagen", imagen);

    try {
      await axios.post("https://render-hhyo.onrender.com/api/alquilerelementos/catalogo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 🔔 Emitimos notificación por socket
      socket.emit("nuevaNotificacion", {
        titulo: " Nuevo elemento agregado al catálogo",
        mensaje: `Se añadió "${nombre}" como nuevo recurso disponible para alquiler.`,
        tipo: "catalogo",
        fecha: new Date(),
      });

      setMensaje("Elemento subido exitosamente al catálogo.");
      setNombre("");
      setImagen(null);
      setPreview(null);
    } catch (error) {
      console.error("Error al subir elemento:", error);
      setMensaje("Hubo un error al subir el elemento.");
    }
  };

  return (
    <div className="formulario-catalogo">
      <h2>Agregar nuevo elemento al catálogo</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Nombre del elemento"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setImagen(file);
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />

        {preview && (
          <div className="preview-container">
            <p>Vista previa de la imagen:</p>
            <img src={preview} alt="preview" className="preview-imagen" />
          </div>
        )}

        <button type="submit">Subir elemento</button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default FormularioCatalogo;
