import React, { useState } from "react";
import MenuLateralIn from "../src/pages/DashBoard/DashBoardComponents/DashIn/MenuLateralIn";
import HomeDash from "../src/pages/DashBoard/HomeDash";
// import ActivBot from "../src/pages/DashBoard/DashBoardComponents/DashA/ActivBot";
import NavbarIn from "../src/pages/DashBoard/DashBoardComponents/DashIn/NavbarIn";
import CalendarioActividades from "../src/pages/CalendarioAdmin/CalendarioActividades";
import Feedbacks from "../src/pages/Feedback/Feedbacks";
import Planificar from "../src/pages/Planificar/Planificar";
import RegistroActividades from "../src/pages/RegistroActividades/RegistroActividades";
import Combinar from "../src/pages/CombinarFA/Combinar";
import Actividades from "../src/pages/Actividades/Actividades";
import Aplicacion from "../src/pages/Aplicacion/Aplicacion";
import AprendizRun from "../src/pages/AprendizC/AprendizRun";
import PlanificarEvento from "../src/pages/PlanificarEv/PlanificarEvento";
import RegistroA from "../src/pages/RegistroAsistencia/RegistroA";
import CartaContacto from "../src/pages/CartasContacto/CartaInstructor";
import ChromaGrid from "../src/Components/ChromaGrid/ChromaGrid";
import ChatAI from "../src/pages/ChatAI/ChatAI";
import UserViewIn from "../src/pages/UserView/UserViewIn";
import ConfigViewIn from "../src/pages/ConfigView/ConfigViewIn";
import Registroludicas from "../src/pages/RegistroLudicas/Registroludicas";
import MisActividades from "../src/pages/Actividades/Instructor/MisActividades";
import MisLudicas from "../src/pages/RegistroLudicas/MisLudicas";
import MisEventos from "../src/pages/Aplicacion/Instructor/MisEventos"
import AsistenciasActividad from "../src/pages/Asistencia/Instructor/AsistenciasActividad";
import Instructor from "../src/pages/SolicitudApoyo/Instructor";
import PanelFeedback from "../src/pages/Feedback/instructor/PanelFeedback";
import GraficosPromediosAyuda from "../src/pages/Graficos/GraficosPromediosAyuda";
import AprobarEventos from "../src/pages/PlanificarEv/AprobarEventos";
import "../src/styles/BotHp.css";
import "../src/styles/ColaViento.css";
import "../src/styles/Resposive.css";
import "../src/styles/global.css";
import AsistentesEventos from "../src/pages/Asistencia/Instructor/AsistentesEventos";
import Noticias from "../src/pages/Noticias/Noticias";
export default function DashBoard() {
  const [menuAbierto, setMenuAbierto] = useState(true);
  const [contenidoActual, setContenidoActual] = useState("userviewin");
  const [idSeleccionada, setIdSeleccionada] = useState(null);
  const [actualizarPerfil, setActualizarPerfil] = useState(false);


  // ✅ Nueva función que evita cambios repetidos innecesarios
  const handleSetContenido = (nuevoContenido) => {
    if (contenidoActual !== nuevoContenido) {
      setContenidoActual(nuevoContenido);
    }
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  return (
    <section className="contenedordash">
      <MenuLateralIn
        menuAbierto={menuAbierto}
        toggleMenu={toggleMenu}
        setContenidoActual={handleSetContenido}
      />

      <main className="contenidodash">
        <NavbarIn
          toggleMenu={toggleMenu}
          setContenidoActual={handleSetContenido}
        />

        {contenidoActual === "userviewin" && (
  <UserViewIn
    setContenidoActual={handleSetContenido}
    actualizarPerfil={actualizarPerfil}
  />
)}

        {contenidoActual === "actividades" && (
          <Actividades
            setContenidoActual={handleSetContenido}
            setIdSeleccionada={setIdSeleccionada}
          />
        )}
        {contenidoActual === "aplicacion" && <Aplicacion />}
        {contenidoActual === "plan" && <Planificar />}
        {contenidoActual === "registrarl" && <Registroludicas />}
        {contenidoActual === "feedback" && <Feedbacks />}
        {contenidoActual === "comprobar" && <Combinar />}
        {contenidoActual === "calendarioactividades" && <CalendarioActividades />}
        {contenidoActual === "aprendiz" && <AprendizRun />}
        {contenidoActual === "planevento" && <PlanificarEvento />}
        {contenidoActual === "registro" && <RegistroA />}
        {contenidoActual === "cartacontacto" && <CartaContacto />}
       
        {contenidoActual === "solicitudapoyoinstructor" && <Instructor />}
        {contenidoActual === "chatai" && <ChatAI />}
        {contenidoActual === "perfil" && <HomeDash />}
        {contenidoActual === "registroactividades" && <RegistroActividades />}
        {contenidoActual === "registroLudicas" && <Registroludicas />}
        {contenidoActual === "misactividades" && <MisActividades />}
        {contenidoActual === "misludicas" && <MisLudicas />}
        {contenidoActual === "miseventos" && <MisEventos />}
         {contenidoActual === "aprobadoseventos" && <AprobarEventos />}
         {contenidoActual === "graficopromediofeedback" && <GraficosPromediosAyuda />}
          {contenidoActual === "asistenciaseventos" && <AsistentesEventos/>}
         {contenidoActual === "panelfeedback" && <PanelFeedback />}
          {contenidoActual === "noticias" && <Noticias />}
       {contenidoActual === "config" && (
  <ConfigViewIn
    setContenidoActual={handleSetContenido}
    setActualizarPerfil={setActualizarPerfil}
    
  />
)}

        {contenidoActual === "asistenciasactividad" && (
          <AsistenciasActividad IdActividad={idSeleccionada} />
        )}
      </main>

      {/* <ActivBot irAChatai={() => handleSetContenido("chatai")} /> */}
    </section>
  );
}
