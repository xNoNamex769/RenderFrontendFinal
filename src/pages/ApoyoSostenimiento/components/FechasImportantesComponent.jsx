import React from 'react'
import "./styles/FechasImportantesStyle.css"

export default function FechasImportantesComponent({index, fecha, evento}) {
  return (
    <div key={index} className="fecha-item-apoyo">
        <div className="fecha-date-apoyo">{fecha}</div>
        <div className="fecha-event-apoyo">{evento}</div>
    </div>

  )
}
