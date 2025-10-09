// src/pages/SubirAprendices.tsx
import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./styles/subirAprendices.css";
import toast from "react-hot-toast";
export default function SubirAprendices() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [jornada, setJornada] = useState<string>("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"exito" | "error" | "">("");
  const [loading, setLoading] = useState(false);
  const [reporte, setReporte] = useState<any | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);


  // nuevos estados para preview / detecciones
  const [preview, setPreview] = useState<any[]>([]);
  const [fichaDetectada, setFichaDetectada] = useState<string>("");
  const [programaDetectado, setProgramaDetectado] = useState<string>("");

  // Cambia esto si en tu backend multer usa otro nombre, p.e. 'file' o 'excel'
  const FIELD_NAME = "archivo";

  // ----------------------
  // Helpers de normalización
  // ----------------------
  const normalize = (s: any) =>
    String(s || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "") // quita acentos
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  // normaliza keys de un objeto (ej: "Correo Electrónico" -> "correo electronico")
  const normalizeKeys = (row: Record<string, any>) => {
    const out: Record<string, any> = {};
    Object.keys(row).forEach((k) => {
      const nk = normalize(k);
      out[nk] = row[k];
    });
    return out;
  };

  // lee el excel (solo para obtener C2 y preview). Range 4 -> asumes que los datos empiezan en la fila 5 (índice 4)
  const leerExcelParaPreview = async (archivo: File) => {
    setMensaje("");
    setTipoMensaje("");
    setPreview([]);
    setFichaDetectada("");
    setProgramaDetectado("");

    const buffer = await archivo.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    // Extraer C2 (puede ser la celda que trae "12345 - Nombre Programa")
    const rawC2 = sheet?.["C2"]?.v?.toString().trim() || "";
    if (rawC2) {
      // a veces usan guion largo – => reemplazamos por - para normalizar
      const fichaLimpia = rawC2.replace(/–/g, "-");
      // separar "1234 - Programa Nombre"
      const partes = fichaLimpia.split(" - ");
      const numeroGrupo = (partes[0] || "").trim();
      const nombrePrograma = (partes.slice(1).join(" - ") || "").trim();
      setFichaDetectada(numeroGrupo);
      setProgramaDetectado(nombrePrograma);
    }

    // convertir a json empezando en la fila 5 (range: 4), con defval para evitar undefined
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      range: 4,
      defval: "",
    });
 

    // normalizamos claves para poder leer distintas variaciones
    const normalized = data.map((r) => normalizeKeys(r));
