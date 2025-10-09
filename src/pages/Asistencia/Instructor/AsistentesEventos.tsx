import React, { useEffect, useState } from "react";
import axios from "axios";

interface Usuario {
  Nombre: string;
  Apellido: string;
  Correo: string;
}

interface Asistente {
  Usuario?: Usuario;
}

interface Props {
  idEvento: number;
}

const AsistentesEvento: React.FC<Props> = ({ idEvento }) => {
  const [asistentes, setAsistentes] = useState<Asistente[]>([]);

  useEffect(() => {
    console.log("ID del evento recibido:", idEvento);
    const obtenerAsistentes = async () => {
      try {
        const response = await axios.get<Asistente[]>(
          `https://render-hhyo.onrender.com/api/relusuarioevento/asistentes/${idEvento}`
        );
        console.log("Respuesta del backend:", response.data);
        setAsistentes(response.data);
      } catch (error) {
        console.error("Error al obtener asistentes confirmados", error);
      }
    };

    if (idEvento) {
      obtenerAsistentes();
    }
  }, [idEvento]);

  return (
    <div>
      <h2>Asistentes Confirmados</h2>
      {asistentes.length === 0 ? (
        <p>No hay asistentes confirmados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
            </tr>
          </thead>
          <tbody>
            {asistentes.map((asistente, index) => (
              <tr key={index}>
               <td>{asistente.Usuario?.Nombre ?? "—"}</td>
<td>{asistente.Usuario?.Apellido ?? "—"}</td>
<td>{asistente.Usuario?.Correo ?? "—"}</td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AsistentesEvento;
