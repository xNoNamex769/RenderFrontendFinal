import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/styles.css";

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && !file.type.startsWith("image/")) {
      alert("⚠️ Solo se permiten archivos de imagen.");
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
      !eventLocation.trim() ||
      selectedActivities.length === 0
    ) {
      alert("⚠️ Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ No se encontró token. Inicia sesión.");
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

      // Asociar actividades
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

      alert("✅ Evento creado y actividades asociadas con éxito.");

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
      alert("❌ Error al crear evento. Revisa la consola.");
    }
  };

return (
  <div className="planificar-evento-container">
    {/* ✅ Título */}
    <h1 className="planificar-evento-title">Planificador de eventos</h1>

    {/* ✅ Vista previa justo debajo del título */}
    {previewImage && (
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img
          src={previewImage}
          alt="Vista previa del evento"
          style={{
            width: "40%",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    )}

    <div className="planificar-evento-form">
      <input
        type="text"
        placeholder="Nombre del evento"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
      />
      <input
        type="date"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
      />
      <input
        type="text"
        placeholder="Tipo de evento"
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
      />
      <textarea
        placeholder="Recursos necesarios"
        value={eventResources}
        onChange={(e) => setEventResources(e.target.value)}
      />
      <textarea
        placeholder="Descripción del evento"
        value={eventDescription}
        onChange={(e) => setEventDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Ubicación"
        value={eventLocation}
        onChange={(e) => setEventLocation(e.target.value)}
      />

      {/* Campo de imagen */}
      <div className="planificar-evento-imagen">
        <label>📷 Imagen del evento:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      {/* Actividades */}
      <div className="planificar-evento-actividades">
        <h3>Actividades disponibles:</h3>
        {!showActivities && (
          <button
            type="button"
            className="planificar-evento-botonactividades"
            onClick={() => setShowActivities(true)}
            style={{ marginTop: "0.5rem" }}
          >
            Agregar actividad
          </button>
        )}

        {showActivities && (
          <div className="planificar-evento-grid" style={{ marginTop: "1rem" }}>
            {availableActivities.map((act) => (
              <label key={act.IdActividad} className="planificar-evento-card">
                <input
                  type="checkbox"
                  checked={selectedActivities.includes(act.IdActividad)}
                  onChange={() => handleActivityToggle(act.IdActividad)}
                />
                <span>{act.NombreActi}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <button className="planificar-evento-boton" onClick={addEvent}>
        Agregar Evento
      </button>
    </div>
  </div>
);

};

export default EventPlanner;
