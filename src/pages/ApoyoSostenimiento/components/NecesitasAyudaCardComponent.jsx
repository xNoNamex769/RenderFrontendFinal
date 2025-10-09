import React from 'react'
import "./styles/NecesitasAyudaCardStyle.css"

export default function NecesitasAyudaCardComponent({idenx, item}) {
  return (
    <div key={idenx} className="contacto-item-apoyo">
        <span className="contacto-icon-apoyo">{item.icon}</span>
        <div>
            <strong>{item.titulo}</strong>
            <br />
            <a href={item.href} className="contacto-link-apoyo">
                {item.descripcion}
            </a>
        </div>
    </div>
  )
}
