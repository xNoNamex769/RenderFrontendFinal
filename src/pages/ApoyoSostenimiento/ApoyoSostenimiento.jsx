"use client"
import React, { useState, useEffect } from "react"
import "./styles/ApoyoSostenimientoStyle.css"
import HeaderHome from "../Home/HeaderHome"
import FooterHome from "../Home/FooterHome"
import PasoComponent from "./components/PasoComponent"
import EnlacesYRecursos from "./components/EnlacesYRecursosComponent"
import qrFormulario from "./img/qr-formulario-documentos.png"
import qrInscripcion from "./img/qr-inscripcion.png"
import qrSofiaPlus from "./img/qr-sofiaplus.png"
import FechasImportantesComponent from "./components/FechasImportantesComponent"
import RequisitoComponents from "./components/RequisitoComponents"
import NecesitasAyudaCardComponent from "./components/NecesitasAyudaCardComponent"
import NotaImportante from "./components/NotaImportante"

export default function ApoyoSostenimiento() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStep, setSelectedStep] = useState(null)
  const [theme, setTheme] = useState("light")

  // Detectar tema del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleThemeChange = (e) => {
      setTheme(e.matches ? "light" : "dark")
      document.documentElement.setAttribute("data-theme", e.matches ? "light" : "dark")
    }

    // Establecer tema inicial
    handleThemeChange(mediaQuery)

    // Escuchar cambios
    mediaQuery.addEventListener("change", handleThemeChange)

    return () => mediaQuery.removeEventListener("change", handleThemeChange)
  }, [])

  const pasos = [
    {
      numero: 1,
      titulo: "Inscripcion De Sofía Plus",
      descripcion: "Ingresa al link de inscripcion y selecciona la convocatoria de Apoyo de Sostenimiento en SofiaPlus. Y sigue los pasos.",
      enlace: "https://oferta.senasofiaplus.edu.co/sofia-oferta/inscripcion-apoyo-sostenimiento.html",
      enlaceBtn2: "",
      detalles:
        "Debes tener tu documento de identidad y correo electrónico activo. El registro es gratuito y te permitirá acceder a la convocatoria de Apoyo de Sostenimiento.",
    },
    {
      numero: 2,
      titulo: "Crear un solo PDF con los documentos requeridos",
      descripcion: "En un solo PDF El cuál debe ser nombrado así: NOMBRE y APELLIDOS en MAYÚSCULAS y Número de Documento de Identidad.",
      enlace: "https://forms.office.com/r/documentos-ctpi",
      enlaceBtn2: "https://drive.google.com/file/d/1S4t_0-jXVglCEb2hvg3895zSnBRdf5v7/view?usp=drivesdk",
      detalles:
      `El PDF debe tener los documentos legibles y en este orden:
1. Formato de registro de condición socioeconómica (GFPI-F-027-V-08) correctamente diligenciado y firmado. Se puede descargar presionando el boton.
2.    Fotocopia del Documento de Identidad Vigente.
3.    Y los demás documentos que soporten cada uno de los criterios de Priorización en caso de que el/la aprendiz ostente dicha calidad los cuales se relacionan en la tabla de abajo:`,
      
},
    {
      numero: 3,
      titulo: "Completar Formulario de Documentos",
      descripcion: "Carga todos los documentos requeridos en el formulario.",
      enlace: "https://forms.gle/hkSx9TERWH5CLr9s6",
      enlaceBtn2: "",
      detalles:
        "En el siguiente link encontrará un formulario que debe diligenciar de forma cuidadosa y podrá subir el PDF con los soportes anteriormente mencionados en el paso 2",
    },
  ]


  const enlacesApoyo = [
  {
    icono: "🌐",
    titulo: "Ingresar \n a Sofía Plus",
    descripcion: "Plataforma oficial de ofertas educativas del SENA",
    enlace: "https://oferta.senasofiaplus.edu.co/sofia-oferta/",
    textoEnlace: "Acceder a Sofía Plus",
    qrImage: qrSofiaPlus
  },
  {
    icono: "📋",
    titulo: "Formulario de Documentos",
    descripcion: "Carga tus documentos requeridos para la convocatoria",
    enlace: "https://forms.gle/hkSx9TERWH5CLr9s6",
    textoEnlace: "Cargar Documentos",
    qrImage: qrFormulario
  },
    {
    icono: "📝",
    titulo: "Inscripcion de Sofia Plus",
    descripcion: "Plataforma donde se hara la inscripcion al Apoyo de Sostenimiento",
    enlace: "https://oferta.senasofiaplus.edu.co/sofia-oferta/inscripcion-apoyo-sostenimiento.html",
    textoEnlace: "Acceder a la Inscripcion",
    qrImage: qrInscripcion
  },
];
  const fechasImportantes = [
    { fecha: "15 de Enero 2025", evento: "Apertura de convocatoria" },
    { fecha: "28 de Febrero 2025", evento: "Cierre de inscripciones" },
    { fecha: "15 de Marzo 2025", evento: "Publicación de resultados" },
    { fecha: "1 de Abril 2025", evento: "Inicio de actividades" },
  ]

  const requisitosBasicos = [
    "Ser aprendiz activo del SENA Regional Cauca",
    "Estar matriculado en programa técnico o tecnológico",
    "Tener documentos de identidad vigentes",
    "Cumplir con los criterios socioeconómicos establecidos",
    "No tener sanciones disciplinarias vigentes"
  ]

  const necesitasAyudaInformacino = [
    {titulo: "Correo de Contacto:", descripcion : "activsena66@gmail.com",icon:"📧", href:"mailto:apoyoctpi@sena.edu.co"},
    {titulo: "Teléfono:", descripcion: "+57 322 663 7578", icon:"📞", href:"tel:+573226637578"},
    {titulo: "Horario de Atención:", descripcion: "Lunes a Viernes: 9:00 AM - 5:00 PM", icon:"🕒", href:""},
  ]

  const openModal = (step) => {
    setSelectedStep(step)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedStep(null)
  }

  return (
    
    <div className="page-apoyo">
      {/* Header Space */}
      <HeaderHome />

      {/* Hero Section */}
      <section className="hero-apoyo">
        <div className="container-apoyo">
          <div className="hero-content-apoyo">
            <div className="hero-badge-apoyo">
              <span>2DA CONVOCATORIA CTPI 2025</span>
            </div>
            <h1 className="hero-title-apoyo">
              Bienvenido a la <span className="highlight-apoyo">Convocatoria de Apoyo Regular</span> SENA Regional Cauca
            </h1>
            <p className="hero-description-apoyo">
              Esta convocatoria representa una oportunidad única para que los aprendices del SENA Regional Cauca accedan
              a apoyo económico regular que les permita continuar y completar exitosamente su formación técnica y
              tecnológica.
            </p>
            <div className="hero-buttons-apoyo">
              <button className="btn-primary-apoyo" onClick={() => document.getElementById("pasos").scrollIntoView()}>
                Comenzar Inscripción
              </button>
              <button
                className="btn-secondary-apoyo"
                onClick={() => document.getElementById("requisitos").scrollIntoView()}
              >
                Ver Requisitos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pasos de Inscripción */}
      <section id="pasos" className="pasos-apoyo">
        <div className="container-apoyo">
          <div className="section-header-apoyo">
            <h2 className="section-title-apoyo">Pasos para la Inscripción</h2>
            <p className="section-description-apoyo">
              Sigue estos pasos para completar tu inscripción de manera exitosa
            </p>
          </div>
          <div className="pasos-grid-apoyo">
            {pasos.map((paso, index) => (
                <PasoComponent paso={paso} index={index} openModal={openModal}/>
            ))}
          </div>
        </div>
      </section>
            {/* Criterios de Priorización */}
      <section className="criterios-apoyo">
        <div className="container-apoyo">
          <div className="section-header-apoyo">
            <h2 className="section-title-apoyo">Criterios de Priorización</h2>
            <p className="section-description-apoyo">
              Si tienes alguno o más de los siguientes certificados los puedes anexar al PDF en el siguiente orden
            </p>
          </div>
          <div className="tabla-container-apoyo">
            <table className="tabla-criterios-apoyo">
              <thead>
                <tr className="tabla-header-apoyo">
                  <th className="tabla-th-apoyo">PRIORIDAD DE ASIGNACIÓN</th>
                  <th className="tabla-th-puntos-apoyo">PUNTOS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="tabla-row-apoyo">
                  <td className="tabla-td-apoyo">Aprendices con discapacidad</td>
                  <td className="tabla-td-puntos-apoyo">15</td>
                </tr>
                <tr className="tabla-row-apoyo">
                  <td className="tabla-td-apoyo">Aprendices de etnias, comunidades NARP, ROM o pueblos indígenas</td>
                  <td className="tabla-td-puntos-apoyo">15</td>
                </tr>
                <tr className="tabla-row-apoyo">
                  <td className="tabla-td-apoyo">Aprendiz Campesino</td>
                  <td className="tabla-td-puntos-apoyo">15</td>
                </tr>
                <tr className="tabla-row-apoyo">
                  <td className="tabla-td-apoyo">Aprendiz madre o padre cabeza de familia</td>
                  <td className="tabla-td-puntos-apoyo">10</td>
                </tr>
                <tr className="tabla-row-apoyo">
                  <td className="tabla-td-apoyo">
                    Aprendiz víctima del conflicto armado Ley 1448 de 2011- Decreto 4800 de 2011
                  </td>
                  <td className="tabla-td-puntos-apoyo">10</td>
                </tr>
                <tr className="tabla-row-apoyo">
                  <td className="tabla-td-apoyo">
                    Aprendiz embarazada o en período de lactancia hasta un (1) año después del parto y por razones de
                    lactancia
                  </td>
                  <td className="tabla-td-puntos-apoyo">10</td>
                </tr>
                <tr className="tabla-row-apoyo">
                  <td className="tabla-td-apoyo">
                    Aprendiz víctima de violencia basada en género y violencia contra la mujer
                  </td>
                  <td className="tabla-td-puntos-apoyo">10</td>
                </tr>
                <tr className="tabla-row-apoyo">
                  <td className="tabla-td-apoyo">Aprendiz con hermanos en el SENA</td>
                  <td className="tabla-td-puntos-apoyo">10</td>
                </tr>
                <tr className="tabla-row-apoyo">
                  <td className="tabla-td-apoyo">
                    Aprendiz en situación de desplazamiento por fenómenos naturales en los últimos dos (2) años
                  </td>
                  <td className="tabla-td-puntos-apoyo">5</td>
                </tr>
                <tr className="tabla-row-apoyo">
                  <td className="tabla-td-apoyo">Aprendiz nivel SISBEN grupo A1, A2, A3, A4, A5, B1, B2</td>
                  <td className="tabla-td-puntos-apoyo">5</td>
                </tr>
                <tr className="tabla-row-apoyo">
                  <td className="tabla-td-apoyo">
                    Aprendiz perteneciente a una comunidad institucional o vocero de aprendices
                  </td>
                  <td className="tabla-td-puntos-apoyo">5</td>
                </tr>
                <tr className="tabla-row-apoyo">
                  <td className="tabla-td-apoyo">
                    Aprendiz que participa en: Semillero de investigación o WorldSkills o SENNOVA (apropiación del
                    centro)
                  </td>
                  <td className="tabla-td-puntos-apoyo">5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Enlaces Importantes */}
      <section className="enlaces-apoyo">
        <div className="container-apoyo">
          <div className="section-header-apoyo">
            <h2 className="section-title-apoyo">Enlaces y Recursos Importantes</h2>
            <p className="section-description-apoyo">Accede rápidamente a las plataformas y formularios oficiales</p>
          </div>
          <div className="enlaces-grid-apoyo">
            {
              enlacesApoyo.map((item, index) => (
                <EnlacesYRecursos item={item} index={index} qrImage={item.qrImage}/>
              ))
            }
          </div>
        </div>
      </section>

      {/* Fechas Importantes y Requisitos */}
      <section id="requisitos" className="info-apoyo">
        <div className="container-apoyo">
          <div className="info-grid-apoyo">
            <div className="fechas-apoyo">
              <h3 className="info-title-apoyo">Fechas Importantes</h3>
              <div className="fechas-list-apoyo">
                {fechasImportantes.map((item, index) => (
                  <FechasImportantesComponent index={index} fecha={item.fecha} evento={item.evento} />
                ))}
              </div>
            </div>
            <div className="requisitos-apoyo">
              <h3 className="info-title-apoyo">Requisitos Básicos</h3>
              <ul className="requisitos-list-apoyo">
                {requisitosBasicos.map((requisito, index)=> (
                  <RequisitoComponents index={index} requisito={requisito} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
     
      {/* Contacto */}
      <section className="contacto-apoyo">
        <div className="container-apoyo">
          <div className="contacto-content-apoyo">
            <div className="contacto-info-apoyo">
              <h3 className="contacto-title-apoyo">¿Necesitas Ayuda?</h3>
              <p className="contacto-description-apoyo">
                Nuestro equipo está disponible para resolver tus dudas sobre la convocatoria
              </p>
              <div className="contacto-details-apoyo">
                {necesitasAyudaInformacino.map((item, index) => (
                  <NecesitasAyudaCardComponent idenx={index} item={item}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <NotaImportante />

      {/* Modal */}
      {modalOpen && selectedStep && (
        <div className="modal-overlay-apoyo" onClick={closeModal}>
          <div className="modal-content-apoyo" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-apoyo">
              <h3 className="modal-title-apoyo">{selectedStep.titulo}</h3>
              <button className="modal-close-apoyo" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body-apoyo">
              <p className="modal-description-apoyo">{selectedStep.detalles}</p>
              <a href={selectedStep.numero != 2 ? selectedStep.enlace : selectedStep.enlaceBtn2} className="btn-primary-apoyo" target="_blank" rel="noopener noreferrer">
                Ir al Enlace
              </a>
            </div>
          </div>
        </div>
      )}
      <FooterHome />
      {/* Indicador de tema */}
    </div>
    
  )
}
