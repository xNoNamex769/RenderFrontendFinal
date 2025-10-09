import React from 'react'
import "../styles/HomeEstilosPrincipales.css"
import "./styles/FormComponent.css"

export default function FormComponent() {
  return (
    <div className="contact-form-home">
      <form id="contactForm-home">
        <div className="form-group-home">
          <label htmlFor="name-home">Tu Nombre</label>
          <input
            type="text"
            id="name-home"
            name="name"
            className="form-control-home"
            autoComplete="name" //  agregado
            required
          />
        </div>
        <div className="form-group-home">
          <label htmlFor="email-home">Tu Correo</label>
          <input
            type="email"
            id="email-home"
            name="email"
            className="form-control-home"
            autoComplete="email" //  agregado
            required
          />
        </div>
        <div className="form-group-home">
          <label htmlFor="subject-home">Asunto</label>
          <input
            type="text"
            id="subject-home"
            name="subject"
            className="form-control-home"
            autoComplete="off" //  navegador no debería autocompletar esto
            required
          />
        </div>
        <div className="form-group-home">
          <label htmlFor="message-home">Tu Mensaje</label>
          <textarea
            id="message-home"
            name="message"
            className="form-control-home"
            autoComplete="off" // también mejor desactivar aquí
            required
          ></textarea>
        </div>
        <button type="submit" className="btn-submit-home">Enviar Mensaje</button>
      </form>
    </div>
  )
}
