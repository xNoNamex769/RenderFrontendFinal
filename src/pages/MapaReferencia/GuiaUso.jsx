import React from 'react';
import { FaMapMarkerAlt, FaSearch, FaFilter, FaRoute, FaInfoCircle } from 'react-icons/fa';
import './GuiaUso.css';

function GuiaUso({ onClose }) {
  return (
    <div className="guia-uso-overlay">
      <div className="guia-uso-modal">
        <button className="guia-cerrar" onClick={onClose}>✕</button>
        
        <div className="guia-header">
          <FaMapMarkerAlt className="guia-icono-principal" />
          <h2>Guía de Uso del Mapa</h2>
          <p>Aprende a usar todas las funcionalidades del mapa de referencia</p>
        </div>

        <div className="guia-contenido">
          <div className="guia-seccion">
            <div className="guia-paso">
              <div className="guia-numero">1</div>
              <div className="guia-info">
                <h3><FaInfoCircle /> Permitir Ubicación</h3>
                <p>El navegador te pedirá permiso para acceder a tu ubicación. Esto nos ayuda a mostrarte qué tan lejos estás de cada lugar.</p>
              </div>
            </div>

            <div className="guia-paso">
              <div className="guia-numero">2</div>
              <div className="guia-info">
                <h3><FaSearch /> Buscar Lugares</h3>
                <p>Usa la barra de búsqueda para encontrar lugares específicos por nombre o descripción.</p>
              </div>
            </div>

            <div className="guia-paso">
              <div className="guia-numero">3</div>
              <div className="guia-info">
                <h3><FaFilter /> Filtrar por Categoría</h3>
                <p>Haz clic en los botones de categoría para ver solo ciertos tipos de lugares:</p>
                <ul>
                  <li>🎓 <strong>SENA:</strong> Centros de formación</li>
                  <li>📚 <strong>Bibliotecas:</strong> Espacios de estudio</li>
                  <li>🌳 <strong>Recreación:</strong> Parques y deportes</li>
                  <li>🏥 <strong>Salud:</strong> Centros médicos</li>
                  <li>🍽️ <strong>Alimentación:</strong> Cafeterías y restaurantes</li>
                  <li>🚌 <strong>Transporte:</strong> Paraderos públicos</li>
                </ul>
              </div>
            </div>

            <div className="guia-paso">
              <div className="guia-numero">4</div>
              <div className="guia-info">
                <h3><FaMapMarkerAlt /> Explorar el Mapa</h3>
                <p>Haz clic en los marcadores del mapa para ver información detallada de cada lugar, incluyendo servicios disponibles y distancia desde tu ubicación.</p>
              </div>
            </div>

            <div className="guia-paso">
              <div className="guia-numero">5</div>
              <div className="guia-info">
                <h3><FaRoute /> Obtener Direcciones</h3>
                <p>Presiona el botón "Cómo llegar" en cualquier lugar para abrir Google Maps y obtener indicaciones de navegación.</p>
              </div>
            </div>
          </div>

          <div className="guia-consejos">
            <h3>💡 Consejos Útiles</h3>
            <ul>
              <li>Puedes hacer zoom en el mapa usando la rueda del mouse o los botones +/-</li>
              <li>Arrastra el mapa para explorar diferentes áreas</li>
              <li>La lista lateral muestra todos los lugares filtrados con su distancia</li>
              <li>Los marcadores tienen colores según su categoría</li>
            </ul>
          </div>
        </div>

        <button className="guia-btn-entendido" onClick={onClose}>
          ¡Entendido!
        </button>
      </div>
    </div>
  );
}

export default GuiaUso;
