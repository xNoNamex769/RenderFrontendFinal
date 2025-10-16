import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/aprendicesCargados.css";
import { FaUserGraduate, FaChevronUp, FaChevronDown, FaPhone, FaIdCard, FaGraduationCap, FaClock } from "react-icons/fa"; 

export default function AprendicesCargados() {
  type AprendizConUsuario = {
    id?: string | number;
    __key?: string;
    usuario?: {
      Nombre?: string;
      Apellido?: string;
      Correo?: string;
      Telefono?: string;
      Documento?: string;
      Ficha?: string;
      Programa?: string;
    };
    Ficha?: string;
    ProgramaFormacion?: string;
    Jornada?: string;
    [k: string]: any;
  };

  const [aprendices, setAprendices] = useState<AprendizConUsuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [itemsPorPagina] = useState<number>(15);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const safeStr = (v: any) =>
    v === null || v === undefined ? "" : String(v).trim();

  const firstNonEmpty = (obj: any, keys: string[]) => {
    if (!obj) return "";
    for (const k of keys) {
      if (typeof obj[k] !== "undefined" && obj[k] !== null) {
        const s = safeStr(obj[k]);
        if (s !== "") return s;
      }
    }
    return "";
  };

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchAprendices = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          "https://render-hhyo.onrender.com/api/aprendices/listar",
          { signal: controller.signal }
        );

        const rawData: any[] = Array.isArray(res.data)
          ? res.data
          : res.data?.aprendices ?? [];

        const normalized = rawData.map((item: any, idx: number) => {
          const ficha = firstNonEmpty(item, [
            "Ficha",
            "ficha",
            "fichaDetectada",
            "ficha_detectada",
          ]);
          const programa = firstNonEmpty(item, [
            "ProgramaFormacion",
            "programaFormacion",
            "programa_formacion",
            "programa",
            "Programa",
          ]);
          const jornada = firstNonEmpty(item, ["Jornada", "jornada"]);
          const nombre = firstNonEmpty(item?.usuario, ["Nombre", "nombre"]) || "";
          const apellido = firstNonEmpty(item?.usuario, ["Apellido", "apellido"]) || "";
          const correo = firstNonEmpty(item?.usuario, ["Correo", "correo", "email"]) || "";
          const telefono = firstNonEmpty(item?.usuario, ["Telefono", "telefono", "celular"]) || "";
          const documento = firstNonEmpty(item?.usuario, ["IdentificacionUsuario", "Documento", "documento", "cedula"]) || "";


       const stableKey = item.id ?? item._id ?? `${correo || documento || 'no-id'}-${idx}`;


          return {
            ...item,
            __key: String(stableKey),
            Ficha: ficha,
            ProgramaFormacion: programa,
            Jornada: jornada,
            usuario: {
              ...(item.usuario || {}),
              Nombre: nombre,
              Apellido: apellido,
              Correo: correo,
              Telefono: telefono,
              Documento: documento,
            },
          } as AprendizConUsuario;
        });

        if (mounted) setAprendices(normalized);
      } catch (err: any) {
        if (axios.isCancel(err)) console.log("Petición cancelada");
        else {
          console.error(err);
          if (mounted) setError("Error al cargar aprendices");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAprendices();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // Filtrado por búsqueda
const aprendicesFiltrados = aprendices.filter((a) => {
  const busq = busqueda.toLowerCase().trim();
  if (!busq) return true; // si no hay búsqueda, muestra todo

  const nombre = safeStr(a.usuario?.Nombre).toLowerCase();
  const apellido = safeStr(a.usuario?.Apellido).toLowerCase();
  const correo = safeStr(a.usuario?.Correo).toLowerCase();
  const documento = safeStr(a.usuario?.Documento).toLowerCase();

  // Búsqueda parcial: va mostrando coincidencias mientras escribe
  return (
    nombre.includes(busq) ||
    apellido.includes(busq) ||
    correo.includes(busq) ||
    documento.includes(busq)
  );
});

  // Cálculos de paginación
  const totalPaginas = Math.ceil(aprendicesFiltrados.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const aprendicesPaginados = aprendicesFiltrados.slice(indiceInicio, indiceFin);

  // Resetear a página 1 cuando cambia la búsqueda
  React.useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const irAPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const generarBotonesPaginacion = () => {
    const botones: (number | string)[] = [];
    const rango = 2; // Mostrar 2 páginas a cada lado de la actual

    if (totalPaginas <= 7) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPaginas; i++) {
        botones.push(i);
      }
    } else {
      // Siempre mostrar primera página
      botones.push(1);

      if (paginaActual > rango + 2) {
        botones.push('...');
      }

      // Páginas alrededor de la actual
      const inicio = Math.max(2, paginaActual - rango);
      const fin = Math.min(totalPaginas - 1, paginaActual + rango);

      for (let i = inicio; i <= fin; i++) {
        botones.push(i);
      }

      if (paginaActual < totalPaginas - rango - 1) {
        botones.push('...');
      }

      // Siempre mostrar última página
      botones.push(totalPaginas);
    }

    return botones;
  };

  const toggleExpand = (key: string) => {
    const newExpandidos = new Set(expandidos);
    if (newExpandidos.has(key)) {
      newExpandidos.delete(key);
    } else {
      newExpandidos.add(key);
    }
    setExpandidos(newExpandidos);
  };

 return (
  <div className="apc-contenedor">
    <div className="apc-header">
       
      <h2>Aprendices Registrados</h2>
      <p className="apc-intro">
        Aquí puedes ver todos los aprendices cargados en el sistema. Usa la barra de búsqueda para filtrar por documento o correo.
      </p>
    </div>

  <div className="apc-contador">
  <div className="apc-tarjeta">
    <FaUserGraduate className="apc-icono" />
    <div>
      <p className="apc-titulo">Total Aprendices</p>
      <p className="apc-numero">{aprendices.length}</p>
    </div>
  </div>

</div>


    {loading && <p className="apc-loading">Cargando aprendices...</p>}
    {error && <p className="apc-error">{error}</p>}

    <div className="apc-busqueda">
      <input
        type="text"
        placeholder="Buscar por documento o correo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
    </div>

    {aprendicesFiltrados.length > 0 ? (
      <>
        <div className="apc-info-paginacion">
          <p className="apc-info-texto">
            Mostrando <strong>{indiceInicio + 1}</strong> a <strong>{Math.min(indiceFin, aprendicesFiltrados.length)}</strong> de <strong>{aprendicesFiltrados.length}</strong> aprendices
          </p>
        </div>

        <div className="apc-tabla-wrapper">
          <table className="apc-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Ficha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {aprendicesPaginados.map((a, i) => (
                <React.Fragment key={a.__key}>
                  <tr>
                    <td>{indiceInicio + i + 1}</td>
                    <td>
                      <div className="apc-nombre-cell">
                        <span className="apc-nombre-completo">{a.usuario?.Nombre} {a.usuario?.Apellido}</span>
                      </div>
                    </td>
                    <td>{a.usuario?.Correo ?? "-"}</td>
                    <td>
                      <span className="apc-badge-ficha">{a.Ficha ?? "-"}</span>
                    </td>
                    <td>
                      <button 
                        className="apc-btn-expandir"
                        onClick={() => toggleExpand(a.__key!)}
                        title={expandidos.has(a.__key!) ? "Ocultar detalles" : "Ver detalles"}
                      >
                        {expandidos.has(a.__key!) ? (
                          <>
                            <span className="apc-icono-flecha"><FaChevronUp /></span> Ocultar
                          </>
                        ) : (
                          <>
                            <span className="apc-icono-flecha"><FaChevronDown /></span> Ver más
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandidos.has(a.__key!) && (
                    <tr className="apc-fila-expandida">
                      <td colSpan={5}>
                        <div className="apc-detalles">
                          <div className="apc-detalles-grid">
                            <div className="apc-detalle-item">
                              <span className="apc-detalle-label"><FaPhone /> Teléfono:</span>
                              <span className="apc-detalle-valor">{a.usuario?.Telefono || "No especificado"}</span>
                            </div>
                            <div className="apc-detalle-item">
                              <span className="apc-detalle-label"><FaIdCard /> Documento:</span>
                              <span className="apc-detalle-valor">{a.usuario?.Documento || "No especificado"}</span>
                            </div>
                            <div className="apc-detalle-item">
                              <span className="apc-detalle-label"><FaGraduationCap /> Programa:</span>
                              <span className="apc-detalle-valor">{a.ProgramaFormacion || "No especificado"}</span>
                            </div>
                            <div className="apc-detalle-item">
                              <span className="apc-detalle-label"><FaClock /> Jornada:</span>
                              <span className="apc-detalle-valor">{a.Jornada || "No especificado"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="apc-paginacion">
            <button
              className="apc-btn-paginacion apc-btn-prev"
              onClick={() => irAPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              title="Página anterior"
            >
              ‹ Anterior
            </button>

            <div className="apc-numeros-paginacion">
              {generarBotonesPaginacion().map((boton, idx) => (
                boton === '...' ? (
                  <span key={`dots-${idx}`} className="apc-dots">...</span>
                ) : (
                  <button
                    key={boton}
                    className={`apc-btn-numero ${paginaActual === boton ? 'activo' : ''}`}
                    onClick={() => irAPagina(boton as number)}
                  >
                    {boton}
                  </button>
                )
              ))}
            </div>

            <button
              className="apc-btn-paginacion apc-btn-next"
              onClick={() => irAPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              title="Página siguiente"
            >
              Siguiente ›
            </button>
          </div>
        )}
      </>
    ) : (
      !loading && <p className="apc-no-data">No hay aprendices que coincidan con la búsqueda.</p>
    )}
  </div>
);
}
