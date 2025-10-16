// src/pages/SubirAprendices.tsx
import React, { useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { FaFileAlt, FaClock, FaClipboardList, FaGraduationCap, FaCheckCircle, FaTimes, FaExclamationTriangle, FaChartBar, FaFolder, FaCheck, FaEdit, FaForward, FaSun, FaCloudSun, FaMoon, FaInfoCircle, FaUpload, FaEye } from "react-icons/fa";
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
  // Estados de paginación para preview
  const [paginaPreview, setPaginaPreview] = useState<number>(1);
  const itemsPorPaginaPreview = 10;

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
  <div className="subir-apr-wrapper">
    {/* Header */}
    <div className="subir-apr-header">
      <h1 className="subir-apr-title"><FaChartBar /> Subir Aprendices desde Excel</h1>
      <p className="subir-apr-subtitle">Importa el reporte oficial de Sofía Plus con todos los aprendices</p>
    </div>

    {/* Card Principal */}
    <div className="subir-apr-card">
      {/* Upload Area */}
      <div className="subir-apr-upload-section">
        <label className="subir-apr-label"><FaFolder /> Selecciona el archivo Excel</label>
        <div className="subir-apr-upload-area">
          <label className="subir-apr-upload-label">
            {archivo ? (
              <>
                <span className="subir-apr-upload-icon success"><FaCheck /></span>
                <span className="subir-apr-upload-text">{archivo.name}</span>
                <span className="subir-apr-upload-hint">{(archivo.size / 1024).toFixed(2)} KB</span>
              </>
            ) : (
              <>
                <span className="subir-apr-upload-icon"><FaFileAlt /></span>
                <span className="subir-apr-upload-text">Haz clic para seleccionar el archivo</span>
                <span className="subir-apr-upload-hint">Formatos: .xlsx, .xls, .csv</span>
              </>
            )}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleArchivo}
              className="subir-apr-upload-input"
            />
          </label>
        </div>
      </div>

      {/* Jornada Select */}
      <div className="subir-apr-field">
        <label className="subir-apr-label"><FaClock /> Jornada</label>
        <select
          value={jornada}
          onChange={(e) => setJornada(e.target.value)}
          className="subir-apr-select"
        >
          <option value="">Selecciona la jornada</option>
          <option value="Mañana">☀️ Mañana</option>
          <option value="Tarde">🌤️ Tarde</option>
          <option value="Noche">🌙 Noche</option>
        </select>
      </div>

      {/* Botón Subir */}
      <button
        onClick={() => setShowModal(true)}
        disabled={loading || !archivo}
        className="subir-apr-btn"
      >
        {loading ? (
          <>
            <span className="subir-apr-spinner"></span>
            <span>Subiendo...</span>
          </>
        ) : (
          <>
            <span className="subir-apr-btn-icon"><FaUpload /></span>
            <span>Subir Archivo</span>
          </>
        )}
      </button>

      {showModal && (
        <div className="subir-apr-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="subir-apr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="subir-apr-modal-close" onClick={() => setShowModal(false)}>✖</button>
            <div className="subir-apr-modal-header">
              <span className="subir-apr-modal-icon">⚠️</span>
              <h3 className="subir-apr-modal-title">Confirmar Importación</h3>
            </div>
            <div className="subir-apr-modal-body">
              <div className="subir-apr-alert-info">
                <span className="subir-apr-alert-icon">ℹ️</span>
                <p>El archivo debe ser el reporte oficial de aprendices generado desde <strong>Sofía Plus</strong>. No modifiques los nombres de columnas ni el formato original.</p>
              </div>
              <div className="subir-apr-info-grid">
                <div className="subir-apr-info-item">
                  <span className="subir-apr-info-label"><FaFileAlt /> Archivo:</span>
                  <span className="subir-apr-info-value">{archivo?.name || "—"}</span>
                </div>
                <div className="subir-apr-info-item">
                  <span className="subir-apr-info-label"><FaClipboardList /> Ficha:</span>
                  <span className="subir-apr-info-value">{fichaDetectada || "No detectada"}</span>
                </div>
                <div className="subir-apr-info-item">
                  <span className="subir-apr-info-label"><FaGraduationCap /> Programa:</span>
                  <span className="subir-apr-info-value">{programaDetectado || "No detectado"}</span>
                </div>
              </div>
            </div>
            <div className="subir-apr-modal-footer">
              <button className="subir-apr-modal-btn subir-apr-modal-btn-cancel" onClick={() => setShowModal(false)}>
                ✖ Cancelar
              </button>
              <button className="subir-apr-modal-btn subir-apr-modal-btn-confirm" onClick={() => { setShowModal(false); subirArchivo(); }}>
                ✓ Confirmar y Subir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {progress !== null && (
        <div className="subir-apr-progress-container">
          <div className="subir-apr-progress-bar">
            <div className="subir-apr-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="subir-apr-progress-text">{progress}%</span>
        </div>
      )}

      {/* Mensaje */}
      {mensaje && (
        <div className={`subir-apr-alert ${tipoMensaje === "exito" ? "success" : "error"}`}>
          <span className="subir-apr-alert-icon">{tipoMensaje === "exito" ? <FaCheckCircle /> : <FaExclamationTriangle />}</span>
          <span className="subir-apr-alert-text">{mensaje}</span>
        </div>
      )}

      {/* Detección */}
      {(fichaDetectada || programaDetectado) && (
        <div className="subir-apr-detection">
          <div className="subir-apr-detection-item">
            <span className="subir-apr-detection-icon"><FaClipboardList /></span>
            <span className="subir-apr-detection-label">Ficha:</span>
            <span className="subir-apr-detection-value">{fichaDetectada || "—"}</span>
          </div>
          <div className="subir-apr-detection-item">
            <span className="subir-apr-detection-icon"><FaGraduationCap /></span>
            <span className="subir-apr-detection-label">Programa:</span>
            <span className="subir-apr-detection-value">{programaDetectado || "—"}</span>
          </div>
        </div>
      )}
    </div>

    {preview && preview.length > 0 && (() => {
      const totalPaginasPreview = Math.ceil(preview.length / itemsPorPaginaPreview);
      const inicioPreview = (paginaPreview - 1) * itemsPorPaginaPreview;
      const finPreview = inicioPreview + itemsPorPaginaPreview;
      const previewPaginado = preview.slice(inicioPreview, finPreview);

      return (
        <div className="subir-apr-preview-section">
          <h3 className="subir-apr-section-title"><FaEye /> Vista Previa ({preview.length} filas detectadas)</h3>
          
          <div className="subir-apr-info-pag">
            Mostrando <strong>{inicioPreview + 1}</strong> a <strong>{Math.min(finPreview, preview.length)}</strong> de <strong>{preview.length}</strong>
          </div>

          <div className="subir-apr-table-container">
            <table className="subir-apr-table">
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
                {previewPaginado.map((r: any, i: number) => (
                  <tr key={i}>
                    <td>{inicioPreview + i + 1}</td>
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

          {totalPaginasPreview > 1 && (
            <div className="subir-apr-paginacion">
              <button
                className="subir-apr-btn-pag"
                onClick={() => setPaginaPreview(Math.max(1, paginaPreview - 1))}
                disabled={paginaPreview === 1}
              >
                ‹ Anterior
              </button>
              <span className="subir-apr-pag-info">
                Página {paginaPreview} de {totalPaginasPreview}
              </span>
              <button
                className="subir-apr-btn-pag"
                onClick={() => setPaginaPreview(Math.min(totalPaginasPreview, paginaPreview + 1))}
                disabled={paginaPreview === totalPaginasPreview}
              >
                Siguiente ›
              </button>
            </div>
          )}
        </div>
      );
    })()}

    {reporte && (
      <div className="subir-apr-report-section">
        <h3 className="subir-apr-section-title">📊 Reporte de Importación</h3>
        <div className="subir-apr-stats-grid">
          <div className="subir-apr-stat-card">
            <span className="subir-apr-stat-icon">📝</span>
            <span className="subir-apr-stat-value">{reporte.total}</span>
            <span className="subir-apr-stat-label">Total Filas</span>
          </div>
          <div className="subir-apr-stat-card success">
            <span className="subir-apr-stat-icon"><FaCheckCircle /></span>
            <span className="subir-apr-stat-value">{reporte.inserted}</span>
            <span className="subir-apr-stat-label">Insertados</span>
          </div>
          <div className="subir-apr-stat-card warning">
            <span className="subir-apr-stat-icon">⏭️</span>
            <span className="subir-apr-stat-value">{reporte.skippedExisting}</span>
            <span className="subir-apr-stat-label">Existentes</span>
          </div>
          <div className="subir-apr-stat-card error">
            <span className="subir-apr-stat-icon"><FaTimes /></span>
            <span className="subir-apr-stat-value">{reporte.errors?.length ?? 0}</span>
            <span className="subir-apr-stat-label">Errores</span>
          </div>
        </div>
        <h3 className="subir-apr-section-subtitle"><FaClipboardList /> Detalles</h3>
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