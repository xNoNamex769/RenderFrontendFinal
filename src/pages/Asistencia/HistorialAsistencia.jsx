import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/Historial.css'; 

const HistorialAsistencia = () => {
  const [historial, setHistorial] = useState([]);
  const IdUsuario = localStorage.getItem('IdUsuario');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const obtenerHistorial = async () => {
      try {
        const response = await axios.get(
          `https://render-hhyo.onrender.com/api/asistencia/historial/${IdUsuario}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setHistorial(response.data);
      } catch (error) {
        console.error('❌ Error al obtener historial:', error);
      }
    };

    if (IdUsuario && token) {
      obtenerHistorial();
    }
  }, [IdUsuario, token]);

  return (
    <div className="historial-container">
      <h2>📋 Historial de Asistencia</h2>
      <table className="historial-tabla">
       <thead>
  <tr>
    <th>Actividad</th>
    <th>Evento</th>
    <th>Fecha</th>
    <th>Entrada</th>
    <th>Registrada por</th>
    <th>Salida</th>
    <th>Registrada por</th>
    <th>Estado</th>
  </tr>
</thead>
<tbody>
  {historial.map((item, index) => (
    <tr key={index} className={item.estado === 'Completa' ? 'completa' : 'incompleta'}>
      <td>{item.actividad}</td>
      <td>{item.evento}</td>
      <td>{item.fecha}</td>

      {/* Entrada */}
      <td>{item.entrada ? `✔️ ${item.entradaHora}` : '❌'}</td>
      <td>{item.entrada ? item.entradaRegistradaPor : '---'}</td>

      {/* Salida */}
      <td>{item.salida ? `✔️ ${item.salidaHora}` : '❌'}</td>
      <td>{item.salida ? item.salidaRegistradaPor : '---'}</td>

      <td>
        {item.estado === 'Completa' ? (
          <span className="estado-completo">✅ Completa</span>
        ) : (
          <span className="estado-incompleto">⚠️ Incompleta</span>
        )}
      </td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
  );
};

export default HistorialAsistencia;
