import React from "react";
import { QRCodeCanvas } from "qrcode.react";

function QRGenerator({ IdActividad, tipo }) {
  // Construir el payload directamente con las props
  const payload = {
    IdActividad,
    tipo, // "entrada" o "salida"
  };

  // Convertir el payload a base64 para el valor del QR
  const qrValue = `activsenaqr://${btoa(JSON.stringify(payload))}`;

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>🎯 QR para Actividad #{IdActividad} ({tipo})</h2>
      <QRCodeCanvas value={qrValue} size={256} />
      <p style={{ marginTop: "1rem", wordBreak: "break-all" }}>{qrValue}</p>
    </div>
  );
}

export default QRGenerator;
