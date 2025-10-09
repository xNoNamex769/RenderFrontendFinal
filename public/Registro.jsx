import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../src/services/api';
import './styles/registro.css';

const Registro = () => {
  const [formulario, setFormulario] = useState({
    IdentificacionUsuario: '',
    Nombre: '',
    Apellido: '',
    Correo: '',
    Telefono: '',
    Contrasena: '',
    profesion: '',
    ubicacion: '',
    imagenUbicacion: null,
    imagenPerfil: null,
    aceptaTerminos: false,
    Rol: '',
  });

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [previewPerfil, setPreviewPerfil] = useState(null);
  const [previewUbicacion, setPreviewUbicacion] = useState(null);

  const navigate = useNavigate();

  // Validación por campo que devuelve error (string) o null
  const validarCampoValor = (nombre, valor) => {
    switch (nombre) {
      case 'IdentificacionUsuario':
        if (!valor) return 'Campo obligatorio';
        if (!/^\d{1,50}$/.test(valor)) return 'Solo números (máx 50 dígitos)';
        return null;
      case 'Nombre':
      case 'Apellido':
        if (!valor) return 'Campo obligatorio';
        if (valor.length > 100) return 'Máx 100 caracteres';
        return null;
      case 'Correo':
        if (!valor) return 'Campo obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'Correo inválido';
        return null;
      case 'Contrasena':
        if (!valor) return 'Campo obligatorio';
        if (valor.length < 6) return 'Mínimo 6 caracteres';
        return null;
      case 'Rol':
        if (!valor) return 'Selecciona un rol';
        return null;
      case 'profesion':
        if (formulario.Rol === 'Instructor' && !valor) return 'Campo obligatorio';
        return null;
      case 'ubicacion':
        if (formulario.Rol === 'Instructor' && !valor) return 'Campo obligatorio';
        return null;
      default:
        return null;
    }
  };

  // Valida todo y devuelve objeto de errores (sin depender de setState)
  const validarTodo = () => {
    const camposAValidar = [
      'IdentificacionUsuario',
      'Nombre',
      'Apellido',
      'Correo',
      'Contrasena',
      'Rol',
    ];

    // Si Instructor, validar campos extra
    if (formulario.Rol === 'Instructor') {
      camposAValidar.push('profesion', 'ubicacion');
      // Imagenes también consideradas requeridas para Instructor
      if (!formulario.imagenPerfil) {
        // marcar error con clave especial
        // (podrías mostrar mensaje en UI dependiendo de la clave)
      }
      if (!formulario.imagenUbicacion) {
        //
      }
    }

    const nuevosErrores = {};
    camposAValidar.forEach((campo) => {
      const err = validarCampoValor(campo, formulario[campo]);
      if (err) nuevosErrores[campo] = err;
    });

    // Validar aceptaTerminos
    if (!formulario.aceptaTerminos) {
      nuevosErrores.aceptaTerminos = 'Debes aceptar los términos';
    }

    // validar archivos si Instructor
    if (formulario.Rol === 'Instructor') {
      if (!formulario.imagenPerfil) {
        nuevosErrores.imagenPerfil = 'Imagen de perfil requerida';
      }
      if (!formulario.imagenUbicacion) {
        nuevosErrores.imagenUbicacion = 'Imagen de ubicación requerida';
      }
    }

    return nuevosErrores;
  };

  // Manejador cambio general
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      const file = files && files[0] ? files[0] : null;
      setFormulario((prev) => ({ ...prev, [name]: file }));

      // Previews
      if (name === 'imagenPerfil' && file) {
        const url = URL.createObjectURL(file);
        setPreviewPerfil(url);
      }
      if (name === 'imagenUbicacion' && file) {
        const url = URL.createObjectURL(file);
        setPreviewUbicacion(url);
      }
    } else {
      const nuevoValor = type === 'checkbox' ? checked : value;
      setFormulario((prev) => ({ ...prev, [name]: nuevoValor }));

      // Validar campo en el momento (actualiza errores)
      setErrores((prev) => {
        const copia = { ...prev };
        const err = validarCampoValor(name, nuevoValor);
        if (err) copia[name] = err;
        else delete copia[name];
        return copia;
      });
    }
  };

  // Liberar objetos URL al desmontar / cuando cambia el archivo
  useEffect(() => {
    return () => {
      if (previewPerfil) URL.revokeObjectURL(previewPerfil);
      if (previewUbicacion) URL.revokeObjectURL(previewUbicacion);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setTipoMensaje('');
    setCargando(true);

    const valid = validarTodo();
    setErrores(valid);

    const hayErrores = Object.keys(valid).length > 0;
    if (hayErrores) {
      setMensaje('❌ Corrige los errores e intenta nuevamente.');
      setTipoMensaje('error');
      setCargando(false);
      return;
    }

    try {
      const formData = new FormData();

      // append solo campos no nulos (y files)
      Object.entries(formulario).forEach(([key, val]) => {
        if (val === null || val === '') return;
        formData.append(key, val);
      });

      await api.post('/usuario/crear-usuario', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMensaje('✅ Registro exitoso.');
      setTipoMensaje('exito');

      // pequeña pausa UX antes de navegar (opcional)
      setTimeout(() => navigate('/Cuenta'), 900);
    } catch (err) {
      console.error('❌ Error al registrar:', err);
      setMensaje('❌ Error al registrar. Intenta más tarde.');
      setTipoMensaje('error');
    } finally {
      setCargando(false);
    }
  };

  // Helper para mostrar clase de input según error
  const claseInput = (campo) => {
    return errores[campo] ? 'campo-input-registro campo-invalido-registro' : 'campo-input-registro';
  };

  return (
    <div className="contenedor-registro">
      <h2 className="tituloUnico registro-activsena">Registrar Usuario (Admin o Instructor)</h2>

      <form
        className="formulario-registro"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        noValidate
      >
        <div className="grilla-campos-registro">
          <div className="grupo-campo-registro">
            <label htmlFor="IdentificacionUsuario" className="etiqueta-registro">
              Identificación<span className="asterisco-obligatorio-registro">*</span>
            </label>
            <input
              id="IdentificacionUsuario"
              name="IdentificacionUsuario"
              type="text"
              className={claseInput('IdentificacionUsuario')}
              value={formulario.IdentificacionUsuario}
              onChange={handleChange}
              aria-invalid={!!errores.IdentificacionUsuario}
              aria-describedby={errores.IdentificacionUsuario ? 'err-IdentificacionUsuario' : undefined}
              placeholder="Ingresa tu número de identificación"
            />
            {errores.IdentificacionUsuario && (
              <p id="err-IdentificacionUsuario" role="alert" className="mensaje-error-registro">
                {errores.IdentificacionUsuario}
              </p>
            )}
          </div>

          <div className="grupo-campo-registro">
            <label htmlFor="Nombre" className="etiqueta-registro">
              Nombre<span className="asterisco-obligatorio-registro">*</span>
            </label>
            <input
              id="Nombre"
              name="Nombre"
              type="text"
              className={claseInput('Nombre')}
              value={formulario.Nombre}
              onChange={handleChange}
              aria-invalid={!!errores.Nombre}
              placeholder="Tu nombre"
            />
            {errores.Nombre && <p role="alert" className="mensaje-error-registro">{errores.Nombre}</p>}
          </div>

          <div className="grupo-campo-registro">
            <label htmlFor="Apellido" className="etiqueta-registro">
              Apellido<span className="asterisco-obligatorio-registro">*</span>
            </label>
            <input
              id="Apellido"
              name="Apellido"
              type="text"
              className={claseInput('Apellido')}
              value={formulario.Apellido}
              onChange={handleChange}
              aria-invalid={!!errores.Apellido}
              placeholder="Tu apellido"
            />
            {errores.Apellido && <p role="alert" className="mensaje-error-registro">{errores.Apellido}</p>}
          </div>

          <div className="grupo-campo-registro">
            <label htmlFor="Correo" className="etiqueta-registro">
              Correo electrónico<span className="asterisco-obligatorio-registro">*</span>
            </label>
            <input
              id="Correo"
              name="Correo"
              type="email"
              className={claseInput('Correo')}
              value={formulario.Correo}
              onChange={handleChange}
              aria-invalid={!!errores.Correo}
              placeholder="usuario@ejemplo.com"
            />
            {errores.Correo && <p role="alert" className="mensaje-error-registro">{errores.Correo}</p>}
          </div>

          <div className="grupo-campo-registro">
            <label htmlFor="Telefono" className="etiqueta-registro">Teléfono (opcional)</label>
            <input
              id="Telefono"
              name="Telefono"
              type="tel"
              className="campo-input-registro"
              value={formulario.Telefono}
              onChange={handleChange}
              placeholder="Opcional"
            />
          </div>

          <div className="grupo-campo-registro">
            <label htmlFor="Contrasena" className="etiqueta-registro">
              Contraseña<span className="asterisco-obligatorio-registro">*</span>
            </label>
            <input
              id="Contrasena"
              name="Contrasena"
              type="password"
              className={claseInput('Contrasena')}
              value={formulario.Contrasena}
              onChange={handleChange}
              aria-invalid={!!errores.Contrasena}
              placeholder="Mínimo 6 caracteres"
            />
            {errores.Contrasena && <p role="alert" className="mensaje-error-registro">{errores.Contrasena}</p>}
          </div>

          <div className="grupo-campo-registro">
            <label htmlFor="Rol" className="etiqueta-registro">
              Rol<span className="asterisco-obligatorio-registro">*</span>
            </label>
            <select
              id="Rol"
              name="Rol"
              className={errores.Rol ? 'campo-input-registro campo-invalido-registro' : 'campo-input-registro'}
              value={formulario.Rol}
              onChange={handleChange}
              aria-invalid={!!errores.Rol}
            >
              <option value="">Selecciona un rol</option>
              <option value="Administrador">Administrador</option>
              <option value="Instructor">Instructor</option>
            </select>
            {errores.Rol && <p role="alert" className="mensaje-error-registro">{errores.Rol}</p>}
          </div>
        </div>

        {/* CAMPOS EXCLUSIVOS DE INSTRUCTOR */}
        {formulario.Rol === 'Instructor' && (
          <>
            <div className="grilla-campos-registro">
              <div className="grupo-campo-registro">
                <label htmlFor="profesion" className="etiqueta-registro">
                  Profesión<span className="asterisco-obligatorio-registro">*</span>
                </label>
                <input
                  id="profesion"
                  name="profesion"
                  type="text"
                  className={claseInput('profesion')}
                  value={formulario.profesion}
                  onChange={handleChange}
                  aria-invalid={!!errores.profesion}
                />
                {errores.profesion && <p role="alert" className="mensaje-error-registro">{errores.profesion}</p>}
              </div>

              <div className="grupo-campo-registro">
                <label htmlFor="ubicacion" className="etiqueta-registro">
                  Ubicación<span className="asterisco-obligatorio-registro">*</span>
                </label>
                <input
                  id="ubicacion"
                  name="ubicacion"
                  type="text"
                  className={claseInput('ubicacion')}
                  value={formulario.ubicacion}
                  onChange={handleChange}
                  aria-invalid={!!errores.ubicacion}
                />
                {errores.ubicacion && <p role="alert" className="mensaje-error-registro">{errores.ubicacion}</p>}
              </div>
            </div>

            <div className="grilla-campos-registro">
              <div className="grupo-campo-registro">
                <label htmlFor="imagenUbicacion" className="etiqueta-registro">
                  Imagen del lugar (Ubicación)<span className="asterisco-obligatorio-registro">*</span>
                </label>
                <input
                  id="imagenUbicacion"
                  name="imagenUbicacion"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className={errores.imagenUbicacion ? 'campo-invalido-registro' : ''}
                  aria-invalid={!!errores.imagenUbicacion}
                />
                {previewUbicacion && (
                  <img src={previewUbicacion} alt="Preview ubicación" className="preview-imagen" />
                )}
                {errores.imagenUbicacion && <p role="alert" className="mensaje-error-registro">{errores.imagenUbicacion}</p>}
              </div>

              <div className="grupo-campo-registro">
                <label htmlFor="imagenPerfil" className="etiqueta-registro">
                  Imagen de perfil del instructor<span className="asterisco-obligatorio-registro">*</span>
                </label>
                <input
                  id="imagenPerfil"
                  name="imagenPerfil"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className={errores.imagenPerfil ? 'campo-invalido-registro' : ''}
                  aria-invalid={!!errores.imagenPerfil}
                />
                {previewPerfil && <img src={previewPerfil} alt="Preview perfil" className="preview-imagen" />}
                {errores.imagenPerfil && <p role="alert" className="mensaje-error-registro">{errores.imagenPerfil}</p>}
              </div>
            </div>
          </>
        )}

        <div className="contenedor-terminos-registro" style={{ marginTop: 8 }}>
          <input
            id="aceptaTerminos"
            name="aceptaTerminos"
            type="checkbox"
            className="checkbox-terminos-registro"
            checked={formulario.aceptaTerminos}
            onChange={handleChange}
            aria-invalid={!!errores.aceptaTerminos}
          />
          <label htmlFor="aceptaTerminos" className="texto-terminos-registro">
            Acepto los <a href="/terminos" className="enlace-terminos-registro">términos y condiciones</a>
          </label>
        </div>
        {errores.aceptaTerminos && <p role="alert" className="mensaje-error-registro">{errores.aceptaTerminos}</p>}

        <div style={{ marginTop: 12 }}>
          <button type="submit" className="boton-registro" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrar'}
          </button>
        </div>

        {mensaje && (
          <p className={tipoMensaje === 'exito' ? 'mensaje-exito' : 'mensaje-error-registro'} role="status" style={{ marginTop: 8 }}>
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
};

export default Registro;
