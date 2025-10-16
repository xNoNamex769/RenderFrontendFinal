"use client"

import React, { useState, useEffect } from "react"
import InicioSesion from "./InicioSesion"
import Registro from "./Registro"
import "./styles/cuenta-mejorada.css"
import HeaderHome from "../src/pages/Home/HeaderHome"
import { FaUsers, FaCalendarCheck, FaStar, FaShieldAlt, FaClock, FaMobileAlt } from "react-icons/fa"
import { MdEventAvailable } from "react-icons/md"

export default function CuentaMejorada() {
  const [esLogin, setEsLogin] = useState(true)
  const [testimonioActual, setTestimonioActual] = useState(0)

  const testimonios = [
    {
      texto: "Una plataforma que transforma el aprendizaje en experiencias inolvidables",
      autor: "María González",
      rol: "Aprendiz ADSI"
    },
    {
      texto: "La mejor forma de conectar con eventos y actividades del SENA",
      autor: "Carlos Ramírez",
      rol: "Instructor"
    },
    {
      texto: "Gestión de eventos simplificada y eficiente",
      autor: "Ana Martínez",
      rol: "Coordinadora"
    }
  ]

  const beneficios = [
    {
      icono: <FaCalendarCheck />,
      titulo: "Gestión de Eventos",
      descripcion: "Organiza y participa en actividades fácilmente"
    },
    {
      icono: <FaUsers />,
      titulo: "Comunidad Activa",
      descripcion: "Conecta con más de 2,500 aprendices"
    },
    {
      icono: <FaShieldAlt />,
      titulo: "Seguro y Confiable",
      descripcion: "Tus datos protegidos con tecnología avanzada"
    },
    {
      icono: <FaMobileAlt />,
      titulo: "Acceso Móvil",
      descripcion: "Disponible en cualquier dispositivo"
    }
  ]

  // Rotar testimonios cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonioActual((prev) => (prev + 1) % testimonios.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <HeaderHome />
      <div className="cuenta-mejorada-container">
        <div className="cuenta-mejorada-content">
          
          {/* Panel Izquierdo - Información */}
          <div className="cuenta-panel-info">
            <div className="cuenta-info-header">
              <div className="cuenta-logo-section">
                <div className="cuenta-logo-circle">
                  <MdEventAvailable className="cuenta-logo-icon" />
                </div>
                <h1 className="cuenta-brand-name">ACTIV SENA</h1>
              </div>
              
              <h2 className="cuenta-welcome-title">
                Bienvenido a tu Espacio de Formación
              </h2>
              <p className="cuenta-welcome-subtitle">
                Donde el aprendizaje se convierte en una experiencia única
              </p>
            </div>

            {/* Estadísticas rápidas */}
            <div className="cuenta-stats-grid">
              <div className="cuenta-stat-item">
                <FaUsers className="cuenta-stat-icon" />
                <div className="cuenta-stat-content">
                  <div className="cuenta-stat-number">2,500+</div>
                  <div className="cuenta-stat-label">Aprendices</div>
                </div>
              </div>
              <div className="cuenta-stat-item">
                <MdEventAvailable className="cuenta-stat-icon" />
                <div className="cuenta-stat-content">
                  <div className="cuenta-stat-number">150+</div>
                  <div className="cuenta-stat-label">Eventos</div>
                </div>
              </div>
              <div className="cuenta-stat-item">
                <FaStar className="cuenta-stat-icon" />
                <div className="cuenta-stat-content">
                  <div className="cuenta-stat-number">95%</div>
                  <div className="cuenta-stat-label">Satisfacción</div>
                </div>
              </div>
            </div>

            {/* Beneficios */}
            <div className="cuenta-beneficios">
              <h3 className="cuenta-beneficios-title">¿Por qué ACTIV SENA?</h3>
              <div className="cuenta-beneficios-grid">
                {beneficios.map((beneficio, index) => (
                  <div key={index} className="cuenta-beneficio-item">
                    <div className="cuenta-beneficio-icon">{beneficio.icono}</div>
                    <div className="cuenta-beneficio-content">
                      <h4 className="cuenta-beneficio-titulo">{beneficio.titulo}</h4>
                      <p className="cuenta-beneficio-desc">{beneficio.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonios */}
            <div className="cuenta-testimonios">
              <div className="cuenta-testimonio-card">
                <div className="cuenta-testimonio-quote">"</div>
                <p className="cuenta-testimonio-texto">
                  {testimonios[testimonioActual].texto}
                </p>
                <div className="cuenta-testimonio-autor">
                  <strong>{testimonios[testimonioActual].autor}</strong>
                  <span>{testimonios[testimonioActual].rol}</span>
                </div>
              </div>
              <div className="cuenta-testimonio-dots">
                {testimonios.map((_, index) => (
                  <button
                    key={index}
                    className={`cuenta-dot ${index === testimonioActual ? 'active' : ''}`}
                    onClick={() => setTestimonioActual(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Panel Derecho - Formulario */}
          <div className="cuenta-panel-form">
            <div className="cuenta-form-card">
              <div className="cuenta-form-header">
                <h2 className="cuenta-form-title">
                  {esLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                </h2>
                <p className="cuenta-form-subtitle">
                  {esLogin 
                    ? "Ingresa tus credenciales para continuar" 
                    : "Completa el formulario para registrarte"}
                </p>
              </div>

              <div className="cuenta-form-content">
                {esLogin ? <InicioSesion /> : <Registro />}
              </div>

              
              {/* Información de ayuda */}
              <div className="cuenta-help-section">
                <div className="cuenta-help-item">
                  <FaClock className="cuenta-help-icon" />
                  <span>Soporte 24/7 disponible</span>
                </div>
                <div className="cuenta-help-item">
                  <FaShieldAlt className="cuenta-help-icon" />
                  <span>Conexión segura SSL</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
