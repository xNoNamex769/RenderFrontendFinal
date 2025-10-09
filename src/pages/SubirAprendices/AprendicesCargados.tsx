import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/aprendicesCargados.css";
import { FaUserGraduate } from "react-icons/fa"; 

export default function AprendicesCargados() {
  type AprendizConUsuario = {
    id?: string | number;
    __key?: string;
    usuario?: {
      Nombre?: string;
      Apellido?: string;
      Correo?: string;
      Telefono?: string;
      Documento?: string;
      Ficha?: string;
      Programa?: string;
    };
    Ficha?: string;
    ProgramaFormacion?: string;
    Jornada?: string;
    [k: string]: any;
  };

  const [aprendices, setAprendices] = useState<AprendizConUsuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");

  const safeStr = (v: any) =>
    v === null || v === undefined ? "" : String(v).trim();

  const firstNonEmpty = (obj: any, keys: string[]) => {
    if (!obj) return "";
    for (const k of keys) {
      if (typeof obj[k] !== "undefined" && obj[k] !== null) {
        const s = safeStr(obj[k]);
        if (s !== "") return s;
      }
    }
    return "";
  };

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchAprendices = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          "https://render-hhyo.onrender.com/api/aprendices/listar",
          { signal: controller.signal }
        );

        const rawData: any[] = Array.isArray(res.data)
          ? res.data
          : res.data?.aprendices ?? [];

        const normalized = rawData.map((item: any, idx: number) => {
          const ficha = firstNonEmpty(item, [
            "Ficha",
            "ficha",
            "fichaDetectada",
            "ficha_detectada",
          ]);
          const programa = firstNonEmpty(item, [
            "ProgramaFormacion",
            "programaFormacion",
            "programa_formacion",
            "programa",
            "Programa",
          ]);
          const jornada = firstNonEmpty(item, ["Jornada", "jornada"]);
          const nombre = firstNonEmpty(item?.usuario, ["Nombre", "nombre"]) || "";
          const apellido = firstNonEmpty(item?.usuario, ["Apellido", "apellido"]) || "";
          const correo = firstNonEmpty(item?.usuario, ["Correo", "correo", "email"]) || "";
          const telefono = firstNonEmpty(item?.usuario, ["Telefono", "telefono", "celular"]) || "";
          const documento = firstNonEmpty(item?.usuario, ["IdentificacionUsuario", "Documento", "documento", "cedula"]) || "";


       const stableKey = item.id ?? item._id ?? `${correo || documento || 'no-id'}-${idx}`;


          return {
            ...item,
            __key: String(stableKey),
            Ficha: ficha,
            ProgramaFormacion: programa,
            Jornada: jornada,
            usuario: {
              ...(item.usuario || {}),
              Nombre: nombre,
              Apellido: apellido,
              Correo: correo,
              Telefono: telefono,
              Documento: documento,
            },
          } as AprendizConUsuario;
        });

        if (mounted) setAprendices(normalized);
      } catch (err: any) {
        if (axios.isCancel(err)) console.log("Petición cancelada");
        else {
          console.error(err);
          if (mounted) setError("Error al cargar aprendices");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAprendices();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // Filtrado por búsqueda
const aprendicesFiltrados = aprendices.filter((a) => {
  const busq = busqueda.toLowerCase().trim();
  if (!busq) return true; // si no hay búsqueda, muestra todo

  const nombre = safeStr(a.usuario?.Nombre).toLowerCase();
  const apellido = safeStr(a.usuario?.Apellido).toLowerCase();
  const correo = safeStr(a.usuario?.Correo).toLowerCase();
  const documento = safeStr(a.usuario?.Documento).toLowerCase();

  // Búsqueda parcial: va mostrando coincidencias mientras escribe
  return (
    nombre.includes(busq) ||
    apellido.includes(busq) ||
    correo.includes(busq) ||
    documento.includes(busq)
  );
});

 return (
  <div className="apc-contenedor">
    <div className="apc-header">
       
      <h2>Aprendices Registrados</h2>
      <p className="apc-intro">
        Aquí puedes ver todos los aprendices cargados en el sistema. Usa la barra de búsqueda para filtrar por documento o correo.
      </p>
    </div>

  <div className="apc-contador">
  <div className="apc-tarjeta">
    <FaUserGraduate className="apc-icono" />
    <div>
      <p className="apc-titulo">Total Aprendices</p>
      <p className="apc-numero">{aprendices.length}</p>
    </div>
  </div>

</div>


    {loading && <p className="apc-loading">Cargando aprendices...</p>}
    {error && <p className="apc-error">{error}</p>}

    <div className="apc-busqueda">
      <input
        type="text"
        placeholder="Buscar por documento o correo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
    </div>

    {aprendicesFiltrados.length > 0 ? (
      <div className="apc-tabla-wrapper">
        <table className="apc-tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Documento</th>
              <th>Ficha</th>
              <th>Programa</th>
              <th>Jornada</th>
            </tr>
          </thead>
          <tbody>
            {aprendicesFiltrados.map((a, i) => (
              <tr key={a.__key}>
                <td>{i + 1}</td>
                <td>{a.usuario?.Nombre} {a.usuario?.Apellido}</td>
                <td>{a.usuario?.Correo ?? "-"}</td>
                <td>{a.usuario?.Telefono ?? "-"}</td>
                <td>{a.usuario?.Documento ?? "-"}</td>
                <td>{a.Ficha ?? "-"}</td>
                <td>{a.ProgramaFormacion ?? "-"}</td>
                <td>{a.Jornada ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      !loading && <p className="apc-no-data">No hay aprendices que coincidan con la búsqueda.</p>
    )}
  </div>
);
}
