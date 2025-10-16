# 🤖 Configurar IA Real para Análisis de Eventos

## ✨ Opción 1: OpenAI GPT-4 Mini (RECOMENDADO - MÁS PRECISO)

### Paso 1: Obtener API Key
1. Ve a: https://platform.openai.com/api-keys
2. Inicia sesión con tu cuenta de OpenAI
3. Haz clic en **"Create new secret key"**
4. Dale un nombre (ej: "Analisis Eventos SENA")
5. Copia la clave generada (¡guárdala bien, solo se muestra una vez!)

### Paso 2: Configurar en el código
Abre `EventoAnalisisIA.jsx` y busca la línea 56:
```javascript
const API_KEY = 'TU_API_KEY_DE_OPENAI';
```

Reemplázala con tu clave:
```javascript
const API_KEY = 'sk-proj-...tu-clave-aqui';
```

### Paso 3: ¡Listo!
La IA ahora analizará eventos reales con GPT-4 Mini de OpenAI.

### 💰 Costos de OpenAI
- **GPT-4o-mini**: $0.15 por 1M tokens de entrada, $0.60 por 1M tokens de salida
- **Estimado por análisis**: ~$0.001 - $0.003 USD (menos de 1 centavo)
- **Crédito inicial**: $5 USD gratis para nuevas cuentas

---

## 🔐 Opción Segura (Recomendada para producción)

### Crear archivo .env
Crea un archivo `.env` en la raíz del proyecto:
```env
REACT_APP_GEMINI_API_KEY=AIzaSy...tu-clave-aqui
```

### Modificar el código
En `EventoAnalisisIA.jsx` línea 56:
```javascript
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
```

### Agregar al .gitignore
Asegúrate de que `.env` esté en tu `.gitignore`:
```
.env
```

---

## 🚀 Alternativas de IA (si Gemini no funciona)

### Opción 2: Hugging Face (GRATIS)
```javascript
const analizarConHuggingFace = async (evento) => {
  const API_KEY = 'TU_HF_API_KEY'; // Obtener en https://huggingface.co/settings/tokens
  
  const response = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Analiza este evento: ${JSON.stringify(evento)}`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7
        }
      })
    }
  );
  
  return await response.json();
};
```

### Opción 3: Cohere (GRATIS hasta 100 llamadas/mes)
```javascript
const analizarConCohere = async (evento) => {
  const API_KEY = 'TU_COHERE_API_KEY'; // Obtener en https://dashboard.cohere.com/api-keys
  
  const response = await fetch(
    'https://api.cohere.ai/v1/generate',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt: `Analiza este evento y dame recomendaciones: ${JSON.stringify(evento)}`,
        max_tokens: 500
      })
    }
  );
  
  return await response.json();
};
```

---

## 📊 Cómo funciona el análisis con IA

1. **Usuario selecciona un evento** → Click en "Analizar con IA"
2. **Sistema envía datos** → Nombre, descripción, fechas, ubicación
3. **IA analiza** → Procesa la información del evento
4. **IA genera**:
   - ✅ Puntos fuertes específicos
   - ⚠️ Áreas de oportunidad
   - 💡 Recomendaciones priorizadas
   - 📈 Predicciones para próximo evento
5. **Dashboard muestra** → Resultados visuales con métricas

---

## 🎯 Mejoras Futuras

### Agregar datos de feedback real
Si tienes una tabla de feedbacks en tu base de datos:

```javascript
const analizarConGeminiIA = async (evento) => {
  // Obtener feedbacks del evento
  const feedbacksResponse = await axios.get(
    `https://render-hhyo.onrender.com/api/evento/${evento.IdEvento}/feedbacks`
  );
  const feedbacks = feedbacksResponse.data;
  
  const prompt = `
Analiza este evento con los siguientes feedbacks reales:

EVENTO: ${evento.NombreEvento}
FEEDBACKS:
${feedbacks.map(f => `- "${f.comentario}" (${f.calificacion}/5)`).join('\n')}

Proporciona análisis detallado...
  `;
  
  // ... resto del código
};
```

### Crear endpoint en tu backend
```javascript
// backend/routes/analisis.js
router.post('/api/evento/:id/analizar', async (req, res) => {
  const { IdEvento } = req.params;
  
  // Obtener evento
  const evento = await Evento.findByPk(IdEvento);
  
  // Obtener feedbacks
  const feedbacks = await Feedback.findAll({
    where: { IdEvento }
  });
  
  // Llamar a IA
  const analisis = await analizarConIA(evento, feedbacks);
  
  // Guardar análisis
  await AnalisisEvento.create({
    IdEvento,
    analisis: JSON.stringify(analisis),
    fecha: new Date()
  });
  
  res.json(analisis);
});
```

---

## ⚠️ Notas Importantes

1. **Límites de API**:
   - Gemini: 60 requests/minuto (gratis)
   - Hugging Face: Sin límite pero más lento
   - Cohere: 100 requests/mes gratis

2. **Costos**:
   - Gemini es **GRATIS** para uso normal
   - Solo pagas si superas millones de requests

3. **Privacidad**:
   - Los datos se envían a Google/Hugging Face
   - No envíes información sensible
   - Considera anonimizar datos personales

4. **Fallback**:
   - Si la IA falla, usa análisis simulado
   - Siempre valida las respuestas de la IA

---

## 🧪 Probar la IA

1. Ejecuta tu aplicación: `npm start`
2. Ve a la página de análisis
3. Selecciona un evento finalizado
4. Click en "Analizar con IA"
5. Espera 3-5 segundos
6. ¡Verás el análisis generado por IA real!

---

## 🆘 Solución de Problemas

### Error: "API key not valid"
- Verifica que copiaste la clave completa
- Asegúrate de que la API está habilitada

### Error: "CORS blocked"
- Gemini permite CORS desde frontend
- Si falla, crea un endpoint en tu backend

### Error: "Rate limit exceeded"
- Espera 1 minuto
- Implementa caché para evitar llamadas repetidas

### La IA no responde en JSON
- El código extrae JSON automáticamente
- Si falla, usa el análisis simulado como fallback

---

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12)
2. Los logs del backend
3. La documentación de Gemini: https://ai.google.dev/docs

¡Disfruta del análisis inteligente de eventos! 🎉
