import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style/Noticias.css";
import { useNavigate } from "react-router-dom";
import sindesenaLogo from "../../../public/img/sindesena.webp" 

interface Noticia {
  IdActividad: number;
  NombreActi: string;
  Descripcion: string;
  Imagen: string;
  createdAt: string;
  TipoLudica?: string
  Evento?: { NombreEvento: string };
  Usuario?: { Nombre: string };
}

const NoticiasDestacadas: React.FC = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState<Noticia | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const res = await axios.get("https://render-hhyo.onrender.com/api/actividad/noticias");
        setNoticias(res.data);
      } catch (error) {
        console.error("❌ Error al cargar noticias:", error);
      }
    };
    fetchNoticias();
  }, []);

  const abrirModalNoticia = (noticia: Noticia) => {
    setNoticiaSeleccionada(noticia);
    setMostrarModal(true);
  };

  const cerrarModalNoticia = () => {
    setNoticiaSeleccionada(null);
    setMostrarModal(false);
  };

  return (
    <section className="noticias-container">
      <h2 className="noticias-titulo">📰 Noticias destacadas</h2>
      
      <div className="noticias-carrusel">
        {noticias.map((noticia) => {
          const esSindesena = noticia.TipoLudica === "Noticia";

          return (
            <div
              key={noticia.IdActividad}
              className="noticia-card"
              onClick={() => abrirModalNoticia(noticia)}
            >
              {/* Logo si es sindesena */}
              {esSindesena && (
                <div style={{ textAlign: "center", marginBottom: "5px" }}>
                  <img src={sindesenaLogo} alt="Sindesena" style={{ width: "60px" }} />
                </div>
              )}
              <img
                src={`http://localhost:3001/uploads/${noticia.Imagen}`}
                alt={noticia.NombreActi}
                className="noticia-img"
              />
              <div className="noticia-info">
                <h3>{noticia.NombreActi}</h3>
                <p className="noticia-descripcion">{noticia.Descripcion}</p>
                {noticia.Evento && (
                  <p className="noticia-evento">🎉 {noticia.Evento.NombreEvento}</p>
                )}
                <p className="noticia-fecha">
                  🗓️ {new Date(noticia.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {mostrarModal && noticiaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModalNoticia}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={cerrarModalNoticia}>×</button>
            
            {/* Logo en el modal si es sindesena */}
         {noticiaSeleccionada.TipoLudica === "Noticia" && (

              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <img src={sindesenaLogo} alt="Sindesena" style={{ width: "100px" }} />
              </div>
            )}

            <img
              src={`http://localhost:3001/uploads/${noticiaSeleccionada.Imagen}`}
              alt={noticiaSeleccionada.NombreActi}
              className="modal-img"
            />
            <h2>{noticiaSeleccionada.NombreActi}</h2>
            <p><strong>Descripción:</strong> {noticiaSeleccionada.Descripcion}</p>
            {noticiaSeleccionada.Evento && (
              <p><strong>Evento:</strong> {noticiaSeleccionada.Evento.NombreEvento}</p>
            )}
            <p><strong>Fecha:</strong> {new Date(noticiaSeleccionada.createdAt).toLocaleDateString()}</p>

            <button
              className="btn-ver-feedback"
              onClick={() => navigate(`/feedbacks/${noticiaSeleccionada.IdActividad}`)}
            >
              Ir a Feedbacks
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default NoticiasDestacadas;
