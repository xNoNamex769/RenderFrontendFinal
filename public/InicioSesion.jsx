"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/inicio.css";
import api from "../src/services/api";
import { Toaster, toast } from "react-hot-toast";


//  Importa el contexto
import { useAuth } from "../src/Context/AuthContext"; // Ajusta la ruta si es necesario

const IconoMail = () => (
  <svg className="icono-input-inicio" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
    />
  </svg>
);


const IconoCandado = () => (
  <svg className="icono-input-inicio" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

export default function InicioSesion() {
  const [datosFormulario, setDatosFormulario] = useState({
    correo: "",
    contrasena: "",
    recordarme: false,
  });

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
    const [mostrarInfo, setMostrarInfo] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); //  usar login del contexto

  const manejarCambio = (evento) => {
    const { name, value, type, checked } = evento.target;
    setDatosFormulario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const response = await api.post("/usuario/login", {
        Correo: datosFormulario.correo,
        Contrasena: datosFormulario.contrasena,
      });

      const { token, usuario } = response.data;
console.log ( "usuario recibido" , usuario);

console.log("✅ Token recibido del backend:", token);
console.log("👤 Usuario recibido:", usuario);





      login(token, usuario); // Contexto
localStorage.setItem("IdUsuario", usuario.IdUsuario); //  Cambiado
localStorage.setItem("token", token);

     toast.success("¡Inicio de sesión exitoso!");

      setTipoMensaje("exito");

 setTimeout(() => {
  if (usuario.IdRol === 1) {
    navigate("/dash"); // Admin
  } else if (usuario.IdRol === 2) {
    navigate("/dashap"); // aprendiz
  } else if (usuario.IdRol === 3) {
    navigate("/dashin"); // instructor
  }
}, 1200);

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast.error("Usuario o contraseña incorrectos");

      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  };
  

  return (
    <>
  
    
    <form className="formulario-inicio-sesion" onSubmit={manejarEnvio}>
      <div className="grupo-campo-inicio">
        <label htmlFor="correo-inicio" className="etiqueta-inicio etiqueta-inicio-desktop">
          Correo Electrónico
        </label>
       
        
        <div className="contenedor-input-inicio">
          <IconoMail />
          <input
            id="correo-inicio"
            name="correo"
            type="email"
            placeholder="tu@email.com"
            className="campo-input-inicio"
            value={datosFormulario.correo}
            onChange={manejarCambio}
            required
          />
        </div>
      </div>

      <div className="grupo-campo-inicio">
        <label htmlFor="contrasena-inicio" className="etiqueta-inicio etiqueta-inicio-desktop">
          Contraseña
        </label>
        <div className="contenedor-input-inicio">
          <IconoCandado />
          <input
            id="contrasena-inicio"
            name="contrasena"
            type="password"
            placeholder="••••••••"
            className="campo-input-inicio"
            value={datosFormulario.contrasena}
            onChange={manejarCambio}
            required
          />
        </div>
      </div>

      

      <button type="submit" className="boton-inicio-sesion" disabled={cargando}>
        {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
      </button>

      {mensaje && (
        <p
          className={`mensaje-${tipoMensaje}`}
          style={{ textAlign: "center", marginTop: "1rem" }}
        >
          {mensaje}
        </p>
      )}
    </form>


        <button
          type="button"
          className="boton-detalle-inicio"
          onClick={() => setMostrarInfo(!mostrarInfo)}
        >
          {mostrarInfo ? "Ocultar detalle" : "Ver detalle"}
        </button>

        {mostrarInfo && (
          <p className="info-inicio-sesion">
            Recuerda Usa tu <strong>correo institucional</strong> y tu <strong>número de documento</strong> como contraseña.
          </p>
        )}

        {mensaje && (
          <p
            className={`mensaje-${tipoMensaje}`}
            style={{ textAlign: "center", marginTop: "1rem" }}
          >
            {mensaje}
          </p>
        )}

    </>
  );
}
