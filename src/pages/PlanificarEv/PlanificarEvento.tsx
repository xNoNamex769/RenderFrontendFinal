import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaFileAlt, 
  FaBoxOpen, 
  FaCamera, 
  FaEdit, 
  FaBullseye,
  FaPlus,
  FaCheckCircle,
  FaTimes,
  FaStar,
  FaClock
} from "react-icons/fa";
import { MdEvent, MdDescription } from "react-icons/md";
import "./styles/styles.css";
import "./styles/PlanificarMejorado.css";

// Tipos de datos
interface Actividad {
  IdActividad: number;
  NombreActi: string;
}

const EventPlanner: React.FC = () => {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventResources, setEventResources] = useState("");
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [availableActivities, setAvailableActivities] = useState<Actividad[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);

  // Nuevo estado para mostrar/ocultar actividades
  const [showActivities, setShowActivities] = useState(false);

  // Estados para crear nueva actividad
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityDescription, setNewActivityDescription] = useState("");
  const [newActivityType, setNewActivityType] = useState("");
  const [newActivityDate, setNewActivityDate] = useState("");
  const [newActivityStartTime, setNewActivityStartTime] = useState("");
  const [newActivityEndTime, setNewActivityEndTime] = useState("");
  const [newActivityLocation, setNewActivityLocation] = useState("");
  const [newActivityImage, setNewActivityImage] = useState<File | null>(null);

  // Obtener actividades
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get("https://render-hhyo.onrender.com/api/actividad");
        console.log("🎯 Actividades cargadas:", res.data);
        setAvailableActivities(res.data);
      } catch (error) {
        console.error("❌ Error cargando actividades:", error);
      }
    };

    fetchActivities();
  }, []);

  const handleActivityToggle = (id: number) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((actId) => actId !== id) : [...prev, id]
    );
  };

  // Crear nueva actividad
  const createNewActivity = async () => {
    if (!newActivityName.trim() || !newActivityDescription.trim() || !newActivityType.trim() ||
        !newActivityDate || !newActivityStartTime || !newActivityEndTime || !newActivityLocation) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos de la actividad.",
        confirmButtonColor: "#5eb319",
      });
      return;
    }

    if (newActivityStartTime >= newActivityEndTime) {
      Swal.fire({
        icon: "error",
        title: "Error en horario",
        text: "La hora de inicio debe ser anterior a la hora de fin.",
        confirmButtonColor: "#5eb319",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Sesión requerida",
          text: "No se encontró token. Inicia sesión.",
          confirmButtonColor: "#5eb319",
        });
        return;
      }

      const decoded = JSON.parse(atob(token.split(".")[1]));
      const idUsuario = decoded?.IdUsuario;

      if (!idUsuario) {
        Swal.fire({
          icon: "error",
          title: "Error de usuario",
          text: "No se pudo identificar al usuario.",
          confirmButtonColor: "#5eb319",
        });
        return;
      }

      const formData = new FormData();
      formData.append("NombreActi", newActivityName);
      formData.append("Descripcion", newActivityDescription);
      formData.append("FechaInicio", newActivityDate);
      formData.append("FechaFin", newActivityDate);
      formData.append("HoraInicio", newActivityStartTime);
      formData.append("HoraFin", newActivityEndTime);
      formData.append("Ubicacion", newActivityLocation);
      formData.append("IdUsuario", idUsuario);
      formData.append("TipoLudica", newActivityType);
      
      if (newActivityImage) {
        formData.append("Imagen", newActivityImage);
      }

      const res = await axios.post(
        "https://render-hhyo.onrender.com/api/actividad",
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Actividad creada exitosamente.",
        confirmButtonColor: "#5eb319",
        timer: 2500,
        showConfirmButton: true,
      });
      
      // Agregar la nueva actividad a la lista
      const nuevaActividad = res.data;
      setAvailableActivities((prev) => [...prev, nuevaActividad]);
      
      // Seleccionar automáticamente la nueva actividad
      setSelectedActivities((prev) => [...prev, nuevaActividad.IdActividad]);

      // Limpiar formulario
      setNewActivityName("");
      setNewActivityDescription("");
      setNewActivityType("");
      setNewActivityDate("");
      setNewActivityStartTime("");
      setNewActivityEndTime("");
      setNewActivityLocation("");
      setNewActivityImage(null);
      setShowCreateActivity(false);
    } catch (error: any) {
      console.error("❌ Error al crear actividad:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al crear actividad. Revisa la consola.",
        confirmButtonColor: "#5eb319",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && !file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Archivo inválido",
        text: "Solo se permiten archivos de imagen.",
        confirmButtonColor: "#5eb319",
      });
      return;
    }

    setEventImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const addEvent = async () => {
    if (
      !eventName.trim() ||
      !eventDate.trim() ||
      !eventType.trim() ||
      !eventDescription.trim() ||
      !eventLocation.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos obligatorios.",
        confirmButtonColor: "#5eb319",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Sesión requerida",
          text: "No se encontró token. Inicia sesión.",
          confirmButtonColor: "#5eb319",
        });
        return;
      }

      const formData = new FormData();
      formData.append("NombreEvento", eventName);
      formData.append("FechaEvento", eventDate);
      formData.append("TipoEvento", eventType);
      formData.append("LugarDeEvento", eventLocation);
      formData.append("Recursos", eventResources);
      formData.append("DescripcionEvento", eventDescription);
      if (eventImage) formData.append("ImagenEvento", eventImage);

      // Crear planificación de evento
      const res = await axios.post(
        "https://render-hhyo.onrender.com/api/planificacionevento",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const IdPlanificarE = res.data.planificacion.IdPlanificarE;

      // Asociar actividades solo si hay actividades seleccionadas
      if (selectedActivities.length > 0) {
        await axios.post(
          "https://render-hhyo.onrender.com/api/eventoactividad/asociar",
          {
            IdPlanificarE,
            actividades: selectedActivities,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: selectedActivities.length > 0 
          ? "Evento creado y actividades asociadas con éxito."
          : "Evento creado con éxito.",
        confirmButtonColor: "#5eb319",
        timer: 3000,
        showConfirmButton: true,
      });

      // Limpiar formulario
      setEventName("");
      setEventDate("");
      setEventType("");
      setEventDescription("");
      setEventLocation("");
      setEventResources("");
      setEventImage(null);
      setPreviewImage(null);
      setSelectedActivities([]);
      setShowActivities(false); // Ocultar actividades después de crear evento
    } catch (error: any) {
      console.error("❌ Error al crear evento:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al crear evento. Revisa la consola.",
        confirmButtonColor: "#5eb319",
      });
    }
  };

