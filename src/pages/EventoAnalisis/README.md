# 🤖 Sistema de Análisis de Eventos con IA

## 📋 Descripción

Sistema inteligente que analiza eventos finalizados y proporciona insights automáticos, recomendaciones y predicciones para mejorar futuros eventos.

## ✨ Características Principales

### 1. **Análisis Automático con IA**
- Evaluación de métricas clave del evento
- Análisis de satisfacción y participación
- Identificación de puntos fuertes y débiles

### 2. **Métricas Analizadas**
- 📊 **Asistencia**: Número de participantes
- ⭐ **Satisfacción**: Calificación promedio (1-5)
- 🏆 **Participación**: Porcentaje de engagement
- ⏱️ **Duración**: Tiempo efectivo del evento

### 3. **Insights Inteligentes**
- ✅ **Puntos Fuertes**: Aspectos exitosos del evento
- ⚠️ **Áreas de Oportunidad**: Aspectos a mejorar
- 💡 **Recomendaciones**: Sugerencias priorizadas con impacto estimado

### 4. **Predicciones**
- Estimación de asistencia para próximo evento
- Recomendaciones de capacidad
- Tendencias identificadas

## 🔧 Integración con IA Real

### Opción 1: OpenAI GPT
```javascript
import OpenAI from 'openai';

const analizarConOpenAI = async (evento, feedbacks) => {
  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY
  });

  const prompt = `
    Analiza el siguiente evento y proporciona insights:
    
    Evento: ${evento.NombreEvento}
    Descripción: ${evento.DescripcionEvento}
    Fecha: ${evento.FechaInicio} - ${evento.FechaFin}
    Ubicación: ${evento.UbicacionEvento}
    
    Feedbacks de participantes:
    ${feedbacks.map(f => `- ${f.comentario} (${f.calificacion}/5)`).join('\n')}
    
    Proporciona:
    1. Puntos fuertes (4-5 items)
    2. Áreas de oportunidad (4-5 items)
    3. Recomendaciones específicas con prioridad e impacto
    4. Predicción de asistencia para próximo evento
    5. Sentimiento general (Muy Positivo/Positivo/Neutral/Negativo)
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Eres un experto analista de eventos que proporciona insights accionables."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content);
};
```

### Opción 2: Google Gemini
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const analizarConGemini = async (evento, feedbacks) => {
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Analiza este evento y genera un reporte JSON con:
    - metricas: {asistentes, satisfaccion, participacion}
    - puntosFuertes: array de strings
    - areasDeOportunidad: array de strings
    - recomendaciones: array de objetos {tipo, prioridad, descripcion, impacto}
    - sentimientoGeneral: string
    - prediccionProximoEvento: objeto
    
    Datos del evento:
    ${JSON.stringify(evento, null, 2)}
    
    Feedbacks:
    ${JSON.stringify(feedbacks, null, 2)}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};
```

