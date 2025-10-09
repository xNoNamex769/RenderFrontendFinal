import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../style/AdminLudicas.css";

interface Evento {
  IdEvento: number;
  actividad: string;
  entradas: number;
  completas: number;
  horas: number;
}

const VistaInteresEventosAdmin = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://render-hhyo.onrender.com/api/ludica/admin/resumen-ludicas");
      setEventos(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);



  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>Error: {error}</p>;

  const eventosConPorcentaje = Array.isArray(eventos)
    ? eventos.map((ev) => {
        const porcentaje = ev.entradas
          ? Math.round((ev.completas / ev.entradas) * 100)
          : 0;
        return { ...ev, porcentaje };
      })
    : [];

  return (
    <div className="vista-admin">
      <h2>📊 Resumen de Participación en Lúdicas</h2>
      <table className="tabla-interes">
        <thead>
          <tr>
            <th>Actividad</th>
            <th>Entradas</th>
            <th>Asistencias Completas</th>
            <th>Horas Totales</th>
            <th>Porcentaje Completo</th>
          </tr>
        </thead>
        <tbody>
          {eventosConPorcentaje.map((ev,index) => (
            <tr key={ev.IdEvento ?? index}>
              <td>{ev.actividad}</td>
              <td>{ev.entradas}</td>
              <td>{ev.completas}</td>
              <td>{typeof ev.horas === "number" ? ev.horas.toFixed(2) : "0.00"}</td>
              <td>{ev.porcentaje}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="btn-toggle-grafico"
        onClick={() => setMostrarGrafico((prev) => !prev)}
      >
        {mostrarGrafico ? "Ocultar gráfico" : "Mostrar gráfico"}
      </button>

      {mostrarGrafico && (
        <div className="grafico-container" style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={eventosConPorcentaje}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="actividad"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="porcentaje"
                fill="#82ca9d"
                name="Porcentaje Completo (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default VistaInteresEventosAdmin;
