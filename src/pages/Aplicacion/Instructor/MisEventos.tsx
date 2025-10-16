import React, { useEffect, useState } from "react";
import axios from "axios";
import AsistentesEvento from "../../Asistencia/Instructor/AsistentesEventos"; 
import Swal from 'sweetalert2';

import "../styles/MisEventos.css"
import { MdEvent, MdAccessTime, MdLocationOn, MdGroups, MdBarChart, MdQrCode2, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaDoorOpen, FaDoorClosed, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import ModalEstadisticas from "./ModalEstadisticas";





interface EventoConDatos {
  IdEvento: number;
  NombreEvento: string;
  FechaInicio: string;
  FechaFin: string;
  HoraInicio: string;
  HoraFin: string;
  UbicacionEvento: string;
  DescripcionEvento: string;
  QREntrada?: string;
  QRSalida?: string;
}

interface AsistenciaItem {
  QREntrada?: string;
  QRSalida?: string;
  IdUsuario?: number;

  usuario?: {
    Nombre?: string;
    Apellido?: string;
    Correo?: string;
    perfilAprendiz?: {
      Ficha?: string;
      ProgramaFormacion?: string;
      Jornada?: string;
    };
  };
  Usuario?: {
    IdUsuario?: number;
    Nombre?: string;
    Apellido?: string;
    Correo?: string;
  };
}

export default function MisEventos() {
  const [asistencias, setAsistencias] = useState<Record<number, AsistenciaItem[]>>({});
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [eventos, setEventos] = useState<EventoConDatos[]>([]);
  const [mostrarAsistentes, setMostrarAsistentes] = useState<Record<number, boolean>>({});
  const [qrVisible, setQrVisible] = useState<Record<number, boolean>>({});

  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<number | null>(null);

  // Toggle QR visibility
  const toggleQR = (id: number) => {
    setQrVisible(prev => ({ ...prev, [id]: !prev[id] }));
  };

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    setUsuarioId(decoded.IdUsuario);

    axios
      .get("https://render-hhyo.onrender.com/api/evento/evento/mis-eventos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const eventosTotales: EventoConDatos[] = res.data;

        // Fecha y hora actual
        const ahora = new Date();

        // Filtrar solo eventos que NO han terminado
        const eventosDisponibles = eventosTotales.filter((evento) => {
          const fechaFin = new Date(`${evento.FechaFin}T${evento.HoraFin}`);
          return fechaFin >= ahora;
        });

        setEventos(eventosDisponibles);
      })
      .catch((err) => console.error("❌ Error cargando eventos:", err));
  }
}, []);


  const obtenerAsistencias = async (IdEvento: number): Promise<AsistenciaItem[]> => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`https://render-hhyo.onrender.com/api/asistencia/evento/${IdEvento}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAsistencias((prev) => ({ ...prev, [IdEvento]: res.data }));
      return res.data;
    } catch (err: any) {
      // Si es 404, significa que no hay asistencias registradas (normal)
      if (err.response?.status === 404) {
        setAsistencias((prev) => ({ ...prev, [IdEvento]: [] }));
        return [];
      }
      console.error("❌ Error obteniendo asistencia:", err);
      return [];
    }
  };

  const compararYNotificar = async (IdEvento: number) => {
    const token = localStorage.getItem("token");
    const response = await axios.get<AsistenciaItem[]>(`https://render-hhyo.onrender.com/api/relusuarioevento/asistentes/${IdEvento}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const confirmados: AsistenciaItem[] = response.data;

    const asistenciaReal = await obtenerAsistencias(IdEvento);

    // Correos confirmados
    const correosConfirmados = confirmados
      .filter((a) => a.Usuario?.Correo)
      .map((a) => a.Usuario!.Correo!.toLowerCase());

    const correosAsistieron = asistenciaReal
      .filter((a) => a.usuario?.Correo)
      .map((a) => a.usuario!.Correo!.toLowerCase());

    // Confirmaron y asistieron
    const confirmaronYAsistieron = correosConfirmados.filter((correo) =>
      correosAsistieron.includes(correo)
    );

    // Confirmaron pero NO asistieron
    const confirmaronPeroNoAsistieron = correosConfirmados.filter(
      (correo) => !correosAsistieron.includes(correo)
    );

    // NO confirmaron pero SÍ asistieron
    const noConfirmaronPeroAsistieron = correosAsistieron.filter(
      (correo) => !correosConfirmados.includes(correo)
    );

    const total =
      confirmaronYAsistieron.length +
      confirmaronPeroNoAsistieron.length +
      noConfirmaronPeroAsistieron.length;

    if (total === 0) {
      Swal.fire("⚠️", "No hay datos para comparar.", "info");
      return;
    }

    const resultado = await Swal.fire({
      title: "¿Deseas notificar a los aprendices?",
      html: `
        <p><strong>${confirmaronYAsistieron.length}</strong> confirmo y asistio ✅</p>
        <p><strong>${confirmaronPeroNoAsistieron.length}</strong> confirmaron pero NO asistieron ❌</p>
        <p><strong>${noConfirmaronPeroAsistieron.length}</strong> NO confirmaron pero sí asistieron ⚠️</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, notificar",
      cancelButtonText: "Cancelar",
    });

    if (resultado.isConfirmed) {
      try {
        if (!usuarioId) throw new Error("Usuario no identificado");
        const hoy = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

      const idsConfirmaronYAsistieron = confirmados
  .filter(a => confirmaronYAsistieron.includes(a.Usuario?.Correo?.toLowerCase() ?? ""))
  .map(a => a.IdUsuario ?? a.Usuario?.IdUsuario)
  .filter(Boolean);

const idsConfirmaronPeroNoAsistieron = confirmados
  .filter(a => confirmaronPeroNoAsistieron.includes(a.Usuario?.Correo?.toLowerCase() ?? ""))
  .map(a => a.IdUsuario ?? a.Usuario?.IdUsuario)
  .filter(Boolean);

const idsNoConfirmaronPeroAsistieron = asistenciaReal
  .filter(a => noConfirmaronPeroAsistieron.includes(a.usuario?.Correo?.toLowerCase() ?? ""))
  .map(a => a.IdUsuario ?? a.Usuario?.IdUsuario) // <-- aquí cambia `a.Usuario?.IdUsuario` (mayúscula)
  .filter(Boolean);


const payloadConfirmadosYAsistieron = {
  Titulo: "Asistencia confirmada",
  Mensaje: "Gracias por asistir al evento. Valoramos tu compromiso y participación. 🌟",
  TipoNotificacion: "Evento",
  FechaDeEnvio: hoy,
  IdEvento: IdEvento,
  idUsuarios: idsConfirmaronYAsistieron,
  RutaDestino: null,
  imagenUrl: null,
};

console.log("Payload para confirmaron y asistieron:", payloadConfirmadosYAsistieron);
console.log("Payload para confirmaron y asistieron:", {
  Titulo: "Asistencia confirmada",
  Mensaje: "Gracias por asistir al evento. Valoramos tu compromiso y participación. 🌟",
  TipoNotificacion: "Evento",
  FechaDeEnvio: hoy,
  IdEvento: IdEvento,
  idUsuarios: idsConfirmaronYAsistieron,
  RutaDestino: null,
  imagenUrl: null,
});
console.log('idsConfirmaronPeroNoAsistieron:', idsConfirmaronPeroNoAsistieron);
console.log('idsNoConfirmaronPeroAsistieron:', idsNoConfirmaronPeroAsistieron);

await axios.post("https://render-hhyo.onrender.com/api/notificaciones", payloadConfirmadosYAsistieron);

        // Envío de notificaciones
        if (idsConfirmaronYAsistieron.length > 0) {
        await axios.post("https://render-hhyo.onrender.com/api/notificaciones", {
          Titulo: "Asistencia confirmada",
          Mensaje: "Gracias por asistir al evento. Valoramos tu compromiso y participación. 🌟",
          TipoNotificacion: "Evento",
          FechaDeEnvio: hoy,
          IdEvento: IdEvento,
          idUsuarios: idsConfirmaronYAsistieron,
          RutaDestino: null,
          imagenUrl: null,
        });
      }
if (idsConfirmaronPeroNoAsistieron.length > 0) {
        await axios.post("https://render-hhyo.onrender.com/api/notificaciones", {
          Titulo: "Asistencia no realizada",
          Mensaje: "Confirmaste tu asistencia, pero no te presentaste. Esto afecta tu participación y compromiso. ⚠️",
          TipoNotificacion: "Evento",
          FechaDeEnvio: hoy,
          IdEvento: IdEvento,
          idUsuarios: idsConfirmaronPeroNoAsistieron,
          RutaDestino: null,
          imagenUrl: null,
        });}
if (idsNoConfirmaronPeroAsistieron.length > 0) {
        await axios.post("https://render-hhyo.onrender.com/api/notificaciones", {
          Titulo: "Asistencia inesperada",
          Mensaje: "Gracias por asistir al evento. Sin embargo, no habías confirmado tu asistencia. Por favor recuerda hacerlo para próximos eventos. 📌",
          TipoNotificacion: "Evento",
          FechaDeEnvio: hoy,
          IdEvento: IdEvento,
          idUsuarios: idsNoConfirmaronPeroAsistieron,
          RutaDestino: null,
          imagenUrl: null,
        });
      }
        Swal.fire("✅ Notificaciones enviadas", "", "success");
      } catch (error: any) {
  console.error("❌ Error al enviar notificaciones:", error.response?.data || error.message || error);
  Swal.fire("Error", "No se pudieron enviar las notificaciones", "error");
}
    }
  };

  return (
    <div className="miseventos-wrapper">
      <div className="miseventos-container">
        <h2 className="miseventos-titulo">Mis Eventos Creados</h2>
        <p className="miseventos-descripcion">
          Aquí puedes ver tus eventos creados, revisar los registros de asistencia y enviar notificaciones o reportes a los participantes.
        </p>
      </div>

      {eventos.length === 0 && <p className="miseventos-sin-datos">No has creado eventos aún.</p>}

      {eventos.map((evento) => (
      <div key={evento.IdEvento} className="miseventos-evento-item">
        <div className="miseventos-card">
        <h3 className="miseventos-nombre">{evento.NombreEvento}</h3>
        <div className="miseventos-info">
          <p className="miseventos-info-item">
            <MdEvent className="miseventos-icono" /> {evento.FechaInicio}
          </p>
          <p className="miseventos-info-item">
            <MdAccessTime className="miseventos-icono" /> {evento.HoraInicio} - {evento.HoraFin}
          </p>
          <p className="miseventos-info-item">
            <MdLocationOn className="miseventos-icono" /> {evento.UbicacionEvento}
          </p>
        </div>
        <p className="miseventos-descripcion-evento">📝 {evento.DescripcionEvento}</p>

        {(evento.QREntrada || evento.QRSalida) && (
          <div className="miseventos-qr-section">
            <button 
              className="miseventos-qr-toggle-btn-modern"
              onClick={() => toggleQR(evento.IdEvento)}
            >
              <div className="miseventos-qr-toggle-content">
                <div className="miseventos-qr-toggle-left">
                  <MdQrCode2 className="miseventos-qr-icon" />
                  <span className="miseventos-qr-toggle-text">Códigos QR de Asistencia</span>
                </div>
                <div className="miseventos-qr-toggle-right">
                  {qrVisible[evento.IdEvento] ? (
                    <>
                      <MdVisibilityOff className="miseventos-toggle-icon" />
                      <span className="miseventos-toggle-label">Ocultar</span>
                    </>
                  ) : (
                    <>
                      <MdVisibility className="miseventos-toggle-icon" />
                      <span className="miseventos-toggle-label">Mostrar</span>
                    </>
                  )}
                </div>
              </div>
            </button>
            
            <div className={`miseventos-qr-content ${qrVisible[evento.IdEvento] ? 'miseventos-qr-visible' : 'miseventos-qr-hidden'}`}>
              <div className="miseventos-qr-contenedor">
                {evento.QREntrada && (
                  <div className="miseventos-qr-item">
                    <div className="miseventos-qr-badge">Entrada</div>
                    <img src={evento.QREntrada} alt={`QR de entrada - ${evento.NombreEvento}`} className="miseventos-qr-imagen" />
                    <div className="miseventos-qr-info">
                      <FaDoorOpen className="miseventos-qr-info-icon" />
                      <span>Escanear al ingresar</span>
                    </div>
                  </div>
                )}
                {evento.QRSalida && (
                  <div className="miseventos-qr-item">
                    <div className="miseventos-qr-badge miseventos-qr-badge-salida">Salida</div>
                    <img src={evento.QRSalida} alt={`QR de salida - ${evento.NombreEvento}`} className="miseventos-qr-imagen" />
                    <div className="miseventos-qr-info">
                      <FaDoorClosed className="miseventos-qr-info-icon" />
                      <span>Escanear al salir</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="miseventos-acciones">
          <button
            type="button"
            className="miseventos-btn miseventos-btn-asistencia"
            onClick={() => obtenerAsistencias(evento.IdEvento)}
            aria-label={`Ver asistencia de ${evento.NombreEvento}`}
          >
            <MdGroups className="miseventos-btn-icono" /> Ver asistencia
          </button>
          <button
            type="button"
            className="miseventos-btn miseventos-btn-estadisticas"
            onClick={() => {
            setEventoSeleccionadoId(evento.IdEvento);
            setMostrarReporte(true);
            }}
          >
            <MdBarChart className="miseventos-btn-icono" /> Ver estadísticas
          </button>

          <button
            type="button"
            className="miseventos-btn miseventos-btn-confirmados"
            onClick={() =>
            setMostrarAsistentes((prev) => ({ ...prev, [evento.IdEvento]: !prev[evento.IdEvento] }))
            }
            aria-label={`Ver asistentes confirmados ${evento.NombreEvento}`}
          >
            <MdGroups className="miseventos-btn-icono" /> {mostrarAsistentes[evento.IdEvento] ? "Ocultar" : "Ver"} confirmados
          </button>

          <button
            type="button"
            className="miseventos-btn miseventos-btn-comparar"
            onClick={() => compararYNotificar(evento.IdEvento)}
            aria-label={`Comparar asistencia y notificar ${evento.NombreEvento}`}
          >
            <MdBarChart className="miseventos-btn-icono" /> Comparar y notificar
          </button>
        </div>

        {mostrarAsistentes[evento.IdEvento] && (
          <AsistentesEvento idEvento={evento.IdEvento} />
        )}

        {asistencias[evento.IdEvento] && (
          <div className="miseventos-tabla-contenedor">
          <h4 className="miseventos-tabla-titulo">📊 Asistencia registrada</h4>
          <div className="miseventos-tabla-wrapper">
            <table className="miseventos-tabla">
              <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Ficha</th>
                <th>Programa</th>
                <th>Jornada</th>
                <th>Hora Entrada</th>
                <th>Hora Salida</th>
                <th>Estado</th>
              </tr>
              </thead>
              <tbody>
              {asistencias[evento.IdEvento].map((asistente, index) => (
                <tr key={index}>
                <td>
                  {asistente.usuario?.Nombre} {asistente.usuario?.Apellido}
                </td>
                <td>{asistente.usuario?.Correo}</td>
                <td>{asistente.usuario?.perfilAprendiz?.Ficha || "—"}</td>
                <td>{asistente.usuario?.perfilAprendiz?.ProgramaFormacion || "—"}</td>
                <td>{asistente.usuario?.perfilAprendiz?.Jornada || "—"}</td>
                <td>
                  {asistente.QREntrada
                  ? new Date(asistente.QREntrada).toLocaleTimeString("es-CO")
                  : "—"}
                </td>
                <td>
                  {asistente.QRSalida
                  ? new Date(asistente.QRSalida).toLocaleTimeString("es-CO")
                  : "—"}
                </td>
                <td>
                  {asistente.QREntrada && asistente.QRSalida ? (
                  <span className="miseventos-estado miseventos-estado-completo"><FaCheckCircle /> Completa</span>
                  ) : asistente.QREntrada ? (
                  <span className="miseventos-estado miseventos-estado-incompleto"><FaDoorOpen /> Solo entrada</span>
                  ) : (
                  <span className="miseventos-estado miseventos-estado-sin-registro"><FaTimesCircle /> Sin registro</span>
                  )}
                </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
        </div>
      </div>
      ))}
      {/* UNA SOLA INSTANCIA DEL MODAL (FUERA DEL map) */}
      <ModalEstadisticas
      open={mostrarReporte}
      onClose={() => {
        setMostrarReporte(false);
        setEventoSeleccionadoId(null);
      }}
      eventos={eventos}
      asistencias={asistencias}
      // Elimina la prop eventoSeleccionadoId si no existe en ModalEstadisticasProps
      />
    </div>
    
  );
}
