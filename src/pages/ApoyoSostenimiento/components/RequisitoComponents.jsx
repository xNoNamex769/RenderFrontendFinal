import React from 'react'
import "./styles/RequisitoStyle.css"

export default function RequisitoComponents({index,requisito}) {
  return (
     <li key={index} className="requisito-item-apoyo">{requisito}</li>
  )
}
