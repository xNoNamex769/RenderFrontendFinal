import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaUserTie, FaCheckCircle, FaClock, FaTimesCircle, FaImage } from "react-icons/fa";
import "./styles/AprobarEventos.css";

// Interfaces
interface Usuario {
  Nombre: string;
  Apellido: string;
  Correo: string;
}

interface GestionEvento {
  Aprobar: string;
  MotivoRechazo?: string;
  gestionador?: Usuario;
}

interface Evento {
  IdPlanificarE: number;
  NombreEvento: string;
  FechaEvento: string;
  LugarDeEvento: string;
  ImagenEvento?: string;
  gestionEvento: GestionEvento;
  usuario: Usuario;
}

const MisEventos: React.FC = () => {
  const [misEventos, setMisEventos] = useState<Evento[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [motivoActual, setMotivoActual] = useState("");
  const navigate = useNavigate();

  // 🔹 Abrir modal
  const abrirModal = (motivo: string) => {
    setMotivoActual(motivo || "No especificado");
    setModalAbierto(true);
  };

  // 🔹 Cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false);
  };

  // 🔹 Cargar eventos del usuario
  const cargarMisEventos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Sesión requerida",
          text: "No estás autenticado.",
          confirmButtonColor: "#5eb319",
        });
        return;
      }

      const res = await axios.get(
        "https://render-hhyo.onrender.com/api/planificacionevento/mis-eventos",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMisEventos(res.data);
      console.log("✅ Eventos recibidos:", res.data);
    } catch (error) {
      console.error("❌ Error al cargar mis eventos", error);
    }
  };

  useEffect(() => {
    cargarMisEventos();
  }, []);

  return (
    <div className="aprobeventos-wrapper">
      <div className="aprobeventos-header">
        <h2 className="aprobeventos-titulo">Mis Eventos Planificados</h2>
        <p className="aprobeventos-descripcion">
          Aquí puedes ver el estado de tus eventos planificados y gestionar los rechazos.
        </p>
      </div>

      {misEventos.length === 0 ? (
        <div className="aprobeventos-sin-datos">
          <FaCalendarAlt className="aprobeventos-sin-datos-icono" />
          <p>No tienes eventos planificados aún.</p>
        </div>
      ) : (
      <div className="aprobeventos-tabla-contenedor">
        <table className="aprobeventos-tabla">
          <thead>
            <tr>
              <th><FaCalendarAlt className="aprobeventos-th-icono" /> Evento</th>
              <th><FaCalendarAlt className="aprobeventos-th-icono" /> Fecha</th>
              <th><FaMapMarkerAlt className="aprobeventos-th-icono" /> Lugar</th>
              <th><FaUserTie className="aprobeventos-th-icono" /> Gestionado por</th>
              <th><FaCheckCircle className="aprobeventos-th-icono" /> Estado</th>
              <th><FaImage className="aprobeventos-th-icono" /> Imagen</th>
            </tr>
          </thead>
          <tbody>
            {misEventos.map((evento) => (
              <tr key={evento.IdPlanificarE} className="aprobeventos-fila">
                <td className="aprobeventos-nombre-evento">{evento.NombreEvento}</td>
                <td>{new Date(evento.FechaEvento).toLocaleDateString('es-CO', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</td>
                <td>{evento.LugarDeEvento}</td>
                <td>
                  {evento.gestionEvento?.gestionador
                    ? `${evento.gestionEvento.gestionador.Nombre} ${evento.gestionEvento.gestionador.Apellido}`
                    : <span className="aprobeventos-no-asignado">No asignado</span>}
                </td>
                <td>
                  {evento.gestionEvento?.Aprobar === "Aprobado" ? (
                    <span className="aprobeventos-estado aprobeventos-estado-aprobado">
                      <FaCheckCircle /> Aprobado
                    </span>
                  ) : evento.gestionEvento?.Aprobar === "Pendiente" ? (
                    <span className="aprobeventos-estado aprobeventos-estado-pendiente">
                      <FaClock /> Pendiente
                    </span>
                  ) : (
                    <button
                      className="aprobeventos-btn-rechazo"
                      onClick={() =>
                        abrirModal(
                          evento.gestionEvento?.MotivoRechazo || "Motivo no especificado"
                        )
                      }
                    >
                      <FaTimesCircle /> Ver detalles
                    </button>
                  )}
                </td>
                <td>
                  {evento.ImagenEvento ? (
                    <img
                      src={
                        evento.ImagenEvento.startsWith("http")
                          ? evento.ImagenEvento
                          : `https://render-hhyo.onrender.com/uploads/${evento.ImagenEvento}`
                      }
                      alt="Evento"
                      className="aprobeventos-miniatura"
                    />
                  ) : (
                    <span className="aprobeventos-sin-imagen">Sin imagen</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Modal de rechazo */}
      {modalAbierto && (
        <div className="aprobeventos-modal-overlay" onClick={cerrarModal}>
          <div className="aprobeventos-modal-contenido" onClick={(e) => e.stopPropagation()}>
            <div className="aprobeventos-modal-header">
              <FaTimesCircle className="aprobeventos-modal-icono" />
              <h3 className="aprobeventos-modal-titulo">Motivo del Rechazo</h3>
            </div>
            <p className="aprobeventos-modal-texto">{motivoActual}</p>
            <div className="aprobeventos-modal-botones">
              <button className="aprobeventos-btn-modal aprobeventos-btn-cerrar" onClick={cerrarModal}>
                Cerrar
              </button>
              <button className="aprobeventos-btn-modal aprobeventos-btn-planificar" onClick={() => navigate("/planevento")}>
                Planificar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisEventos;
