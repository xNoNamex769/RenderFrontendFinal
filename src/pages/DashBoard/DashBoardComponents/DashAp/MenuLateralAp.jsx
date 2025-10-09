import React, { useState } from "react";
import {
  FaHome,
  FaListAlt,
  FaRegCalendarCheck,
  FaRunning,
  FaRegCalendarAlt,
  FaStopwatch,
  FaGamepad,
  FaQrcode,
  FaUserGraduate,
  FaDiscourse,
  FaAddressBook,
  FaChevronDown,
  FaChevronRight,
  FaTimes,

  FaRegCaretSquareRight ,

  FaRegComments,
  FaRegUserCircle

} from "react-icons/fa";

import { MdEventAvailable, MdOutlinePermContactCalendar  } from "react-icons/md";
import { TfiWrite } from "react-icons/tfi";
import { LiaPeopleCarrySolid, LiaPersonBoothSolid } from "react-icons/lia";
import { VscFeedback } from "react-icons/vsc";
import { PiPersonSimpleThrowLight } from "react-icons/pi";
import { MdQrCode2 } from "react-icons/md";

import logo from "../../../../../public/img/logodef.png";
import avatar from "../img/avatar.png";
import "../DashA/style/MenuLateral.css";


import { useAuth } from "../../../../Context/AuthContext";
import { Toaster, toast } from "react-hot-toast";


export default function MenuLateral({ menuAbierto, toggleMenu, setContenidoActual }) {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [openSection, setOpenSection] = useState({
    participacion: true,
    gestion: true,
    otros: true,
  });

  const { logout } = useAuth(); // ✅ usamos logout

  const toggleDropdown = () => setMostrarMenu((prev) => !prev);
  const toggleSection = (section) =>
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));

  const irAPerfil = () => {
    setContenidoActual("perfil");
    setMostrarMenu(false);
  };

  const irConfig = () => {
    setContenidoActual("config");
    setMostrarMenu(false);
  };

  return (
    <aside className={`barradash ${menuAbierto ? "mostrar" : "ocultar"}`}>
      {/* Header usuario */}
      <section className="Clogodash">
        <div className="UserHeaderInfo" >
          <img src={avatar} alt="Usuario" className="avatardash" />
          <span className="nombredash">Aprendiz</span>
        </div>
        

        {mostrarMenu && (
          <div className="menudesplegabledash">
            <ul>
              <li className="opcionesm" onClick={irAPerfil}>Perfil</li>
              <li className="opcionesm" onClick={irConfig}>Configuración</li>
              <li className="opcionesm" onClick={logout}>Cerrar sesión</li> {/* ✅ funcional */}
            </ul>
          </div>
        )}
      </section>

      {/* Menú principal */}
      <nav className="menudash">

        <button onClick={() => setContenidoActual("userviewap")} className="opciondash">
          <FaHome className="iconodash" /> Inicio
        </button>

        <div className="grupo-menu">
          <button className="tituloseccion" onClick={() => toggleSection("participacion")}>
            {openSection.participacion ? <FaChevronDown /> : <FaChevronRight />} Participación
          </button>
          {openSection.participacion && (
            <>
              <button onClick={() => setContenidoActual("actividades")} className="opciondash">
                <PiPersonSimpleThrowLight className="iconodash" /> Actividades
              </button>
              <button onClick={() => setContenidoActual("aplicacion")} className="opciondash">
                <MdEventAvailable className="iconodash" /> Eventos
              </button>
              <button onClick={() => setContenidoActual("ludicas")} className="opciondash">
                <FaRunning className="iconodash" /> Lúdicas
              </button>
              <button onClick={() => setContenidoActual("calendarioactividades")} className="opciondash">
                <FaRegCalendarAlt className="iconodash" /> Calendario
              </button>
              <button onClick={() => setContenidoActual("horasl")} className="opciondash">
                <FaStopwatch className="iconodash" /> Horas Lúdicas
              </button>
            </>
          )}
        </div>

        <div className="grupo-menu">
          <button className="tituloseccion" onClick={() => toggleSection("gestion")}>
            {openSection.gestion ? <FaChevronDown /> : <FaChevronRight />} Gestión
          </button>
          {openSection.gestion && (
            <>
              <button onClick={() => setContenidoActual("alquilerap")} className="opciondash">
                <LiaPersonBoothSolid className="iconodash" /> Préstamos
              </button>
              <button onClick={() => setContenidoActual("escanerqr")} className="opciondash">
                <MdQrCode2 className="iconodash" /> Escanear QR
              </button>
              <button onClick={() => setContenidoActual("constanciacr")} className="opciondash">
                <FaUserGraduate className="iconodash" /> Constancia
              </button>
              {/* <button onClick={() => setContenidoActual("solicitudapoyoaprendiz")} className="opciondash">
                <FaUserGraduate className="iconodash" /> Apoyos
              </button> */}
            </>
          )}
        </div>

        <div className="grupo-menu">
          <button className="tituloseccion" onClick={() => toggleSection("otros")}>
            {openSection.otros ? <FaChevronDown /> : <FaChevronRight />} Otros
          </button>
          {openSection.otros && (
            <>
              <button onClick={() => setContenidoActual("combinar")} className="opciondash">
                <FaRegComments className="iconodash" /> Feedback
              </button>
              <button onClick={() => setContenidoActual("cartacontacto")} className="opciondash">
                <FaRegUserCircle className="iconodash" /> Contactos
              </button>
              {/* <button onClick={() => setContenidoActual("noticias")} className="opciondash">
                <FaAddressBook className="iconodash" /> Noticias
              </button> */}
            </>
          )}
        </div>
      </nav>
      <button
  className="btn-cerrar-sesion"
  onClick={() => {
    logout(); 
    toast.success("¡Sesión cerrada correctamente!");
  }}
>
  <FaRegCaretSquareRight className="icono-cerrar" /> 
  Cerrar Sesión
</button>

      
    </aside>
  );
}
