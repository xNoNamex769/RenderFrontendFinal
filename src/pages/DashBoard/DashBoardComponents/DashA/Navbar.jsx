import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaBars } from "react-icons/fa";
import Rotar from "../RotatingText/Rotar";
import "../DashAp/styles/NavbarFix.css";

// Importa servicios (ajustá rutas si es necesario)
import {
  getNotificacionesPorUsuario,
  confirmarNotificacion,
} from "../../../../services/notificacionService";

export default function Navbar({ toggleMenu, setContenidoActual }) {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [animarCampana, setAnimarCampana] = useState(false);
  const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const sonidoAlerta = useRef(new Audio("/audio/notificacion2.mp3"));

  const elementosGlobales = [
    { nombre: "Calendario actividades", ruta: "calendarioactividades" },
    { nombre: "Actividades", ruta: "actividades" },
    { nombre: "Aplicacion", as: "Eventos", ruta: "aplicacion" },
    { nombre: "Registra rElemento", ruta: "registrarelemento" },
    { nombre: "Prestamos", ruta: "detallea" },
    { nombre: "feedback", ruta: "feedback" },
    { nombre: "Catalogo Elementos", ruta: "gestioncatalogo" },
    { nombre: "Constancia Aprendices", ruta: "adminconstancias" },
    { nombre: "Aprobar Eventos", ruta: "planificareventosadmin" },
    { nombre: "Registrar usuarios", ruta: "registro" },
    { nombre: "Registrar Aprendices", ruta: "subiraprendiz" },
    { nombre: "Lista De Aprendices", ruta: "aprendices" },
    { nombre: "Lista De Usuarios", ruta: "usuarios-registrados" },
    { nombre: "Elementos disponibles", ruta: "registroa" },
    { nombre: "carta contacto", as: "Contactos", ruta: "cartacontacto" },
  ];

  const idUsuario = JSON.parse(localStorage.getItem("usuario"))?.IdUsuario;

  const manejarBusqueda = (valor) => {
    const limpio = valor.trim().toLowerCase();
    setBusqueda(valor);

    if (valor.trim() === "") {
      setResultados([]);
      setMostrarResultados(false);
      return;
    }

    const filtrados = elementosGlobales.filter((item) => {
      const nombre = (item.nombre || "").toLowerCase();
      const alias = (item.as || "").toLowerCase();
      return nombre.includes(limpio) || alias.includes(limpio);
    });

    setResultados(filtrados);
    setMostrarResultados(true);
  };

  const confirmar = async (id) => {
    await confirmarNotificacion(id);
    cargarNotificaciones();
  };

  const cargarNotificaciones = async () => {
    if (!idUsuario) return;
    try {
      const data = await getNotificacionesPorUsuario(idUsuario);
      setNotificaciones(data);
      const nuevasNoLeidas = data.filter((n) => !n.Confirmado).length;

      if (nuevasNoLeidas > cantidadNoLeidas) {
        sonidoAlerta.current.play().catch((e) =>
          console.warn("No se pudo reproducir el sonido:", e)
        );
        setAnimarCampana(true);
        setTimeout(() => setAnimarCampana(false), 500);
      }

      setCantidadNoLeidas(nuevasNoLeidas);
    } catch (err) {
      console.error("Error al obtener notificaciones:", err);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  return (
    <header className="encabezadodash">
      <Rotar />

      {/* 🔍 Buscador */}
      <div className="contenedor-busqueda">
        <input
          type="text"
          placeholder="¿Qué quieres hacer hoy?"
          value={busqueda}
          onChange={(e) => manejarBusqueda(e.target.value)}
          onFocus={() => busqueda && setMostrarResultados(true)}
          onBlur={() => setTimeout(() => setMostrarResultados(false), 150)}
          className="input-busqueda-header"
        />

        {mostrarResultados && resultados.length > 0 && (
          <ul className="lista-resultados">
            {resultados.map((item, i) => (
              <li
                key={i}
                onClick={() => {
                  setContenidoActual(item.ruta);
                  setBusqueda("");
                  setMostrarResultados(false);
                }}
              >
                {item.as || item.nombre}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🔔 Notificaciones */}
      <nav className="accionesdash">
        <div className="relative">
          <button
            className={`iconodash relative iconocampanita${
              animarCampana ? " animar-campana" : ""
            }`}
            onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
          >
            <FaBell />
            {cantidadNoLeidas > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {cantidadNoLeidas}
              </span>
            )}
          </button>

          {mostrarNotificaciones && (
            <div className="dropdown-notificaciones">
              <div className="noti-header">
                <h3>🔔 Notificaciones</h3>
                <button
                  className="btn-cerrar-noti"
                  onClick={() => setMostrarNotificaciones(false)}
                >
                  ✖
                </button>
              </div>

              {notificaciones.length === 0 ? (
                <p>No hay notificaciones.</p>
              ) : (
                <ul>
                  {notificaciones.map((n) => (
                    <li
                      key={n.IdNotificacion}
                      className={`notificacion-item ${
                        n.Confirmado ? "notificacion-confirmada" : ""
                      }`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (n.RutaDestino) {
                          let rutaLimpia = n.RutaDestino
                            .replace(/^\//, "")
                            .toLowerCase();
                          if (rutaLimpia === "usuario/constancia") {
                            rutaLimpia = "constanciacr";
                          }
                          setContenidoActual(rutaLimpia);
                        }
                      }}
                    >
                      {n.imagenUrl && (
                        <img
                          src={n.imagenUrl}
                          alt="img"
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            marginRight: 10,
                            borderRadius: 6,
                          }}
                        />
                      )}
                      <div>
                        <strong>{n.Titulo}</strong>
                        <p>{n.Mensaje}</p>
                        <p className="fecha">
                          {new Date(n.FechaDeEnvio).toLocaleDateString()}
                        </p>
                        {!n.Confirmado && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmar(n.IdNotificacion);
                            }}
                          >
                            Confirmar ✅
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
