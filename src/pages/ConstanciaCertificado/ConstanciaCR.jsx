import React, { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import axios from "axios";
import Swal from "sweetalert2";

import "./style/BannerFelicitaciones.css";
import { FaCheckCircle, FaAward, FaCertificate, FaTrophy } from "react-icons/fa";

const objetivo = 80;

const ConstanciaSENA = () => {
  const [datos, setDatos] = useState(null);
  const [totalHoras, setTotalHoras] = useState(0);
  const [estadoConstancia, setEstadoConstancia] = useState(null);
  const [cargando, setCargando] = useState(true);
  const fetched = useRef(false);
  const idCertificado = `SENA-${Date.now()}`;

  const handleDescargarPDF = () => {
    const elemento = document.querySelector(".csena-container");
    const banner = document.querySelector(".csena-banner");
    const boton = document.querySelector(".csena-btn");
    
    // Ocultar banner y botón antes de generar PDF
    if (banner) banner.style.display = "none";
    if (boton) boton.style.display = "none";
    
    html2pdf()
      .set({
        margin: 0.5,
        filename: `Constancia_${datos?.Nombre || "Aprendiz"}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .from(elemento)
      .save()
      .then(() => {
        // Restaurar banner y botón después de generar PDF
        if (banner) banner.style.display = "block";
        if (boton) boton.style.display = "inline-flex";
      });
  };

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = JSON.parse(atob(token.split(".")[1]));
        const id = decoded.IdUsuario;

        const cacheUsuario = localStorage.getItem("cache_usuario");
        if (cacheUsuario) {
          const usuarioCache = JSON.parse(cacheUsuario);
          if (usuarioCache.IdUsuario !== id) {
            localStorage.removeItem("cache_usuario");
            localStorage.removeItem("cache_asistencias");
            localStorage.removeItem("cache_constancia");
          }
        }

        const newCacheUsuario = localStorage.getItem("cache_usuario");
        const cacheAsistencias = localStorage.getItem("cache_asistencias");
        const cacheConstancia = localStorage.getItem("cache_constancia");

        if (newCacheUsuario && cacheAsistencias) {
          setDatos(JSON.parse(newCacheUsuario));
          const asistencias = JSON.parse(cacheAsistencias);
          const total = asistencias
            .filter((a) => a.AsiEstado === "Completa")
            .reduce((sum, a) => sum + (a.AsiHorasAsistidas || 0), 0);
          setTotalHoras(total);
          
          // Cargar constancia del caché si existe
          if (cacheConstancia) {
            try {
              setEstadoConstancia(JSON.parse(cacheConstancia));
            } catch (e) {
              setEstadoConstancia(null);
            }
          }
        } else {
          const config = { headers: { Authorization: `Bearer ${token}` } };

          const usuarioRes = await axios.get(
            `https://render-hhyo.onrender.com/api/usuario/${id}`,
            config
          );
          setDatos(usuarioRes.data);
          localStorage.setItem("cache_usuario", JSON.stringify(usuarioRes.data));

          const asistenciasRes = await axios.get(
            `https://render-hhyo.onrender.com/api/asistencia/usuario/${id}`,
            config
          );
          const total = asistenciasRes.data
            .filter((a) => a.AsiEstado === "Completa")
            .reduce((sum, a) => sum + (a.AsiHorasAsistidas || 0), 0);
          setTotalHoras(total);
          localStorage.setItem(
            "cache_asistencias",
            JSON.stringify(asistenciasRes.data)
          );

          // Intentar cargar constancia (no crítico si falla)
          try {
            const constanciaRes = await axios.get(
              `https://render-hhyo.onrender.com/api/constancia/usuario/${id}`,
              config
            );
            setEstadoConstancia(constanciaRes.data?.ConstanciaEstado);
            localStorage.setItem(
              "cache_constancia",
              JSON.stringify(constanciaRes.data?.ConstanciaEstado)
            );
          } catch (constanciaErr) {
            // Si no existe constancia (404), no es un error crítico
            if (constanciaErr.response?.status === 404) {
              console.log("ℹ️ No se encontró constancia previa para el usuario");
              setEstadoConstancia(null);
              localStorage.setItem("cache_constancia", JSON.stringify(null));
            } else {
              console.warn("⚠️ Error al cargar estado de constancia:", constanciaErr);
              setEstadoConstancia(null);
            }
          }
        }
      } catch (err) {
        console.error("❌ Error cargando datos de usuario o asistencia", err);
        
        // Solo mostrar error si es crítico (usuario o asistencias)
        if (err.response?.status !== 404 || err.config?.url?.includes('/usuario/') || err.config?.url?.includes('/asistencia/')) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los datos necesarios. Por favor, intenta nuevamente.",
            confirmButtonColor: "#5eb319",
          });
        }
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  if (cargando) return <p className="csena-cargando">🔄 Cargando datos...</p>;
  if (!datos) return <p className="csena-cargando">❌ Error cargando datos del usuario.</p>;

  const horasCompletas = Math.floor(totalHoras);
  const minutos = Math.round((totalHoras - horasCompletas) * 60);
  const haCumplido = totalHoras >= objetivo;
  const progreso = Math.min((totalHoras / objetivo) * 100, 100).toFixed(0);
  const nombreCompleto = `${datos.Nombre} ${datos.Apellido}`;

  return (
    <div className="csena-wrapper">
      {haCumplido ? (
        <div className="csena-container">
          {/* Banner de felicitaciones */}
          <div className="csena-banner">
            <div className="csena-banner-icon-wrapper">
              <FaTrophy className="csena-banner-trophy" />
            </div>
            <div className="csena-banner-content">
              <h2 className="csena-banner-title">¡Felicitaciones!</h2>
              <p className="csena-banner-subtitle">
                Has completado exitosamente tus horas lúdicas
              </p>
              <div className="csena-banner-stats">
                <div className="csena-stat">
                  <span className="csena-stat-number">{horasCompletas}</span>
                  <span className="csena-stat-label">{horasCompletas === 1 ? "Hora" : "Horas"}</span>
                </div>
                <div className="csena-stat-divider">:</div>
                <div className="csena-stat">
                  <span className="csena-stat-number">{minutos}</span>
                  <span className="csena-stat-label">Minutos</span>
                </div>
                <div className="csena-stat-total">
                  <FaCheckCircle className="csena-check-icon" />
                  <span>de {objetivo} horas requeridas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="csena-header">
            <div className="csena-header-icon">
              <FaCertificate size={60} />
            </div>
            <h1 className="csena-titulo">CONSTANCIA DE HORAS LÚDICAS</h1>
            <div className="csena-titulo-decoracion">
              <span className="csena-decor-line"></span>
              <FaTrophy className="csena-decor-icon" />
              <span className="csena-decor-line"></span>
            </div>
          </div>

          {/* Información aprendiz */}
          <div className="csena-info-aprendiz">
            <div className="csena-info-item">
              <span className="csena-info-label">Aprendiz</span>
              <span className="csena-info-value">{nombreCompleto}</span>
            </div>
            <div className="csena-info-item">
              <span className="csena-info-label">Documento</span>
              <span className="csena-info-value">
                {datos.IdentificacionUsuario}
              </span>
            </div>
          </div>

          {/* Texto principal */}
          <div className="csena-texto-principal">
            <p className="csena-texto">
              <strong>ActivSena</strong> certifica que el aprendiz mencionado ha
              cumplido satisfactoriamente con el total de{" "}
              <strong className="csena-horas">{objetivo} horas lúdicas</strong>{" "}
              requeridas durante su proceso de formación, demostrando
              compromiso, dedicación y participación activa.
            </p>
          </div>

          {/* Detalles */}
          <div className="csena-detalles">
            <div className="csena-detalle-card">
              <div className="csena-detalle-icon">📚</div>
              <div className="csena-detalle-content">
                <span className="csena-detalle-label">Ficha</span>
                <span className="csena-detalle-value">
                  {datos.perfilAprendiz?.Ficha}
                </span>
              </div>
            </div>
            <div className="csena-detalle-card">
              <div className="csena-detalle-icon">🕐</div>
              <div className="csena-detalle-content">
                <span className="csena-detalle-label">Jornada</span>
                <span className="csena-detalle-value">
                  {datos.perfilAprendiz?.Jornada}
                </span>
              </div>
            </div>
            <div className="csena-detalle-card csena-detalle-full">
              <div className="csena-detalle-icon">🎓</div>
              <div className="csena-detalle-content">
                <span className="csena-detalle-label">
                  Programa de Formación
                </span>
                <span className="csena-detalle-value">
                  {datos.perfilAprendiz?.ProgramaFormacion}
                </span>
              </div>
            </div>
          </div>

          {/* Emisión */}
          <div className="csena-emision">
            <div className="csena-emision-item">
              <FaAward className="csena-emision-icon" />
              <div>
                <span className="csena-emision-label">Fecha de Emisión</span>
                <span className="csena-emision-value">
                  {new Date().toLocaleDateString("es-CO", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="csena-emision-item">
              <FaCertificate className="csena-emision-icon" />
              <div>
                <span className="csena-emision-label">ID de Certificado</span>
                <span className="csena-emision-value">{idCertificado}</span>
              </div>
            </div>
          </div>

          {estadoConstancia === "Aprobado" && (
            <div className="csena-firmas">
              <div>
                <p className="csena-subrayado">Firma Coordinador Académico</p>
                <p className="csena-firma-nombre">Nombre Coordinador</p>
              </div>
              <div>
                <p className="csena-subrayado">Firma Director Regional</p>
                <p className="csena-firma-nombre">Nombre Director</p>
              </div>
            </div>
          )}

          <button className="csena-btn" onClick={handleDescargarPDF}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "8px" }}
            >
              <path d="M12 5v14m0 0l-6-6m6 6l6-6" />
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
            Descargar PDF
          </button>
        </div>
      ) : (
        <div className="csena-no-cumplido">
          <div className="csena-no-icon">
            <FaCertificate size={80} />
          </div>
          <h2>😕 Aún no puedes generar tu constancia</h2>
          <p>
            Actualmente has completado{" "}
            <strong>
              {horasCompletas} {horasCompletas === 1 ? "hora" : "horas"} y{" "}
              {minutos} minutos
            </strong>{" "}
            de <strong>{objetivo}</strong> horas requeridas.
          </p>
          <div className="csena-barra" style={{ marginTop: "1.5rem" }}>
            <div className="csena-barra-fill" style={{ width: `${progreso}%` }}>
              {progreso}%
            </div>
          </div>
          <p style={{ marginTop: "1.5rem", fontSize: "1.1rem" }}>
            ¡Sigue participando y pronto podrás descargar tu certificado! 💪
          </p>
        </div>
      )}
    </div>
  );
};

export default ConstanciaSENA;
