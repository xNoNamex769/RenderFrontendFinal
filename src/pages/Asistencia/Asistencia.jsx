  import React, { useEffect } from "react";
  import { useSearchParams, useNavigate } from "react-router-dom";
  import axios from "axios";

  export default function Asistencia() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
      const actividad = searchParams.get("actividad");
      const tipo = searchParams.get("tipo"); // entrada o salida
      const token = localStorage.getItem("token");

      if (!token) {
        alert("❌ Debes iniciar sesión para registrar asistencia.");
        navigate("/iniciosesion");
        return;
      }

      if (actividad && tipo) {
       const url = `https://render-hhyo.onrender.com/api/asistencia/${tipo}`;


        axios
          .post(
            url,
            { IdActividad: actividad },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((res) => {
            alert(res.data.msg || "✅ Asistencia registrada correctamente.");
            navigate("/iniciosesion");
          })
          .catch((err) => {
            console.error(err);
            alert("❌ Error al registrar asistencia.");
            navigate("/");
          });
      } else {
        alert("❌ Faltan parámetros en la URL.");
        navigate("/");
      }
    }, []);

    return <h2>Registrando asistencia...</h2>;
  }
