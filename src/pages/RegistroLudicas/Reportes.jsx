import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./style/Reportes.css"; 

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

import Papa from "papaparse";
import html2canvas from "html2canvas";

export default function ReporteAsistencia({ actividadId, tokenOverride }) {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aggregados, setAggregados] = useState({});
  const chartRef = useRef();

  useEffect(() => {
    if (!actividadId) return;
    fetchAsistencias(actividadId);
  }, [actividadId]);

  const getToken = () => tokenOverride || localStorage.getItem("token");

  const fetchAsistencias = async (id) => {
    const token = getToken();
    if (!token) {
      setError("No hay token disponible");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `https://render-hhyo.onrender.com/api/asistencia/actividad/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAsistencias(res.data || []);
      setAggregados(calcularAgregados(res.data || []));
    } catch (err) {
      console.error(err);
      setError("Error obteniendo asistencias");
    } finally {
      setLoading(false);
    }
  };

  const calcularAgregados = (rows) => {
    const porFicha = {};
    const porPrograma = {};
    const porEstado = { completa: 0, soloEntrada: 0, sinRegistro: 0 };
    const porFecha = {};

    rows.forEach((r) => {
      const ficha = r.usuario?.perfilAprendiz?.Ficha || "—";
      const programa = r.usuario?.perfilAprendiz?.ProgramaFormacion || "—";

      porFicha[ficha] = (porFicha[ficha] || 0) + 1;
      porPrograma[programa] = (porPrograma[programa] || 0) + 1;

      if (r.QREntrada && r.QRSalida) porEstado.completa += 1;
      else if (r.QREntrada) porEstado.soloEntrada += 1;
      else porEstado.sinRegistro += 1;

      const fechaRaw = r.QREntrada || r.createdAt || r.FechaRegistro || null;
      let fechaKey = "Sin fecha";
      if (fechaRaw) {
        const d = new Date(fechaRaw);
        if (!isNaN(d)) fechaKey = d.toISOString().slice(0, 10);
      }
      porFecha[fechaKey] = (porFecha[fechaKey] || 0) + 1;
    });

    const fichaArray = Object.entries(porFicha).map(([k, v]) => ({ ficha: k, count: v })).sort((a,b)=>b.count-a.count);
    const programaArray = Object.entries(porPrograma).map(([k, v]) => ({ programa: k, count: v })).sort((a,b)=>b.count-a.count);
    const fechaArray = Object.entries(porFecha).map(([k, v]) => ({ fecha: k, count: v })).sort((a,b)=>a.fecha.localeCompare(b.fecha));

    return { fichaArray, programaArray, porEstado, fechaArray };
  };

  const exportCSV = () => {
    if (!asistencias.length) return;
    const rows = asistencias.map((r) => ({
      Nombre: `${r.usuario?.Nombre || ""} ${r.usuario?.Apellido || ""}`.trim(),
      Correo: r.usuario?.Correo || "",
      Ficha: r.usuario?.perfilAprendiz?.Ficha || "",
      Programa: r.usuario?.perfilAprendiz?.ProgramaFormacion || "",
      Jornada: r.usuario?.perfilAprendiz?.Jornada || "",
      Entrada: r.QREntrada || "",
      Salida: r.QRSalida || "",
      Estado: r.QREntrada && r.QRSalida ? "Completa" : r.QREntrada ? "Solo entrada" : "Sin registro",
    }));

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_asistencia_actividad_${actividadId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = async () => {
    if (!chartRef.current) return;
    const node = chartRef.current;
    const canvas = await html2canvas(node, { scale: 2 });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_asistencia_${actividadId}.png`;
    a.click();
  };

  const COLORS = ["#2E86AB", "#22C1A9", "#F6C85F", "#FF7A5A", "#9B8CFF", "#FF6B6B"];

  return (
    <div className="ra-root">
      <div className="ra-header">
        <h3 className="ra-title">Reporte de asistencia</h3>
        <div className="ra-actions">
          <button className="ra-btn ra-btn-ghost" onClick={() => fetchAsistencias(actividadId)} disabled={loading}>🔁 Actualizar</button>
          <button className="ra-btn" onClick={exportCSV}>📥 Exportar CSV</button>
          <button className="ra-btn" onClick={exportPNG}>🖼️ Exportar PNG</button>
        </div>
      </div>

      {error && <div className="ra-error">{error}</div>}
      {loading && <div className="ra-loading">Cargando...</div>}

      <div ref={chartRef} className="ra-grid">
        <div className="ra-card">
          <h4 className="ra-card-title">Fichas con más asistentes</h4>
          {aggregados.fichaArray?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={aggregados.fichaArray}>
                <XAxis dataKey="ficha" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count">
                  {aggregados.fichaArray.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="ra-empty">No hay datos por ficha</div>}
        </div>

        <div className="ra-card">
          <h4 className="ra-card-title">Estado de registros</h4>
          {aggregados.porEstado ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Completa", value: aggregados.porEstado.completa },
                    { name: "Solo entrada", value: aggregados.porEstado.soloEntrada },
                    { name: "Sin registro", value: aggregados.porEstado.sinRegistro },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  <Cell fill={COLORS[0]} />
                  <Cell fill={COLORS[1]} />
                  <Cell fill={COLORS[2]} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="ra-empty">No hay datos de estado</div>}
        </div>

        <div className="ra-card ra-full">
          <h4 className="ra-card-title">Asistentes por programa</h4>
          {aggregados.programaArray?.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={aggregados.programaArray} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="programa" width={180} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count">
                  {aggregados.programaArray.map((entry, index) => (
                    <Cell key={`p-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="ra-empty">No hay datos por programa</div>}
        </div>

        <div className="ra-card ra-full">
          <h4 className="ra-card-title">Asistentes por fecha</h4>
          {aggregados.fechaArray?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={aggregados.fechaArray}>
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke={COLORS[0]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="ra-empty">No hay datos por fecha</div>}
        </div>

        <div className="ra-card ra-full">
          <h4 className="ra-card-title">Listado de asistentes (resumen)</h4>
          <div className="ra-table-wrap">
            <table className="ra-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Ficha</th>
                  <th>Programa</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                </tr>
              </thead>
              <tbody>
                {asistencias.map((r, i) => (
                  <tr key={i}>
                    <td>{`${r.usuario?.Nombre || ""} ${r.usuario?.Apellido || ""}`}</td>
                    <td>{r.usuario?.Correo || ""}</td>
                    <td>{r.usuario?.perfilAprendiz?.Ficha || "—"}</td>
                    <td>{r.usuario?.perfilAprendiz?.ProgramaFormacion || "—"}</td>
                    <td>{r.QREntrada ? new Date(r.QREntrada).toLocaleTimeString() : "—"}</td>
                    <td>{r.QRSalida ? new Date(r.QRSalida).toLocaleTimeString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
