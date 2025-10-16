import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/usuarioscargados.css";
import { FaChalkboardTeacher, FaUserShield, FaChevronUp, FaChevronDown, FaPhone, FaIdCard, FaBriefcase, FaMapMarkerAlt } from "react-icons/fa";

type Usuario = {
  id?: string | number;
  __key?: string;
  Nombre?: string;
  Apellido?: string;
  Correo?: string;
  Telefono?: string;
  Documento?: string;
  Rol?: "Administrador" | "Instructor";
  profesion?: string;
  ubicacion?: string;
  imagenPerfil?: string;
  imagenUbicacion?: string;
};

export default function UsuariosCargados() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [itemsPorPagina] = useState<number>(12);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const safeStr = (v: any) => (v === null || v === undefined ? "" : String(v).trim());

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchUsuarios = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("https://render-hhyo.onrender.com/api/usuario", {
          signal: controller.signal,
        });

    const normalized: Usuario[] = res.data
  .map((u: any, idx: number) => ({
    ...u,
    __key: u.id ?? u._id ?? `no-id-${idx}`,
    Nombre: safeStr(u.Nombre),
    Apellido: safeStr(u.Apellido),
    Correo: safeStr(u.Correo),
    Telefono: safeStr(u.Telefono),
    Documento: safeStr(u.IdentificacionUsuario ?? u.Documento),
    Rol: u.IdRol === 1 ? "Administrador" : u.IdRol === 3 ? "Instructor" : undefined,
    profesion: safeStr(u.perfilInstructor?.profesion),
    ubicacion: safeStr(u.perfilInstructor?.ubicacion),
    imagenPerfil: u.perfilInstructor?.imagen || "",
    imagenUbicacion: u.perfilInstructor?.imagenUbicacion || "",
  }))
  .filter((u: Usuario) => u.Rol); 


        if (mounted) setUsuarios(normalized);
      } catch (err: any) {
        if (!axios.isCancel(err)) {
          console.error(err);
          if (mounted) setError("Error al cargar usuarios");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsuarios();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const busq = busqueda.toLowerCase().trim();
    if (!busq) return true;

    return (
      safeStr(u.Nombre).toLowerCase().includes(busq) ||
      safeStr(u.Apellido).toLowerCase().includes(busq) ||
      safeStr(u.Correo).toLowerCase().includes(busq) ||
      safeStr(u.Documento).toLowerCase().includes(busq)
    );
  });
   const instructoresFiltrados = usuariosFiltrados.filter(u => u.Rol === "Instructor");
  const administradoresFiltrados = usuariosFiltrados.filter(u => u.Rol === "Administrador");

  // Paginación
  const totalPaginas = Math.ceil(usuariosFiltrados.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indiceInicio, indiceFin);

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
    const rango = 2;
    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) botones.push(i);
    } else {
      botones.push(1);
      if (paginaActual > rango + 2) botones.push('...');
      const inicio = Math.max(2, paginaActual - rango);
      const fin = Math.min(totalPaginas - 1, paginaActual + rango);
      for (let i = inicio; i <= fin; i++) botones.push(i);
      if (paginaActual < totalPaginas - rango - 1) botones.push('...');
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
    <div className="uc-contenedor">
      <div className="uc-header">
        <h2>Usuarios Registrados</h2>
        <p className="uc-intro">
          Lista de Administradores e Instructores. Filtra por nombre, correo o documento.
        </p>
      </div>
<div className="uc-contador">
  <p>
    <FaChalkboardTeacher style={{ marginRight: "0.5rem", color: "#f39c12" }} />
    Total instructores: <strong>{usuarios.filter(u => u.Rol === "Instructor").length}</strong> | 
    Coincidentes: <strong>{instructoresFiltrados.length}</strong>
  </p>
  <p>
    <FaUserShield style={{ marginRight: "0.5rem", color: "#3498db" }} />
    Total administradores: <strong>{usuarios.filter(u => u.Rol === "Administrador").length}</strong> | 
    Coincidentes: <strong>{administradoresFiltrados.length}</strong>
  </p>
</div>



      {loading && <p className="uc-loading">Cargando usuarios...</p>}
      {error && <p className="uc-error">{error}</p>}

      <div className="uc-busqueda">
        <input
          type="text"
          placeholder="Buscar por nombre, correo o documento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {usuariosFiltrados.length > 0 ? (
        <>
          <div className="uc-info-paginacion">
            <p className="uc-info-texto">
              Mostrando <strong>{indiceInicio + 1}</strong> a <strong>{Math.min(indiceFin, usuariosFiltrados.length)}</strong> de <strong>{usuariosFiltrados.length}</strong> usuarios
            </p>
          </div>

          <div className="uc-tabla-wrapper">
            <table className="uc-tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPaginados.map((u, i) => (
                  <React.Fragment key={u.__key}>
                    <tr>
                      <td>{indiceInicio + i + 1}</td>
                      <td>
                        <div className="uc-nombre-cell">
                          <span className="uc-nombre-completo">{u.Nombre} {u.Apellido}</span>
                        </div>
                      </td>
                      <td>{u.Correo || "-"}</td>
                      <td>
                        <span className={`uc-badge ${u.Rol === 'Administrador' ? 'uc-badge-admin' : 'uc-badge-instructor'}`}>
                          {u.Rol}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="uc-btn-expandir"
                          onClick={() => toggleExpand(u.__key!)}
                          title={expandidos.has(u.__key!) ? "Ocultar detalles" : "Ver detalles"}
                        >
                          {expandidos.has(u.__key!) ? (
                            <>
                              <span className="uc-icono-flecha"><FaChevronUp /></span> Ocultar
                            </>
                          ) : (
                            <>
                              <span className="uc-icono-flecha"><FaChevronDown /></span> Ver más
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandidos.has(u.__key!) && (
                      <tr className="uc-fila-expandida">
                        <td colSpan={5}>
                          <div className="uc-detalles">
                            <div className="uc-detalles-grid">
                              <div className="uc-detalle-item">
                                <span className="uc-detalle-label"><FaPhone /> Teléfono:</span>
                                <span className="uc-detalle-valor">{u.Telefono || "No especificado"}</span>
                              </div>
                              <div className="uc-detalle-item">
                                <span className="uc-detalle-label"><FaIdCard /> Documento:</span>
                                <span className="uc-detalle-valor">{u.Documento || "No especificado"}</span>
                              </div>
                              <div className="uc-detalle-item">
                                <span className="uc-detalle-label"><FaBriefcase /> Profesión:</span>
                                <span className="uc-detalle-valor">{u.profesion || "No especificado"}</span>
                              </div>
                              <div className="uc-detalle-item">
                                <span className="uc-detalle-label"><FaMapMarkerAlt /> Ubicación:</span>
                                <span className="uc-detalle-valor">{u.ubicacion || "No especificado"}</span>
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
            <div className="uc-paginacion">
              <button
                className="uc-btn-paginacion"
                onClick={() => irAPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                ‹ Anterior
              </button>

              <div className="uc-numeros-paginacion">
                {generarBotonesPaginacion().map((boton, idx) => (
                  boton === '...' ? (
                    <span key={`dots-${idx}`} className="uc-dots">...</span>
                  ) : (
                    <button
                      key={boton}
                      className={`uc-btn-numero ${paginaActual === boton ? 'activo' : ''}`}
                      onClick={() => irAPagina(boton as number)}
                    >
                      {boton}
                    </button>
                  )
                ))}
              </div>

              <button
                className="uc-btn-paginacion"
                onClick={() => irAPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente ›
              </button>
            </div>
          )}
        </>
      ) : (
        !loading && <p className="uc-no-data">No hay usuarios que coincidan con la búsqueda.</p>
      )}
    </div>
  );
}
