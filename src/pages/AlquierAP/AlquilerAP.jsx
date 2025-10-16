import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./style/AlquilerAP.css";
import bienestar from "../../../public/img/fondo1.jpeg";
import InventarioResumen from "./Inventario";
import {
  FaBox,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaClock,
  FaStar,
  FaBullseye,
  FaCubes,
} from "react-icons/fa";

// ⚡ Conexión a socket.io en Render
const socket = io("https://render-hhyo.onrender.com", {
  transports: ["websocket"],
});

const Alquiler = () => {
  const [imagenes, setImagenes] = useState([]);
  const [nuevaNotificacion, setNuevaNotificacion] = useState(null);

  // 🔹 Cargar catálogo desde backend
  const cargarCatalogo = async () => {
    try {
      const res = await axios.get(
        "https://render-hhyo.onrender.com/api/alquilerelementos/catalogo"
      );
      setImagenes(res.data);
    } catch (err) {
      console.error("Error cargando catálogo:", err);
    }
  };

  useEffect(() => {
    cargarCatalogo();

    // 🔔 Escuchar notificaciones en tiempo real
    socket.on("nuevaNotificacion", (data) => {
      if (data.tipo === "Elemento") {
        setNuevaNotificacion(data);
        cargarCatalogo();
      }
    });

    return () => {
      socket.off("nuevaNotificacion");
    };
  }, []);

  // 🔹 Placeholders
  const placeholders = [
    "futbol.jpg",
    "baloncesto.jpg",
    "danza.jpg",
    "parques.jpg",
    "domino.png",
    "juegos_mesa.jpg",
    "sapo.jpg",
    "logo-sena.png",
  ];

  // 🔹 Completar hasta 8 elementos
  const itemsCarrusel = [...imagenes];
  while (itemsCarrusel.length < 8) {
    const i = itemsCarrusel.length;
    itemsCarrusel.push({
      Imagen: placeholders[i],
      NombreElemento: "Disponible",
      esPlaceholder: true,
    });
  }

  return (
    <div className="alquiler-container">
      {/* Header con ícono en vez de emoji */}
      <header className="alquiler-header">
        <div className="header-icon-wrapper">
          <FaCubes size={50} className="header-icon" />
        </div>
        <div className="header-content">
          <h1 className="alquiler-titulo">
            <FaBox className="inline-icon" /> Préstamo de Elementos
          </h1>
          <p className="alquiler-subtitulo">
            Explora nuestro catálogo y solicita los elementos que necesitas
          </p>
        </div>
      </header>

      {/* 🔔 Notificación emergente */}
      {nuevaNotificacion && (
        <div className="notificacion-popup">
          <FaCheckCircle /> {nuevaNotificacion.titulo}: {nuevaNotificacion.mensaje}
        </div>
      )}

      {/* 🔹 Sección de Ubicación y Bienvenida (ARRIBA - Primera información visible) */}
      <section className="bienvenida-section">
        <div className="bienvenida-card">
          <div className="bienvenida-content">
            <div className="bienvenida-icon">
              <FaMapMarkerAlt size={40} className="icon-ubicacion" />
            </div>
            <div className="bienvenida-texto">
              <h2>
                <FaBox className="inline-icon" /> ¡Bienvenido al área de Préstamo
                de Elementos!
              </h2>
              <p>
                Aquí puedes explorar todos los elementos disponibles que Bienestar
                al Aprendiz tiene para ti. Si deseas hacer uso de algún elemento,
                dirígete directamente al área de Bienestar.
              </p>
              <div className="bienvenida-info-box">
                <FaMapMarkerAlt />
                <div>
                  <strong>Ubicación</strong>
                  <p>Bienestar del Aprendiz - Edificio Principal</p>
                </div>
              </div>
              <div className="bienvenida-info-box">
                <FaClock />
                <div>
                  <strong>Horario de Atención</strong>
                  <p>Lunes a Viernes: 7:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bienvenida-imagen">
            <img
              src={bienestar}
              alt="Ubicación Bienestar"
              className="ubicacion-imagen"
            />
          </div>
        </div>
      </section>

      {/* 🔹 Resumen de inventario */}
      <InventarioResumen elementos={imagenes} />

      {/* 🔹 Grid de elementos */}
      <section className="elementos-section">
        <div className="section-header">
          <h2>
            <FaBullseye className="inline-icon" /> Catálogo de Elementos Disponibles
          </h2>
          <span className="elementos-count">{imagenes.length} elementos</span>
        </div>

        <div className="elementos-grid">
          {itemsCarrusel.map((img, index) => (
            <div
              key={index}
              className={`elemento-card ${img.esPlaceholder ? "placeholder" : ""}`}
            >
              <div className="elemento-imagen-wrapper">
                <img
                  src={
                    img.esPlaceholder
                      ? `/img/${img.Imagen}`
                      : img.Imagen.startsWith("http")
                      ? img.Imagen
                      : `https://render-hhyo.onrender.com/uploads/${img.Imagen}`
                  }
                  alt={img.NombreElemento}
                  className="elemento-imagen"
                />
                {!img.esPlaceholder && (
                  <div className="elemento-badge">
                    <FaCheckCircle /> Disponible
                  </div>
                )}
              </div>
              <div className="elemento-info">
                <h3 className="elemento-nombre">{img.NombreElemento}</h3>
                {!img.esPlaceholder && (
                  <div className="elemento-meta">
                    <span className="elemento-estado">
                      <FaStar /> Popular
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Alquiler;
