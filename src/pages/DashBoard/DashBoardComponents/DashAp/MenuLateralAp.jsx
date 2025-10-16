import React, { useState } from "react";
import {
  FaHome,
  FaListAlt,
  FaRegCalendarAlt,
  FaRunning,
  FaStopwatch,
  FaRegComments,
  FaRegUserCircle,
  FaChevronDown,
  FaChevronRight,
  FaRegCaretSquareRight,
  FaTimes,
  FaMapMarkedAlt,
  FaUserGraduate
} from "react-icons/fa";
import { MdEventAvailable, MdQrCode2 } from "react-icons/md";
import { LiaPersonBoothSolid } from "react-icons/lia";
import { PiPersonSimpleThrowLight } from "react-icons/pi";

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

  const { logout } = useAuth();

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
    <>
      {/* 🔘 Botón flotante solo visible en pantallas pequeñas */}
      <button
        className="menulateralap-boton-toggle"
        onClick={toggleMenu}
      >
        {menuAbierto ? <FaTimes /> : <FaListAlt />}
      </button>

      <aside className={`menulateralap-barradash ${menuAbierto ? "mostrar" : "ocultar"}`}>
        {/* Header usuario */}
        <section>
          <div className="menulateralap-user-header" onClick={toggleDropdown}>
            <img src={avatar} alt="Usuario" className="menulateralap-avatar" />
            <span className="menulateralap-nombre">Aprendiz</span>
          </div>

          {mostrarMenu && (
            <div className="menulateralap-dropdown">
              <ul>
                <li className="menulateralap-opcion-dropdown" onClick={irAPerfil}>👤 Perfil</li>
                <li className="menulateralap-opcion-dropdown" onClick={irConfig}>⚙️ Configuración</li>
                <li className="menulateralap-opcion-dropdown" onClick={logout}>🚪 Cerrar sesión</li>
              </ul>
            </div>
          )}
        </section>

        {/* Menú principal */}
        <nav className="menulateralap-menu">

          <button onClick={() => setContenidoActual("userviewap")} className="menulateralap-opcion">
            <FaHome className="menulateralap-icono" /> Inicio
          </button>

          <button onClick={() => setContenidoActual("mapareferencia")} className="menulateralap-opcion">
            <FaMapMarkedAlt className="menulateralap-icono" /> Mapa de Referencia
          </button>

          <div className="menulateralap-grupo">
            <button className="menulateralap-titulo-seccion" onClick={() => toggleSection("participacion")}>
              {openSection.participacion ? <FaChevronDown /> : <FaChevronRight />} Participación
            </button>
            {openSection.participacion && (
              <>
                <button onClick={() => setContenidoActual("actividades")} className="menulateralap-opcion">
                  <PiPersonSimpleThrowLight className="menulateralap-icono" /> Actividades
                </button>
                <button onClick={() => setContenidoActual("aplicacion")} className="menulateralap-opcion">
                  <MdEventAvailable className="menulateralap-icono" /> Eventos
                </button>
                <button onClick={() => setContenidoActual("ludicas")} className="menulateralap-opcion">
                  <FaRunning className="menulateralap-icono" /> Lúdicas
                </button>
                <button onClick={() => setContenidoActual("calendarioactividades")} className="menulateralap-opcion">
                  <FaRegCalendarAlt className="menulateralap-icono" /> Calendario
                </button>
                <button onClick={() => setContenidoActual("horasl")} className="menulateralap-opcion">
                  <FaStopwatch className="menulateralap-icono" /> Horas Lúdicas
                </button>
              </>
            )}
          </div>

          <div className="menulateralap-grupo">
            <button className="menulateralap-titulo-seccion" onClick={() => toggleSection("gestion")}>
              {openSection.gestion ? <FaChevronDown /> : <FaChevronRight />} Gestión
            </button>
            {openSection.gestion && (
              <>
                <button onClick={() => setContenidoActual("alquilerap")} className="menulateralap-opcion">
                  <LiaPersonBoothSolid className="menulateralap-icono" /> Préstamos
                </button>
                <button onClick={() => setContenidoActual("escanerqr")} className="menulateralap-opcion">
                  <MdQrCode2 className="menulateralap-icono" /> Escanear QR
                </button>
                <button onClick={() => setContenidoActual("constanciacr")} className="menulateralap-opcion">
                  <FaUserGraduate className="menulateralap-icono" /> Constancia
                </button>
              </>
            )}
          </div>

          <div className="menulateralap-grupo">
            <button className="menulateralap-titulo-seccion" onClick={() => toggleSection("otros")}>
              {openSection.otros ? <FaChevronDown /> : <FaChevronRight />} Otros
            </button>
            {openSection.otros && (
              <>
                <button onClick={() => setContenidoActual("combinar")} className="menulateralap-opcion">
                  <FaRegComments className="menulateralap-icono" /> Feedback
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
    </>
  );
}
