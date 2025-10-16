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
  FaRegNewspaper,
  FaRobot

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
    <aside className={`menulateralap-barradash ${menuAbierto ? "mostrar" : "ocultar"}`}>
      {/* Header usuario */}
      <section>
        <div className="menulateralap-user-header" onClick={toggleDropdown}>
          <img src={avatar} alt="Usuario" className="menulateralap-avatar" />
          <span className="menulateralap-nombre">Instructor</span>
        </div>

        {mostrarMenu && (
          <div className="menulateralap-dropdown">
            <ul>
              <li className="menulateralap-opcion-dropdown" onClick={irAPerfil}>👤 Perfil</li>
              <li className="menulateralap-opcion-dropdown" onClick={irConfig}>⚙️ Configuración</li>
              <li className="menulateralap-opcion-dropdown" onClick={() => {
                logout(); 
                toast.success("¡Sesión cerrada correctamente!");
              }}>🚪 Cerrar sesión</li>
            </ul>
          </div>
        )}
      </section>

      {/* Menú principal */}
      <nav className="menulateralap-menu">
        {/* Inicio */}
        <button onClick={() => setContenidoActual("userviewin")} className="menulateralap-opcion">
          <FaHome className="menulateralap-icono" /> Inicio
        </button>

        {/* 1. Eventos y Actividades */}
        <div className="menulateralap-grupo">
          <button className="menulateralap-titulo-seccion" onClick={() => toggleSection("eventos")}>
            {openSection.eventos ? <FaChevronDown /> : <FaChevronRight />} Eventos y Actividades
          </button>
          {openSection.eventos && (
            <>
              <button onClick={() => setContenidoActual("actividades")} className="menulateralap-opcion">
                <PiPersonSimpleThrowLight className="menulateralap-icono" /> Actividades
              </button>
              <button onClick={() => setContenidoActual("aplicacion")} className="menulateralap-opcion">
                <MdEventAvailable className="menulateralap-icono" /> Eventos
              </button>
              <button onClick={() => setContenidoActual("calendarioactividades")} className="menulateralap-opcion">
                <FaRegCalendarAlt className="menulateralap-icono" /> Calendario
              </button>
             
            </>
          )}
        </div>

        {/* 2. Gestión de Eventos */}
        <div className="menulateralap-grupo">
          <button className="menulateralap-titulo-seccion" onClick={() => toggleSection("gestionEventos")}>
            {openSection.gestionEventos ? <FaChevronDown /> : <FaChevronRight />} Gestión de Eventos y Actividades
          </button>
          {openSection.gestionEventos && (
            <>
              <button onClick={() => setContenidoActual("planevento")} className="menulateralap-opcion">
                <TfiWrite className="menulateralap-icono" /> Planificar Evento
              </button>
              <button onClick={() => setContenidoActual("registroactividades")} className="menulateralap-opcion">
                <FaRegEdit className="menulateralap-icono" /> Registro Actividades
              </button>
                <button onClick={() => setContenidoActual("registroLudicas")} className="menulateralap-opcion">
                <FaRegEdit className="menulateralap-icono" /> Registro Ludicas
              </button>
            
              
              
               <button onClick={() => setContenidoActual("misludicas")} className="menulateralap-opcion">
                <MdOutlinePermContactCalendar className="menulateralap-icono" /> Mis ludicas
              </button>
               <button onClick={() => setContenidoActual("miseventos")} className="menulateralap-opcion">
                <LiaPeopleCarrySolid className="menulateralap-icono" /> Mis eventos
              </button>
                 <button onClick={() => setContenidoActual("panelfeedback")} className="menulateralap-opcion">
                <FaThumbsUp className="menulateralap-icono" /> Mis feedback
              </button>
              <button onClick={() => setContenidoActual("analisis-eventos")} className="menulateralap-opcion">
                <FaRobot className="menulateralap-icono" /> Análisis con IA
              </button>
              {/* <button onClick={() => setContenidoActual("graficopromediofeedback")} className="opciondash">
                <FaThumbsUp className="iconodash" /> graficos feedback
              </button> */}
            </>
          )}
        </div>

        {/* 3. Gestión de Aprendices */}
        <div className="menulateralap-grupo">
          <button className="menulateralap-titulo-seccion" onClick={() => toggleSection("aprendices")}>
            {openSection.aprendices ? <FaChevronDown /> : <FaChevronRight />}  Novedades
          </button>
          {openSection.aprendices && (
            <>
            <button onClick={() => setContenidoActual("aprobadoseventos")} className="menulateralap-opcion">
                <FaCheckDouble className="menulateralap-icono" /> Eventos Aprobados
              </button>
           
              {/* <button onClick={() => setContenidoActual("solicitudapoyoinstructor")} className="opciondash">
                <FaClipboardList className="iconodash" /> Apoyos
              </button> */}
            </>
          )}
        </div>

        {/* 4. Feedback y Contacto */}
        <div className="menulateralap-grupo">
          <button className="menulateralap-titulo-seccion" onClick={() => toggleSection("feedback")}>
            {openSection.feedback ? <FaChevronDown /> : <FaChevronRight />} Feedback y Contacto
          </button>
          {openSection.feedback && (
            <>
              <button onClick={() => setContenidoActual("comprobar")} className="menulateralap-opcion">
                <VscFeedback className="menulateralap-icono" /> Feedback
              </button>
              <button onClick={() => setContenidoActual("cartacontacto")} className="menulateralap-opcion">
                <FaRegUserCircle className="menulateralap-icono" /> Contactos
              </button>
            </>
          )}
        </div>
      </nav>

      <button
        className="menulateralap-btn-cerrar"
        onClick={() => {
          logout(); 
          toast.success("¡Sesión cerrada correctamente!");
        }}
      >
        <FaRegCaretSquareRight className="menulateralap-icono-cerrar" /> 
        Cerrar Sesión
      </button>
    </aside>
  );
}
