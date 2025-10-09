import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style/Admin.css";

const rolesDisponibles = [
  { id: 1, nombre: "Administrador" },
  { id: 2, nombre: "Aprendiz" },
  { id: 3, nombre: "Instructor" },
];

interface Usuario {
  IdUsuario: number;
  Nombre: string;
  Correo: string;
  IdRol: number;
}

const CambiarRol = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const obtenerUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://render-hhyo.onrender.com/api/usuario", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    }
  };

  const cambiarRol = async (idUsuario: number, nuevoRolId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://render-hhyo.onrender.com/api/usuario/cambiar-rol/${idUsuario}`,
        { IdRol: nuevoRolId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Rol actualizado correctamente");
      obtenerUsuarios(); // refrescar lista
    } catch (err) {
      console.error("Error al cambiar rol:", err);
      alert("❌ Error al cambiar rol");
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  return (
    <div className="cambiar-rol-container">
      <h2>🛠 Cambiar Rol de Usuarios</h2>

      <table className="tabla-roles">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.IdUsuario}>
              <td>{usuario.Nombre}</td>
              <td>{usuario.Correo}</td>
              <td>
                <select
                  value={usuario.IdRol}
                  onChange={(e) =>
                    cambiarRol(usuario.IdUsuario, parseInt(e.target.value))
                  }
                >
                  {rolesDisponibles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CambiarRol;
