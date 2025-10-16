import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./style/ReportesMejorado.css"; 

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
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

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

  const exportPDF = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header - Logo y título SENA
    pdf.setFillColor(94, 179, 25); // Verde SENA
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SENA', 15, 15);
    
    pdf.setFontSize(16);
    pdf.text('Reporte de Asistencia', 15, 25);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Actividad ID: ${actividadId}`, 15, 32);
    pdf.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, pageWidth - 60, 32);

    yPosition = 45;

    // Información general
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Resumen General', 15, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total de registros: ${asistencias.length}`, 15, yPosition);
    yPosition += 6;
    pdf.text(`Asistencias completas: ${aggregados.porEstado?.completa || 0}`, 15, yPosition);
    yPosition += 6;
    pdf.text(`Solo entrada: ${aggregados.porEstado?.soloEntrada || 0}`, 15, yPosition);
    yPosition += 6;
    pdf.text(`Sin registro: ${aggregados.porEstado?.sinRegistro || 0}`, 15, yPosition);
    yPosition += 12;

    // Tabla de asistencias
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Listado de Asistentes', 15, yPosition);
    yPosition += 5;

    const tableData = asistencias.map((r) => [
      `${r.usuario?.Nombre || ""} ${r.usuario?.Apellido || ""}`,
      r.usuario?.Correo || "",
      r.usuario?.perfilAprendiz?.Ficha || "—",
      r.usuario?.perfilAprendiz?.ProgramaFormacion || "—",
      r.QREntrada ? new Date(r.QREntrada).toLocaleTimeString('es-CO') : "—",
      r.QRSalida ? new Date(r.QRSalida).toLocaleTimeString('es-CO') : "—",
      r.QREntrada && r.QRSalida ? "Completa" : r.QREntrada ? "Solo entrada" : "Sin registro"
    ]);

    pdf.autoTable({
      startY: yPosition,
      head: [['Nombre', 'Correo', 'Ficha', 'Programa', 'Entrada', 'Salida', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [94, 179, 25],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 40 },
        2: { cellWidth: 15 },
        3: { cellWidth: 40 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 }
      },
      margin: { left: 15, right: 15 }
    });

    yPosition = pdf.lastAutoTable.finalY + 15;

    // Footer
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      pdf.text(
        'Generado por Sistema de Gestión SENA',
        15,
        pageHeight - 10
      );
    }

    pdf.save(`Reporte_Asistencia_Actividad_${actividadId}_${new Date().toLocaleDateString('es-CO').replace(/\//g, '-')}.pdf`);
  };

  const COLORS = ["#2E86AB", "#22C1A9", "#F6C85F", "#FF7A5A", "#9B8CFF", "#FF6B6B"];

  return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem', 
        paddingBottom: '0.75rem', 
        borderBottom: '3px solid #5eb319',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <h3 style={{ 
          fontSize: '1.75rem', 
          fontWeight: 800, 
          color: '#1f2937', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📊 Reporte de asistencia
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => fetchAsistencias(actividadId)} 
            disabled={loading}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              background: '#f3f4f6',
              color: '#6b7280',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            🔁 Actualizar
          </button>
          <button 
            onClick={exportCSV}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #5eb319, #3a7d13)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(94, 179, 25, 0.3)'
            }}
          >
            📥 Exportar CSV
          </button>
          <button 
            onClick={exportPDF}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontWeight: 600, borderLeft: '4px solid #dc2626' }}>{error}</div>}
      {loading && <div style={{ background: '#dcfce7', color: '#3a7d13', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontWeight: 600, textAlign: 'center', borderLeft: '4px solid #5eb319' }}>Cargando...</div>}

      <div ref={chartRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', border: '2px solid #dcfce7' }}>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1f2937', margin: '0 0 1rem 0', paddingBottom: '0.75rem', borderBottom: '2px solid #dcfce7' }}>📈 Fichas con más asistentes</h4>
          {aggregados.fichaArray?.length ? (
            <ResponsiveContainer width="100%" height={200}>
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
          ) : <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', fontSize: '0.9375rem', fontWeight: 600 }}>No hay datos por ficha</div>}
        </div>

        <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', border: '2px solid #dcfce7' }}>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1f2937', margin: '0 0 1rem 0', paddingBottom: '0.75rem', borderBottom: '2px solid #dcfce7' }}>📈 Estado de registros</h4>
          {aggregados.porEstado ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Completa", value: aggregados.porEstado.completa },
                    { name: "Solo entrada", value: aggregados.porEstado.soloEntrada },
                    { name: "Sin registro", value: aggregados.porEstado.sinRegistro },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
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
          ) : <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', fontSize: '0.9375rem', fontWeight: 600 }}>No hay datos de estado</div>}
        </div>

        <div style={{ background: '#fff', borderRadius: '1rem', padding: '1rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', border: '2px solid #dcfce7', gridColumn: '1 / -1' }}>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1f2937', margin: '0 0 1rem 0', paddingBottom: '0.75rem', borderBottom: '2px solid #dcfce7' }}>📈 Asistentes por programa</h4>
          {aggregados.programaArray?.length ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={aggregados.programaArray} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="programa" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count">
                  {aggregados.programaArray.map((entry, index) => (
                    <Cell key={`p-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', fontSize: '0.9375rem', fontWeight: 600 }}>No hay datos por programa</div>}
        </div>

        <div style={{ background: '#fff', borderRadius: '1rem', padding: '1rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', border: '2px solid #dcfce7', gridColumn: '1 / -1' }}>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1f2937', margin: '0 0 1rem 0', paddingBottom: '0.75rem', borderBottom: '2px solid #dcfce7' }}>📈 Asistentes por fecha</h4>
          {aggregados.fechaArray?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={aggregados.fechaArray}>
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke={COLORS[0]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', fontSize: '0.9375rem', fontWeight: 600 }}>No hay datos por fecha</div>}
        </div>

        <div style={{ background: '#fff', borderRadius: '1rem', padding: '1rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', border: '2px solid #dcfce7', gridColumn: '1 / -1' }}>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1f2937', margin: '0 0 1rem 0', paddingBottom: '0.75rem', borderBottom: '2px solid #dcfce7' }}>📈 Listado de asistentes (resumen)</h4>
          <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '2px solid #dcfce7', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }}>
              <thead style={{ background: 'linear-gradient(135deg, #5eb319, #3a7d13)', color: '#fff' }}>
                <tr>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Nombre</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Correo</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Ficha</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Programa</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Entrada</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Salida</th>
                </tr>
              </thead>
              <tbody>
                {asistencias.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem 0.75rem', color: '#1f2937', fontWeight: 500, fontSize: '0.9375rem' }}>{`${r.usuario?.Nombre || ""} ${r.usuario?.Apellido || ""}`}</td>
                    <td style={{ padding: '0.75rem 0.75rem', color: '#1f2937', fontWeight: 500, fontSize: '0.9375rem' }}>{r.usuario?.Correo || ""}</td>
                    <td style={{ padding: '0.75rem 0.75rem', color: '#1f2937', fontWeight: 500, fontSize: '0.9375rem' }}>{r.usuario?.perfilAprendiz?.Ficha || "—"}</td>
                    <td style={{ padding: '0.75rem 0.75rem', color: '#1f2937', fontWeight: 500, fontSize: '0.9375rem' }}>{r.usuario?.perfilAprendiz?.ProgramaFormacion || "—"}</td>
                    <td style={{ padding: '0.75rem 0.75rem', color: '#1f2937', fontWeight: 500, fontSize: '0.9375rem' }}>{r.QREntrada ? new Date(r.QREntrada).toLocaleTimeString() : "—"}</td>
                    <td style={{ padding: '0.75rem 0.75rem', color: '#1f2937', fontWeight: 500, fontSize: '0.9375rem' }}>{r.QRSalida ? new Date(r.QRSalida).toLocaleTimeString() : "—"}</td>
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
