import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminEventos.css";

interface Usuario {
  Nombre: string;
  Apellido: string;
  Correo: string;
  rol?: {
    NombreRol: string;
  };
  perfilInstructor?: {
    Cargo: string;
    Profesion: string;
  };
}

interface GestionEvento {
  IdGestionE: number;
  Aprobar: string;
}

interface Planificacion {
  IdPlanificarE: number;
  NombreEvento: string;
  FechaEvento: string;
  LugarDeEvento: string;
  ImagenEvento?: string; // ahora contendrá la URL de Cloudinary
  usuario: Usuario;
  gestionEvento: GestionEvento;
}

const PlanificacionesEventos: React.FC = () => {
  const [eventos, setEventos] = useState<Planificacion[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [modalImagen, setModalImagen] = useState<string | null>(null);
  const [pestanaActiva, setPestanaActiva] = useState<"pendientes" | "aprobados">("pendientes");
  const [modalRechazoId, setModalRechazoId] = useState<number | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  // Rechazar evento
  const rechazarEvento = async (idGestionE: number, motivo: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://render-hhyo.onrender.com/api/gestionevento/rechazar/${idGestionE}`,
        { motivo },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMensaje("❌ Evento rechazado correctamente.");
      fetchEventos();
    } catch (error: any) {
      console.error("Error al rechazar evento", error);
      setMensaje(error.response?.data?.error || "Error al rechazar el evento");
    }
  };

  // Aprobar evento
  const aprobarEvento = async (idGestionE: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://render-hhyo.onrender.com/api/gestionevento/aprobar/${idGestionE}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMensaje("✅ Evento aprobado correctamente.");
      fetchEventos();
    } catch (error: any) {
      console.error("Error al aprobar evento", error);
      setMensaje(error.response?.data?.error || "❌ Error al aprobar");
    }
  };

  // Cargar eventos
  const fetchEventos = async () => {
    try {
      const res = await axios.get("https://render-hhyo.onrender.com/api/planificacionevento");
      setEventos(res.data);
    } catch (error) {
      console.error("Error al cargar eventos", error);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  // Filtros
  const eventosAprobados = eventos.filter((e) => e.gestionEvento?.Aprobar === "Aprobado");
  const eventosPendientes = eventos.filter((e) => e.gestionEvento?.Aprobar === "Pendiente");
  const eventosAMostrar = pestanaActiva === "pendientes" ? eventosPendientes : eventosAprobados;

  return (
    <div className="pe-contenedor">
      <h2 className="pe-titulo">🗓️ Planificaciones de Eventos</h2>

      {mensaje && <p className="pe-mensaje">{mensaje}</p>}

      {/* Pestañas */}
      <div className="pe-tabs">
        <button
          className={pestanaActiva === "pendientes" ? "pe-tab pe-tab-activa" : "pe-tab"}
          onClick={() => setPestanaActiva("pendientes")}
        >
          ⏳ Pendientes
        </button>
        <button
          className={pestanaActiva === "aprobados" ? "pe-tab pe-tab-activa" : "pe-tab"}
          onClick={() => setPestanaActiva("aprobados")}
        >
          ✅ Aprobados
        </button>
      </div>

      {/* Modal de rechazo */}
      {modalRechazoId && (
        <div className="modal-imagen-fondo" onClick={() => setModalRechazoId(null)}>
          <div className="modal-imagen-contenido" onClick={(e) => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={() => setModalRechazoId(null)}>✖</button>
            <h3>Motivo del rechazo</h3>
            <textarea
              rows={4}
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Escribe el motivo..."
              style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
            />
            <button
              className="pe-boton"
              onClick={() => {
                if (modalRechazoId && motivoRechazo.trim()) {
                  rechazarEvento(modalRechazoId, motivoRechazo.trim());
                  setModalRechazoId(null);
                  setMotivoRechazo("");
                } else {
                  alert("Debes escribir un motivo de rechazo.");
                }
              }}
            >
              Confirmar rechazo
            </button>
          </div>
        </div>
      )}

      {/* Tabla de eventos */}
      <table className="pe-tabla">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Evento</th>
            <th>Fecha</th>
            <th>Lugar</th>
            <th>Responsable</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {eventosAMostrar.map((e) => (
            <tr key={e.IdPlanificarE}>
              <td>
                {e.ImagenEvento ? (
                  <img
                    src={e.ImagenEvento} // ahora directamente URL de Cloudinary
                    alt="Imagen del evento"
                    className="pe-miniatura"
                    onClick={() => setModalImagen(e.ImagenEvento!)}
                    style={{ cursor: "pointer" }}
                    title="Ver imagen en grande"
                  />
                ) : (
                  <span>No hay imagen</span>
                )}
              </td>
              <td>{e.NombreEvento}</td>
              <td>{new Date(e.FechaEvento).toLocaleDateString()}</td>
              <td>{e.LugarDeEvento}</td>
              <td>{`${e.usuario.Nombre} ${e.usuario.Apellido}`}</td>
              <td>{e.usuario.rol?.NombreRol || "N/A"}</td>
              <td>
                {e.gestionEvento?.Aprobar === "Pendiente"
                  ? "⏳ Pendiente"
                  : "✅ Aprobado"}
              </td>
              <td>
                {e.gestionEvento?.Aprobar === "Pendiente" ? (
                  <>
                    <button
                      className="pe-boton"
                      onClick={() => {
                        if (e.gestionEvento?.IdGestionE) {
                          aprobarEvento(e.gestionEvento.IdGestionE);
                        } else {
                          alert("❌ No se encontró el ID de gestión del evento.");
                        }
                      }}
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      className="pe-boton pe-boton-rechazo"
                      onClick={() => setModalRechazoId(e.gestionEvento?.IdGestionE || null)}
                    >
                      ❌ Rechazar
                    </button>
                  </>
                ) : (
                  <span style={{ color: "green", fontWeight: "bold" }}>✔️</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para imagen ampliada */}
      {modalImagen && (
        <div className="modal-imagen-fondo" onClick={() => setModalImagen(null)}>
          <div className="modal-imagen-contenido" onClick={(e) => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={() => setModalImagen(null)}>✖</button>
            <img src={modalImagen} alt="Imagen ampliada" className="modal-imagen" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanificacionesEventos;
