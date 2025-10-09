// src/components/LectorQR.tsx
import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface LectorQRProps {
  onScanSuccess: (codigo: string) => void;
}

const LectorQR: React.FC<LectorQRProps> = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "lector-qr", {
      fps: 10,
      qrbox: 250,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText); // Llama a tu función para registrar asistencia
        scanner.clear(); // Limpia el escáner
      },
      (error) => {
        // Puedes ignorar los errores de escaneo si quieres
        console.warn("QR Scan Error:", error);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScanSuccess]);

  return <div id="lector-qr" />;
};

export default LectorQR;
