// src/components/CodigosQRActividad.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CodigosQRActividad = ({ actividadId }: { actividadId: number }) => {
  const [qrEntrada, setQrEntrada] = useState<string | null>(null);
  const [qrSalida, setQrSalida] = useState<string | null>(null);
  const [datosQR, setDatosQR] = useState<{ nombreActividad: string, nombreEvento: string } | null>(null);

  useEffect(() => {
    const obtenerQRs = async () => {
      try {
        const res = await axios.get(`https://render-hhyo.onrender.com/api/actividad/${actividadId}`);
        const actividad = res.data;
        setQrEntrada(actividad.CodigoQR || null);
        setQrSalida(actividad.CodigoQRSalida || null);
        setDatosQR({
          nombreActividad: actividad.NombreActi,
          nombreEvento: actividad.evento?.NombreEvento || 'Evento sin nombre'
        });
      } catch (error) {
        console.error('Error obteniendo códigos QR:', error);
      }
    };

    if (actividadId) {
      obtenerQRs();
    }
  }, [actividadId]);

  if (!qrEntrada && !qrSalida) return <p>⏳ Cargando códigos QR...</p>;

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
      {qrEntrada && (
        <div className="p-2 border rounded-lg shadow">
          <h3 className="text-lg font-bold text-green-700 mb-2">📥 QR de Entrada</h3>
          <img src={qrEntrada} alt="Código QR Entrada" className="mx-auto w-40" />
          {datosQR && (
            <div className="mt-2 text-sm text-gray-700">
              <p><strong>Actividad:</strong> {datosQR.nombreActividad}</p>
              <p><strong>Evento:</strong> {datosQR.nombreEvento}</p>
              <p><strong>Tipo:</strong> Entrada</p>
            </div>
          )}
        </div>
      )}
      {qrSalida && (
        <div className="p-2 border rounded-lg shadow">
          <h3 className="text-lg font-bold text-blue-700 mb-2">📤 QR de Salida</h3>
          <img src={qrSalida} alt="Código QR Salida" className="mx-auto w-40" />
          {datosQR && (
            <div className="mt-2 text-sm text-gray-700">
              <p><strong>Actividad:</strong> {datosQR.nombreActividad}</p>
              <p><strong>Evento:</strong> {datosQR.nombreEvento}</p>
              <p><strong>Tipo:</strong> Salida</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodigosQRActividad;
