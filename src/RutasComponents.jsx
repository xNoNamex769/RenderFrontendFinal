import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { IAProvider } from "./pages/AnalisisIA/IAcontext";
import { AuthProvider } from "./Context/AuthContext"; 

// Tus imports de componentes
import HomePage from "../public/HomePage";
import DashBoard from "../public/DashBoard";
import DashBoardAp from "../public/DashBoardAp";
import DashBoardIn from "../public/DashBoardIn";
import Registro from "../public/Registro";
import Actividades from "./pages/Actividades/Actividades";
import Agenda from "./pages/Agenda/Agenda";
import VerificarToken from "../public/VerificarToken";
import Asistencia from "./pages/Asistencia/Asistencia";
import EscanerQR from "./Components/QrGenerador.jsx/EscanerHtml5QR";
import Cuenta from "../public/Cuenta";
import CuentaMejorada from "../public/CuentaMejorada";
import QRGenerator from "./Components/QrGenerador.jsx/QRGenerator";
import HistorialAsistencia from "./pages/Asistencia/HistorialAsistencia";
import QRGeneratorSalida from "./Components/QrGenerador.jsx/QRGeneratorSalida";
import FormularioCatalogo from "./pages/AlquierAP/FormularioCatalogo";
import GestionCatalogo from "./pages/AlquierAP/GestionFormulario";

import ApoyoSostenimiento from "./pages/ApoyoSostenimiento/ApoyoSostenimiento";
import Feedbacks from '../src/pages/Feedback/Feedbacks';

import SubirAprendices from "./pages/SubirAprendices/SubirAprendices"
import AprendicesCargados from "./pages/SubirAprendices/AprendicesCargados"
import PlanificarEvento from "./pages/PlanificarEv/PlanificarEvento";
import ToastProvider from "../public/ToastProvider";
import UsuariosCargados from "../public/UsuariosCargados";
import Aplicacion from "../src/pages/Aplicacion/Aplicacion"
import HorasLudicas from "./pages/HorasLudicas/HorasLudicas";
import EventoAnalisisIA from "./pages/EventoAnalisis/EventoAnalisisIA";
import MapaReferencia from "./pages/MapaReferencia/MapaReferencia";
export default function RutasComponents() {
  return (
    <BrowserRouter>
     <ToastProvider />
      <AuthProvider> {/* Se envuelve todo*/}
        <IAProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cuenta" element={<Cuenta />} />
            <Route path="/cuenta-mejorada" element={<CuentaMejorada />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/verificar-token" element={<VerificarToken />} />
            <Route path="/dash" element={<DashBoard />} />
            <Route path="/dashap" element={<DashBoardAp />} />
            <Route path="/dashin" element={<DashBoardIn />} />
             <Route path="/horasl" element={<HorasLudicas />} />
            <Route path="/actividades" element={<Actividades />} />
            <Route path="/historial" element={<HistorialAsistencia />} />
            <Route path="/formulariocatalogo" element={<FormularioCatalogo />} />
            <Route path="/gestioncatalogo" element={<GestionCatalogo />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/qr-salida" element={<QRGeneratorSalida />} />
            <Route path="/qr" element={<QRGenerator IdUsuario={1} IdActividad={9} tipo="entrada" />} />
            <Route path="/asistencia" element={<Asistencia />} />
            <Route path="/escaner" element={<EscanerQR />} />
              <Route path="/feedbacks/:idActividad" element={<Feedbacks />} />
             <Route path="/subiraprendiz" element={<SubirAprendices />} />
               <Route path="/aprendices" element={<AprendicesCargados />} />
               <Route path="/usuarios-registrados" element={<UsuariosCargados />} />
            <Route path="/historial" element={<HistorialAsistencia IdUsuario={1} />} />
            <Route path="/apoyo-sostenimiento" element={<ApoyoSostenimiento />} />
               <Route path="/mapareferencia" element={<MapaReferencia />} />
               <Route path="/aplicacion" element={<Aplicacion />} />
             <Route path="/planevento" element={<PlanificarEvento />} />
               <Route path="/feedback" element={<Feedbacks />} />
            <Route path="/analisis-eventos" element={<EventoAnalisisIA />} />
          </Routes>
        </IAProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
