import React from "react";
import { QRCodeCanvas } from "qrcode.react";

function QRGeneratorSalida() {
  const IdActividad = 9; // Cambia este valor si quieres otro ID
  const tipo = "salida";

  const payload = {
    IdActividad,
    tipo,
  };

  const qrValue = `activsenaqr://${btoa(JSON.stringify(payload))}`;

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>🎯 QR de **SALIDA** para Actividad #{IdActividad}</h2>
      <QRCodeCanvas value={qrValue} size={256} />
      <p style={{ marginTop: "1rem", wordBreak: "break-all" }}>{qrValue}</p>
    </div>
  );
}

export default QRGeneratorSalida;
