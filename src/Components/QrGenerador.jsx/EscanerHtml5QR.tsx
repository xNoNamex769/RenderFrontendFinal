import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  FaQrcode,
  FaLightbulb,
  FaCheckCircle,
  FaBoxOpen,
  FaBolt,
  FaCamera,
  FaSearch,
  FaClipboardList,
  FaShieldAlt,
  FaClock,
  FaChartLine,
  FaUsers,
  FaCalendarCheck,
  FaInfoCircle,
} from 'react-icons/fa';
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

        setMensaje("Alquiler registrado correctamente");
        setColor("text-green-600");
        setExito(true);
        setEscaneando(false);

        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Alquiler registrado correctamente",
          confirmButtonColor: "#5eb319",
          timer: 2500,
        });

        setTimeout(() => navigate("/detalles-alquiler"), 2500);

      } else if (tipo === "evento") {
        const response = await axios.post(
          "https://render-hhyo.onrender.com/api/asistencia/evento/qr",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (payload.accion === "entrada" || payload.accion === "salida") {
          localStorage.setItem("refrescarHorasLudicas", "true");
        }

        setMensaje(response.data.mensaje || "Asistencia a evento registrada");
        setColor("text-green-600");
        setExito(true);
        setEscaneando(false);

        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: response.data.mensaje || "Asistencia a evento registrada",
          confirmButtonColor: "#5eb319",
          timer: 2500,
        });

        setTimeout(() => navigate("/historial"), 2500);

      } else {
        const response = await axios.post(
          "https://render-hhyo.onrender.com/api/asistencia/qr",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (payload.QREntrada && payload.QRSalida) {
          localStorage.setItem("refrescarHorasLudicas", "true");
        }

        setMensaje(response.data.mensaje || "Asistencia registrada");
        setColor("text-green-600");
        setExito(true);
        setEscaneando(false);

        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: response.data.mensaje || "Asistencia registrada",
          confirmButtonColor: "#5eb319",
          timer: 2500,
        });

        setTimeout(() => navigate("/historial"), 2500);
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

        console.log(" Detalles del error:", backendError);
        setMensaje(`Error: ${backendError}`);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: backendError,
          confirmButtonColor: "#5eb319",
        });
      } else if (error.request) {
        console.log(" No se recibió respuesta del servidor:", error.request);
        setMensaje("No se recibió respuesta del servidor");
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se recibió respuesta del servidor",
          confirmButtonColor: "#5eb319",
        });
      } else {
        console.log(" Error al enviar la solicitud:", error.message);
        setMensaje("Error al enviar la solicitud");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al enviar la solicitud",
          confirmButtonColor: "#5eb319",
        });
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
        Swal.fire({
          icon: "error",
          title: "Error de cámara",
          text: "No se pudo acceder a la cámara. Verifica los permisos.",
          confirmButtonColor: "#5eb319",
        });
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
    <div className="qr-container-wrapper">
      {/* Header */}
      <div className="qr-intro">
        <h2 className="qr-title flex items-center gap-2">
          <FaQrcode className="text-blue-600" /> Escanea tu Código QR
        </h2>
        <p className="qr-description">
          Usa tu cámara para registrar <strong>asistencia</strong> a eventos o realizar <strong>alquileres</strong> de elementos de forma rápida y segura.
        </p>
        <p className="qr-note flex items-center gap-2">
          <FaLightbulb className="text-yellow-500" /> Asegúrate de que el QR esté enfocado y con buena iluminación.
        </p>
      </div>

      <div className="qr-main-layout">
        {/* Columna Izquierda - Información y Estadísticas */}
        <div className="qr-sidebar">
          {/* Estadísticas */}
          <div className="qr-stats-section">
            <h3 className="qr-sidebar-title">
              <FaChartLine /> Estadísticas del Sistema
            </h3>
            <div className="qr-stats-grid">
              <div className="qr-stat-card">
                <FaUsers className="qr-stat-icon" />
                <div className="qr-stat-info">
                  <span className="qr-stat-number">1,250+</span>
                  <span className="qr-stat-label">Usuarios Activos</span>
                </div>
              </div>
              <div className="qr-stat-card">
                <FaCalendarCheck className="qr-stat-icon" />
                <div className="qr-stat-info">
                  <span className="qr-stat-number">350+</span>
                  <span className="qr-stat-label">Eventos Registrados</span>
                </div>
              </div>
              <div className="qr-stat-card">
                <FaBoxOpen className="qr-stat-icon" />
                <div className="qr-stat-info">
                  <span className="qr-stat-number">500+</span>
                  <span className="qr-stat-label">Elementos Prestados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="qr-benefits-section">
            <h3 className="qr-sidebar-title">
              <FaShieldAlt /> Beneficios del Sistema QR
            </h3>
            <ul className="qr-benefits-list">
              <li className="qr-benefit-item">
                <FaBolt className="qr-benefit-icon" />
                <div>
                  <strong>Registro Instantáneo</strong>
                  <p>Escanea y registra en menos de 3 segundos</p>
                </div>
              </li>
              <li className="qr-benefit-item">
                <FaShieldAlt className="qr-benefit-icon" />
                <div>
                  <strong>100% Seguro</strong>
                  <p>Datos encriptados y protegidos</p>
                </div>
              </li>
              <li className="qr-benefit-item">
                <FaClock className="qr-benefit-icon" />
                <div>
                  <strong>Ahorra Tiempo</strong>
                  <p>Sin formularios ni papeleos</p>
                </div>
              </li>
              <li className="qr-benefit-item">
                <FaCheckCircle className="qr-benefit-icon" />
                <div>
                  <strong>Confirmación Inmediata</strong>
                  <p>Recibe notificación al instante</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Tips de Uso */}
          <div className="qr-tips-section">
            <h3 className="qr-sidebar-title">
              <FaInfoCircle /> Tips para un Escaneo Exitoso
            </h3>
            <div className="qr-tips-list">
              <div className="qr-tip-item">
                <span className="qr-tip-number">1</span>
                <p>Mantén el código QR a 15-20 cm de la cámara</p>
              </div>
              <div className="qr-tip-item">
                <span className="qr-tip-number">2</span>
                <p>Asegúrate de tener buena iluminación</p>
              </div>
              <div className="qr-tip-item">
                <span className="qr-tip-number">3</span>
                <p>Mantén el código QR sin reflejos ni sombras</p>
              </div>
              <div className="qr-tip-item">
                <span className="qr-tip-number">4</span>
                <p>Espera a que el sistema confirme el registro</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Escáner */}
        <div className="qr-content">
        {!escaneando && !exito && (
          <div className="qr-features">
            <div className="qr-feature-item">
              <FaCheckCircle className="qr-feature-icon text-green-500" />
              <p className="qr-feature-text">Asistencia a Eventos</p>
            </div>
            <div className="qr-feature-item">
              <FaBoxOpen className="qr-feature-icon text-blue-500" />
              <p className="qr-feature-text">Alquiler de Elementos</p>
            </div>
            <div className="qr-feature-item">
              <FaBolt className="qr-feature-icon text-yellow-500" />
              <p className="qr-feature-text">Registro Rápido</p>
            </div>
          </div>
        )}

        {!escaneando && !exito && (
          <button onClick={iniciarEscaneo} className="qr-btn flex items-center gap-2 justify-center">
            <FaCamera className="text-white text-lg" /> Abrir Cámara
          </button>
        )}

        {escaneando && !exito && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-4 animate-fadeIn">
            <p className="font-semibold text-yellow-800 flex items-center gap-2 text-lg">
              <FaSearch /> Escaneando... Enfoca el código QR
            </p>
          </div>
        )}

        {!exito && <div id={qrCodeRegionId} className="qr-reader" />}

        {exito && (
          <div className="qr-success">
            <FaCheckCircle className="text-green-600 text-5xl mb-2" />
            <p className="qr-success-text">¡Registro Completado!</p>
            <p className="text-green-700 font-medium mt-2">Redirigiendo...</p>
          </div>
        )}

        {mensaje && <p className={`qr-message ${color}`}>{mensaje}</p>}

      {/* Instrucciones adicionales */}
{!escaneando && !exito && (
  <div className="qr-instructions-container">
    <h3 className="qr-instructions-title">
      <FaClipboardList className="qr-instructions-icon" />
      Instrucciones de Uso
    </h3>
    <ul className="qr-instructions-list">
      <li><strong>Paso 1:</strong> Haz clic en "Abrir Cámara"</li>
      <li><strong>Paso 2:</strong> Permite el acceso a la cámara</li>
      <li><strong>Paso 3:</strong> Enfoca el código QR en el área marcada</li>
      <li><strong>Paso 4:</strong> Espera la confirmación del registro</li>
    </ul>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default QRScannerHtml5;
