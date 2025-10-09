import React from 'react'
import "./styles/ContactHome.css"
import Email from "./Email"

export default function ContactHome() {
  return (
    <section id="contact" className="contact-section-home">
      <div className="container-home">
        <div className="section-header-home">
          <h2 className='h2-home'>Contáctanos</h2>
        </div>
        <div className="contact-content-home">
          <div className="contact-info-home">
            <h3 className='h3-home'>Ponte en contacto con Nosotros</h3>

            <div className="contact-item-home">
              <div className="contact-icon-home">
                <i className="icon-location-home i-home"></i>
              </div>
              <div className="contact-text-home">
                <h4 className='h4-home'>Nuestra Ubicación</h4>
                <p className='p-home'>	
Kra. 9 No. 71 - 60 Sede Alto Cauca / Carrera 9 <br />Popayán, Colombia, Cauca</p>
              </div>
            </div>

            <div className="contact-item-home">
              <div className="contact-icon-home">
                <i className="icon-phone-home i-home"></i>
              </div>
              <div className="contact-text-home">
                <h4 className='h4-home'>Número de Teléfono</h4>
                <p className='p-home'>+57 3226637578</p>
              </div>
            </div>

            <div className="contact-item-home">
              <div className="contact-icon-home">
                <i className="icon-email-home i-home"></i>
              </div>
              <div className="contact-text-home">
                <h4 className='h4-home'>Correo Electrónico</h4>
                <p className='p-home'>activsena66@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Aquí el formulario de contacto */}
          <Email />
        </div>
      </div>
    </section>
  )
}
