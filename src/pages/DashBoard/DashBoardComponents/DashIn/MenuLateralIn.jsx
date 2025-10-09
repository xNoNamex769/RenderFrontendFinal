import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaHome,
  FaCheckSquare,
  FaQrcode,
  FaThumbsUp,
  FaAddressBook,
  FaIdBadge,
  FaCommentDots,
  FaChevronDown,
  FaChevronRight,
  FaClipboardList,

  FaRegCaretSquareRight,

  FaRegCalendarAlt,
  FaRegEdit,
  FaRegIdCard,
  FaRegUserCircle,
  FaRegComments,
  FaCheckDouble,
  FaRegNewspaper

} from "react-icons/fa";

import { MdEventAvailable, MdOutlinePermContactCalendar  } from "react-icons/md";
import { TfiWrite } from "react-icons/tfi";
import { LiaPeopleCarrySolid } from "react-icons/lia";
import { VscFeedback } from "react-icons/vsc";
import { PiPersonSimpleThrowLight } from "react-icons/pi";

import logo from "../img/logo.png";
import avatar from "../img/avatar.png";
import "../DashA/style/MenuLateral.css";
import { useAuth } from "../../../../Context/AuthContext";
import { Toaster, toast } from "react-hot-toast";

export default function MenuLateralIn({ menuAbierto, setContenidoActual }) {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [openSection, setOpenSection] = useState({
    eventos: true,
    gestionEventos: true,
    aprendices: true,
    feedback: true,
  });

  const { logout } = useAuth(); // ✅ usamos logout

  const toggleDropdown = () => setMostrarMenu((prev) => !prev);
  const toggleSection = (section) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
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
    <aside className={`barradash ${menuAbierto ? "mostrar" : "ocultar"}`}>
      {/* Header */}
      <section className="Clogodash">
        <div className="UserHeaderInfo" >
          <img src={avatar} alt="Usuario" className="avatardash" />
          <span className="nombredash">Instructor</span>
        </div>

        {mostrarMenu && (
          <div className="menudesplegabledash">
            <ul>
              <li className="opcionesm" onClick={irAPerfil}>Perfil</li>
              <li className="opcionesm" onClick={irConfig}>Configuración</li>
              <li className="opcionesm">Cerrar sesión</li>
            </ul>
          </div>
        )}
      </section>

      <nav className="menudash">
        {/* Inicio */}
        <button onClick={() => setContenidoActual("userviewin")} className="opciondash">
          <FaHome className="iconodash" /> Inicio
        </button>

        {/* 1. Eventos y Actividades */}
        <div className="grupo-menu">
          <button className="tituloseccion" onClick={() => toggleSection("eventos")}>
            {openSection.eventos ? <FaChevronDown /> : <FaChevronRight />} Eventos y Actividades
          </button>
          {openSection.eventos && (
            <>
              <button onClick={() => setContenidoActual("actividades")} className="opciondash">
                <PiPersonSimpleThrowLight className="iconodash" /> Actividades
              </button>
              <button onClick={() => setContenidoActual("aplicacion")} className="opciondash">
                <MdEventAvailable className="iconodash" /> Eventos
              </button>
              <button onClick={() => setContenidoActual("calendarioactividades")} className="opciondash">
                <FaRegCalendarAlt className="iconodash" /> Calendario
              </button>
             
            </>
          )}
        </div>

        {/* 2. Gestión de Eventos */}
        <div className="grupo-menu">
          <button className="tituloseccion" onClick={() => toggleSection("gestionEventos")}>
            {openSection.gestionEventos ? <FaChevronDown /> : <FaChevronRight />} Gestión de Eventos y Actividades
          </button>
          {openSection.gestionEventos && (
            <>
              <button onClick={() => setContenidoActual("planevento")} className="opciondash">
                <TfiWrite className="iconodash" /> Planificar Evento
              </button>
              <button onClick={() => setContenidoActual("registroactividades")} className="opciondash">
                <FaRegEdit className="iconodash" /> Registro Actividades
              </button>
                <button onClick={() => setContenidoActual("registroLudicas")} className="opciondash">
                <FaRegEdit className="iconodash" /> Registro Ludicas
              </button>
            
              
              
               <button onClick={() => setContenidoActual("misludicas")} className="opciondash">
                <MdOutlinePermContactCalendar className="iconodash" /> Mis ludicas
              </button>
               <button onClick={() => setContenidoActual("miseventos")} className="opciondash">
                <LiaPeopleCarrySolid className="iconodash" /> Mis eventos
              </button>
                 <button onClick={() => setContenidoActual("panelfeedback")} className="opciondash">
                <FaThumbsUp className="iconodash" /> Mis feedback
              </button>
              {/* <button onClick={() => setContenidoActual("graficopromediofeedback")} className="opciondash">
                <FaThumbsUp className="iconodash" /> graficos feedback
              </button> */}
            </>
          )}
        </div>

        {/* 3. Gestión de Aprendices */}
        <div className="grupo-menu">
          <button className="tituloseccion" onClick={() => toggleSection("aprendices")}>
            {openSection.aprendices ? <FaChevronDown /> : <FaChevronRight />}  Novedades
          </button>
          {openSection.aprendices && (
            <>
            <button onClick={() => setContenidoActual("aprobadoseventos")} className="opciondash">
                <FaCheckDouble className="iconodash" /> Eventos Aprobados
              </button>
           
              {/* <button onClick={() => setContenidoActual("solicitudapoyoinstructor")} className="opciondash">
                <FaClipboardList className="iconodash" /> Apoyos
              </button> */}
            </>
          )}
        </div>

        {/* 4. Feedback y Contacto */}
        <div className="grupo-menu">
          <button className="tituloseccion" onClick={() => toggleSection("feedback")}>
            {openSection.feedback ? <FaChevronDown /> : <FaChevronRight />} Feedback y Contacto
          </button>
          {openSection.feedback && (
            <>
              <button onClick={() => setContenidoActual("comprobar")} className="opciondash">
                <VscFeedback className="iconodash" /> Feedback
              </button>
              <button onClick={() => setContenidoActual("cartacontacto")} className="opciondash">
                <FaRegUserCircle className="iconodash" /> Contactos
              </button>
            </>
          )}
        </div>

        {/* Logo */}
        <button
  className="btn-cerrar-sesion"
  onClick={() => {
    logout(); 
    toast.success("¡Sesión cerrada correctamente! ");
  }}
>
  <FaRegCaretSquareRight className="icono-cerrar" /> 
  Cerrar Sesión
</button>
      </nav>
    </aside>
  );
}