### Opción 3: Anthropic Claude
```javascript
import Anthropic from '@anthropic-ai/sdk';

const analizarConClaude = async (evento, feedbacks) => {
  const anthropic = new Anthropic({
    apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analiza este evento y proporciona insights detallados...`
      }
    ],
  });

  return JSON.parse(message.content[0].text);
};
```

## 📊 Sistema de Feedback

Para mejorar el análisis, implementa un sistema de recolección de feedback:

### Backend Endpoint (Node.js + Express)
```javascript
// routes/feedback.js
router.post('/api/evento/:id/feedback', async (req, res) => {
  const { IdEvento } = req.params;
  const { calificacion, comentario, aspectos } = req.body;
  
  try {
    const feedback = await Feedback.create({
      IdEvento,
      calificacion,
      comentario,
      aspectos: JSON.stringify(aspectos),
      fecha: new Date()
    });
    
    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/evento/:id/feedbacks', async (req, res) => {
  const { IdEvento } = req.params;
  
  try {
    const feedbacks = await Feedback.findAll({
      where: { IdEvento }
    });
    
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Modelo de Base de Datos
```sql
CREATE TABLE Feedbacks (
  IdFeedback INT PRIMARY KEY AUTO_INCREMENT,
  IdEvento INT NOT NULL,
  calificacion DECIMAL(2,1) NOT NULL,
  comentario TEXT,
  aspectos JSON,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (IdEvento) REFERENCES Eventos(IdEvento)
);
```

## 🎯 Uso del Componente

### 1. Importar en tu aplicación
```javascript
import EventoAnalisisIA from './pages/EventoAnalisis/EventoAnalisisIA';
```

### 2. Agregar ruta
```javascript
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

<Routes>
  <Route path="/analisis-eventos" element={<EventoAnalisisIA />} />
</Routes>
```

### 3. Agregar al menú de navegación
```javascript
<nav>
  <Link to="/analisis-eventos">
    <FaRobot /> Análisis con IA
  </Link>
</nav>
```

## 🔄 Flujo de Trabajo

1. **Evento Finaliza** → Sistema marca evento como completado
2. **Recolección de Datos** → Participantes dejan feedback
3. **Análisis con IA** → Sistema procesa datos y genera insights
4. **Visualización** → Dashboard muestra resultados
5. **Acción** → Organizadores implementan recomendaciones

## 📈 Métricas Avanzadas (Opcional)

### Análisis de Sentimiento en Comentarios
```javascript
const analizarSentimiento = async (comentarios) => {
  // Usar API de análisis de sentimiento
  const sentimientos = await Promise.all(
    comentarios.map(async (comentario) => {
      const response = await fetch('https://api.sentimiento.com/analyze', {
        method: 'POST',
        body: JSON.stringify({ text: comentario })
      });
      return response.json();
    })
  );
  
  return sentimientos;
};
```

### Comparación con Eventos Anteriores
```javascript
const compararConHistorico = (eventoActual, eventosAnteriores) => {
  const promedios = {
    asistencia: calcularPromedio(eventosAnteriores, 'asistentes'),
    satisfaccion: calcularPromedio(eventosAnteriores, 'satisfaccion'),
    participacion: calcularPromedio(eventosAnteriores, 'participacion')
  };
  
  return {
    mejoras: calcularMejoras(eventoActual, promedios),
    tendencias: identificarTendencias(eventosAnteriores)
  };
};
```

## 🎨 Personalización

### Cambiar colores del tema
```css
/* EventoAnalisisIA.css */
:root {
  --color-primary: #667eea;
  --color-secondary: #764ba2;
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-danger: #f44336;
}
```

### Agregar nuevas métricas
```javascript
// En generarAnalisisSimulado()
metricas: {
  asistentes: asistenciaEstimada,
  satisfaccion: parseFloat(satisfaccion),
  participacion: participacion,
  duracion: '2.5 horas',
  // Nuevas métricas
  retencion: 85, // % que se quedó hasta el final
  networking: 70, // % que hizo networking
  aprendizaje: 4.2 // Calificación de aprendizaje
}
```

## 🚀 Mejoras Futuras

- [ ] Integración con Google Analytics
- [ ] Exportar reportes en PDF
- [ ] Comparación entre múltiples eventos
- [ ] Alertas automáticas de bajo rendimiento
- [ ] Dashboard de tendencias a largo plazo
- [ ] Integración con sistemas de tickets
- [ ] Análisis de redes sociales
- [ ] Predicciones con Machine Learning

## 📝 Notas Importantes

1. **API Keys**: Guarda las claves de API en variables de entorno
2. **Costos**: Considera los costos de las APIs de IA
3. **Rate Limits**: Implementa caché para evitar llamadas repetidas
4. **Privacidad**: Anonimiza datos sensibles antes de enviar a IA
5. **Validación**: Siempre valida las respuestas de la IA

## 🤝 Contribuir

Para agregar nuevas funcionalidades:
1. Crea una nueva rama
2. Implementa la funcionalidad
3. Agrega tests
4. Crea un Pull Request

## 📄 Licencia

Este componente es parte del sistema de gestión de eventos del SENA.
