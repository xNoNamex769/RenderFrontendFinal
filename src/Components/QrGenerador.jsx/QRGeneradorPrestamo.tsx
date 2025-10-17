import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRGeneradorPrestamoProps {
  IdElemento: number;
  nombreElemento?: string;
}

// Este componente recibe el IdElemento y nombreElemento como props
export default function QRGeneradorPrestamo({ IdElemento, nombreElemento }: QRGeneradorPrestamoProps) {
  // Payload con formato correcto para el escáner
  const payload = {
    tipo: "alquiler",
    IdElemento: IdElemento,
    nombreElemento: nombreElemento || "Elemento",
    nombreAprendiz: "Aprendiz", // Se puede personalizar después
    codigo: `ALQ-${IdElemento}-${Date.now()}`
  };

  // Convertir a JSON string para el QR
  const qrValue = JSON.stringify(payload);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Escanea para registrar el préstamo</h3>
      <QRCodeCanvas value={qrValue} size={256} />
      <p style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        Elemento: {nombreElemento}
      </p>
    </div>
  );
}
