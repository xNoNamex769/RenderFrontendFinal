import React from 'react' 
import "../styles/HomeEstilosPrincipales.css"
import "./styles/ProjectCardComponent.css"


export default function ProjectCardComponent({ title, description, image }) {
  return (
    <div className="project-card-home">
      <img src={image} alt={title} className="project-image-home img-home" />
      <div className="project-overlay-home">
        <div className="project-category-home">{title}</div>
        <h3 className="project-title-home h3-home">{description}</h3>
        <a href="#" className="project-link-home a-home">
          Ver Proyecto <i className="icon-arrow-right-long-home"></i>
        </a>
      </div>
    </div>
  )
}
