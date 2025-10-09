import React, { useState } from 'react';
import './styles/ComtentarStyle.css';
import axios from 'axios';



import { useIA } from "../AnalisisIA/IAcontext";

export default function ComentarFeedback() {
 const [usuarios, setUsuarios] = useState([
  { name: "Pepe Gorra", imagen: "/img/dragon.jpeg", comentarios: "Excelente", reseñas: "★★★★★" },
  { name: "Juan Pérez", imagen: "/img/dragon.jpeg", comentarios: "Casi no me gustó, faltó emoción", reseñas: "★☆☆☆☆" },
  { name: "Ana López", imagen: "/img/dragon.jpeg", comentarios: "Me gustó", reseñas: "★★★☆☆" }
]);


  const [nuevoComentario, setNuevoComentario] = useState("");
  const { setRecargarAnalisis } = useIA();

  const agregarComentario = async () => {
    if (nuevoComentario.trim() === "") return;

    try {
      const response = await axios.post("https://render-hhyo.onrender.com/api/comentario/comentario", {
        comentario: nuevoComentario,
        IdUsuario: 1,
        IdEvento: 2,
      });

      const recomendacion = response.data.recomendacionIA;

      setUsuarios(prev => [
        ...prev,
        {
          name: "Nuevo Usuario",
          imagen: dbz2,
          comentarios: `${nuevoComentario} (${recomendacion})`,
          reseñas: "☆☆☆☆☆"
        }
      ]);

      setNuevoComentario("");
      setRecargarAnalisis(prev => !prev);
    } catch (error) {
      console.error("❌ Error enviando comentario con IA:", error);
    }
  };

  return (
    <>
      <section className="table">
        <div className='table-container'>
          <table className='border'>
            <thead>
              <tr>
                <th>Usuarios</th>
                <th>Comentarios</th>
                <th>Reseñas</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario, index) => (
                <tr key={index}>
                  <td className='border user-cell'>
                    <img src={usuario.imagen || "default-image.jpg"} alt={usuario.name} className="perfil-img" />
                    <span>{usuario.name}</span>
                  </td>
                  <td className="border">{usuario.comentarios}</td>
                  <td className='border'>{usuario.reseñas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="flex">
        <input
          type="text"
          placeholder="Escribe tu Comentario..."
          className="input-text"
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
        />
        <button className="button-submit" onClick={agregarComentario}>
          Subir
        </button>
      </div>
    </>
  );
}
