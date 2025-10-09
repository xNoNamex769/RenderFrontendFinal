import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../style/AdminConstancias.css";

const AdminConstancias = () => {
  const [constancias, setConstancias] = useState([]);

  useEffect(() => {
    const cargarConstancias = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("https://render-hhyo.onrender.com/api/constancia/admin/todas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConstancias(data);
      } catch (error) {
        console.error("❌ Error cargando constancias:", error);
      }
    };

    cargarConstancias();
  }, []);

  const aprobarConstancia = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `https://render-hhyo.onrender.com/api/constancia/aprobar/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Constancia aprobada ✅",
        text: "Se notificó al aprendiz exitosamente.",
      });

      setConstancias((prev) =>
        prev.map((c) =>
          c.ConstanciaId === id ? { ...c, ConstanciaEstado: "Aprobado" } : c
        )
      );
    } catch (error) {
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.bloqueado
      ) {
        Swal.fire({
          icon: "warning",
          title: "No se puede aprobar ❌",
          html:
            "Este aprendiz tiene préstamos pendientes.<br>" +
            "Debe devolver los elementos antes de que se le pueda generar la constancia.",
          showCancelButton: true,
          confirmButtonText: "🔍 Ver préstamos",
          cancelButtonText: "Cerrar",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/admin/prestamos";
          }
        });
      } else {
        console.error("❌ Error al aprobar constancia:", error);
      }
    }
  };

  return (
    <div className="admin-constancias">
      <h2>📄 Constancias Generadas</h2>
      {constancias.length === 0 ? (
        <p>No hay constancias generadas.</p>
      ) : (
      <table>
  <thead>
    <tr>
      <th>Aprendiz</th>
      <th>Documento</th>
      <th>Horas</th>
      <th>Estado</th>
      <th>Observación</th> {/* Nueva columna */}
      <th>Acción</th>
    </tr>
  </thead>
  <tbody>
    {constancias.map((c) => (
      <tr key={c.ConstanciaId}>
        <td>{c.usuario?.Nombre} {c.usuario?.Apellido}</td>
        <td>{c.usuario?.IdentificacionUsuario}</td>
        <td>{c.ConstanciaHorasCert}</td>
        <td>{c.ConstanciaEstado}</td>
        <td>
          {c.tieneDeuda
            ? " Tiene préstamos pendientes. No puede aprobar."
            : "✅ Ninguna"}
        </td>
        <td>
          {c.ConstanciaEstado === "Pendiente" && !c.tieneDeuda ? (
            <button onClick={() => aprobarConstancia(c.ConstanciaId)}>
              ✅ Aprobar
            </button>
          ) : c.ConstanciaEstado === "Pendiente" && c.tieneDeuda ? (
            <button disabled title="El aprendiz tiene préstamos pendientes">
              ❌ No puede aprobar
            </button>
          ) : (
            "✔️ Aprobada"
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>

      )}
    </div>
  );
};

export default AdminConstancias;
