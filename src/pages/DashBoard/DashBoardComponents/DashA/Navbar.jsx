import { FaBell, FaBars } from "react-icons/fa";

import React, { useState } from "react";
import avatar from "../img/avatar.png";

import Rotar from "../RotatingText/Rotar";

export default function Navbar({ toggleMenu, setContenidoActual }) {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const elementosGlobales = [
    { nombre: "Calendario actividades", ruta: "calendarioactividades" },
    { nombre: "Actividades", ruta: "actividades" },

    { nombre: "Aplicacion", as: "Eventos", ruta: "aplicacion" },

    { nombre: "Registra rElemento", ruta: "registrarelemento" },

    { nombre: "Prestamos", ruta: "detallea" },
    { nombre: "feedback", ruta: "feedback" },
    { nombre: "Catalogo Elementos", ruta: "gestioncatalogo" },
    { nombre: "Constancia Aprendices", ruta: "adminconstancias" },
    {nombre:"Aprobar Eventos", ruta:"planificareventosadmin"},
    {nombre:"Registrar usuarios" ,ruta:"registro"},
    {nombre:"Registrar Aprendices", ruta:"subiraprendiz"},
    {nombre:"Lista De Aprendices",ruta:"aprendices"},
        {nombre:"Lista De Usuarios",ruta:"usuarios-registrados"},

    { nombre: "Elementos disponibles", ruta: "registroa" },
    { nombre: "carta contacto", as: "Contactos", ruta: "cartacontacto" },
  ];

  const manejarBusqueda = (valor) => {
    const limpio = valor.trim().toLowerCase();
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

  const toggleDropdown = () => {
    setMostrarMenu((prev) => !prev);
  };

  const irAPerfil = () => {
    setContenidoActual("perfil");
    setMostrarMenu(false);
  };

  const irConfig = () => {
    setContenidoActual("config");
    setMostrarMenu(false);
  };

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
        <button className="iconodash">
          <FaBell />
        </button>
      </nav>
    </header>
  );
}
