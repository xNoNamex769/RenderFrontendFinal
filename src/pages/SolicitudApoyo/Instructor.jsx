import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./style/Instructor.css";
import { jwtDecode } from 'jwt-decode';


const obtenerIdInstructor = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token); // ✅ ahora sí es una función
    return decoded.IdUsuario || null;
  } catch (e) {
    console.error("Error al decodificar token:", e);
    return null;
  }
};

const Instructor = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [telefono, setTelefono] = useState('');
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarSolicitudesInstructor = async (id, token) => {
    try {
      setLoading(true);
      setError(null);

      const resSolicitudes = await axios.get(`https://render-hhyo.onrender.com/api/solicitudapoyo`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const todasSolicitudes = resSolicitudes.data;
      const tiposUnicos = [...new Set(todasSolicitudes.map(s => s.TipoAyuda))];

      const encargadosPorTipo = await Promise.all(
        tiposUnicos.map(tipo =>
          axios.get(`https://render-hhyo.onrender.com/api/solicitudapoyo/encargados/${tipo}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => ({ tipo, encargados: res.data }))
            .catch(err => {
              console.error(`Error al obtener encargados para tipo ${tipo}:`, err);
              return { tipo, encargados: [] };
            })
        )
      );

      let solicitudesInstructor = [];

      encargadosPorTipo.forEach(({ tipo, encargados }) => {
        const esEncargado = encargados.some(e => e.usuario?.IdUsuario === id);
        if (esEncargado) {
          const solicitudesFiltradas = todasSolicitudes.filter(s => s.TipoAyuda === tipo);
          solicitudesInstructor.push(...solicitudesFiltradas);
        }
      });

      setSolicitudes(solicitudesInstructor);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      setError("No se pudieron cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = obtenerIdInstructor();
    const token = localStorage.getItem('token');

    if (!id || !token) {
      setError("No se encontró sesión activa.");
      setLoading(false);
      return;
    }

    setLoading(true);
    axios.get(`https://render-hhyo.onrender.com/api/usuario/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setInstructor(res.data);
        setTelefono(res.data.Telefono || '');
        return cargarSolicitudesInstructor(id, token);
      })
      .catch(err => {
        console.error("Error al cargar instructor:", err);
        setError("Error al cargar datos del instructor.");
        setLoading(false);
      });
  }, []);

  const actualizarTelefono = () => {
    const token = localStorage.getItem('token');
    if (!instructor || !token) return;

    if (!/^\d{10}$/.test(telefono)) {
      alert("Número inválido. Debe tener exactamente 10 dígitos.");
      return;
    }

    setGuardando(true);
    axios.put(
      `https://render-hhyo.onrender.com/api/usuario/${instructor.IdUsuario}`,
      { Telefono: telefono },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
      .then(() => alert("Número actualizado correctamente"))
      .catch(err => {
        console.error("Error al actualizar teléfono:", err);
        alert("Error al actualizar número");
      })
      .finally(() => setGuardando(false));
  };

  const manejarCambio = async (solicitud) => {
    try {
      const IdInstructor = obtenerIdInstructor();
      const token = localStorage.getItem('token');
      if (!IdInstructor || !token) {
        alert("Error: no se pudo obtener el ID del instructor o token");
        return;
      }

      const nuevoEstado = solicitud.estado ?? solicitud.Estado;

      setGuardando(true);
      await axios.put(`https://render-hhyo.onrender.com/api/solicitudapoyo/${solicitud.IdSolicitud}`, {
        Estado: nuevoEstado
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await axios.post(`https://render-hhyo.onrender.com/api/historial`, {
        IdSolicitud: solicitud.IdSolicitud,
        EstadoNuevo: nuevoEstado,
        Comentario: solicitud.comentario || '',
        IdUsuario: IdInstructor
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Solicitud actualizada y registrada en historial');
      await cargarSolicitudesInstructor(IdInstructor, token);
    } catch (error) {
      console.error('Error al actualizar y registrar historial', error);
      alert('Hubo un error al actualizar la solicitud.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <div>Cargando solicitudes...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div className="instructor-container">
      <div className="form-contacto">
        <h3>📞 Mi número de contacto</h3>
        <input
          type="text"
          placeholder="Ingresa tu número"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          disabled={guardando}
        />
        <button onClick={actualizarTelefono} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Actualizar número'}
        </button>
      </div>

      {solicitudes.length === 0 && <p>No tienes solicitudes asignadas.</p>}

      {solicitudes.map((s) => (
        <div key={s.IdSolicitud} className="solicitud">
          <h3>
            {s.usuario?.Nombre} - {s.TipoAyuda}
            <span className={`badge ${((s.estado ?? s.Estado) || '').replace(/\s/g, '')}`}>
              {s.estado ?? s.Estado}
            </span>
          </h3>

          <p>{s.Descripcion}</p>

          <label>Comentario al aprendiz:</label>
          <textarea
            value={s.comentario || ''}
            onChange={(e) =>
              setSolicitudes((prev) =>
                prev.map((sol) =>
                  sol.IdSolicitud === s.IdSolicitud
                    ? { ...sol, comentario: e.target.value }
                    : sol
                )
              )
            }
            disabled={guardando}
          />

          <label>Estado:</label>
          <select
            value={s.estado ?? s.Estado}
            onChange={(e) =>
              setSolicitudes((prev) =>
                prev.map((sol) =>
                  sol.IdSolicitud === s.IdSolicitud
                    ? { ...sol, estado: e.target.value }
                    : sol
                )
              )
            }
            disabled={guardando}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Atendido">Atendido</option>
            <option value="Finalizado">Finalizado</option>
          </select>

          <button onClick={() => manejarCambio(s)} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Instructor;