const dataParaEnvio = normalized.map((r) => ({
  ...r,
  IdentificacionUsuario:
    r["numero_de_documento"] || r["documento"] || r["identificacion"] || r["id"] || "",
}));

    // Creamos una preview presentable (tratando de recuperar nombre/apellidos/correo/documento).
    const previewRows = normalized.slice(0, 50).map((r) => {
      const nombre =
        `${r["nombre"] || r["nombres"] || r["primer nombre"] || ""}`.trim();
      const apellidos =
        `${r["apellido"] || r["apellidos"] || r["segundo nombre"] || ""}`.trim();
      const documento =
        r["numero de documento"] || r["documento"] || r["identificacion"] || "";
      const correo = r["correo electronico"] || r["correo"] || r["email"] || "";
      const estado = r["estado"] || r["estado aprendiz"] || "";
      return {
        raw: r,
        Nombre: nombre,
        Apellidos: apellidos,
        Documento: documento,
        Correo: correo,
        Estado: estado,
        Ficha: fichaDetectada || "",
        Programa: programaDetectado || "",
      };
    });

    setPreview(previewRows);
    return { data: normalized, raw: data };
  };

  // manejador del input file: guarda archivo y lee preview/detecciones
  const handleArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setArchivo(f);
    setReporte(null);
    setProgress(null);
    setPreview([]);
    setFichaDetectada("");
    setProgramaDetectado("");

    if (!f) return;

    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      setTipoMensaje("error");
      setMensaje(" El archivo debe ser .xlsx, .xls o .csv");
      return;
    }

    try {
      await leerExcelParaPreview(f);
    } catch (err) {
      console.error("Error leyendo archivo para preview:", err);
      setTipoMensaje("error");
      setMensaje(" No se pudo leer el archivo para la vista previa.");
    }
  };

  // ----------------------
  // Subida al backend (sincronizada con tu lógica anterior)
  // ----------------------
  const subirArchivo = async () => {
    if (!archivo) {
      setTipoMensaje("error");
      setMensaje(" Debes seleccionar un archivo primero.");
      return;
    }

    setLoading(true);
    setMensaje("");
    setTipoMensaje("");
    setReporte(null);
    setProgress(null);

    try {
      const formData = new FormData();
      // mantenemos el mismo nombre que tu backend espere
      formData.append(FIELD_NAME, archivo);
      if (jornada) formData.append("jornada", jornada);
      
      // añadimos, si están, ficha y programa detectados (útil para el backend)
      if (fichaDetectada) formData.append("ficha", fichaDetectada);
      if (programaDetectado) formData.append("programa", programaDetectado);
      

      const res = await axios.post(
        "https://render-hhyo.onrender.com/api/aprendices/subir-excel",
        formData,
        {
          // NO establecer Content-Type manualmente: axios + browser pondrán el boundary correcto
          onUploadProgress: (evt) => {
            if (evt.total) {
              const p = Math.round((evt.loaded * 100) / evt.total);
              setProgress(p);
            }
          },
          // withCredentials: true // habilita si usas cookies/sesiones si necesitas
        }
      );

      // Mostrar mensaje y, si viene, el reporte con detalles
      const data = res.data ?? {};
      console.log("Respuesta completa del servidor:", data);
     // éxito
toast.success(data.mensaje || "Archivo subido con éxito");

// error
// Define errMsg before using it



      // Si backend devuelve reporte, lo adaptamos para mostrar ficha/programa si no vienen
      if (data.reporte) {
        // inyectar ficha/programa detectados en cada fila procesada si backend no los produjo
        if (Array.isArray(data.reporte.processed)) {
          const processedWithFicha = data.reporte.processed.map((r: any) => ({
            ...r,
            ficha: r.ficha || fichaDetectada || "",
            programa: r.programa || programaDetectado || "",
          }));
          setReporte({ ...data.reporte, processed: processedWithFicha });
          console.table(processedWithFicha);
        } else {
          setReporte(data.reporte);
        }
      }
    } catch (err: any) {
      console.error("Error al subir archivo:", err);
      const errMsg =
        err?.response?.data?.mensaje ||
        err?.response?.data?.message ||
        err?.message ||
        " Error al subir el archivo.";
      setTipoMensaje("error");
      setMensaje(errMsg);

      // si el backend devuelve un "reporte" parcial en error, muéstralo
      if (err?.response?.data?.reporte) {
        const rep = err.response.data.reporte;
        if (Array.isArray(rep.processed)) {
          const processedWithFicha = rep.processed.map((r: any) => ({
            ...r,
            ficha: r.ficha || fichaDetectada || "",
            programa: r.programa || programaDetectado || "",
          }));
          setReporte({ ...rep, processed: processedWithFicha });
          console.table(processedWithFicha);
        } else {
          setReporte(rep);
        }
      }
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

 return (
  <div className="subir-aprendices-contenedor">
    <h2>Subir aprendices desde Excel</h2>

    <input
      type="file"
      accept=".xlsx,.xls,.csv"
      onChange={handleArchivo}
      className="subir-aprendices-input-file"
    />

 <select
  value={jornada}
  onChange={(e) => setJornada(e.target.value)}
  className="subir-aprendices-input-text"
>
  <option value="">Selecciona la jornada</option>
  <option value="Mañana">Mañana</option>
  <option value="Tarde">Tarde</option>
  <option value="Noche">Noche</option>
</select>


    <button
      onClick={() => setShowModal(true)}
      disabled={loading || !archivo}
      className="subir-aprendices-btn"
    >
      {loading ? "Subiendo..." : "Subir archivo"}
    </button>

    {showModal && (
      <div className="subir-aprendices-modal-overlay">
        <div className="subir-aprendices-modal">
          <div className="subir-aprendices-modal-header">
            <h3>⚠️ Atención</h3>
            <button
              className="subir-aprendices-close-btn"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
          </div>
          <div className="subir-aprendices-modal-body">
           
            <p>
              El archivo debe ser el reporte oficial de aprendices generado desde
              <span className="subir-aprendices-text-success"> Sofía Plus</span>.
              Asegúrate de no modificar los nombres de columnas ni el formato original del reporte.
            </p>
            <ul>
              <li>
                Archivo seleccionado: <strong>{archivo?.name || "—"}</strong>
              </li>
             
              <li>
                Ficha detectada: <strong>{fichaDetectada || "—"}</strong>
              </li>
              <li>
                Programa detectado: <strong>{programaDetectado || "—"}</strong>
              </li>
            </ul>
          </div>
          <div className="subir-aprendices-modal-footer">
            <button
              className="subir-aprendices-btn-cancel"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </button>
            <button
              className="subir-aprendices-btn-confirm"
              onClick={() => {
                setShowModal(false);
                subirArchivo();
              }}
            >
              Confirmar y Subir
            </button>
          </div>
        </div>
      </div>
    )}

    {progress !== null && <p className="subir-aprendices-progreso">Progreso: {progress}%</p>}

    {mensaje && (
      <p
        className={
          tipoMensaje === "exito"
            ? "subir-aprendices-mensaje-exito"
            : "subir-aprendices-mensaje-error"
        }
      >
        {mensaje}
      </p>
    )}

    {(fichaDetectada || programaDetectado) && (
      <div className="subir-aprendices-preview" style={{ marginTop: 12 }}>
        <strong>Ficha detectada:</strong> {fichaDetectada || "—"}{" "}
        <strong style={{ marginLeft: 12 }}>Programa:</strong> {programaDetectado || "—"}
      </div>
    )}

    {preview && preview.length > 0 && (
      <div className="subir-aprendices-reporte" style={{ marginTop: 12 }}>
        <h3>Vista previa (primeras filas)</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="subir-aprendices-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>Documento</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Ficha (C2)</th>
                <th>Programa (C2)</th>
              </tr>
            </thead>
            <tbody>
              {preview.slice(0, 50).map((r: any, i: number) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.Nombre || "—"}</td>
                  <td>{r.Apellidos || "—"}</td>
                  <td>{r.Documento || "—"}</td>
                  <td>{r.Correo || "—"}</td>
                  <td>{r.Estado || "—"}</td>
                  <td>{r.Ficha || fichaDetectada || "—"}</td>
                  <td>{r.Programa || programaDetectado || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {reporte && (
      <div className="subir-aprendices-reporte" style={{ marginTop: 20 }}>
        <h3>Reporte de importación</h3>
        <p>Total filas: {reporte.total}</p>
        <p>Insertados: {reporte.inserted}</p>
        <p>Saltados (existentes): {reporte.skippedExisting}</p>
        {typeof reporte.skippedMissing !== "undefined" && (
          <p>Saltados (faltó correo/ID): {reporte.skippedMissing}</p>
        )}
        <p>Errores: {reporte.errors?.length ?? 0}</p>

        {reporte.errors && reporte.errors.length > 0 && (
          <>
            <h4>Errores (primeras 10)</h4>
            <ul>
              {reporte.errors.slice(0, 10).map((e: any, idx: number) => (
                <li key={idx}>
                  Fila {e.row}: {e.reason}
                </li>
              ))}
            </ul>
          </>
        )}

        {reporte.processed && Array.isArray(reporte.processed) && (
          <>
            <h4>Detalle por fila (primeras 50)</h4>
            <div style={{ overflowX: "auto" }}>
              <table className="subir-aprendices-tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Identificacion</th>
                    <th>Correo</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Status</th>
                    <th>Motivo</th>
                    <th>Ficha</th>
                    <th>Programa</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.processed.slice(0, 50).map((r: any, i: number) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.IdentificacionUsuario || r.numero_documento || r.Documento || "—"}</td>
                      <td>{r.Correo || r.correo || "—"}</td>
                      <td>{r.Nombre || r.nombre || "—"}</td>
                      <td>{r.Apellido || r.apellido || "—"}</td>
                      <td>{r.status || r.estado || "—"}</td>
                      <td>{r.motivo || r.reason || "—"}</td>
                      <td>{r.ficha || fichaDetectada || "—"}</td>
                      <td>{r.programa || programaDetectado || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    )}
  </div>
);
}