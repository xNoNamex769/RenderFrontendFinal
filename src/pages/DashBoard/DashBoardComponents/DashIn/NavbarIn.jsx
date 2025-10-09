import React, { useEffect, useState, useRef } from "react";
import { FaBell, FaBars } from "react-icons/fa";
import avatar from "../img/avatar.png";
import { io } from "socket.io-client";
import Rotar from "../RotatingText/Rotar";
import {
  getNotificacionesPorUsuario,
  confirmarNotificacion,
} from "../../../../services/notificacionService";

export default function Navbar({ toggleMenu, setContenidoActual, cerrarSesion }) {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [animarCampana, setAnimarCampana] = useState(false);
  const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0);
  const sonidoAlerta = useRef(new Audio("/audio/notificacion.mp3"));
  const [busqueda, setBusqueda] = useState("");
const [resultados, setResultados] = useState([]);
const [mostrarResultados, setMostrarResultados] = useState(false);

// Simulación de datos globales de ejemplo
const elementosGlobales = [
  { nombre: "misfeedbacks", ruta: "panelfeedback" },
  { nombre: "MisEventos", ruta: "miseventos" },
 { nombre: "Calendarioactividades" ,ruta:"calendarioactividades"},
  { nombre: "Actividades", ruta: "actividades" },
  { nombre: "Calendario", ruta: "constanciacr" },
  { nombre: "PlanEvento", ruta: "planevento" },
   { nombre: "Aplicacion" , as:"Eventos", ruta: "aplicacion" },
  { nombre: "RegistroActividades", ruta: "registroactividades" },
  { nombre: "RegistroLudicas", ruta: "registroLudicas" },
  {nombre:"MisLudicas" , ruta:"misludicas"},
   {nombre:"AprobadosEventos" ,as:"EventosAprobados" , ruta:"aprobadoseventos"},
    {nombre:"feedback" ,as:"Feedbacks" , ruta:"feedback"},
     {nombre:"cartacontacto" ,as:"Contactos" , ruta:"cartacontacto"}
];

const manejarBusqueda = (valor) => {
  const limpio=valor.trim().toLowerCase()
  setBusqueda(valor);

  if (valor.trim() === "") {
    setResultados([]);
    setMostrarResultados(false);
    return;
  }

  const valorMin = valor.toLowerCase();

 const filtrados = elementosGlobales.filter((item) => {
    const nombre = (item.nombre || "").toLowerCase(); 
    const alias = (item.as || "").toLowerCase();
    return nombre.includes(limpio) || alias.includes(limpio); 
  });

  setResultados(filtrados);
  setMostrarResultados(true);
};


  const idUsuario = JSON.parse(localStorage.getItem("usuario"))?.IdUsuario;

  const toggleDropdown = () => setMostrarMenu((prev) => !prev);
  const irAPerfil = () => {
    setContenidoActual("perfil");
    setMostrarMenu(false);
  };
  const irConfig = () => {
    setContenidoActual("config");
    setMostrarMenu(false);
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
    const socket = io("https://render-hhyo.onrender.com");

    socket.on("connect", () => {
      console.log("✅ Conectado al socket:", socket.id);
    });

    socket.on("nuevaNotificacion", (data) => {
      console.log("🔔 Nueva notificación:", data);
      sonidoAlerta.current.play().catch((e) =>
        console.warn("No se pudo reproducir el sonido:", e)
      );
      setAnimarCampana(true);
      setTimeout(() => setAnimarCampana(false), 500);
      cargarNotificaciones();
    });

    return () => {
      socket.off("nuevaNotificacion");
    };
  }, []);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  return (
    
    
    <header className="encabezadodash">
       <Rotar />
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

     
      <nav className="accionesdash">
        <div className="relative">
          <button
            className={`iconodash relative  iconocampanita${animarCampana ? "animar-campana" : ""}`}
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
                      className={`notificacion-item  ${n.Confirmado ? "notificacion-confirmada" : ""}`}
                      style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                      onClick={() => {
                        if (n.RutaDestino) {
                          let rutaLimpia = n.RutaDestino.replace(/^\//, "").toLowerCase();
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
