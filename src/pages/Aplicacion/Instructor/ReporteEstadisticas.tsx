// ReporteEstadisticas.tsx
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import '../styles/Reportes.css';

type EventoConDatos = {
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
};

type Perfil = {
  Ficha?: string;
  ProgramaFormacion?: string;
  Jornada?: string;
};

type AsistenciaItem = {
  QREntrada?: string;
  QRSalida?: string;
  IdUsuario?: number;
  usuario?: {
    Nombre?: string;
    Apellido?: string;
    Correo?: string;
    perfilAprendiz?: Perfil;
  };
  Usuario?: {
    IdUsuario?: number;
    Nombre?: string;
    Apellido?: string;
    Correo?: string;
  };
};

type Props = {
  eventos: EventoConDatos[];
  asistencias: Record<number, AsistenciaItem[]>; // key = IdEvento
};

/* interfaces para evitar any implícitos */
interface FichaCount {
  ficha: string;
  count: number;
}

interface ParticipanteFrecuente {
  nombre: string;
  count: number;
}

// paleta agradable y neutra
const COLORS = ['#0d9488', '#06b6d4', '#7c3aed', '#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

export default function ReporteEstadisticas({ eventos, asistencias }: Props) {
  // Normalizar asistencias a array plano (sin usar flat())
  const allAsistencias = useMemo<AsistenciaItem[]>(() => {
    return Object.keys(asistencias).reduce<AsistenciaItem[]>((acc, key) => {
      const arr = asistencias[Number(key)];
      if (Array.isArray(arr)) acc = acc.concat(arr);
      return acc;
    }, []);
  }, [asistencias]);

  // Resumen por evento
  const resumenPorEvento = useMemo(() => {
    return eventos.map((ev) => {
      const lista = asistencias[ev.IdEvento] || [];
      const total = lista.length;
      const completos = lista.filter((a) => a.QREntrada && a.QRSalida).length;
      const soloEntrada = lista.filter((a) => a.QREntrada && !a.QRSalida).length;
      const sinRegistro = lista.filter((a) => !a.QREntrada && !a.QRSalida).length;
      return {
        IdEvento: ev.IdEvento,
        nombre: ev.NombreEvento,
        total,
        completos,
        soloEntrada,
        sinRegistro,
        tasaAsistencia: total === 0 ? 0 : Math.round((completos / total) * 100),
      };
    });
  }, [eventos, asistencias]);

  // Top fichas
  const fichaCounts = useMemo<FichaCount[]>(() => {
    const mapa: Record<string, number> = {};
    allAsistencias.forEach((a) => {
      const ficha = a.usuario?.perfilAprendiz?.Ficha ?? '—';
      mapa[ficha] = (mapa[ficha] || 0) + 1;
    });

    // Anotar tipo en el destructuring para evitar any implícito
    const arr: FichaCount[] = Object.keys(mapa).map((ficha) => ({
      ficha,
      count: mapa[ficha],
    }));
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, 8); // top 8 fichas
  }, [allAsistencias]);

  // Participantes frecuentes
  const participantesDestacados = useMemo<ParticipanteFrecuente[]>(() => {
    const mapa: Record<string, ParticipanteFrecuente> = {};
    allAsistencias.forEach((a) => {
      const correo = (a.usuario?.Correo ?? a.Usuario?.Correo ?? '').toLowerCase();
      const nombre =
        [a.usuario?.Nombre ?? a.Usuario?.Nombre, a.usuario?.Apellido ?? a.Usuario?.Apellido]
          .filter(Boolean)
          .join(' ') || correo || 'Anónimo';
      if (!correo) return;
      if (!mapa[correo]) mapa[correo] = { nombre, count: 0 };
      mapa[correo].count += 1;
    });

    const arr: ParticipanteFrecuente[] = Object.keys(mapa).map((correo) => mapa[correo]);
    return arr.sort((a, b) => b.count - a.count).slice(0, 10);
  }, [allAsistencias]);

  // Datos para gráficas
  const dataConfirmacionAsistencia = useMemo(
    () =>
      resumenPorEvento.map((r) => ({
        name: r.nombre,
        Completos: r.completos,
        'Solo Entrada': r.soloEntrada,
        'Sin Registro': r.sinRegistro,
      })),
    [resumenPorEvento],
  );

  const dataFichasPie = useMemo(
    () => fichaCounts.map((f, i) => ({ name: f.ficha, value: f.count, color: COLORS[i % COLORS.length] })),
    [fichaCounts],
  );

  // KPIs
  const kpis = useMemo(() => {
    const totalEventos = eventos.length;
    const totalAsistencias = allAsistencias.length;
    const tasaMediaAsistencia = resumenPorEvento.length
      ? Math.round(resumenPorEvento.reduce((s, r) => s + r.tasaAsistencia, 0) / resumenPorEvento.length)
      : 0;
    return { totalEventos, totalAsistencias, tasaMediaAsistencia };
  }, [eventos, allAsistencias, resumenPorEvento]);

  return (
    <section className="reportes-contenedor">
      <div className="reportes-encabezado">
        <h3>Reporte de Estadísticas </h3>
        <p className="sub">Resumen rápido para tus eventos — visual, limpio y exportable.</p>
      </div>

      <div className="kpis-grid">
        <div className="kpi-card">
          <div className="kpi-title">Eventos creados</div>
          <div className="kpi-value">{kpis.totalEventos}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Registros totales</div>
          <div className="kpi-value">{kpis.totalAsistencias}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Tasa media asistencia (%)</div>
          <div className="kpi-value">{kpis.tasaMediaAsistencia}%</div>
        </div>
      </div>

      <div className="grids">
        <div className="grafico tarjeta">
          <h4>Asistencia por evento</h4>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={dataConfirmacionAsistencia} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Completos" stackId="a" fill={COLORS[0]} />
                <Bar dataKey="Solo Entrada" stackId="a" fill={COLORS[1]} />
                <Bar dataKey="Sin Registro" stackId="a" fill={COLORS[3]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grafico tarjeta">
          <h4>Top fichas (más asistentes)</h4>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={dataFichasPie} dataKey="value" nameKey="name" outerRadius={90} label>
                  {dataFichasPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grids">
        <div className="tarjeta lista-destacados">
          <h4>Participantes más frecuentes</h4>
          {participantesDestacados.length === 0 ? (
            <p className="muted">No hay participantes aún.</p>
          ) : (
            <ol>
              {participantesDestacados.map((p, i) => (
                <li key={i}>
                  <strong>{p.nombre}</strong> <span className="muted">— {p.count} registro(s)</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="tarjeta tabla-resumen">
          <h4>Resumen por evento</h4>
          <table className="tabla-resumen">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Total</th>
                <th>Completo</th>
                <th>Solo entrada</th>
                <th>Sin registro</th>
                <th>% Asist.</th>
              </tr>
            </thead>
            <tbody>
              {resumenPorEvento.map((r) => (
                <tr key={r.IdEvento}>
                  <td className="evt-name">{r.nombre}</td>
                  <td>{r.total}</td>
                  <td>{r.completos}</td>
                  <td>{r.soloEntrada}</td>
                  <td>{r.sinRegistro}</td>
                  <td>{r.tasaAsistencia}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="nota">
        <small>Consejo: Haz click en el nombre de un evento (en la tabla) si quieres crear una acción rápida como exportar o ver detalle.</small>
      </div>
    </section>
  );
}
