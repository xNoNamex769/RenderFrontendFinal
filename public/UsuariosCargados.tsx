import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/usuarioscargados.css";
import { FaChalkboardTeacher,FaUserShield  } from "react-icons/fa";

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
        <div className="uc-tabla-wrapper">
          <table className="uc-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Documento</th>
                <th>Rol</th>
                <th>Profesión</th>
                <th>Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u, i) => (
                <tr key={u.__key}>
                  <td>{i + 1}</td>
                  <td>{u.Nombre} {u.Apellido}</td>
                  <td>{u.Correo || "-"}</td>
                  <td>{u.Telefono || "-"}</td>
                  <td>{u.Documento || "-"}</td>
                  <td>{u.Rol}</td>
                  <td>{u.profesion || "-"}</td>
                  <td>{u.ubicacion || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p className="uc-no-data">No hay usuarios que coincidan con la búsqueda.</p>
      )}
    </div>
  );
}
