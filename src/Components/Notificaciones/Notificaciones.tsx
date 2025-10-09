import React,{ useEffect, useState } from "react";
import {
  getNotificacionesPorUsuario,
  confirmarNotificacion,
} from "../../services/notificacionService";

interface Notificacion {
  IdNotificacion: number;
  Titulo: string;
  Mensaje: string;
  TipoNotificacion: string;
  FechaDeEnvio: string;
  Confirmado: boolean;
}

const Notificaciones = ({ idUsuario }: { idUsuario: number }) => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarNotificaciones = async () => {
    const data = await getNotificacionesPorUsuario(idUsuario);
    setNotificaciones(data);
    setLoading(false);
  };

  const confirmar = async (id: number) => {
    await confirmarNotificacion(id);
    cargarNotificaciones(); // refresca después de confirmar
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  if (loading) return <p>Cargando notificaciones...</p>;

  return (
    <div className="p-4 bg-white rounded shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">🔔 Notificaciones</h2>
      {notificaciones.length === 0 && <p>No hay notificaciones.</p>}
      <ul className="space-y-2">
        {notificaciones.map((n) => (
          <li
            key={n.IdNotificacion}
            className={`border p-2 rounded ${
              n.Confirmado ? "bg-green-100" : "bg-yellow-50"
            }`}
          >
            <div className="font-semibold">{n.Titulo}</div>
            <div className="text-sm">{n.Mensaje}</div>
            <div className="text-xs text-gray-500">
              {new Date(n.FechaDeEnvio).toLocaleDateString()}
            </div>
            {!n.Confirmado && (
              <button
                onClick={() => confirmar(n.IdNotificacion)}
                className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Confirmar ✅
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notificaciones;
