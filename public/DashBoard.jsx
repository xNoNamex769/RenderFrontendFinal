import React, { useState, useEffect } from "react";
import MenuLateral from "../src/pages/DashBoard/DashBoardComponents/DashA/MenuLateral";
import HomeDash from "../src/pages/DashBoard/HomeDash";
// import ActivBot from "../src/pages/DashBoard/DashBoardComponents/DashA/ActivBot";
import Alquiler from "../src/pages/Alquiler/CatalogoDisponible";
import CalendarioAdmin from "../src/pages/CalendarioAdmin/CalendarioAp";
import DetallesAlquiler from "../src/pages/DetallesAlquiler/DetallerAlquiler";
import ConstanciaCertificado from "../src/pages/ConstanciaCertificado/ConstanciaCR";
import Actividades from "../src/pages/Actividades/Actividades";
import Aplicacion from "../src/pages/Aplicacion/Aplicacion";
import ConstanciasList from "../src/pages/Constancia/components/ConstanciasList";
import Combinar from "../src/pages/CombinarFA/Combinar";
import CartaContacto from "../src/pages/CartasContacto/CartaContacto";
import ChatAI from "../src/pages/ChatAI/ChatAI";
import UserView from "../src/pages/UserView/UserView";
import Navbar from "../src/pages/DashBoard/DashBoardComponents/DashA/Navbar";
import ConfigView from "../src/pages/ConfigView/ConfigView";

import GestionCatalogo from "../src/pages/AlquierAP/GestionFormulario";
import FormularioCatalogo from "../src/pages/AlquierAP/FormularioCatalogo";
import Administrador from "../src/pages/SolicitudApoyo/Administrador";
import CambiarRol from "../src/pages/CambiarRol/CambiarRol";
import DashThemed from "../src/pages/Dashtheme/DashThemed";
import AdminConstancias from "../src/pages/ConstanciaCertificado/Admin/AdminConstancias";
import PlanificarEventosAdmin from "../src/pages/PlanificarEv/Admin/PlanificarEventosAdmin";
import ResumenIA from "../src/Components/ResumenIA/ResumenIA";
import AdminLudicas from "../src/pages/Ludicas/Admin/AdminLudicas";
// Estilos globales
import "../src/styles/BotHp.css";
import "../src/styles/ColaViento.css";
import "../src/styles/Resposive.css";
import "../src/styles/global.css";
import RegistrarElemento from "../src/pages/Elementos/RegistrarElemento";
import ListaTrimestre from "../src/pages/ListaEventosTM/EventosporTrimestre";
import Registro from "./Registro";
import SubirAprendices from "../src/pages/SubirAprendices/SubirAprendices";
import AprendicesCargados from "../src/pages/SubirAprendices/AprendicesCargados";
import CalendarioActividades from "../src/pages/CalendarioAdmin/CalendarioActividades";
import UsuariosCargados from "../public/UsuariosCargados";

export default function DashBoard() {
  const [menuAbierto, setMenuAbierto] = useState(true);
  const [contenidoActual, setContenidoActual] = useState("userview");
  const [esTemaHalloween, setEsTemaHalloween] = useState(false);
  const [resumenIAData, setResumenIAData] = useState(null);

  useEffect(() => {
    const temaGuardado = localStorage.getItem("tema-halloween") === "true";
    setEsTemaHalloween(temaGuardado);
  }, []);

  useEffect(() => {
    if (esTemaHalloween) {
      document.body.classList.add("theme-halloween");
    } else {
      document.body.classList.remove("theme-halloween");
    }
  }, [esTemaHalloween]);

  useEffect(() => {
    if (contenidoActual === "resumenia") {
      fetch("https://render-hhyo.onrender.com/api/resumenia/resumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IdActividad: 5, IdEvento: 3 }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) setResumenIAData(data.resumen);
          else console.error("Error:", data.mensaje);
        })
        .catch((err) => console.error("Error al cargar resumen IA:", err));
    }
  }, [contenidoActual]);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  return (
    <section className={`contenedordash ${menuAbierto ? "" : "menu-cerrado"}`}>
      {esTemaHalloween && (
        <div className="efectos-halloween">
          <div className="murcielago uno"></div>
          <div className="murcielago dos"></div>
          <div className="murcielago tres"></div>
          <div className="nube-humo"></div>
        </div>
      )}

      <MenuLateral
        menuAbierto={menuAbierto}
        toggleMenu={toggleMenu}
        setContenidoActual={setContenidoActual}
      />

      <main
        className={`contenidodash ${
          menuAbierto ? "con-menu" : "expandido"
        }`}
      >
        <Navbar toggleMenu={toggleMenu} setContenidoActual={setContenidoActual} />

        {contenidoActual === "perfil" && (
          <DashThemed
            esTemaHalloween={esTemaHalloween}
            setEsTemaHalloween={setEsTemaHalloween}
          />
        )}

        {contenidoActual === "userview" && (
          <UserView setContenidoActual={setContenidoActual} />
        )}
        {contenidoActual === "actividad" && <Actividades />}
        {contenidoActual === "aplicacion" && <Aplicacion />}
        {contenidoActual === "calendario" && <CalendarioAdmin />}
        {contenidoActual === "registroa" && <Alquiler />}
        {contenidoActual === "detallea" && <DetallesAlquiler />}
        {contenidoActual === "combinar" && <Combinar />}
        {contenidoActual === "constancia" && <ConstanciaCertificado />}
        {contenidoActual === "constancia2" && <ConstanciasList />}
        {contenidoActual === "cartacontacto" && <CartaContacto />}
        {contenidoActual === "calendarioactividades" && <CalendarioActividades />}
        {contenidoActual === "chatai" && <ChatAI />}
        {contenidoActual === "config" && <ConfigView />}
        {contenidoActual === "analisisia" && <AnalisisIA />}
        {contenidoActual === "cambiarrol" && <CambiarRol />}
        {contenidoActual === "registrarelemento" && <RegistrarElemento />}
        {contenidoActual === "solicitudapoyo" && <Administrador />}
        {contenidoActual === "gestioncatalogo" && <GestionCatalogo />}
        {contenidoActual === "formulariocatalogo" && <FormularioCatalogo />}
        {contenidoActual === "planificareventosadmin" && <PlanificarEventosAdmin />}
        {contenidoActual === "adminconstancias" && <AdminConstancias />}
        {contenidoActual === "adminludicas" && <AdminLudicas />}
        {contenidoActual === "listatrimestre" && <ListaTrimestre />}
        {contenidoActual === "subiraprendiz" && <SubirAprendices />}
        {contenidoActual === "registro" && <Registro />}
        {contenidoActual === "aprendices" && <AprendicesCargados />}
        {contenidoActual === "usuarios-registrados" && <UsuariosCargados />}

        {contenidoActual === "temas" && (
          <DashThemed
            esTemaHalloween={esTemaHalloween}
            setEsTemaHalloween={setEsTemaHalloween}
          />
        )}
        {contenidoActual === "perfil" && <HomeDash />}

        {contenidoActual === "resumenia" && resumenIAData && (
          <ResumenIA resumen={resumenIAData} />
        )}
      </main>
    </section>
  );
}
