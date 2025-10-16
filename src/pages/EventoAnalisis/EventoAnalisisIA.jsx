import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EventoAnalisisIA.css';
import { 
  FaRobot, 
  FaUsers, 
  FaStar, 
  FaTrophy, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaLightbulb,
  FaBullseye,
  FaChartLine,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaInfoCircle,
  FaClipboardList,
  FaUserCheck,
  FaChartBar
} from 'react-icons/fa';
import { MdEventAvailable, MdAnalytics } from 'react-icons/md';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { BiTargetLock } from 'react-icons/bi';

function EventoAnalisisIA() {
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [analisisIA, setAnalisisIA] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  // Cargar eventos finalizados
  useEffect(() => {
    cargarEventosFinalizados();
  }, []);

  const cargarEventosFinalizados = async () => {
    try {
      const response = await axios.get('https://render-hhyo.onrender.com/api/evento/publicos');
      const ahora = new Date();
      
      // Filtrar solo eventos que ya terminaron (fecha y hora de fin pasadas)
      const eventosFinalizados = response.data.filter(evento => {
        try {
          // Crear fecha de fin con hora
          const fechaFinStr = `${evento.FechaFin}T${evento.HoraFin || '23:59:59'}`;
          const fechaFin = new Date(fechaFinStr);
          
          // Solo mostrar eventos que ya terminaron
          const yaTermino = fechaFin < ahora;
          
          return yaTermino;
        } catch (error) {
          return false;
        }
      });
      setEventos(eventosFinalizados);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  // Analizar con IA real obteniendo datos reales primero
  const analizarEventoConIA = async (evento) => {
    setCargando(true);
    setEventoSeleccionado(evento);
    
    // Declarar variables fuera del try para que estén disponibles en el catch
    let asistenciasReales = 0;
    let feedbacksReales = [];
    let confirmadosReales = 0;
    let tasaAsistencia = 0;
    
    try {
      console.log('📊 Obteniendo datos reales del evento...');
      
      try {
        const resAsistencias = await axios.get(`https://render-hhyo.onrender.com/api/asistencia/evento/${evento.IdEvento}`);
        asistenciasReales = resAsistencias.data.length || 0;
        console.log(`✅ Asistencias encontradas: ${asistenciasReales}`);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('ℹ️ No hay asistencias registradas (404 - normal)');
        } else {
          console.error('❌ Error obteniendo asistencias:', error.message);
        }
      }
      
      // Obtener confirmados
      try {
        const resConfirmados = await axios.get(`https://render-hhyo.onrender.com/api/confirmacion/evento/${evento.IdEvento}`);
        confirmadosReales = resConfirmados.data.length || 0;
        console.log(`✅ Confirmados encontrados: ${confirmadosReales}`);
        
        // Calcular tasa de asistencia (confirmados que asistieron)
        if (confirmadosReales > 0) {
          tasaAsistencia = Math.round((asistenciasReales / confirmadosReales) * 100);
          console.log(`📊 Tasa de asistencia: ${tasaAsistencia}%`);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('ℹ️ No hay confirmaciones registradas (404 - normal)');
        } else {
          console.error('❌ Error obteniendo confirmaciones:', error.message);
        }
      }
      
      // Obtener feedbacks reales si existen
      try {
        const resFeedbacks = await axios.get(`https://render-hhyo.onrender.com/api/feedback/evento/${evento.IdEvento}`);
        feedbacksReales = resFeedbacks.data || [];
        console.log(`✅ Feedbacks encontrados: ${feedbacksReales.length}`);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('ℹ️ No hay feedbacks registrados (404 - normal)');
        } else {
          console.error('❌ Error obteniendo feedbacks:', error.message);
        }
      }
      
      // Resumen de datos obtenidos
      console.log('📋 Resumen de datos:', {
        asistencias: asistenciasReales,
        confirmados: confirmadosReales,
        feedbacks: feedbacksReales.length,
        tasaAsistencia: `${tasaAsistencia}%`
      });
      
      // Llamar a la IA con los datos reales
      console.log('🤖 Llamando a OpenAI para análisis...');
      const analisis = await analizarConGeminiIA(evento, asistenciasReales, feedbacksReales, confirmadosReales, tasaAsistencia);
      console.log('✅ Análisis de IA completado');
      setAnalisisIA(analisis);
      
    } catch (error) {
      console.error('❌ Error en análisis con IA:', error.message || error);
      console.log('🔄 Generando análisis con datos reales (fallback sin IA)...');
      // Si falla la IA, generar análisis basado en datos reales (sin inventar)
      const analisis = generarAnalisisConDatosReales(evento, asistenciasReales, feedbacksReales, confirmadosReales, tasaAsistencia);
      console.log('✅ Análisis generado con datos reales');
      setAnalisisIA(analisis);
    } finally {
      setCargando(false);
    }
  };

  // Función para analizar con OpenAI GPT-4 Mini
  // NOTA: Esta función puede fallar por CORS al llamar desde el navegador.
  // OpenAI no permite llamadas directas desde el frontend por seguridad.
  // Cuando falla, automáticamente se usa el análisis con datos reales (generarAnalisisConDatosReales)
  const analizarConGeminiIA = async (evento, asistencias, feedbacks, confirmados, tasaAsistencia) => {
    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY ;
    
  
    // Calcular satisfacción promedio de feedbacks reales
    let satisfaccionPromedio = 0;
    let comentariosFeedback = '';
    
    if (feedbacks.length > 0) {
      const suma = feedbacks.reduce((acc, fb) => acc + (fb.calificacion || 0), 0);
      satisfaccionPromedio = (suma / feedbacks.length).toFixed(1);
      comentariosFeedback = feedbacks.map(fb => `- "${fb.comentario}" (${fb.calificacion}/5)`).join('\n');
    }
    
    const prompt = `
Eres un experto analista de eventos del SENA. Analiza el siguiente evento con DATOS REALES y proporciona un análisis detallado.

EVENTO:
- Nombre: ${evento.NombreEvento}
- Descripción: ${evento.DescripcionEvento || 'Sin descripción'}
- Fecha: ${evento.FechaInicio} al ${evento.FechaFin}
- Horario: ${evento.HoraInicio} - ${evento.HoraFin}
- Ubicación: ${evento.UbicacionEvento || 'Por confirmar'}
${evento.TipoEvento ? `- Tipo: ${evento.TipoEvento}` : ''}
${evento.CapacidadEvento ? `- Capacidad máxima: ${evento.CapacidadEvento} personas` : ''}

DATOS REALES:
- Confirmados (personas que dijeron que asistirían): ${confirmados} personas
- Asistentes reales (personas que SÍ asistieron): ${asistencias} personas
${confirmados > 0 ? `- Tasa de cumplimiento: ${tasaAsistencia}% (${asistencias} de ${confirmados} confirmados asistieron)` : ''}
- Feedbacks recibidos: ${feedbacks.length}
${satisfaccionPromedio > 0 ? `- Satisfacción promedio: ${satisfaccionPromedio}/5` : ''}

${feedbacks.length > 0 ? `COMENTARIOS DE PARTICIPANTES:\n${comentariosFeedback}` : 'No hay comentarios de participantes aún.'}

${asistencias === 0 && confirmados === 0 ? '\n⚠️ IMPORTANTE: Este evento NO tiene confirmaciones NI asistencias registradas. Analiza basándote SOLO en la información del evento y recomienda implementar sistema de registro.' : ''}
${confirmados > 0 && asistencias === 0 ? `\n⚠️ CRÍTICO: ${confirmados} personas confirmaron pero NADIE asistió. Analiza qué pudo fallar (comunicación, recordatorios, interés real, problemas logísticos).` : ''}
${confirmados > 0 && tasaAsistencia < 50 ? `\n⚠️ ALERTA: Tasa de asistencia baja (${tasaAsistencia}%). Muchos confirmaron pero no asistieron. Analiza causas.` : ''}

Proporciona un análisis en el siguiente formato JSON (SOLO JSON, sin texto adicional):
{
  "metricas": {
    "asistentes": ${asistencias},
    "satisfaccion": ${satisfaccionPromedio > 0 ? satisfaccionPromedio : 0},
    "participacion": ${asistencias > 0 ? Math.round((asistencias / 100) * 100) : 0},
    "duracion": "calcula las horas entre ${evento.HoraInicio} y ${evento.HoraFin}",
    "tieneAsistencias": ${asistencias > 0 ? 'true' : 'false'},
    "tieneFeedbacks": ${feedbacks.length > 0 ? 'true' : 'false'}
  },
  "puntosFuertes": [
    ${asistencias === 0 ? `"Genera 2-3 puntos POSITIVOS basados SOLO en la planificación: Tipo='${evento.TipoEvento || 'evento'}', Ubicación='${evento.UbicacionEvento}', Horario='${evento.HoraInicio}-${evento.HoraFin}', Duración. Sé específico sobre QUÉ está bien planeado. NO menciones asistencia."` : `"Genera 4-5 puntos fuertes ESPECÍFICOS basados en: ${asistencias} asistentes de ${evento.CapacidadEvento || '?'} capacidad (${Math.round((asistencias / (evento.CapacidadEvento || 100)) * 100)}% ocupación), satisfacción ${satisfaccionPromedio}/5, comentarios reales de participantes"`}
  ],
  "areasDeOportunidad": [
    ${asistencias === 0 && confirmados === 0 ? `
    "Sin datos de asistencia ni confirmaciones. Genera 3-4 áreas ESPECÍFICAS:"
    "1. PROMOCIÓN: Especifica DÓNDE y CÓMO promocionar (Instagram SENA, carteleras en bloques X, grupos WhatsApp de aprendices)"
    "2. REGISTRO: Especifica QUÉ herramienta usar (Google Forms con link corto, código QR en entrada, lista física)"
    "3. TIMING: Analiza si el horario ${evento.HoraInicio}-${evento.HoraFin} es conveniente para aprendices"
    "4. ATRACTIVO: Qué hace falta para que '${evento.NombreEvento}' sea más atractivo"
    ` : ''}
    ${confirmados > 0 && asistencias === 0 ? `
    "CRÍTICO: ${confirmados} confirmaron pero 0 asistieron. Genera 3-4 áreas ESPECÍFICAS:"
    "1. RECORDATORIOS: Falta sistema de recordatorios (WhatsApp, email, notificaciones app)"
    "2. HORARIO: ${evento.HoraInicio} puede ser muy temprano/tarde para aprendices"
    "3. UBICACIÓN: '${evento.UbicacionEvento}' puede ser difícil de encontrar o poco atractiva"
    "4. INTERÉS REAL: El tema '${evento.NombreEvento}' puede no ser lo que esperaban"
    ` : ''}
    ${confirmados > 0 && asistencias > 0 && tasaAsistencia < 70 ? `
    "Tasa de asistencia baja: ${asistencias}/${confirmados} (${tasaAsistencia}%). Genera 3-4 áreas ESPECÍFICAS:"
    "1. COMPROMISO: Cómo hacer que los confirmados realmente asistan"
    "2. RECORDATORIOS: Implementar recordatorios 24h y 1h antes"
    "3. INCENTIVOS: Qué ofrecer (certificados, refrigerio, puntos extra)"
    "4. BARRERAS: Qué impide que asistan (horario, ubicación, duración de ${evento.HoraInicio}-${evento.HoraFin})"
    ` : ''}
    ${asistencias > 0 && satisfaccionPromedio > 0 && satisfaccionPromedio < 4.0 ? `
    "Satisfacción baja: ${satisfaccionPromedio}/5. Analiza comentarios reales y genera 3-4 áreas ESPECÍFICAS basadas en ellos"
    ` : ''}
    ${asistencias > 0 && evento.CapacidadEvento && asistencias < evento.CapacidadEvento * 0.5 ? `
    "Baja ocupación: ${asistencias}/${evento.CapacidadEvento} (${Math.round((asistencias / evento.CapacidadEvento) * 100)}%). Genera áreas sobre cómo llenar más el evento"
    ` : ''}
    "Cada área debe ser ACCIONABLE, no solo identificar el problema"
  ],
  "recomendaciones": [
    "Genera 3-4 recomendaciones ACCIONABLES y ESPECÍFICAS para '${evento.NombreEvento}':",
    ${asistencias === 0 && confirmados === 0 ? `
    "CRÍTICO: No hay sistema de registro. Recomendaciones DEBEN incluir:"
    "1. Cómo implementar registro (QR en entrada, Google Forms, app específica)"
    "2. Cómo promocionar mejor el evento (redes sociales, carteleras, grupos WhatsApp)"
    "3. Cómo medir impacto sin datos históricos"
    ` : ''}
    ${confirmados > 0 && asistencias === 0 ? `
    "CRÍTICO: ${confirmados} confirmaron pero NADIE asistió. Recomendaciones DEBEN incluir:"
    "1. Por qué pudo fallar (fecha/hora inadecuada, falta de recordatorios, tema no interesante)"
    "2. Cómo enviar recordatorios efectivos (24h antes, 1h antes)"
    "3. Cómo hacer el evento más atractivo"
    ` : ''}
    ${confirmados > 0 && tasaAsistencia < 50 ? `
    "ALERTA: Solo ${tasaAsistencia}% de confirmados asistió. Recomendaciones DEBEN incluir:"
    "1. Implementar sistema de recordatorios automáticos"
    "2. Analizar horario y ubicación (¿son convenientes?)"
    "3. Ofrecer incentivos para asistir (certificados, refrigerios, puntos)"
    ` : ''}
    ${asistencias > 0 && satisfaccionPromedio < 3.5 ? `
    "ALERTA: Satisfacción baja (${satisfaccionPromedio}/5). Recomendaciones DEBEN incluir:"
    "1. Mejorar contenido basado en comentarios: ${comentariosFeedback.substring(0, 100)}"
    "2. Ajustar duración del evento"
    "3. Mejorar logística (sonido, espacio, materiales)"
    ` : ''}
    "Cada recomendación debe tener:",
    {
      "tipo": "Logística/Contenido/Promoción/Seguimiento",
      "prioridad": "Alta/Media/Baja",
      "descripcion": "Acción ESPECÍFICA y CONCRETA que el instructor puede hacer YA",
      "impacto": "Resultado MEDIBLE esperado (ej: 'Aumentar asistencia en 30%', 'Mejorar satisfacción a 4.5/5')"
    }
  ],
  "actividadesSugeridas": [
    "Genera 3-4 actividades ESPECÍFICAS que complementen el tema '${evento.NombreEvento}'. Analiza el nombre y descripción del evento para crear actividades RELEVANTES y COHERENTES con el objetivo del evento. Cada actividad debe:",
    {
      "nombre": "Nombre específico relacionado con '${evento.NombreEvento}'",
      "descripcion": "Cómo se realiza esta actividad EN EL CONTEXTO de este evento específico",
      "duracion": "Tiempo estimado",
      "participantes": "Número ideal",
      "materiales": "Qué se necesita para esta actividad específica",
      "objetivo": "Qué logra en relación al tema '${evento.NombreEvento}'"
    }
  ],
  "mejorasCreativas": [
    "Genera 4-5 ideas INNOVADORAS específicas para mejorar '${evento.NombreEvento}'. Las ideas deben estar DIRECTAMENTE relacionadas con el tema del evento:",
    "- Si es sobre igualdad: dinámicas de inclusión, debates, testimonios",
    "- Si es deportivo: competencias, retos físicos, gamificación",
    "- Si es académico: talleres prácticos, casos de estudio, simulaciones",
    "- Si es cultural: presentaciones artísticas, exposiciones, intercambios",
    "- Si es tecnológico: demos en vivo, hackathons, workshops",
    "IMPORTANTE: Todas las ideas deben ser COHERENTES con '${evento.NombreEvento}' y su descripción: '${evento.DescripcionEvento || 'evento del SENA'}'"
  ],
  "sentimientoGeneral": ${asistencias === 0 ? '"Sin Datos"' : '"Muy Positivo/Positivo/Neutral basado en satisfacción real"'},
  "prediccionProximoEvento": {
    "asistenciaEstimada": ${asistencias === 0 ? '"No se puede predecir sin datos"' : 'número basado en tendencia real'},
    "recomendaciones": ${asistencias === 0 ? '"CRÍTICO: Implementar sistema de registro de asistencia antes del próximo evento. Sin datos, no se puede medir éxito ni hacer mejoras."' : '"recomendación basada en datos reales"'}
  },
  "razonSinDatos": ${asistencias === 0 ? '"Este evento no tiene sistema de registro de asistencia implementado. Puede que haya tenido asistentes, pero no hay forma de saberlo. Es fundamental implementar un método de registro (QR, lista, app) para futuros eventos."' : 'null'}
}`;

    try {
      console.log('📤 Enviando solicitud a OpenAI...');
      
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Eres un experto analista de eventos del SENA que proporciona análisis detallados y recomendaciones accionables. Siempre respondes en formato JSON válido.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          })
        }
      );

      console.log('📥 Respuesta recibida, status:', response.status);
      
      const data = await response.json();
     
      
      if (data.error) {
    
        throw new Error(data.error.message || 'Error de OpenAI');
      }
      
      if (data.choices && data.choices[0]) {
        const contenido = data.choices[0].message.content;
       
        return JSON.parse(contenido);
      }
      
      throw new Error('No se pudo obtener respuesta de OpenAI');
      
    } catch (error) {
    
    
      throw error;
    }
  };

  // Función para generar análisis con datos reales (sin inventar números)
  const generarAnalisisConDatosReales = (evento, asistencias, feedbacks, confirmados, tasaAsistencia) => {
    // Calcular satisfacción real de feedbacks
    let satisfaccionReal = 0;
    if (feedbacks.length > 0) {
      const suma = feedbacks.reduce((acc, fb) => acc + (fb.calificacion || 0), 0);
      satisfaccionReal = parseFloat((suma / feedbacks.length).toFixed(1));
    }
    
    // Calcular participación real
    let participacionReal = 0;
    if (confirmados > 0 && asistencias > 0) {
      participacionReal = Math.round((asistencias / confirmados) * 100);
    }
    
    // Determinar si hay datos suficientes
    const sinDatos = asistencias === 0 && confirmados === 0;
    
    return {
      metricas: {
        asistentes: asistencias,
        satisfaccion: satisfaccionReal,
        participacion: participacionReal,
        duracion: calcularDuracion(evento.HoraInicio, evento.HoraFin),
        tieneAsistencias: asistencias > 0,
        tieneFeedbacks: feedbacks.length > 0
      },
      puntosFuertes: sinDatos ? [
        `Evento bien planificado: "${evento.NombreEvento}"`,
        `Ubicación definida: ${evento.UbicacionEvento || 'Por confirmar'}`,
        `Horario establecido: ${evento.HoraInicio} - ${evento.HoraFin}`,
        evento.CapacidadEvento ? `Capacidad planificada: ${evento.CapacidadEvento} personas` : 'Evento organizado con anticipación'
      ] : [
        asistencias > 0 ? `${asistencias} personas asistieron al evento` : 'Evento realizado',
        satisfaccionReal >= 4 ? `Excelente satisfacción: ${satisfaccionReal}/5` : satisfaccionReal > 0 ? `Satisfacción registrada: ${satisfaccionReal}/5` : 'Evento completado',
        tasaAsistencia >= 70 ? `Alta tasa de cumplimiento: ${tasaAsistencia}%` : tasaAsistencia > 0 ? `Tasa de asistencia: ${tasaAsistencia}%` : 'Asistencia registrada',
        evento.UbicacionEvento ? `Ubicación: ${evento.UbicacionEvento}` : 'Evento finalizado'
      ],
      areasDeOportunidad: sinDatos ? [
        '⚠️ CRÍTICO: No hay sistema de registro de asistencia implementado',
        'Sin datos de asistencia, no se puede medir el éxito del evento',
        'Imposible saber cuántas personas asistieron realmente',
        'No se pueden generar mejoras basadas en datos sin información de participantes'
      ] : asistencias === 0 && confirmados > 0 ? [
        `CRÍTICO: ${confirmados} personas confirmaron pero nadie registró asistencia`,
        'Posible falla en el sistema de registro QR',
        'Falta de comunicación sobre cómo registrar asistencia',
        'Necesidad de verificar funcionamiento de códigos QR'
      ] : tasaAsistencia < 50 ? [
        `Baja tasa de asistencia: solo ${tasaAsistencia}% de confirmados asistió`,
        'Implementar sistema de recordatorios 24h y 1h antes del evento',
        'Revisar si el horario es conveniente para los participantes',
        'Considerar incentivos para mejorar el compromiso de asistencia'
      ] : [
        'Continuar mejorando la experiencia del participante',
        'Recopilar más feedback para identificar áreas específicas de mejora',
        'Mantener la calidad del contenido y organización',
        'Explorar nuevas dinámicas para aumentar el engagement'
      ],
      recomendaciones: sinDatos ? [
        {
          tipo: 'CRÍTICO - Sistema',
          prioridad: 'Alta',
          descripcion: 'Implementar URGENTEMENTE un sistema de registro de asistencia (códigos QR, lista digital, app móvil)',
          impacto: 'Permitirá medir el éxito de futuros eventos y tomar decisiones basadas en datos reales'
        },
        {
          tipo: 'Promoción',
          prioridad: 'Alta',
          descripcion: 'Crear estrategia de difusión en redes sociales SENA, carteleras físicas y grupos de WhatsApp',
          impacto: 'Aumentará la visibilidad y confirmaciones para próximos eventos'
        },
        {
          tipo: 'Seguimiento',
          prioridad: 'Media',
          descripcion: 'Establecer métricas claras: confirmaciones, asistencia real, satisfacción, engagement',
          impacto: 'Permitirá comparar eventos y medir mejoras continuas'
        }
      ] : asistencias === 0 && confirmados > 0 ? [
        {
          tipo: 'Sistema',
          prioridad: 'Alta',
          descripcion: 'Verificar que los códigos QR funcionen correctamente antes del evento',
          impacto: 'Evitará pérdida de datos de asistencia en futuros eventos'
        },
        {
          tipo: 'Comunicación',
          prioridad: 'Alta',
          descripcion: 'Explicar claramente a los participantes cómo y dónde escanear el QR (entrada y salida)',
          impacto: 'Mejorará el registro de asistencia en un 80%'
        },
        {
          tipo: 'Logística',
          prioridad: 'Media',
          descripcion: 'Colocar señalización visible con instrucciones de registro en la entrada',
          impacto: 'Facilitará el proceso de registro para los asistentes'
        }
      ] : [
        {
          tipo: 'Mejora Continua',
          prioridad: 'Media',
          descripcion: 'Analizar los feedbacks recibidos para identificar aspectos específicos a mejorar',
          impacto: 'Aumentará la satisfacción en próximos eventos'
        },
        {
          tipo: 'Engagement',
          prioridad: 'Media',
          descripcion: 'Incluir actividades interactivas y dinámicas durante el evento',
          impacto: 'Incrementará la participación activa de los asistentes'
        },
        {
          tipo: 'Seguimiento',
          prioridad: 'Baja',
          descripcion: 'Enviar encuesta post-evento para obtener más feedback detallado',
          impacto: 'Proporcionará insights valiosos para futuros eventos'
        }
      ],
      actividadesSugeridas: generarActividadesSegunTipo(evento),
      mejorasCreativas: generarMejorasSegunEvento(evento, asistencias),
      sentimientoGeneral: sinDatos ? 'Sin Datos' : satisfaccionReal >= 4 ? 'Muy Positivo' : satisfaccionReal >= 3.5 ? 'Positivo' : satisfaccionReal > 0 ? 'Neutral' : asistencias > 0 ? 'Positivo' : 'Sin Datos',
      prediccionProximoEvento: {
        asistenciaEstimada: sinDatos ? 'No se puede predecir sin datos históricos' : asistencias > 0 ? Math.round(asistencias * 1.1) : 'Implementar sistema de registro primero',
        recomendaciones: sinDatos ? 
          'CRÍTICO: Implementar sistema de registro de asistencia antes del próximo evento. Sin datos, es imposible medir el éxito o hacer predicciones.' :
          asistencias === 0 && confirmados > 0 ?
          'Verificar el sistema de registro QR y capacitar al personal sobre su uso correcto.' :
          `Basado en ${asistencias} asistentes reales, se estima una asistencia similar o mayor si se mantiene la calidad del evento.`
      },
      razonSinDatos: sinDatos ? 
        `El evento "${evento.NombreEvento}" finalizó el ${evento.FechaFin}, pero no tiene sistema de registro de asistencia implementado. Puede que hayan asistido personas, pero no hay forma de saberlo. Es fundamental implementar códigos QR, listas digitales o algún método de registro para futuros eventos.` :
        null
    };
  };
  
  // Función auxiliar para calcular duración
  const calcularDuracion = (horaInicio, horaFin) => {
    try {
      const inicio = new Date(`2000-01-01T${horaInicio}`);
      const fin = new Date(`2000-01-01T${horaFin}`);
      const diff = (fin - inicio) / (1000 * 60 * 60);
      return `${diff.toFixed(1)} horas`;
    } catch {
      return 'No especificada';
    }
  };
  
  // Generar actividades según el tipo de evento
  const generarActividadesSegunTipo = (evento) => {
    const nombre = evento.NombreEvento.toLowerCase();
    const descripcion = (evento.DescripcionEvento || '').toLowerCase();
    
    // Detectar tipo de evento por palabras clave
    if (nombre.includes('igualdad') || nombre.includes('género') || descripcion.includes('igualdad')) {
      return [
        {
          nombre: 'Panel de Testimonios',
          descripcion: 'Invitar a personas que compartan experiencias sobre igualdad de género en el ámbito laboral',
          duracion: '45 minutos',
          participantes: '3-5 panelistas',
          materiales: 'Micrófono, proyector para presentaciones',
          objetivo: 'Generar conciencia a través de experiencias reales'
        },
        {
          nombre: 'Debate Moderado',
          descripcion: 'Discusión estructurada sobre desafíos actuales en igualdad de género',
          duracion: '30 minutos',
          participantes: 'Toda la audiencia',
          materiales: 'Tarjetas para preguntas, moderador',
          objetivo: 'Fomentar el pensamiento crítico y la participación activa'
        }
      ];
    }
    
    // Actividades genéricas
    return [
      {
        nombre: 'Dinámica de Integración',
        descripcion: 'Actividad rompe hielo para generar conexión entre participantes',
        duracion: '15-20 minutos',
        participantes: 'Todos los asistentes',
        materiales: 'Ninguno o materiales simples',
        objetivo: 'Crear ambiente de confianza y participación'
      },
      {
        nombre: 'Sesión de Preguntas y Respuestas',
        descripcion: 'Espacio abierto para que los participantes hagan preguntas',
        duracion: '20-30 minutos',
        participantes: 'Toda la audiencia',
        materiales: 'Micrófono, tarjetas para preguntas',
        objetivo: 'Resolver dudas y profundizar en temas de interés'
      }
    ];
  };
  
  // Generar mejoras según el evento
  const generarMejorasSegunEvento = (evento, asistencias) => {
    if (asistencias === 0) {
      return [
        'Implementar códigos QR visibles en entrada y salida del evento',
        'Crear campaña de difusión en redes sociales del SENA 2 semanas antes',
        'Enviar recordatorios por WhatsApp y correo 24h y 1h antes del evento',
        'Ofrecer certificados digitales de asistencia como incentivo',
        'Colocar señalización clara desde la entrada principal hasta el lugar del evento'
      ];
    }
    
    return [
      'Incluir dinámicas interactivas cada 30 minutos para mantener la atención',
      'Ofrecer refrigerio o coffee break para mejorar la experiencia',
      'Crear hashtag oficial del evento para generar contenido en redes sociales',
      'Implementar sistema de gamificación con premios para participación activa',
      'Grabar el evento y compartir resumen en redes sociales del SENA'
    ];
  };

  const getSentimientoColor = (sentimiento) => {
    switch(sentimiento) {
      case 'Muy Positivo': return '#4CAF50';
      case 'Positivo': return '#8BC34A';
      case 'Neutral': return '#FFC107';
      default: return '#9E9E9E';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 'Alta': return '#f44336';
      case 'Media': return '#FF9800';
      case 'Baja': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="evento-analisis-container">
      <div className="analisis-ia-header">
        <div className="analisis-ia-header-icon">
          <MdAnalytics size={50} />
        </div>
        <div className="analisis-ia-header-text">
          <h1 className="analisis-ia-titulo">
            Análisis Inteligente de Eventos
          </h1>
          <p className="analisis-ia-subtitulo">
            <FaInfoCircle size={16} /> Esta herramienta analiza tus eventos finalizados usando Inteligencia Artificial. 
            Obtén insights sobre asistencia, satisfacción y recomendaciones personalizadas para mejorar futuros eventos.
          </p>
        </div>
      </div>

      <div className="analisis-contenido">
        {/* Lista de eventos */}
        <div className="eventos-lista-panel">
          <h2>
            <MdEventAvailable size={24} /> Eventos Finalizados
          </h2>
          {eventos.length === 0 ? (
            <div className="sin-eventos">
              <p>No hay eventos finalizados para analizar</p>
            </div>
          ) : (
            <div className="eventos-grid">
              {eventos.map(evento => (
                <div 
                  key={evento.IdEvento}
                  className={`evento-card ${eventoSeleccionado?.IdEvento === evento.IdEvento ? 'seleccionado' : ''}`}
                  onClick={() => analizarEventoConIA(evento)}
                >
                  <div className="evento-card-header">
                    <h3>{evento.NombreEvento}</h3>
                    <span className="evento-fecha">
                      <FaCalendarAlt size={14} /> {evento.FechaInicio}
                    </span>
                  </div>
                  {evento.DescripcionEvento && 
                   !evento.DescripcionEvento.toLowerCase().includes('aprobado') && 
                   evento.DescripcionEvento.trim() !== '' && (
                    <p className="evento-descripcion">{evento.DescripcionEvento}</p>
                  )}
                  <div className="evento-info-mini">
                    <span className="evento-ubicacion">
                      <FaMapMarkerAlt size={14} /> {evento.UbicacionEvento || 'Por confirmar'}
                    </span>
                    <span className="evento-horario">
                      <FaClock size={14} /> {evento.HoraInicio}
                    </span>
                  </div>
                  <button className="btn-analizar">
                    <FaChartBar size={16} /> Analizar con IA
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de análisis */}
        <div className="analisis-panel">
          {!eventoSeleccionado && !cargando && (
            <div className="analisis-placeholder">
              <div className="placeholder-icon"><FaRobot size={60} color="#4CAF50" /></div>
              <h3>Selecciona un evento para analizar</h3>
              <p>La IA generará insights y recomendaciones automáticamente</p>
            </div>
          )}

          {cargando && (
            <div className="analisis-cargando">
              <div className="spinner"><FaChartLine size={40} color="#4CAF50" /></div>
              <h3>Analizando evento con IA...</h3>
              <p>Procesando datos y generando recomendaciones...</p>
            </div>
          )}

          {analisisIA && !cargando && (
            <div className="analisis-resultados">
              <div className="resultado-header">
                <h2>{eventoSeleccionado.NombreEvento}</h2>
                <div 
                  className="sentimiento-badge"
                  style={{ backgroundColor: getSentimientoColor(analisisIA.sentimientoGeneral) }}
                >
                  {analisisIA.sentimientoGeneral}
                </div>
              </div>

              {/* Info del evento */}
              <div className="evento-info-banner">
                {eventoSeleccionado.TipoEvento && (
                  <div className="info-item">
                    <FaBullseye size={16} /> <strong>Tipo:</strong> {eventoSeleccionado.TipoEvento}
                  </div>
                )}
                <div className="info-item">
                  <FaCalendarAlt size={16} /> <strong>Duración:</strong> {eventoSeleccionado.FechaInicio} al {eventoSeleccionado.FechaFin}
                </div>
                {eventoSeleccionado.CapacidadEvento && (
                  <div className="info-item">
                    <FaUsers size={16} /> <strong>Capacidad:</strong> {eventoSeleccionado.CapacidadEvento} personas
                    {analisisIA.metricas.asistentes > 0 && (
                      <span style={{ marginLeft: '10px', color: analisisIA.metricas.asistentes >= eventoSeleccionado.CapacidadEvento * 0.7 ? '#4CAF50' : '#FF9800' }}>
                        ({Math.round((analisisIA.metricas.asistentes / eventoSeleccionado.CapacidadEvento) * 100)}% ocupación)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Advertencia si no hay datos */}
              {analisisIA.metricas.asistentes === 0 && (
                <div className="alerta-sin-datos">
                  <FaExclamationTriangle size={18} /> <strong>Sin datos de asistencia:</strong> Este evento no tiene registros de asistencia ni feedbacks. 
                  El análisis se basa únicamente en la información del evento.
                </div>
              )}

              {/* Métricas principales */}
              <div className="metricas-grid">
                <div className="metrica-card" style={{ opacity: analisisIA.metricas.asistentes === 0 ? 0.5 : 1 }}>
                  <div className="metrica-icon"><FaUsers color="#4CAF50" size={30} /></div>
                  <div className="metrica-info">
                    <span className="metrica-valor">
                      {analisisIA.metricas.asistentes}
                      {analisisIA.metricas.asistentes === 0 && <small style={{fontSize: '0.5em', display: 'block'}}>Sin datos</small>}
                    </span>
                    <span className="metrica-label">Asistentes Reales</span>
                  </div>
                </div>
                <div className="metrica-card" style={{ opacity: analisisIA.metricas.satisfaccion === 0 ? 0.5 : 1 }}>
                  <div className="metrica-icon"><FaStar color="#FFC107" size={30} /></div>
                  <div className="metrica-info">
                    <span className="metrica-valor">
                      {analisisIA.metricas.satisfaccion}/5
                      {analisisIA.metricas.satisfaccion === 0 && <small style={{fontSize: '0.5em', display: 'block'}}>Sin datos</small>}
                    </span>
                    <span className="metrica-label">Satisfacción</span>
                  </div>
                </div>
                <div className="metrica-card" style={{ opacity: analisisIA.metricas.participacion === 0 ? 0.5 : 1 }}>
                  <div className="metrica-icon"><FaTrophy color="#2196F3" size={30} /></div>
                  <div className="metrica-info">
                    <span className="metrica-valor">
                      {analisisIA.metricas.participacion}%
                      {analisisIA.metricas.participacion === 0 && <small style={{fontSize: '0.5em', display: 'block'}}>Sin datos</small>}
                    </span>
                    <span className="metrica-label">Participación</span>
                  </div>
                </div>
              </div>

              {/* Puntos fuertes */}
              <div className="analisis-seccion">
                <h3>
                  <FaCheckCircle size={20} color="#4CAF50" /> Puntos Fuertes
                </h3>
                <ul className="lista-puntos">
                  {analisisIA.puntosFuertes.map((punto, idx) => (
                    <li key={idx}>✓ {punto}</li>
                  ))}
                </ul>
              </div>

              {/* Áreas de oportunidad */}
              <div className="analisis-seccion">
                <h3>
                  <FaExclamationTriangle size={20} color="#FF9800" /> Áreas de Oportunidad
                </h3>
                <ul className="lista-puntos">
                  {analisisIA.areasDeOportunidad.map((area, idx) => (
                    <li key={idx}>⚠ {area}</li>
                  ))}
                </ul>
              </div>

              {/* Recomendaciones de IA */}
              <div className="analisis-seccion">
                <h3>
                  <FaLightbulb size={20} color="#FFC107" /> Recomendaciones de IA
                </h3>
                <div className="recomendaciones-grid">
                  {analisisIA.recomendaciones.map((rec, idx) => (
                    <div key={idx} className="recomendacion-card">
                      <div className="recomendacion-header">
                        <span className="recomendacion-tipo">{rec.tipo}</span>
                        <span 
                          className="recomendacion-prioridad"
                          style={{ backgroundColor: getPrioridadColor(rec.prioridad) }}
                        >
                          {rec.prioridad}
                        </span>
                      </div>
                      <p className="recomendacion-descripcion">{rec.descripcion}</p>
                      <div className="recomendacion-impacto">
                        <strong>Impacto:</strong> {rec.impacto}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actividades Sugeridas */}
              {analisisIA.actividadesSugeridas && analisisIA.actividadesSugeridas.length > 0 && (
                <div className="analisis-seccion">
                  <h3>
                    <BiTargetLock size={22} color="#2196F3" /> Actividades Dinámicas Sugeridas
                  </h3>
                  <div className="actividades-grid">
                    {analisisIA.actividadesSugeridas.map((actividad, idx) => (
                      <div key={idx} className="actividad-card">
                        <div className="actividad-header">
                          <h4><FaBullseye size={18} color="#2196F3" /> {actividad.nombre}</h4>
                          <span className="actividad-duracion"><FaClock size={14} /> {actividad.duracion}</span>
                        </div>
                        <p className="actividad-descripcion">{actividad.descripcion}</p>
                        <div className="actividad-detalles">
                          <div className="actividad-detalle">
                            <FaUsers size={14} color="#666" /> <strong>Participantes:</strong> {actividad.participantes}
                          </div>
                          {actividad.materiales && (
                            <div className="actividad-detalle">
                              <FaClipboardList size={14} color="#666" /> <strong>Materiales:</strong> {actividad.materiales}
                            </div>
                          )}
                          <div className="actividad-objetivo">
                            <FaBullseye size={14} color="#4CAF50" /> <strong>Objetivo:</strong> {actividad.objetivo}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mejoras Creativas */}
              {analisisIA.mejorasCreativas && analisisIA.mejorasCreativas.length > 0 && (
                <div className="analisis-seccion" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', color: 'white' }}>
                  <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaLightbulb size={22} /> Ideas Innovadoras para Mejorar el Evento
                  </h3>
                  <ul className="mejoras-lista">
                    {analisisIA.mejorasCreativas.map((mejora, idx) => (
                      <li key={idx} className="mejora-item">
                        <FaCheckCircle size={16} /> {mejora}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Razón de falta de datos */}
              {analisisIA.razonSinDatos && (
                <div className="analisis-seccion" style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
                  <h3>
                    <FaExclamationTriangle size={20} color="#856404" /> Análisis Limitado
                  </h3>
                  <p style={{ color: '#856404', lineHeight: '1.6' }}>
                    {analisisIA.razonSinDatos}
                  </p>
                </div>
              )}

              {/* Predicción para próximo evento */}
              <div className="analisis-seccion prediccion-seccion">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {analisisIA.metricas.asistentes === 0 ? (
                    <><FaExclamationTriangle size={20} color="#f44336" /> Acción Requerida</>
                  ) : (
                    <><FaChartLine size={20} color="#4CAF50" /> Predicción para Próximo Evento</>
                  )}
                </h3>
                <div className="prediccion-card">
                  {analisisIA.metricas.asistentes > 0 && (
                    <div className="prediccion-metrica">
                      <span className="prediccion-label">Asistencia Estimada:</span>
                      <span className="prediccion-valor">
                        {analisisIA.prediccionProximoEvento.asistenciaEstimada} personas
                      </span>
                    </div>
                  )}
                  <p className="prediccion-recomendacion">
                    {analisisIA.prediccionProximoEvento.recomendaciones}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventoAnalisisIA;
