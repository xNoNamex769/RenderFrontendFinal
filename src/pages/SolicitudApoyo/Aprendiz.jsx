import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import "./style/Aprendiz.css";

const obtenerIdAprendiz = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const decoded = jwtDecode(token);
  return decoded.IdUsuario;
};

const Aprendiz = () => {
  const [solicitud, setSolicitud] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [TipoAyuda, setTipoAyuda] = useState('');
  const [Descripcion, setDescripcion] = useState('');
  const [editando, setEditando] = useState(false);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [comentarioFeedback, setComentarioFeedback] = useState('');
  const [calificacion, setCalificacion] = useState(5);
  const [feedback, setFeedback] = useState(null);

  const IdAprendiz = obtenerIdAprendiz();

  useEffect(() => {
    if (!IdAprendiz) return;

    axios.get(`https://render-hhyo.onrender.com/api/solicitudapoyo`)
      .then((res) => {
       const solicitudesActivas = res.data
  .filter((s) => s.IdUsuario === IdAprendiz && s.Estado !== "cancelada")
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // más reciente primero

const solicitudDelUsuario = solicitudesActivas[0]; // solo la más reciente


        if (solicitudDelUsuario) {
          setSolicitud(solicitudDelUsuario);
          setTipoAyuda(solicitudDelUsuario.TipoAyuda);
          setDescripcion(solicitudDelUsuario.Descripcion);

          // Cargar historial
          axios.get(`https://render-hhyo.onrender.com/api/historial/solicitud/${solicitudDelUsuario.IdSolicitud}`)
            .then((resHistorial) => setHistorial(resHistorial.data))
            .catch((err) => console.error("Error al cargar historial:", err));

          // Cargar feedback
          axios.get(`https://render-hhyo.onrender.com/api/feedback/solicitud/${solicitudDelUsuario.IdSolicitud}`)
            .then((resFeedback) => {
              if (resFeedback.data) setFeedback(resFeedback.data);
            })
            .catch((err) => console.error("Error al cargar feedback:", err));
        }
      })
      .catch((err) => console.error("Error al cargar solicitud:", err));
  }, [IdAprendiz]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const datosSolicitud = {
      IdUsuario: IdAprendiz,
      TipoAyuda,
      Descripcion,
      Estado: "pendiente"
    };

    if (editando && solicitud) {
      axios.put(`https://render-hhyo.onrender.com/api/solicitudapoyo/${solicitud.IdSolicitud}`, datosSolicitud)
        .then((res) => {
          setSolicitud(res.data);
          setEditando(false);
        })
        .catch((err) => console.error("Error al editar solicitud:", err));
    } else {
      axios.post('https://render-hhyo.onrender.com/api/solicitudapoyo', datosSolicitud)
        .then((res) => {
          setSolicitud(res.data);
          //Llamamos a la función de notificación
           notificarEncargados(datosSolicitud.TipoAyuda, res.data.IdSolicitud);
        })
        .catch((err) => console.error("Error al crear solicitud:", err));
    }
  };

  const handleEliminar = () => {
    if (!solicitud) return;

    if (historial.length > 0) {
      if (window.confirm("Tu solicitud ya tiene historial. ¿Deseas cancelarla?")) {
        axios.put(`https://render-hhyo.onrender.com/api/solicitudapoyo/${solicitud.IdSolicitud}`, {
          ...solicitud,
          Estado: "cancelada"
        }).then(() => {
          alert("Solicitud cancelada.");
          setSolicitud(null);
          setHistorial([]);
          setTipoAyuda('');
          setDescripcion('');
        }).catch((err) => console.error("Error al cancelar solicitud:", err));
      }
    } else {
      if (window.confirm("¿Estás seguro de eliminar tu solicitud?")) {
        axios.delete(`https://render-hhyo.onrender.com/api/solicitudapoyo/${solicitud.IdSolicitud}`)
          .then(() => {
            setSolicitud(null);
            setHistorial([]);
            setTipoAyuda('');
            setDescripcion('');
          })
          .catch((err) => console.error("Error al eliminar solicitud:", err));
      }
    }
  };

  const enviarFeedback = () => {
    if (!comentarioFeedback.trim()) {
      alert("El comentario no puede estar vacío.");
      return;
    }
    if (!solicitud?.IdSolicitud) {
    alert("No se puede enviar feedback. La solicitud aún no está disponible.");
    return;
  }

    const datos = {
      IdSolicitud: solicitud?.IdSolicitud,
      IdUsuario: IdAprendiz,
      Comentario: comentarioFeedback,
      Calificacion: calificacion
    };

    axios.post(`https://render-hhyo.onrender.com/api/feedback/solicitud`, datos)
      .then(() => {
        alert("¡Gracias por tu opinión!");
        setMostrarFeedback(false);
        setComentarioFeedback('');
        setCalificacion(5);

        return axios.get(`https://render-hhyo.onrender.com/api/feedback/solicitud/${solicitud.IdSolicitud}`);
      })
      .then(res => {
        setFeedback(res.data);
      })
      .catch((err) => console.error("Error al enviar feedback:", err));
  };
const notificarEncargados = async (tipoAyuda, solicitudId) => {
  try {
    // 1. Buscar encargados según el tipo de ayuda
    const res = await axios.get(`https://render-hhyo.onrender.com/api/solicitudapoyo/encargados/${tipoAyuda}`);
    const encargados = res.data;

    if (encargados.length === 0) {
      console.warn("No hay encargados para esta área");
      return;
    }

    // 2. Por cada encargado, enviar notificación (esto se puede ajustar)
    for (const encargado of encargados) {
      await axios.post('https://render-hhyo.onrender.com/api/notificaciones', {
        IdUsuario: encargado.usuario.IdUsuario,
        Titulo: `Nueva solicitud de ${tipoAyuda}`,
        Descripcion: `Un aprendiz ha solicitado ayuda en el área de ${tipoAyuda}.`,
        Tipo: 'Solicitud',
        Visto: false,
        Link: `/panel-instructor/solicitudes/${solicitudId}`
      });
    }

    console.log("Notificaciones enviadas a encargados");
  } catch (error) {
    console.error("Error al notificar encargados:", error);
  }
};

  return (
    <div className="panel">
      <h2>Mi Solicitud de Apoyo</h2>

      {!solicitud || editando ? (
        <form onSubmit={handleSubmit} className="formulario-apoyo">
          <h3>{editando ? "Editar Solicitud" : "Enviar nueva solicitud"}</h3>

          <label>
            Tipo de Ayuda:
            <select value={TipoAyuda} onChange={(e) => setTipoAyuda(e.target.value)} required>
              <option value="">-- Seleccionar --</option>
              <option value="Psicologica">Psicológica</option>
<option value="Emocional">Emocional</option>
<option value="Economica">Económica</option>
            </select>
            {TipoAyuda && (
  <div className="info-ayuda">
    {TipoAyuda === "Psicológica" && (
      <>
        <span className="icono-ayuda">🧠</span>
        <p className="descripcion-ayuda">
          Apoyo en temas de salud mental, ansiedad, estrés, entre otros.
        </p>
      </>
    )}
    {TipoAyuda === "Emocional" && (
      <>
        <span className="icono-ayuda">💬</span>
        <p className="descripcion-ayuda">
          Ayuda para manejar emociones, conflictos personales o académicos.
        </p>
      </>
    )}
    {TipoAyuda === "Económica" && (
      <>
        <span className="icono-ayuda">💰</span>
        <p className="descripcion-ayuda">
          Solicita apoyo económico para materiales, transporte u otras necesidades.
        </p>
      </>
    )}
  </div>
)}

          </label>

          <label>
            Descripción:
            <textarea value={Descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
          </label>

          <button type="submit">{editando ? "Guardar Cambios" : "Enviar Solicitud"}</button>

          {editando && (
            <button type="button" className="cancelar-btn" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          )}
        </form>
      ) : (
        <>
          <p><strong>Tipo de Ayuda:</strong> {solicitud.TipoAyuda}</p>
          <p><strong>Descripción:</strong> {solicitud.Descripcion}</p>
          <p><strong>Estado Actual:</strong> <span className={`estado-${solicitud.Estado?.toLowerCase()}`}>{solicitud.Estado}</span></p>

          <div className="botones-acciones">
            <button onClick={() => setEditando(true)}>✏️ Editar</button>
            <button onClick={handleEliminar} className="eliminar-btn">
              🗑️ {historial.length > 0 ? "Cancelar" : "Eliminar"}
            </button>
          </div>

          <h3>Seguimiento / Historial</h3>
          <div className="historial-container">
            {historial.length > 0 ? (
              historial.map((h, index) => {
                const esUltimo = index === historial.length - 1;
                return (
                  <div className="historial-card" key={index}>
                    <div className="historial-encabezado">
                      <span className={`estado-label ${h.EstadoNuevo.toLowerCase()}`}>
                        {h.EstadoNuevo}
                      </span>
                      <span className="historial-fecha">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="historial-comentario">
                      <strong>Comentario:</strong> {h.Comentario || <em>Sin comentario</em>}
                    </p>
                    <p className="historial-atendido">
                      <strong>Atendido por:</strong> {h.usuario?.Nombre} ({h.usuario?.rol?.NombreRol}) - 📞 {h.usuario?.Telefono}
                    </p>

                    {esUltimo && feedback && (
                      <div className="feedback-aprendiz">
                        <strong>Mi Feedback:</strong><br />
                        <span>⭐ {feedback.Calificacion}/5</span><br />
                        <em>{feedback.Comentario}</em>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p>No hay historial aún.</p>
            )}
          </div>

          <h3>Dar Feedback al Instructor</h3>
          {!mostrarFeedback ? (
            <button onClick={() => setMostrarFeedback(true)} className="feedback-btn">
              💬 Enviar Feedback
            </button>
          ) : (
            <div className="formulario-feedback">
              <label>
                Calificación:
                <select value={calificacion} onChange={(e) => setCalificacion(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map(n => (
                    <option key={n} value={n}>{n} ⭐</option>
                  ))}
                </select>
              </label>

              <label>
                Comentario:
                <textarea value={comentarioFeedback} onChange={(e) => setComentarioFeedback(e.target.value)} />
              </label>

              <button onClick={enviarFeedback}>Enviar</button>
              <button className="cancelar-btn" onClick={() => setMostrarFeedback(false)}>Cancelar</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Aprendiz;
