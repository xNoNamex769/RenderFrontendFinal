import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const GraficoPromediosAyuda = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("https://render-hhyo.onrender.com/api/feedback/estadisticas/promedio-tipo-ayuda")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error al cargar estadísticas:", err));
  }, []);
console.log("Datos recibidos:", data);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Promedio por Tipo de Ayuda</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="TipoAyuda" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Bar dataKey="Promedio" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoPromediosAyuda;
