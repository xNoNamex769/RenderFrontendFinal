import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style/HorasLudicas.css";
import Swal from "sweetalert2";
import {
  FaTrophy,
  FaClock,
  FaCheckCircle,
  FaCalendarAlt,
  FaCertificate,
  FaStar,
  FaLightbulb,
  FaBullseye,
} from "react-icons/fa";

const objetivo = 80;

const HorasLudicas = () => {
  const [totalHoras, setTotalHoras] = useState(0);
  const [usuarioId, setUsuarioId] = useState(null);
  const [actividades, setActividades] = useState([]);

  const progreso = Math.min((totalHoras / objetivo) * 100, 100);
  const objetivoAlcanzado = totalHoras >= objetivo;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = JSON.parse(atob(token.split(".")[1]));
    const id = decoded.IdUsuario;
    setUsuarioId(id);

    const cargarDatos = async () => {
      try {
        const { data } = await axios.get(
          `https://render-hhyo.onrender.com/api/asistencia/usuario/${id}`
        );

        const asistenciasValidas = data.filter(
          (a) => a.AsiEstado === "Completa" && a.QREntrada && a.QRSalida
        );

        const actividadesFormateadas = asistenciasValidas.map((a) => ({
          horas: a.AsiHorasAsistidas || 1,
          fecha: a.AsiFecha?.split("T")[0],
          actividad: a.actividad?.NombreActi || "Lúdica",
        }));

        const total = asistenciasValidas.reduce(
          (sum, a) => sum + (a.AsiHorasAsistidas || 0),
          0
        );

        setActividades(actividadesFormateadas);
        setTotalHoras(total);

        if (localStorage.getItem("refrescarHorasLudicas")) {
          localStorage.removeItem("refrescarHorasLudicas");
        }
      } catch (err) {
        console.error("Error cargando datos lúdicos", err);
      }
    };

    cargarDatos();
  }, []);

  const formatearTiempo = (horasDecimales) => {
    if (!horasDecimales) return "0 h";

    const totalMin = Math.round(horasDecimales * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;

    if (h > 0 && m > 0) return `${h} h ${m} min`;
    if (h > 0) return `${h} h`;
    return `${m} min`;
  };

  return (
    <section className="horas-ludicas-container">
      {/* Header con íconos */}
      <header className="horas-ludicas-header">
        <div className="header-icon-wrapper">
          <FaTrophy size={50} className="header-icon" />
        </div>
        <div className="header-content">
          <h1 className="titulo-ludicas">
            <FaBullseye className="inline-icon" /> Tu Progreso en Actividades
            Lúdicas
          </h1>
          <p className="subtitulo-ludicas">
            Participa, aprende, diviértete y alcanza las{" "}
            <strong>{objetivo} horas</strong> requeridas para tu formación.
          </p>
          <p className="frase-motivacional">
            <FaLightbulb className="inline-icon" /> Aprender también es jugar,
            compartir y crecer
          </p>
        </div>
      </header>

      <div className="horas-ludicas-content">
        {/* Panel de resumen */}
        <aside className="horas-ludicas-summary">
          <div className="summary-header">
            <FaClock className="summary-icon" size={40} />
            <h3>Resumen de Progreso</h3>
          </div>

          <div className="horas-display">
            <div className="horas-numero">{formatearTiempo(totalHoras)}</div>
            <p className="horas-label">Horas Acumuladas</p>
          </div>

          <div className="progress-bar-wrapper">
            <div className="progress-info">
              <span>Progreso</span>
              <span className="progress-percentage">
                {Math.round(progreso)}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${
                  objetivoAlcanzado ? "progress-complete" : ""
                }`}
                style={{ width: `${progreso}%` }}
              >
                <span className="progress-text">{Math.round(progreso)}%</span>
              </div>
            </div>
          </div>

          {objetivoAlcanzado ? (
            <div className="mensaje-exito">
              <FaCheckCircle size={24} />
              <p>
                ¡Felicidades! Has alcanzado el objetivo de{" "}
                <strong>{objetivo} horas</strong>.
              </p>
            </div>
          ) : (
            <div className="mensaje-pendiente">
              <FaStar size={20} />
              <p>
                Te faltan{" "}
                <strong>{(objetivo - totalHoras).toFixed(1)} horas</strong> para
                llegar a <strong>{objetivo} horas</strong>
              </p>
            </div>
          )}

          <button
            className={`btn-certificado ${
              objetivoAlcanzado ? "" : "btn-disabled"
            }`}
            disabled={!objetivoAlcanzado}
            onClick={() => {
              if (objetivoAlcanzado) {
                Swal.fire({
                  icon: "success",
                  title: "🎓 Constancia disponible",
                  text: "Dirígete al menú de Constancias y haz clic en 'Descargar' para obtener tu certificado.",
                  confirmButtonText: "Entendido",
                  confirmButtonColor: "#16a34a",
                });
              }
            }}
          >
            <FaCertificate />
            {objetivoAlcanzado
              ? "Descargar Certificado"
              : "Certificado disponible al completar"}
          </button>
        </aside>

        {/* Lista de actividades */}
        <article className="horas-ludicas-activities">
          <div className="activities-header">
            <h3>
              <FaCalendarAlt className="inline-icon" /> Actividades Realizadas
            </h3>
            <span className="activities-count">
              {actividades.length} actividades
            </span>
          </div>

          {actividades.length === 0 ? (
            <div className="no-activities">
              <FaCalendarAlt size={50} />
              <p>Aún no has registrado actividades</p>
              <p className="no-activities-subtitle">
                Participa en eventos y talleres para acumular horas
              </p>
            </div>
          ) : (
            <ul className="activities-list">
              {actividades.map(({ actividad, horas, fecha }, idx) => (
                <li key={idx} className="actividad-item">
                  <div className="actividad-icon">
                    <FaCheckCircle />
                  </div>
                  <div className="actividad-content">
                    <span className="actividad-nombre">{actividad}</span>
                    <div className="actividad-meta">
                      <span className="actividad-fecha">
                        <FaCalendarAlt size={12} /> {fecha}
                      </span>
                      <span className="actividad-horas">
                        <FaClock size={12} /> {formatearTiempo(horas)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      {/* Sección informativa con íconos */}
      <section className="horas-ludicas-info">
        <div className="info-card">
          <div className="info-icon">
            <FaLightbulb size={30} />
          </div>
          <div className="info-content">
            <h3>¿Qué son las horas lúdicas?</h3>
            <p>
              Son actividades recreativas y educativas que ayudan a tu desarrollo
              personal y social.
            </p>
          </div>
        </div>
        <div className="info-card">
          <div className="info-icon">
            <FaBullseye size={30} />
          </div>
          <div className="info-content">
            <h3>¿Cómo acumular horas?</h3>
            <p>
              Participar en talleres, clases y eventos organizados cuenta como
              horas lúdicas. ¡Mantente activo!
            </p>
          </div>
        </div>
      </section>
    </section>
  );
};

export default HorasLudicas;