return (
  <div className="planev-container">
    {/* Título */}
    <h1 className="planev-title">
      Planificador de <span className="planev-title-highlight">Eventos SENA</span>
    </h1>
    <p className="planev-subtitle">Crea y gestiona eventos para la comunidad educativa</p>

    {/* Vista previa de imagen */}
    {previewImage && (
      <div className="planev-preview">
        <img
          src={previewImage}
          alt="Vista previa del evento"
          className="planev-preview-img"
        />
      </div>
    )}

    <div className="planev-form">
      <div className="planev-input-wrapper">
        <FaEdit className="planev-input-icon" />
        <input
          type="text"
          placeholder="Nombre del evento"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="planev-input"
        />
      </div>
      <div className="planev-input-wrapper">
        <FaCalendarAlt className="planev-input-icon" />
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="planev-input"
        />
      </div>
      <div className="planev-input-wrapper">
        <FaBullseye className="planev-input-icon" />
        <input
          type="text"
          placeholder="Tipo de evento (Ej: Cultural, Deportivo, Académico)"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="planev-input"
        />
      </div>
      <div className="planev-input-wrapper">
        <FaMapMarkerAlt className="planev-input-icon" />
        <input
          type="text"
          placeholder="Ubicación del evento"
          value={eventLocation}
          onChange={(e) => setEventLocation(e.target.value)}
          className="planev-input"
        />
      </div>
      <div className="planev-input-wrapper">
        <FaBoxOpen className="planev-input-icon" />
        <textarea
          placeholder="Recursos necesarios (Ej: Proyector, Sillas, Sonido)"
          value={eventResources}
          onChange={(e) => setEventResources(e.target.value)}
          className="planev-textarea"
        />
      </div>
      <div className="planev-input-wrapper">
        <MdDescription className="planev-input-icon" />
        <textarea
          placeholder="Descripción del evento"
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          className="planev-textarea"
        />
      </div>

      {/* Campo de imagen */}
      <div className="planev-image-field">
        <label className="planev-image-label">
          <FaCamera /> Imagen del evento
        </label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange}
          className="planev-file-input"
        />
      </div>

      {/* Actividades */}
      <div className="planev-activities-section">
        <h3 className="planev-activities-title">
          <FaBullseye /> Actividades Lúdicas (Opcional)
        </h3>
        
        {!showActivities && !showCreateActivity && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              className="planev-show-activities-btn"
              onClick={() => setShowActivities(true)}
              style={{ flex: 1 }}
            >
              <FaPlus /> Seleccionar Actividades Existentes
            </button>
            <button
              type="button"
              className="planev-show-activities-btn"
              onClick={() => setShowCreateActivity(true)}
              style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
            >
              <FaStar /> Crear Nueva Actividad
            </button>
          </div>
        )}

        {/* Formulario para crear nueva actividad */}
        {showCreateActivity && (
          <div className="planev-create-activity-form">
            <h4 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaStar /> Crear Nueva Actividad
            </h4>
            <div className="planev-input-wrapper">
              <FaEdit className="planev-input-icon" />
              <input
                type="text"
                placeholder="Nombre de la actividad"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                className="planev-input"
              />
            </div>
            <div className="planev-input-wrapper">
              <FaBullseye className="planev-input-icon" />
              <input
                type="text"
                placeholder="Tipo de actividad (Ej: Deportiva, Cultural)"
                value={newActivityType}
                onChange={(e) => setNewActivityType(e.target.value)}
                className="planev-input"
              />
            </div>
            <div className="planev-input-wrapper">
              <MdDescription className="planev-input-icon" />
              <textarea
                placeholder="Descripción de la actividad"
                value={newActivityDescription}
                onChange={(e) => setNewActivityDescription(e.target.value)}
                className="planev-textarea"
                style={{ minHeight: '80px' }}
              />
            </div>
            <div className="planev-input-wrapper">
              <FaCalendarAlt className="planev-input-icon" />
              <input
                type="date"
                value={newActivityDate}
                onChange={(e) => setNewActivityDate(e.target.value)}
                className="planev-input"
              />
            </div>
            <div className="planev-input-wrapper">
              <FaClock className="planev-input-icon" />
              <input
                type="time"
                placeholder="Hora de inicio"
                value={newActivityStartTime}
                onChange={(e) => setNewActivityStartTime(e.target.value)}
                className="planev-input"
              />
            </div>
            <div className="planev-input-wrapper">
              <FaClock className="planev-input-icon" />
              <input
                type="time"
                placeholder="Hora de fin"
                value={newActivityEndTime}
                onChange={(e) => setNewActivityEndTime(e.target.value)}
                className="planev-input"
              />
            </div>
            <div className="planev-input-wrapper">
              <FaMapMarkerAlt className="planev-input-icon" />
              <input
                type="text"
                placeholder="Ubicación de la actividad"
                value={newActivityLocation}
                onChange={(e) => setNewActivityLocation(e.target.value)}
                className="planev-input"
              />
            </div>
            <div className="planev-image-field">
              <label className="planev-image-label">
                <FaCamera /> Imagen de la actividad (opcional)
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setNewActivityImage(e.target.files?.[0] || null)}
                className="planev-file-input"
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={createNewActivity}
                className="planev-submit-btn"
                style={{ marginTop: 0, padding: '1rem', fontSize: '1rem' }}
              >
                <FaCheckCircle /> Crear y Agregar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateActivity(false);
                  setNewActivityName("");
                  setNewActivityDescription("");
                  setNewActivityType("");
                  setNewActivityDate("");
                  setNewActivityStartTime("");
                  setNewActivityEndTime("");
                  setNewActivityLocation("");
                  setNewActivityImage(null);
                }}
                style={{
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#6b7280',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '1rem',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                <FaTimes /> Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de actividades existentes */}
        {showActivities && (
          <>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowCreateActivity(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  color: '#fff',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <FaStar /> Crear Nueva Actividad
              </button>
            </div>
            <div className="planev-activities-grid">
              {availableActivities.map((act) => (
                <label key={act.IdActividad} className="planev-activity-card">
                  <input
                    type="checkbox"
                    checked={selectedActivities.includes(act.IdActividad)}
                    onChange={() => handleActivityToggle(act.IdActividad)}
                  />
                  <span>{act.NombreActi}</span>
                </label>
              ))}
            </div>
            {selectedActivities.length > 0 && (
              <div className="planev-selected-count">
                <FaCheckCircle /> {selectedActivities.length} actividad{selectedActivities.length !== 1 ? 'es' : ''} seleccionada{selectedActivities.length !== 1 ? 's' : ''}
              </div>
            )}
          </>
        )}
      </div>

      <button className="planev-submit-btn" onClick={addEvent}>
        <MdEvent /> Crear Evento
      </button>
    </div>
  </div>
);

};

export default EventPlanner;
