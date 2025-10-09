// ModalEstadisticas.tsx
import React from "react";
import ReporteEstadisticas from "./ReporteEstadisticas";
import "../styles/Estadisticas.css";

interface ModalEstadisticasProps {
  open: boolean;    
  onClose: () => void;
  eventos: any[];
  asistencias: Record<number, any[]>;
}

export default function ModalEstadisticas({ open, onClose, eventos, asistencias }: ModalEstadisticasProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✖</button>
        <ReporteEstadisticas eventos={eventos} asistencias={asistencias} />
      </div>
    </div>
  );
}
