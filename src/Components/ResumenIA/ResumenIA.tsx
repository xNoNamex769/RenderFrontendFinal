import React from "react";
import "./style/ResumenIA.css";

interface DetalleAsistente {
  nombre: string;
  ficha: string;
  jornada: string;
  programa: string; 
}

interface ResumenIAProps {
  resumen: {
    porcentajeParticipacion: number;
    fichaMayorParticipacion: string;
    fichaDestacadaPrograma: string; // <-- no olvides esta propiedad
    jornadaDestacada: string;
    resumenIA: string;
    Actividad: { NombreActi: string };
    Evento: { NombreEvento: string };
    detalleAsistentes: DetalleAsistente[];
  };
}

const ResumenIA: React.FC<ResumenIAProps> = ({ resumen }) => {
  return (
    <div className="resumen-container">
      <h2 className="resumen-titulo">📊 Resumen de Participación</h2>

      <div className="resumen-info">
        <p><strong>Actividad:</strong> {resumen.Actividad.NombreActi}</p>
        <p><strong>Evento:</strong> {resumen.Evento.NombreEvento}</p>
        <p><strong>Participación:</strong> {resumen.porcentajeParticipacion.toFixed(1)}%</p>
        <p>
          <strong>Ficha destacada:</strong> {resumen.fichaMayorParticipacion} – <em>{resumen.fichaDestacadaPrograma}</em>
        </p>
        <p><strong>Jornada destacada:</strong> {resumen.jornadaDestacada}</p>
        <p className="resumen-frase">🧠 {resumen.resumenIA}</p>
      </div>

      <div className="resumen-asistentes">
        <h3>✅ Asistentes:</h3>
        <ul>
          {resumen.detalleAsistentes.map((a, index) => (
            <li key={index}>
              {a.nombre} – Ficha: <strong>{a.ficha}</strong>, Jornada: <strong>{a.jornada}</strong>, Programa: <strong>{a.programa}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResumenIA;
