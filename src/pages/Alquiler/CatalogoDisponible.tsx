import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBox, FaClipboardList, FaCheckCircle, FaInbox, FaCheck, FaTimes, FaSearch } from "react-icons/fa";
import "./styles/Alquiler.css";

interface AlquilerElemento {
  IdAlquiler: number;
  CantidadDisponible: number;
  Nombre: string;
  Imagen: string; // Debe ser la URL de Cloudinary
  IdElemento: number;
}

const CatalogoDisponible = () => {
  const [catalogo, setCatalogo] = useState<AlquilerElemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrActivo, setQrActivo] = useState<AlquilerElemento | null>(null);

  useEffect(() => {
    const fetchCatalogo = async () => {
      try {
        const response = await axios.get(
          "https://render-hhyo.onrender.com/api/elemento"
        );
        setCatalogo(response.data);
      } catch (error) {
        console.error("Error al cargar catálogo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogo();
  }, []);

  const cerrarModal = () => {
    setQrActivo(null);
  };

  if (loading) {
    return (
      <div className="cat-disp-loading">
        <div className="cat-disp-spinner"></div>
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  const totalDisponibles = catalogo.reduce((sum, el) => sum + el.CantidadDisponible, 0);

  return (
    <div className="cat-disp-wrapper">
      {/* Header */}
      <div className="cat-disp-header">
        <h1 className="cat-disp-title"><FaBox /> Catálogo de Elementos</h1>
        <p className="cat-disp-subtitle">Explora los elementos disponibles para alquiler</p>
      </div>

      {/* Estadísticas */}
      <div className="cat-disp-stats">
        <div className="cat-disp-stat-card">
          <div className="cat-disp-stat-icon"><FaClipboardList /></div>
          <div className="cat-disp-stat-content">
            <span className="cat-disp-stat-value">{catalogo.length}</span>
            <span className="cat-disp-stat-label">Tipos de Elementos</span>
          </div>
        </div>
        <div className="cat-disp-stat-card">
          <div className="cat-disp-stat-icon"><FaCheckCircle /></div>
          <div className="cat-disp-stat-content">
            <span className="cat-disp-stat-value">{totalDisponibles}</span>
            <span className="cat-disp-stat-label">Total Disponibles</span>
          </div>
        </div>
      </div>

      {/* Grid de elementos */}
      {catalogo.length === 0 ? (
        <div className="cat-disp-empty">
          <div className="cat-disp-empty-icon"><FaInbox /></div>
          <p>No hay elementos disponibles en el catálogo</p>
        </div>
      ) : (
        <div className="cat-disp-grid">
          {catalogo.map((el) => (
            <div key={el.IdElemento} className="cat-disp-card">
              <div className="cat-disp-img-wrapper">
                <img
                  src={el.Imagen}
                  alt={el.Nombre}
                  className="cat-disp-img"
                  onError={(e) => (e.currentTarget.src = "/img/no-image.png")}
                />
                <div className="cat-disp-badge-wrapper">
                  <span className={`cat-disp-badge ${el.CantidadDisponible > 0 ? 'disponible' : 'agotado'}`}>
                    {el.CantidadDisponible > 0 ? <><FaCheck /> Disponible</> : <><FaTimes /> Agotado</>}
                  </span>
                </div>
              </div>
              <div className="cat-disp-card-body">
                <h3 className="cat-disp-card-title">{el.Nombre}</h3>
                <div className="cat-disp-stock">
                  <span className="cat-disp-stock-icon"><FaBox /></span>
                  <span className="cat-disp-stock-text">{el.CantidadDisponible} unidades</span>
                </div>
                <button onClick={() => setQrActivo(el)} className="cat-disp-btn">
                  <FaSearch /> Ver Código QR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal QR */}
      {qrActivo && (
        <div className="cat-disp-modal-overlay" onClick={cerrarModal}>
          <div className="cat-disp-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="cat-disp-modal-close" onClick={cerrarModal}><FaTimes /></button>
            <h3 className="cat-disp-modal-title">{qrActivo.Nombre}</h3>
            <img
              src={`https://render-hhyo.onrender.com/qrcodes/${qrActivo.IdElemento}.png`}
              alt={`QR de ${qrActivo.Nombre}`}
              className="cat-disp-modal-qr"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoDisponible;
