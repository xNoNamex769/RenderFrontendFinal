import React from 'react'
import "./styles/PasoComponentStyle.css"

export default function PasoComponent({paso, index, openModal}) {
  return (
    <div key={index} className="paso-card-apoyo">
        <div className="paso-number-apoyo">{paso.numero}</div>
        <h3 className="paso-title-apoyo">{paso.titulo}</h3>
        <p className="paso-description-apoyo">{paso.descripcion}</p>
        <div className="paso-actions-apoyo">
            <a href={paso.enlace} className="btn-link-apoyo" target="_blank" rel="noopener noreferrer">
            Ir al Enlace
            </a>
            <button className="btn-info-apoyo" onClick={() => openModal(paso)}>
                Más Info
            </button>
        </div>
    </div>
  )
}
