import axios from "axios";
import React, { useEffect, useState } from "react";

interface Evento {
  IdPlanificarE: number;
  NombreEvento: string;
  FechaEvento: string;
  LugarDeEvento: string;
  Recursos: string;
  TipoEvento: string;
  ImagenEvento?: string | null;
}

const EventosPorTrimestre: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [anio, setAnio] = useState<number>(2025);
  const [trimestre, setTrimestre] = useState<number>(1);
const token = localStorage.getItem("token");
  const fetchEventos = async () => {
    try {
      const res = await axios.get(
        `https://render-hhyo.onrender.com/api/planificacionevento/trimestre/${anio}/${trimestre}`,{
            headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEventos(res.data);
    } catch (error) {
      console.error("Error al cargar eventos por trimestre:", error);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [anio, trimestre]);

  return (
    <div>
      <h2>Eventos del año {anio}, trimestre {trimestre}</h2>
      {/* Aquí puedes poner select o botones para cambiar anio y trimestre */}
      <ul>
        {eventos.map((evento) => (
          <li key={evento.IdPlanificarE}>
            {evento.NombreEvento} - {new Date(evento.FechaEvento).toLocaleDateString()} - {evento.LugarDeEvento}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventosPorTrimestre;
