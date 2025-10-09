import axios from "axios";

const API_URL = "https://render-hhyo.onrender.com/api/notificaciones"; // Ajustar la  IP local

export const getNotificacionesPorUsuario = async (idUsuario: number) => {
  const res = await axios.get(`${API_URL}/${idUsuario}`, {
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  return res.data;
};


export const confirmarNotificacion = async (idNotificacion: number) => {
  const res = await axios.put(`${API_URL}/confirmar/${idNotificacion}`);
  return res.data;
};
