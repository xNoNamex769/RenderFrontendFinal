  import React, { useEffect } from "react";
  import { useSearchParams, useNavigate } from "react-router-dom";
  import axios from "axios";
  import Swal from "sweetalert2";

  export default function Asistencia() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
      const actividad = searchParams.get("actividad");
      const tipo = searchParams.get("tipo"); // entrada o salida
      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Sesión requerida",
          text: "Debes iniciar sesión para registrar asistencia.",
          confirmButtonColor: "#5eb319",
        }).then(() => navigate("/iniciosesion"));
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
            Swal.fire({
              icon: "success",
              title: "¡Éxito!",
              text: res.data.msg || "Asistencia registrada correctamente.",
              confirmButtonColor: "#5eb319",
              timer: 2500,
            }).then(() => navigate("/iniciosesion"));
          })
          .catch((err) => {
            console.error(err);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Error al registrar asistencia.",
              confirmButtonColor: "#5eb319",
            }).then(() => navigate("/"));
          });
      } else {
        Swal.fire({
          icon: "error",
          title: "Parámetros faltantes",
          text: "Faltan parámetros en la URL.",
          confirmButtonColor: "#5eb319",
        }).then(() => navigate("/"));
      }
    }, []);

    return <h2>Registrando asistencia...</h2>;
  }
