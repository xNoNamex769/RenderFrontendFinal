import React, { useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import "./style/RegistroLudicas.css";
import cuadradoImg from "../RegistroActividades/img/cuadrado.jpg";

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
  const [preview, setPreview] = useState(cuadradoImg);
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
      alert("La hora de inicio debe ser menor que la de fin.");
      return;
    }

    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);

    const token = localStorage.getItem("token");
    if (!token) return alert("Debes iniciar sesión");

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

      alert("✅ Lúdica registrada con éxito");
      setActividadCreada(response.data.actividad);
    } catch (error) {
      console.error("❌ Error al registrar lúdica:", error);
      alert("Hubo un error al registrar la lúdica.");
    }
  };

 return (
  <div className="registro-container">
    <h2 className="registro-titulo">Registrar Lúdica</h2>
    <div className="image-container">
  <img
    src={cuadradoImg}
    alt="Decoración de registro"
    className="preview-image"
  />
</div>


    <form className="registro-form" onSubmit={handleSubmit}>
      <div className="registro-grid">
        <label className="registro-label">
          Nombre *
          <input
            className="registro-input"
            type="text"
            name="NombreActi"
            value={form.NombreActi}
            onChange={handleChange}
            required
          />
        </label>

        <label className="registro-label">
          Fecha *
          <input
            className="registro-input"
            type="date"
            name="Fecha"
            value={form.Fecha}
            onChange={handleChange}
            required
          />
        </label>

        <label className="registro-label" style={{ gridColumn: "1 / 3" }}>
          Descripción *
          <textarea
            className="registro-input"
            name="Descripcion"
            value={form.Descripcion}
            onChange={handleChange}
            rows="3"
            required
          />
        </label>

        <label className="registro-label">
          Hora de inicio *
          <input
            className="registro-input"
            type="time"
            name="HoraInicio"
            value={form.HoraInicio}
            onChange={handleChange}
            required
          />
        </label>

        <label className="registro-label">
          Hora de fin *
          <input
            className="registro-input"
            type="time"
            name="HoraFin"
            value={form.HoraFin}
            onChange={handleChange}
            required
          />
        </label>

        <label className="registro-label">
          Tipo de lúdica *
          <select
            className="registro-select"
            name="TipoLudica"
            value={form.TipoLudica}
            onChange={handleChange}
          >
            <option value="Recreativa">Recreativa</option>
            <option value="Cultural">Cultural</option>
            <option value="Deportiva">Deportiva</option>
          </select>
        </label>

        <label className="registro-label">
          Ubicación *
          <input
            className="registro-input"
            type="text"
            name="Ubicacion"
            value={form.Ubicacion}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div className="registro-checkbox-unico">
        <input
          type="checkbox"
          name="HorarioContinuo"
          checked={form.HorarioContinuo}
          onChange={handleChange}
        />
        <span>¿Es un horario continuo?</span>
      </div>

      <div className="registro-input-archivo">
  <input type="file" name="Imagen" accept="image/*" onChange={handleImageChange} />
</div>


      <button type="submit" className="btn-registrar">Registrar Lúdica</button>
    </form>

    {/* Modal */}
    {showModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Confirma los datos</h3>
          <p><strong>Nombre:</strong> {form.NombreActi}</p>
          <p><strong>Descripción:</strong> {form.Descripcion}</p>
          <p><strong>Fecha:</strong> {form.Fecha}</p>
          <p><strong>Hora:</strong> {form.HoraInicio} - {form.HoraFin}</p>
          <p><strong>Ubicación:</strong> {form.Ubicacion}</p>
          <p><strong>Tipo:</strong> {form.TipoLudica}</p>
          <p><strong>Horario continuo:</strong> {form.HorarioContinuo ? "Sí" : "No"}</p>
          <div className="modal-buttons">
            <button onClick={handleConfirm}>Aceptar</button>
            <button onClick={() => setShowModal(false)}>Cancelar</button>
          </div>
        </div>
      </div>
    )}
  </div>
);

};

export default RegistroLudica;
