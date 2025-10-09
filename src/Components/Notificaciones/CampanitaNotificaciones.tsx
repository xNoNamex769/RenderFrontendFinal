import React,{ useEffect, useState } from "react";
import { getNotificacionesPorUsuario } from "../../services/notificacionService";
import { Bell } from "lucide-react"; // o usa cualquier ícono que tengas

interface Props {
  idUsuario: number;
  onClick?: () => void; // para abrir el panel si quieres
}

const CampanitaNotificaciones = ({ idUsuario, onClick }: Props) => {
  const [cantidadNoConfirmadas, setCantidadNoConfirmadas] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      const todas = await getNotificacionesPorUsuario(idUsuario);
      const noConfirmadas = todas.filter((n: any) => !n.Confirmado).length;
      setCantidadNoConfirmadas(noConfirmadas);
    };

    cargar();
  }, []);

  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      <Bell className="w-6 h-6 text-gray-600" />
      {cantidadNoConfirmadas > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
          {cantidadNoConfirmadas}
        </span>
      )}
    </div>
  );
};

export default CampanitaNotificaciones;
