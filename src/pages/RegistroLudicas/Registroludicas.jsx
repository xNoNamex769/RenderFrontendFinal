import React, { useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import Swal from "sweetalert2";

import "./style/RegistroLudicasMejorado.css";

const RegistroLudica = () => {
  const [form, setForm] = useState({
    NombreActi: "",
    Descripcion: "",
    Fecha: "",
    HoraInicio: "",
    HoraFin: "",
    TipoLudica: "Recreativa",
    Ubicacion: "",
    HorarioContinuo: false,
  });

  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actividadCreada, setActividadCreada] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.HoraInicio >= form.HoraFin) {
      Swal.fire({
        icon: "error",
        title: "Error en horario",
        text: "La hora de inicio debe ser menor que la de fin.",
        confirmButtonColor: "#5eb319",
      });
      return;
    }

    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Sesión requerida",
        text: "Debes iniciar sesión para continuar",
        confirmButtonColor: "#5eb319",
      });
      return;
    }

    const decoded = JSON.parse(atob(token.split(".")[1]));
    const IdUsuario = decoded?.IdUsuario;

    const formData = new FormData();
    formData.append("NombreActi", form.NombreActi);
    formData.append("Descripcion", form.Descripcion);
    formData.append("FechaInicio", form.Fecha);
    formData.append("FechaFin", form.Fecha);
    formData.append("HoraInicio", form.HoraInicio);
    formData.append("HoraFin", form.HoraFin);
    formData.append("TipoLudica", form.TipoLudica);
    formData.append("Ubicacion", form.Ubicacion);
    formData.append("IdUsuario", IdUsuario);
    formData.append("HorarioContinuo", form.HorarioContinuo ? "true" : "false");

    // 👇 este nombre debe coincidir con upload.single("Imagen")
    if (imagen) {
      formData.append("Imagen", imagen);
    }

    try {
      const response = await axios.post("https://render-hhyo.onrender.com/api/ludica", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Lúdica registrada con éxito",
        confirmButtonColor: "#5eb319",
        timer: 3000,
        showConfirmButton: true,
      });
      setActividadCreada(response.data.actividad);
    } catch (error) {
      console.error("❌ Error al registrar lúdica:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al registrar la lúdica. Por favor intenta nuevamente.",
        confirmButtonColor: "#5eb319",
      });
    }
  };

 return (
  <div className="reglud-wrapper">
    <div className="reglud-container">
      <h2 className="reglud-titulo">Registrar Lúdica</h2>

      {preview && (
        <div className="reglud-preview-top">
          <img
            src={preview}
            alt="Vista previa de la lúdica"
            className="reglud-preview-img"
          />
        </div>
      )}

      <form className="reglud-form" onSubmit={handleSubmit}>
        <div className="reglud-grid">
          <label className="reglud-label">
            📝 Nombre de la Lúdica *
            <input
              className="reglud-input"
              type="text"
              name="NombreActi"
              value={form.NombreActi}
              onChange={handleChange}
              placeholder="Ej: Torneo de Ajedrez"
              required
            />
          </label>

          <label className="reglud-label">
            📅 Fecha *
            <input
              className="reglud-input"
              type="date"
              name="Fecha"
              value={form.Fecha}
              onChange={handleChange}
              required
            />
          </label>

          <label className="reglud-label">
            🕒 Hora de inicio *
            <input
              className="reglud-input"
              type="time"
              name="HoraInicio"
              value={form.HoraInicio}
              onChange={handleChange}
              required
            />
          </label>

          <label className="reglud-label">
            ⏰ Hora de fin *
            <input
              className="reglud-input"
              type="time"
              name="HoraFin"
              value={form.HoraFin}
              onChange={handleChange}
              required
            />
          </label>

          <label className="reglud-label">
            🎯 Tipo de lúdica *
            <select
              className="reglud-select"
              name="TipoLudica"
              value={form.TipoLudica}
              onChange={handleChange}
            >
              <option value="Recreativa">Recreativa</option>
              <option value="Cultural">Cultural</option>
              <option value="Deportiva">Deportiva</option>
            </select>
          </label>

          <label className="reglud-label">
            📍 Ubicación *
            <input
              className="reglud-input"
              type="text"
              name="Ubicacion"
              value={form.Ubicacion}
              onChange={handleChange}
              placeholder="Ej: Salón 201"
              required
            />
          </label>

          <label className="reglud-label" style={{ gridColumn: "1 / -1" }}>
            📄 Descripción *
            <textarea
              className="reglud-textarea"
              name="Descripcion"
              value={form.Descripcion}
              onChange={handleChange}
              placeholder="Describe la actividad lúdica..."
              rows="3"
              required
            />
          </label>
        </div>

        <div className="reglud-checkbox">
          <input
            type="checkbox"
            name="HorarioContinuo"
            checked={form.HorarioContinuo}
            onChange={handleChange}
          />
          <span>🔄 Esta actividad se repite todos los días en el mismo horario</span>
        </div>

        <div className="reglud-file-input">
          <input type="file" name="Imagen" accept="image/*" onChange={handleImageChange} />
        </div>

        <button type="submit" className="reglud-btn-submit">
          🎉 Registrar Lúdica
        </button>
      </form>
    </div>

    {/* Modal */}
    {showModal && (
      <div className="reglud-modal-overlay">
        <div className="reglud-modal-content">
          <h3>✅ Confirma los datos</h3>
          <p><strong>Nombre:</strong> {form.NombreActi}</p>
          <p><strong>Descripción:</strong> {form.Descripcion}</p>
          <p><strong>Fecha:</strong> {form.Fecha}</p>
          <p><strong>Hora:</strong> {form.HoraInicio} - {form.HoraFin}</p>
          <p><strong>Ubicación:</strong> {form.Ubicacion}</p>
          <p><strong>Tipo:</strong> {form.TipoLudica}</p>
          <p><strong>Horario continuo:</strong> {form.HorarioContinuo ? "Sí" : "No"}</p>
          <div className="reglud-modal-buttons">
            <button onClick={handleConfirm}>✅ Aceptar</button>
            <button onClick={() => setShowModal(false)}>❌ Cancelar</button>
          </div>
        </div>
      </div>
    )}
  </div>
);

};

export default RegistroLudica;
