import React, { useEffect, useState } from 'react';
import "./styles/DetallesAlquiler.css"
const BACKEND_URL = "https://render-hhyo.onrender.com/api";

const DetallesAlquiler = () => {
  const [registrosAlquiler, setRegistrosAlquiler] = useState([]);
  const [searchNombre, setSearchNombre] = useState('');
  const [searchEstado, setSearchEstado] = useState('');

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [observacionEdit, setObservacionEdit] = useState('');
  const [alquilerEditId, setAlquilerEditId] = useState(null);

  useEffect(() => {
    const cargarAlquileres = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/alquilerelementos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
         console.log("Datos recibidos backend:", data);
        setRegistrosAlquiler(data);
      } catch (err) {
        console.error("Error cargando alquileres:", err);
      }
    };
    cargarAlquileres();
  }, []);

  const marcarComoEntregado = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BACKEND_URL}/api/alquilerelementos/alquiler/${id}/cumplido`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegistrosAlquiler((prev) => prev.map(reg =>
        reg.IdAlquiler === id ? { ...reg, CumplioConEntrega: true, Estado: 'Entregado' } : reg
      ));
    } catch (error) {
      console.error("Error marcando como entregado:", error);
    }
  };

  // Abrir modal y cargar observacion actual
  const abrirModalEdicion = (id, observacionActual) => {
    setAlquilerEditId(id);
    setObservacionEdit(observacionActual || "");
    setModalVisible(true);
  };

  // Guardar observación editada
  const guardarObservacion = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BACKEND_URL}/api/alquilerelementos/${alquilerEditId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ Observaciones: observacionEdit }),
      });
      setRegistrosAlquiler((prev) =>
        prev.map((reg) =>
          reg.IdAlquiler === alquilerEditId
            ? { ...reg, Observaciones: observacionEdit }
            : reg
        )
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Error guardando observación:", error);
    }
  };

  const filteredRegistros = registrosAlquiler.filter((registro) =>
    (registro.NombreElemento?.toLowerCase() || "").includes(searchNombre.toLowerCase()) ||
    (registro.usuario?.Nombre?.toLowerCase() || "").includes(searchNombre.toLowerCase()) ||
    (registro.usuario?.aprendiz?.Ficha?.toLowerCase() || "").includes(searchNombre.toLowerCase()) ||
    (registro.Estado?.toLowerCase() || "").includes(searchEstado.toLowerCase())
  );

  return (
    <div className="contenedor-alquiler">
      <h1> Registros de Préstamos</h1>
 <p className="descripcion-alquiler">
        En esta sección se muestran todos los registros de préstamo de elementos realizados por los aprendices. 
        Aquí puedes buscar préstamos por nombre, ficha o estado, marcar los elementos como entregados cuando 
        se devuelvan correctamente, y agregar o editar observaciones relacionadas con cada préstamo.
      </p>
      <input
        type="text"
        placeholder="Buscar por elemento, aprendiz o ficha"
        value={searchNombre}
        onChange={(e) => setSearchNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Filtrar por estado (En uso, Entregado)"
        value={searchEstado}
        onChange={(e) => setSearchEstado(e.target.value)}
      />

      <table className="tabla-alquiler">
        <thead>
          <tr>
            <th>Elemento</th>
            <th>Aprendiz</th>
            <th>Ficha</th>
            <th>Programa</th>
            <th>Estado</th>
            <th>Cumplió Entrega</th>
            <th>Observaciones</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredRegistros.map((registro) => (
            <tr key={registro.IdAlquiler}>
              <td>{registro.NombreElemento}</td>
              <td>{registro.usuario?.Nombre || "Sin nombre"}</td>
              <td>{registro.usuario?.aprendiz?.Ficha || "Sin ficha"}</td>
              <td>{registro.usuario?.aprendiz?.ProgramaFormacion || "Sin programa"}</td>
              <td>{registro.Estado || "En uso"}</td>
              <td>{registro.CumplioConEntrega ? "Sí" : "No"}</td>
              <td>{registro.Observaciones || "Sin observaciones"}</td>
              <td>
                {!registro.CumplioConEntrega && (
                  <button className='btn-cosas-xd' onClick={() => marcarComoEntregado(registro.IdAlquiler)}>
                    Marcar como entregado
                  </button>
                )}
                <button className='btn-cosas-xd'
                  style={{ marginLeft: '8px' }}
                  onClick={() => abrirModalEdicion(registro.IdAlquiler, registro.Observaciones)}
                >
                  Editar observaciones
                </button>
              </td>
            </tr>
          ))}
          {filteredRegistros.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>
                No se encontraron registros que coincidan con la búsqueda.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Observaciones</h2>
            <textarea
              value={observacionEdit}
              onChange={(e) => setObservacionEdit(e.target.value)}
              rows={5}
              style={{ width: '100%' }}
            />
            <div style={{ marginTop: '1rem' }}>
              <button onClick={guardarObservacion}>Guardar</button>
              <button onClick={() => setModalVisible(false)} style={{ marginLeft: '1rem' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallesAlquiler;
