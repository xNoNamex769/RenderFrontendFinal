import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './style/Escaner.css';


const QRScannerHtml5 = () => {
  const qrCodeRegionId = 'reader';
  const [mensaje, setMensaje] = useState('');
  const [color, setColor] = useState('text-black');
  const [exito, setExito] = useState(false);
  const [escaneando, setEscaneando] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  const procesarQR = async (textoQR: string) => {
    console.log("📦 Contenido decodificado:", textoQR);

    try {
      const payload = JSON.parse(textoQR);
      const tipo = (payload.tipo || "").toLowerCase();
      const token = localStorage.getItem('token');
      console.log("📌 Objeto decodificado:", payload);

      if (tipo === "alquiler") {
        // 🟢 Registro de alquiler
        const response = await axios.post(
          "https://render-hhyo.onrender.com/api/alquilerelementos/desde-qr",
          {
            IdElemento: payload.IdElemento,
            nombreElemento: payload.nombreElemento,
            nombreAprendiz: payload.nombreAprendiz || "Aprendiz desconocido",
            fechaDevolucion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            observaciones: "Desde escáner QR",
            codigo: payload.codigo || `ALQ-${Date.now()}`
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        localStorage.setItem("nuevoAlquiler", JSON.stringify({
          nombre: payload.nombreElemento || "Elemento desconocido",
          nombreAprendiz: payload.nombreAprendiz || "Aprendiz",
          fechaEntrega: new Date().toISOString().split('T')[0],
          fechaDevolucion: "",
          observaciones: "Desde escáner QR",
          cumplioConEntrega: false,
          codigo: payload.codigo || `ALQ-${Date.now()}`,
          estado: "En uso"
        }));

        setMensaje("✅ Alquiler registrado correctamente");
        setColor("text-green-600");
        setExito(true);
        setEscaneando(false);

        setTimeout(() => {
          navigate("/detalles-alquiler");
        }, 2500);

      } else if (tipo === "evento") {
        // 🔵 Registro de asistencia a evento
        const response = await axios.post(
          "https://render-hhyo.onrender.com/api/asistencia/evento/qr",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Si se desea actualizar estado de ludicas (opcional)
        if (payload.accion === "entrada" || payload.accion === "salida") {
          localStorage.setItem("refrescarHorasLudicas", "true");
        }

        setMensaje(response.data.mensaje || "✅ Asistencia a evento registrada");
        setColor("text-green-600");
        setExito(true);
        setEscaneando(false);

        setTimeout(() => {
          navigate("/historial");
        }, 2500);

      } else {
        // 🟡 Asistencia regular
        const response = await axios.post(
          "https://render-hhyo.onrender.com/api/asistencia/qr",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (payload.QREntrada && payload.QRSalida) {
          localStorage.setItem("refrescarHorasLudicas", "true");
        }

        setMensaje(response.data.mensaje || "✅ Asistencia registrada");
        setColor("text-green-600");
        setExito(true);
        setEscaneando(false);

        setTimeout(() => {
          navigate("/historial");
        }, 2500);
      }

    } catch (error: any) {
      console.error("❌ Error procesando QR:", error);

      if (error.response) {
        const data = error.response.data;
        const backendError =
          data?.error ||
          data?.message ||
          (Array.isArray(data?.errors) && data.errors.length > 0
            ? data.errors.map((e: any) => e.msg || JSON.stringify(e)).join(" | ")
            : "Error desconocido del servidor");

        console.log("🧾 Detalles del error:", backendError);
        setMensaje(`❌ ${backendError}`);
      } else if (error.request) {
        console.log("📡 No se recibió respuesta del servidor:", error.request);
        setMensaje("❌ No se recibió respuesta del servidor");
      } else {
        console.log("⚠️ Error al enviar la solicitud:", error.message);
        setMensaje("❌ Error al enviar la solicitud");
      }

      setColor("text-red-600");
      setEscaneando(false);
    }
  };

  const iniciarEscaneo = () => {
    if (escaneando) return;

    const html5QrCode = new Html5Qrcode(qrCodeRegionId);
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          html5QrCode.stop().then(() => html5QrCode.clear());
          procesarQR(decodedText);
        },
        () => {}
      )
      .then(() => setEscaneando(true))
      .catch((err) => {
        console.error("📷 Error al iniciar cámara:", err);
        setMensaje("Error al iniciar la cámara");
        setColor("text-red-600");
      });
  };

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      if (scanner && scanner.getState() === 2) {
        scanner.stop().then(() => scanner.clear()).catch(console.error);
      }
    };
  }, []);

  return (
    <div className="qr-container">
      
   <div className="qr-intro">
  <h2 className="qr-title">📲 Escanea tu código QR</h2>
  <p className="qr-description">
    Usa tu cámara para registrar <strong>asistencia</strong> a eventos o realizar <strong>alquileres</strong> de elementos de forma rápida y segura.
  </p>
  <p className="qr-note">
    Asegúrate de que el QR esté enfocado y con buena iluminación para una lectura correcta.
  </p>
</div>


      {!escaneando && !exito && (
        <button onClick={iniciarEscaneo} className="qr-btn">
          📷 Abrir Cámara
        </button>
      )}

      {!exito && <div id={qrCodeRegionId} className="qr-reader" />}

      {exito && (
        <div className="qr-success">
          <div className="qr-check">✅</div>
          <p className="qr-success-text">¡Registro completado!</p>
        </div>
      )}

      <p className={`qr-message ${color}`}>{mensaje}</p>
    </div>
  );
};

export default QRScannerHtml5;
