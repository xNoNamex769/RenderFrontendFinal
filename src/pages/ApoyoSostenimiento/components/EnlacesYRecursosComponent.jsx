import React, { useState } from 'react';
import './styles/EnlacesYRecursosStyle.css';
export default function EnlacesYRecursos ({item, index, qrImage}) {
  const [showModal, setShowModal] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = 'qr-download.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="enlace-card-apoyo" key={index}>
        <div className="enlace-icon-apoyo">{item.icono}</div>
        <h3 className="enlace-title-apoyo">{item.titulo}</h3>
        <p className="enlace-description-apoyo">
          {item.descripcion}
        </p>
        <a
          href={item.enlace}
          className="btn-enlace-apoyo"
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.textoEnlace}
        </a>
        <div className="qr-placeholder-apoyo">
          <div className="qr-code-apoyo">QR</div>
          <button
            className="btn-qr-apoyo"
            onClick={() => setShowModal(true)}
          >
            Mostrar QR
          </button>
        </div>
      </div>

      {/* Modal QR */}
      {showModal && (
        <div className="modal-overlay-apoyo">
          <div className="modal-content-apoyo">
            <button
              className="modal-close-apoyo"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className="modal-title-apoyo">Escanear QR</h2>
            <div className="qr-visual-apoyo">
              <img
                src={qrImage}
                alt="Código QR Formulario"
                className="qr-image-apoyo"
              />
              <p>Escanea para acceso rápido</p>
              <button className="modal-button-apoyo" onClick={handleDownload}>
                Descargar QR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
