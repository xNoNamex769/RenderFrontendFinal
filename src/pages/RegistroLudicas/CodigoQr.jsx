import React from "react";
import QRCode from "react-qr-code";

const CodigoQRLudica = ({ ludica }) => {
  if (!ludica) return null;

  const qrData = JSON.stringify({
    tipo: "ludica",
    IdActividad: ludica.IdActividad,
    esLudica: true,
  });

  return (
    <div className="p-4 border rounded-lg shadow text-center">
      <h3 className="text-lg font-bold text-purple-700 mb-2">🎯 Código QR de Lúdica</h3>
      <QRCode value={qrData} size={200} className="mx-auto" />
      <div className="mt-2 text-sm text-gray-700">
        <p><strong>Actividad:</strong> {ludica.NombreActi}</p>
        <p><strong>Ubicación:</strong> {ludica.Ubicacion}</p>
        <p><strong>Tipo:</strong> Lúdica</p>
      </div>
    </div>
  );
};

export default CodigoQRLudica;
