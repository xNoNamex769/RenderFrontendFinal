import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/CatalogoDisponible.css";

interface Elemento {
  IdElemento: number; // 👈 Asegúrate de usar el campo correcto aquí
  NombreElemento: string;
  Imagen: string;
  CantidadDisponible: number;
}

const CatalogoDisponible = () => {
  const [catalogo, setCatalogo] = useState<Elemento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogo = async () => {
      try {
        const response = await axios.get("https://render-hhyo.onrender.com/api/alquiler/catalogo");
        const data: Elemento[] = response.data;
        setCatalogo(data);
      } catch (error) {
        console.error("Error al cargar catálogo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogo();
  }, []);

  if (loading) return <p className="loading">Cargando catálogo...</p>;

  return (
    <div className="catalogo-container">
      <h2 className="catalogo-titulo">Elementos Disponibles paradddd Alquiler</h2>
      <div className="grid-catalogo">
        {catalogo.map((el) => (
          <div key={el.IdElemento} className="card-elemento">
            <img
              src={`http://localhost:3001/uploads/${el.Imagen}`}
              alt={el.NombreElemento}
              className="img-elemento"
            />
            <h3>{el.NombreElemento}</h3>
            <p><strong>Disponibles:</strong> {el.CantidadDisponible}</p>

            <img
              src={`https://render-hhyo.onrender.com/api/qrcode/${el.IdElemento}`}
              alt={`QR de ${el.NombreElemento}`}
              className="qr-img"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogoDisponible;
