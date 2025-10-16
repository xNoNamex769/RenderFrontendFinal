import React, { useState } from "react";
import {
  FaHome,
  FaCalendarAlt,
  FaRegCheckCircle,
  FaAlignJustify,
  FaCommentDots,
  FaClipboardList,
  FaQrcode,
  FaUserGraduate,
  FaAddressBook,
  	FaInfoCircle,
  FaChartBar,
  FaUpload,
  FaBoxOpen,
  FaChevronDown,
  FaChevronRight,

  FaRegCaretSquareRight,
FaRegCalendarAlt ,
  FaRegUserCircle

} from "react-icons/fa";

import { PiPersonSimpleThrowLight, PiCodeBlockFill, PiBoxArrowUpThin } from "react-icons/pi";
import { MdEventAvailable,  MdQrCode2, MdAppRegistration, MdOutlinePermContactCalendar  } from "react-icons/md";
import { TfiDropbox } from "react-icons/tfi";

import logo from "../img/logo.png";
import avatar from "../img/avatar.png";
import "../DashA/style/MenuLateral.css"
import { useAuth } from "../../../../Context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import { AiOutlineUpload } from "react-icons/ai";  
import { MdCheckCircle } from "react-icons/md";

export default function MenuLateral({ menuAbierto, toggleMenu, setContenidoActual }) {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [openSection, setOpenSection] = useState({
    eventos: true,
    alquiler: false,
    analisis: false,
    documentos: false,
    temas:false,
  });

    const { logout } = useAuth(); // usamos logout
  

  const toggleDropdown = () => setMostrarMenu(prev => !prev);
  const toggleSection = (section) => {
    setOpenSection(prev => ({ ...prev, [section]: !prev[section] }));
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
          <span className="menulateralap-nombre">Administrador</span>
        </div>

        {mostrarMenu && (
          <div className="menulateralap-dropdown">
            <ul>
              <li className="menulateralap-opcion-dropdown" onClick={irAPerfil}>👤 Perfil</li>
              <li className="menulateralap-opcion-dropdown" onClick={irConfig}>⚙️ Configuración</li>
              <li className="menulateralap-opcion-dropdown" onClick={() => { logout(); toast.success("¡Sesión cerrada!"); }}>🚪 Cerrar sesión</li>
            </ul>
          </div>
        )}
      </section>

      {/* Menú principal */}
      <nav className="menulateralap-menu">

        <button onClick={() => setContenidoActual("userview")} className="menulateralap-opcion">
          <FaHome className="menulateralap-icono" /> Inicio
        </button>

        <div className="menulateralap-grupo">
          <button className="menulateralap-titulo-seccion" onClick={() => toggleSection("eventos")}>
            {openSection.eventos ? <FaChevronDown /> : <FaChevronRight />} Eventos
          </button>
          {openSection.eventos && (
            <>
              <button onClick={() => setContenidoActual("actividad")} className="menulateralap-opcion">
                <PiPersonSimpleThrowLight className="menulateralap-icono" /> Actividades
              </button>
              <button onClick={() => setContenidoActual("calendarioactividades")} className="menulateralap-opcion">
                <FaRegCalendarAlt className="menulateralap-icono" /> Calendario
              </button>
              <button onClick={() => setContenidoActual("aplicacion")} className="menulateralap-opcion">
                <MdEventAvailable className="menulateralap-icono" /> Eventos
              </button>
            </>
          )}
        </div>

        <div className="menulateralap-grupo">
          <button className="menulateralap-titulo-seccion" onClick={() => toggleSection("alquiler")}>
            {openSection.alquiler ? <FaChevronDown /> : <FaChevronRight />} Gestión de Alquiler
          </button>
          {openSection.alquiler && (
            <>
              <button onClick={() => setContenidoActual("registroa")} className="menulateralap-opcion">
                <MdQrCode2 className="menulateralap-icono" /> Registro Prestamo
              </button>
              <button onClick={() => setContenidoActual("detallea")} className="menulateralap-opcion">
                <PiCodeBlockFill className="menulateralap-icono" /> Detalles Prestamos
              </button>
              <button onClick={() => setContenidoActual("gestioncatalogo")} className="menulateralap-opcion">
                <TfiDropbox className="menulateralap-icono" /> Elementos Subidos
              </button>
              <button onClick={() => setContenidoActual("registrarelemento")} className="menulateralap-opcion">
                <PiBoxArrowUpThin className="menulateralap-icono" /> Subir Elemento
              </button>
            </>
          )}
        </div>

        <div className="menulateralap-grupo">
          <button className="menulateralap-titulo-seccion" onClick={() => toggleSection("documentos")}>
            {openSection.documentos ? <FaChevronDown /> : <FaChevronRight />} Documentos
          </button>
          {openSection.documentos && (
            <>
              <button onClick={() => setContenidoActual("adminconstancias")} className="menulateralap-opcion">
                <FaUserGraduate className="menulateralap-icono" /> ConstanciaAD
              </button>
              <button onClick={() => setContenidoActual("planificareventosadmin")} className="menulateralap-opcion">
                <MdAppRegistration className="menulateralap-icono" /> Aprobar Eventos
              </button>
              <button onClick={() => setContenidoActual("registro")} className="menulateralap-opcion">
                <MdAppRegistration className="menulateralap-icono" /> Registrar Usuario
              </button>
              <button onClick={() => setContenidoActual("subiraprendiz")} className="menulateralap-opcion">
                <AiOutlineUpload className="menulateralap-icono" /> Subir Aprendiz
              </button>
              <button onClick={() => setContenidoActual("aprendices")} className="menulateralap-opcion">
                <FaUserGraduate className="menulateralap-icono" /> Aprendices Registrados
              </button>
              <button onClick={() => setContenidoActual("usuarios-registrados")} className="menulateralap-opcion">
                <MdCheckCircle className="menulateralap-icono" /> Usuarios Registrados
              </button>
            </>
          )}
        </div>

        {/* Sección: Documentos */}
        {/* <div className="grupo-menu">
          <button className="tituloseccion" onClick={() => toggleSection("gestionusuarios")}>
            {openSection.gestionusuarios ? <FaChevronDown /> : <FaChevronRight />} GestionUsuarios
          </button>
          {openSection.gestionusuarios && (
            <>
            
              <button onClick={() => setContenidoActual("cambiarrol")} className="opciondash">
                <FaAddressBook className="iconodash" /> Roles
              </button>
            </>
          )}
        </div> */}
{/* Sección: Apariencia o Temas */}
{/* <div className="grupo-menu">
  <button className="tituloseccion" onClick={() => toggleSection("temas")}>
    {openSection.temas ? <FaChevronDown /> : <FaChevronRight />} Apariencia
  </button>
  {openSection.temas && (
    <>
      <button onClick={() => setContenidoActual("temas")} className="opciondash">
        <FaAlignJustify className="iconodash" /> Temas
      </button>
    </>
  )}
</div> */}

       
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
