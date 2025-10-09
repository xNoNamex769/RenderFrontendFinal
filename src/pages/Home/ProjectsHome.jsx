import React from 'react'
import "./styles/ProjectsHome.css"
import ProjectCardComponent from './HomeComponents/ProjectCardComponent'


let projects = [
  {
    title: "Gestion Eficiente",
    description: "Optimiza tus procesos y gestiona tus actividades de manera efectiva.",
    image: "/img/actividades.jpg"
  },
  {
    title: "Comunidad Activa",
    description: "Conéctate con otros usuarios y comparte conocimientos.",
    image: "/img/activ.png"
  },
  {
    title: "Eventos y Actividades",
    description: "Participa en eventos y actividades exclusivas para nuestros usuarios.",
       image: "/img/eventos.jpg"
  }
]

export default function ProjectsHome() {
  return (
    <section id="projects" className="projects-section-home">
      <div className="container-home">
        <div className="section-header-home">
          <h2 className='h2-home'>Nuestros Proyectos</h2>
        </div>
     <div className="projects-grid-home">
  {projects.map((project, index) => (
    <ProjectCardComponent
      key={index}
      title={project.title}
      description={project.description}
      image={project.image}
    />
  ))}
</div>
      </div>
    </section>
  )
}
