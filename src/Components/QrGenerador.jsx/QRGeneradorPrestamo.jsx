import React from "react";
import { QRCodeCanvas } from "qrcode.react";

// Este componente recibe el IdElemento como prop
export default function QRGeneradorPrestamo({ IdElemento }) {
  // Endpoint real del backend
  const payload = {
    endpoint: "https://render-hhyo.onrender.com/alquiler/desde-qr", // Cambia esto si tienes ngrok o dominio
    IdElemento: IdElemento
  };

  // Codificamos el payload en base64 para el QR
  const qrValue = `activsenaqr://${btoa(JSON.stringify(payload))}`;

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Escanea para registrar el préstamo</h3>
      <QRCodeCanvas value={qrValue} size={256} />
    </div>
  );
}
