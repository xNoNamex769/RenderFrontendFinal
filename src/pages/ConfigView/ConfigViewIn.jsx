import React, { useState } from "react";
import "./styles/Config.css";

const configuraciones = [
  "Cambiar contraseña",
  "Cambiar imagen",
  "Cambiar nombre",
  "Actualizar correo",
  "Cambiar idioma",
  "Notificaciones",
  "Preferencias de tema",
  "Eliminar cuenta",
  "Seguridad",
  "Sesión activa",
];

export default function ConfigViewIn({ setActualizarPerfil, setContenidoActual }) {
  const [ventana, setVentana] = useState(null);

  const cerrarVentana = () => setVentana(null);

  // Simula guardar y recargar el perfil (ejemplo de uso real)
  const guardarCambio = () => {
    // Aquí iría el axios.post o put al backend
    console.log("🔄 Cambios guardados");

    // Actualiza perfil en UserView
    setActualizarPerfil(prev => !prev); // cambia de true a false o viceversa

    // Cierra la ventana
    cerrarVentana();
    // Opcional: regresar a la vista del perfil
    setContenidoActual("userviewin");
  };

  const renderContenidoVentana = () => {
    switch (ventana) {
      case "Cambiar contraseña":
        return (
          <>
            <input type="password" placeholder="Nueva contraseña" />
            <button onClick={guardarCambio}>Guardar</button>
          </>
        );
      case "Cambiar imagen":
        return (
          <>
            <p>Sube una nueva imagen:</p>
            <input type="file" />
            <button onClick={guardarCambio}>Guardar</button>
          </>
        );
      case "Cambiar nombre":
        return (
          <>
            <input type="text" placeholder="Nuevo nombre" />
            <button onClick={guardarCambio}>Guardar</button>
          </>
        );
      case "Actualizar correo":
        return (
          <>
            <input type="email" placeholder="Nuevo correo electrónico" />
            <button onClick={guardarCambio}>Guardar</button>
          </>
        );
      case "Cambiar idioma":
        return (
          <>
            <select>
              <option>Español</option>
              <option>Inglés</option>
            </select>
            <button onClick={guardarCambio}>Guardar</button>
          </>
        );
      case "Notificaciones":
        return (
          <>
            <label>
              <input type="checkbox" /> Activar notificaciones
            </label>
            <button onClick={guardarCambio}>Guardar</button>
          </>
        );
      case "Preferencias de tema":
        return (
          <>
            <select>
              <option>Claro</option>
              <option>Oscuro</option>
            </select>
            <button onClick={guardarCambio}>Guardar</button>
          </>
        );
      case "Eliminar cuenta":
        return (
          <>
            <p>¿Estás seguro de que deseas eliminar tu cuenta?</p>
            <button style={{ backgroundColor: "red", color: "white" }}>
              Eliminar
            </button>
          </>
        );
      case "Seguridad":
        return <p>Configura autenticación en dos pasos.</p>;
      case "Sesión activa":
        return <p>Cierra sesión en otros dispositivos.</p>;
      default:
        return null;
    }
  };

  return (
    <section className="Configcontenedor">
      <h2 className="Confightitulo">Configuraciones</h2>
      <div className="Configopciones">
        {configuraciones.map((opcion) => (
          <button
            key={opcion}
            className="Configboton"
            onClick={() => setVentana(opcion)}
          >
            {opcion}
          </button>
        ))}
      </div>

      {ventana && (
        <div className="Configmodal">
          <div className="Configventana">
            <h3>{ventana}</h3>
            {renderContenidoVentana()}
            <button className="Configcerrar" onClick={cerrarVentana}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
