import React, { useState } from "react";
import axios from "axios";
import "./style/Elemento.css";
import toast from "react-hot-toast";
import {
  FaPlusCircle,
  FaInfoCircle,
  FaClipboardList,
  FaSortNumericUp,
  FaFileUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaSave,
  FaTimes,
} from "react-icons/fa";

export default function SubirElemento() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !imagen || !cantidad) {
      setMensaje("Nombre, imagen y cantidad son obligatorios");
      return;
    }

    const formData = new FormData();
    formData.append("Nombre", nombre);
    formData.append("Descripcion", descripcion);
    formData.append("Cantidad", cantidad);
    formData.append("imagen", imagen);

    try {
      await axios.post(
        "https://render-hhyo.onrender.com/api/alquilerelementos/catalogo",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setMensaje(" Elemento subido correctamente");
      toast.success("Elemento agregado al catálogo");
      setNombre("");
      setDescripcion("");
      setCantidad("");
      setImagen(null);
      setPreview(null);
    } catch (error) {
      console.error(error);
      setMensaje("Error al subir el elemento" ,);
      toast.error("Error al subir el elemento");
    }
  };

  return (
    <div className="reg-elem-wrapper">
      {/* Header */}
      <div className="reg-elem-header">
        <h1 className="reg-elem-title">
          <FaPlusCircle className="icon-title" /> Registrar Elemento
        </h1>
        <p className="reg-elem-subtitle">
          Añade un nuevo elemento al catálogo con su información completa
        </p>
      </div>

      {/* Alerta */}
      {mensaje && (
        <div
          className={`reg-elem-alert ${
            mensaje.includes("Error") ? "error" : "success"
          }`}
        >
          <span className="reg-elem-alert-icon">
            {mensaje.includes("Error") ? (
              <FaTimesCircle />
            ) : (
              <FaCheckCircle />
            )}
          </span>
          <span className="reg-elem-alert-text">{mensaje}</span>
          <button className="reg-elem-alert-close" onClick={() => setMensaje("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Formulario */}
      <div className="reg-elem-card">
        <form onSubmit={handleSubmit} className="reg-elem-form">
          {/* Nombre */}
          <div className="reg-elem-field">
            <label className="reg-elem-label">
              <FaClipboardList className="icon-label" /> Nombre del Elemento
            </label>
            <input
              type="text"
              name="imagen"
              className="reg-elem-input"
              placeholder="Ej: Balón de fútbol, Raqueta de tenis..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          {/* Descripción */}
          <div className="reg-elem-field">
            <label className="reg-elem-label">
              <FaInfoCircle className="icon-label" /> Descripción (Opcional)
            </label>
            <textarea
              className="reg-elem-textarea"
              placeholder="Describe el elemento, características, uso..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
            />
          </div>

          {/* Cantidad */}
          <div className="reg-elem-field">
            <label className="reg-elem-label">
              <FaSortNumericUp className="icon-label" /> Cantidad Total
            </label>
            <input
              type="number"
              className="reg-elem-input"
              placeholder="Ej: 10"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              min={1}
              required
            />
          </div>

          {/* Imagen */}
          <div className="reg-elem-field">
            <label className="reg-elem-label">
              <FaFileUpload className="icon-label" /> Imagen del Elemento
            </label>
            <div className="reg-elem-upload-area">
              <label className="reg-elem-upload-label">
                {imagen ? (
                  <>
                    <FaCheckCircle className="reg-elem-upload-icon success" />
                    <span className="reg-elem-upload-text">{imagen.name}</span>
                  </>
                ) : (
                  <>
                    <FaFileUpload className="reg-elem-upload-icon" />
                    <span className="reg-elem-upload-text">
                      Haz clic para seleccionar una imagen
                    </span>
                    <span className="reg-elem-upload-hint">
                      PNG, JPG o JPEG (Max. 5MB)
                    </span>
                  </>
                )}
                <input
                  type="file"
                  className="reg-elem-upload-input"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImagen(file);
                    setPreview(file ? URL.createObjectURL(file) : null);
                  }}
                  required
                />
              </label>
            </div>
          </div>

          {/* Vista previa */}
          {preview && (
            <div className="reg-elem-preview">
              <p className="reg-elem-preview-label">
                <FaEye className="icon-label" /> Vista Previa:
              </p>
              <div className="reg-elem-preview-wrapper">
                <img
                  src={preview}
                  alt="preview"
                  className="reg-elem-preview-img"
                />
                <button
                  type="button"
                  className="reg-elem-preview-remove"
                  onClick={() => {
                    setImagen(null);
                    setPreview(null);
                  }}
                >
                  <FaTimes /> Quitar
                </button>
              </div>
            </div>
          )}

          {/* Botón Submit */}
          <button type="submit" className="reg-elem-submit-btn">
            <FaSave className="reg-elem-submit-icon" />
            <span className="reg-elem-submit-text">Registrar Elemento</span>
          </button>
        </form>
      </div>
    </div>
  );
}
