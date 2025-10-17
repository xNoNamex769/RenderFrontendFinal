import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateralAp from "../src/pages/DashBoard/DashBoardComponents/DashAp/MenuLateralAp";
import NavbarAp from "../src/pages/DashBoard/DashBoardComponents/DashAp/NavbarAp";
import ActivBot from "../src/pages/DashBoard/DashBoardComponents/DashA/ActivBot";
import Feedbacks from "../src/pages/Feedback/Feedbacks";
import Ludicas from "../src/pages/Ludicas/Ludicas";
import HorasLudicas from "../src/pages/HorasLudicas/HorasLudicas";
import Combinar from "../src/pages/CombinarFA/Combinar";
import ChatAI from "../src/pages/ChatAI/ChatAI";
import AlquilerAP from "../src/pages/AlquierAP/AlquilerAP";
import CartaContacto from "../src/pages/CartasContacto/CartaContacto";
import Constanciacr from "../src/pages/ConstanciaCertificado/ConstanciaCR";
import UserViewAp from "../src/pages/UserView/UserViewAp";
import Actividades from "../src/pages/Actividades/Actividades";
import Aplicacion from "../src/pages/Aplicacion/Aplicacion";
import ConfigViewAp from "../src/pages/ConfigView/ConfigViewAp";
import CalendarioActividades from "../src/pages/CalendarioAdmin/CalendarioActividades";
import EscanerQR from "../src/Components/QrGenerador.jsx/EscanerHtml5QR";
import Constancia from "../src/pages/Constancia/components/ConstanciasList";
import Aprendiz from "../src/pages/SolicitudApoyo/Aprendiz";
import Noticias from "../src/pages/Noticias/Noticias";
import ActivBotdf from "../src/pages/DialogFlow/Activbot";
import MapaReferencia from "../src/pages/MapaReferencia/MapaReferencia";

import "../src/styles/BotHp.css";
import "../src/styles/ColaViento.css";
import "../src/styles/Resposive.css";
import "../src/styles/global.css";
import toast from "react-hot-toast";

export default function DashBoard() {
  const [menuAbierto, setMenuAbierto] = useState(true);
  const [contenidoActual, setContenidoActual] = useState("userviewap");
  const [validando, setValidando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("IdUsuario");



    navigate("/");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const IdUsuario = localStorage.getItem("IdUsuario");

    if (!token || !IdUsuario) {
      toast("⚠️ Debes iniciar sesión primero");
      navigate("/");
    } else {
      const rutaPendiente = localStorage.getItem("rutaDesdeNotificacion");
      if (rutaPendiente) {
        setContenidoActual(rutaPendiente);
        localStorage.removeItem("rutaDesdeNotificacion");
      }

      if (usuario) {
        const fetchUsuario = async () => {
          try {
            const res = await fetch(
              `https://render-hhyo.onrender.com/api/usuario/${IdUsuario}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const data = await res.json();
            setUsuario(data);
          } catch (err) {
            console.error("Error cargando usuario:", err);
          }
        };

        fetchUsuario();
      }

      setValidando(false);
    }
  }, [navigate, usuario]);

  if (validando) {
    return (
      <div
        style={{ textAlign: "center", paddingTop: "5rem", fontSize: "1.5rem" }}
      >
        Validando sesión...
      </div>
    );
  }

  return (
    <section className={`contenedordash ${menuAbierto ? "menu-abierto" : "menu-cerrado"}`}>
      <MenuLateralAp
        menuAbierto={menuAbierto}
        toggleMenu={() => setMenuAbierto(!menuAbierto)}
        setContenidoActual={setContenidoActual}
      />

      <main className="contenidodash">
        <NavbarAp
          toggleMenu={() => setMenuAbierto(!menuAbierto)}
          setContenidoActual={setContenidoActual}
          cerrarSesion={cerrarSesion}
        />

        {contenidoActual === "actividades" && (
          <Actividades setContenidoActual={setContenidoActual} />
        )}
        {contenidoActual === "aplicacion" && <Aplicacion />}
        {contenidoActual === "ludicas" && <Ludicas />}
        {contenidoActual === "horasl" && <HorasLudicas />}
        {contenidoActual.startsWith("feedback-") && (
          <Feedbacks idActividad={contenidoActual.split("-")[1]} />
        )}
        {contenidoActual === "constancia" && <Constancia />}
        {contenidoActual === "alquilerap" && <AlquilerAP />}
        {contenidoActual === "combinar" && <Combinar />}
        {contenidoActual === "chatai" && <ActivBotdf />}
        {contenidoActual === "feedback" && <Feedbacks />}
        {contenidoActual === "cartacontacto" && <CartaContacto />}
        {contenidoActual === "constanciacr" && <Constanciacr />}
        {contenidoActual === "perfil" && <HomeDash />}
        {contenidoActual === "config" && <ConfigViewAp />}
        {contenidoActual === "escanerqr" && <EscanerQR />}
        {contenidoActual === "solicitudapoyoaprendiz" && <Aprendiz />}
        {contenidoActual === "calendarioactividades" && (
          <CalendarioActividades />
        )}
        {contenidoActual === "noticias" && <Noticias />}
        {contenidoActual === "userviewap" && (
          <UserViewAp
            usuario={usuario}
            setContenidoActual={setContenidoActual}
          />
        )}
        {contenidoActual === "mapareferencia" && <MapaReferencia />}
      </main>



      {<ActivBot irAChatai={() => setContenidoActual("chatai")} />}

    </section>
  );
}
