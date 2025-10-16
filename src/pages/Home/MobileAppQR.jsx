import React from 'react';
import { FaMobileAlt, FaDownload, FaQrcode, FaApple, FaAndroid } from 'react-icons/fa';
import './styles/MobileAppQR.css';

export default function MobileAppQR() {
  return (
    <section id="mobile-app" className="mobile-qr-section">
      <div className="mobile-qr-container">
        <div className="mobile-qr-header">
          <h2 className="mobile-qr-main-title">
            <FaMobileAlt className="mobile-qr-title-icon" /> 
            Descarga Nuestra App Móvil
          </h2>
          <p className="mobile-qr-subtitle">
            Lleva ActivSena contigo a donde vayas. Escanea el código QR y descarga nuestra aplicación móvil.
          </p>
        </div>

        <div className="mobile-qr-content">
          {/* Columna izquierda - Información */}
          <div className="mobile-qr-info">
            <h3 className="mobile-qr-info-title">
              ¡Accede desde tu dispositivo móvil!
            </h3>
            <p className="mobile-qr-info-description">
              Con la aplicación móvil de ActivSena podrás:
            </p>
            
            <ul className="mobile-qr-features-list">
              <li className="mobile-qr-feature-item">
                <div className="mobile-qr-feature-icon">✓</div>
                <span>Consultar actividades y eventos en tiempo real</span>
              </li>
              <li className="mobile-qr-feature-item">
                <div className="mobile-qr-feature-icon">✓</div>
                <span>Registrar tu asistencia con código QR</span>
              </li>
              <li className="mobile-qr-feature-item">
                <div className="mobile-qr-feature-icon">✓</div>
                <span>Recibir notificaciones de nuevos eventos</span>
              </li>
              <li className="mobile-qr-feature-item">
                <div className="mobile-qr-feature-icon">✓</div>
                <span>Acceder a tu perfil y estadísticas</span>
              </li>
              <li className="mobile-qr-feature-item">
                <div className="mobile-qr-feature-icon">✓</div>
                <span>Ver anuncios y noticias importantes</span>
              </li>
            </ul>

            <div className="mobile-qr-platforms">
              <div className="mobile-qr-platform-badge">
                
                
              </div>
              <div className="mobile-qr-platform-badge">
               
              </div>
            </div>
          </div>

          {/* Columna derecha - QR Code */}
          <div className="mobile-qr-code-wrapper">
            <div className="mobile-qr-card">
              <div className="mobile-qr-card-header">
                <FaQrcode className="mobile-qr-card-icon" />
                <h4 className="mobile-qr-card-title">Escanea para Descargar</h4>
              </div>
              
              <div className="mobile-qr-image-container">
                <img 
                  src="/img/qr-app-movil.jpeg" 
                  alt="QR Code para descargar ActivSena App" 
                  className="mobile-qr-image"
                />
                <div className="mobile-qr-glow"></div>
              </div>

              <div className="mobile-qr-instructions">
                <p className="mobile-qr-instructions-text">
                  <FaDownload className="mobile-qr-instruction-icon" />
                  Abre la cámara de tu teléfono y apunta al código QR
                </p>
              </div>

              <div className="mobile-qr-badge">
                <span className="mobile-qr-badge-text">100% Gratis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decoración de fondo */}
        <div className="mobile-qr-decoration">
          <div className="mobile-qr-decoration-circle mobile-qr-decoration-circle-1"></div>
          <div className="mobile-qr-decoration-circle mobile-qr-decoration-circle-2"></div>
          <div className="mobile-qr-decoration-circle mobile-qr-decoration-circle-3"></div>
        </div>
      </div>
    </section>
  );
}
