import React, { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import QRCode from "qrcode";
import axios from "axios";
import "./style/Constancia.css";
import { FaCheckCircle } from "react-icons/fa";
const objetivo = 80;

const ConstanciaSENA = () => {
  const [datos, setDatos] = useState(null);
  const [totalHoras, setTotalHoras] = useState(0);
  const [estadoConstancia, setEstadoConstancia] = useState(null);
  const [cargando, setCargando] = useState(true);
  const qrRef = useRef(null);
  const fetched = useRef(false);

  const idCertificado = `SENA-${Date.now()}`;
  const urlVerificacion = `https://activsena.com/certificados/verificar/${idCertificado}`;

  const handleDescargarPDF = () => {
    const elemento = document.querySelector(".constancia-container");
    html2pdf()
      .set({
        margin: 0.5,
        filename: `Constancia_${datos?.Nombre || "Aprendiz"}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .from(elemento)
      .save();
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

        if (newCacheUsuario && cacheAsistencias && cacheConstancia) {
          setDatos(JSON.parse(newCacheUsuario));
          const asistencias = JSON.parse(cacheAsistencias);
          const total = asistencias
            .filter((a) => a.AsiEstado === "Completa")
            .reduce((sum, a) => sum + (a.AsiHorasAsistidas || 0), 0);
          setTotalHoras(total);
          setEstadoConstancia(JSON.parse(cacheConstancia));
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

          const constanciaRes = await axios.get(
            `https://render-hhyo.onrender.com/api/constancia/usuario/${id}`,
            config
          );
          setEstadoConstancia(constanciaRes.data?.ConstanciaEstado);
          localStorage.setItem(
            "cache_constancia",
            JSON.stringify(constanciaRes.data?.ConstanciaEstado)
          );
        }

        QRCode.toCanvas(qrRef.current, urlVerificacion, { width: 100, margin: 1 });
      } catch (err) {
        console.error("❌ Error cargando datos de usuario o asistencia", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  if (cargando) return <p className="cargando">🔄 Cargando datos...</p>;
  if (!datos) return <p className="cargando">❌ Error cargando datos del usuario.</p>;

  // Conversión a horas y minutos
  const horasCompletas = Math.floor(totalHoras);
  const minutos = Math.round((totalHoras - horasCompletas) * 60);

  const haCumplido = totalHoras >= objetivo;
  const progreso = Math.min((totalHoras / objetivo) * 100, 100).toFixed(0);
  const nombreCompleto = `${datos.Nombre} ${datos.Apellido}`;

  return (
    <div className="constancia-wrapper">
      <div className="progreso-info">
        <p>
          Has completado{" "}
          <strong>
            {horasCompletas} {horasCompletas === 1 ? "hora" : "horas"} y {minutos} minutos
          </strong>{" "}
          de <strong>{objetivo} horas lúdicas</strong>.
        </p>
        <div className="barra-progreso">
          <div className="progreso" style={{ width: `${progreso}%` }}>
            {progreso}%
          </div>
        </div>
       {haCumplido && (
  <p className="estado-aprobado text-constancia">
    <FaCheckCircle style={{ color: "#FFFF", marginRight: "6px" }} />
    Puedes generar tu constancia
  </p>
)}
      </div>

      {haCumplido ? (
        <div className="constancia-container">
          <h1 className="titulo">CONSTANCIA DE HORAS LÚDICAS</h1>

          <p className="texto">
            ActivSena certifica que el aprendiz <strong>{nombreCompleto}</strong>, identificado con
            el documento No. <strong>{datos.IdentificacionUsuario}</strong>, ha cumplido
            satisfactoriamente con el total de <strong>{objetivo} horas</strong> lúdicas requeridas
            durante su proceso de formación.
          </p>

          <p className="texto">
            Pertenece a la ficha <strong>{datos.perfilAprendiz?.Ficha}</strong>, jornada{" "}
            <strong>{datos.perfilAprendiz?.Jornada}</strong>, del programa de formación{" "}
            <strong>{datos.perfilAprendiz?.ProgramaFormacion}</strong>.
          </p>

          <p className="texto">
            Constancia generada el <strong>{new Date().toLocaleDateString()}</strong> con ID de
            verificación <strong>{idCertificado}</strong>.
          </p>

          <div className="qr-section">
            <p>
              <strong>Verificación digital:</strong>
            </p>
            <canvas ref={qrRef} />
          </div>

          {estadoConstancia === "Aprobado" && (
            <div className="firmas">
              <div>
                <p className="subrayado">Firma Coordinador Académico</p>
                <p className="nombre-firma">Nombre Coordinador</p>
              </div>
              <div>
                <p className="subrayado">Firma Director Regional</p>
                <p className="nombre-firma">Nombre Director</p>
              </div>
            </div>
          )}

         <button className="btn-descargar" onClick={handleDescargarPDF}>
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
  Descargar Constancia PDF
</button>

        </div>
      ) : (
        <div className="mensaje-no-cumplido">
          <h2>😕 Aún no puedes generar tu constancia</h2>
          <p>
            Actualmente has completado{" "}
            <strong>
              {horasCompletas} {horasCompletas === 1 ? "hora" : "horas"} y {minutos} minutos
            </strong>{" "}
            de <strong>{objetivo}</strong> horas requeridas.
          </p>
          <p>¡Sigue participando y pronto podrás descargar tu certificado! 💪</p>
        </div>
      )}
    </div>
  );
};

export default ConstanciaSENA;
