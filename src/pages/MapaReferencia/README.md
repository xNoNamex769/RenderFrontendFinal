# 🗺️ Mapa de Referencia - Guía de Configuración

## Descripción
El **Mapa de Referencia** es una herramienta interactiva que permite a los aprendices visualizar sitios importantes dentro del SENA, además de **eventos, actividades y lúdicas en tiempo real** cargados directamente desde la API.

## 🎯 Características

### Funcionalidades Principales
- **Mapa interactivo** con marcadores personalizados
- **Geolocalización** del usuario en tiempo real
- **Filtros por categoría** (Entrada, Académico, Recreación, Salud, Alimentación, Administrativo, Eventos, Servicios)
- **Búsqueda de lugares** por nombre o descripción
- **Cálculo de distancias** desde la ubicación del usuario
- **Información detallada** de cada sitio (servicios disponibles)
- **Navegación con Google Maps** para obtener direcciones
- **Diseño responsive** para móviles y tablets

### 🔥 Integración con API (NUEVO)
- **🎭 Eventos en vivo**: Carga automática de eventos públicos desde la API
- **📚 Actividades programadas**: Visualiza actividades académicas activas
- **⚽ Lúdicas disponibles**: Muestra actividades lúdicas y deportivas
- **Actualización automática**: Los datos se cargan en tiempo real al abrir el mapa
- **Filtrado inteligente**: Solo muestra eventos/actividades futuras o en curso
- **Badges visuales**: Identifica fácilmente qué marcadores vienen de la API

## 📍 Cómo Personalizar los Sitios de Referencia

### 1. Obtener Coordenadas

Para agregar tus propios sitios, necesitas las coordenadas (latitud, longitud). Puedes obtenerlas de varias formas:

**Opción A: Google Maps**
1. Abre [Google Maps](https://maps.google.com)
2. Busca el lugar que deseas agregar
3. Haz clic derecho sobre el marcador
4. Selecciona las coordenadas que aparecen en la parte superior (se copian automáticamente)
5. Ejemplo: `4.8143, -75.6946`

**Opción B: Coordenadas GPS**
- Usa tu smartphone con GPS activado
- Abre Google Maps y mantén presionado el punto exacto
- Las coordenadas aparecerán en la parte inferior

### 2. Editar el Archivo MapaReferencia.jsx

Abre el archivo: `src/pages/MapaReferencia/MapaReferencia.jsx`

Busca el array `sitiosReferencia` (línea ~30) y modifica o agrega nuevos sitios:

```javascript
const sitiosReferencia = [
  {
    id: 1, // ID único (incrementa para cada nuevo sitio)
    nombre: 'SENA - Centro de Biotecnología Agropecuaria', // Nombre del lugar
    categoria: 'sena', // Categoría: sena, biblioteca, recreacion, salud, alimentacion, transporte
    descripcion: 'Centro de formación principal', // Descripción breve
    coordenadas: [4.8143, -75.6946], // [latitud, longitud]
    icono: '🎓', // Emoji que representa el lugar
    color: '#39A900', // Color del marcador (hexadecimal)
    servicios: ['Biblioteca', 'Laboratorios', 'Cafetería', 'Zonas deportivas'] // Lista de servicios
  },
  // Agrega más sitios aquí...
];
```

### 3. Ejemplo de Nuevo Sitio

```javascript
{
  id: 7,
  nombre: 'Gimnasio Municipal',
  categoria: 'recreacion',
  descripcion: 'Espacio deportivo y fitness',
  coordenadas: [4.8155, -75.6945],
  icono: '🏋️',
  color: '#FF5722',
  servicios: ['Pesas', 'Cardio', 'Clases grupales', 'Duchas']
}
```

### 4. Categorías Disponibles

| Categoría | Descripción | Color Sugerido |
|-----------|-------------|----------------|
| `sena` | Centros SENA | `#39A900` (Verde SENA) |
| `biblioteca` | Bibliotecas y salas de estudio | `#2196F3` (Azul) |
| `recreacion` | Parques y zonas deportivas | `#4CAF50` (Verde) |
| `salud` | Centros médicos y farmacias | `#F44336` (Rojo) |
| `alimentacion` | Cafeterías y restaurantes | `#FF9800` (Naranja) |
| `transporte` | Paraderos y estaciones | `#9C27B0` (Morado) |

### 5. Ubicación Actual del Mapa

El mapa está centrado en las coordenadas reales del SENA en Popayán:

```javascript
// Dirección: Calle 4 #2-67, Barrio Sena Centro, Popayán, Cauca
const centroDefault = [2.4832482, -76.5617734]; // [latitud, longitud]
```

Si necesitas cambiar a otra sede del SENA, simplemente actualiza estas coordenadas con las de tu ubicación.

## 🎨 Personalización de Colores

Puedes cambiar los colores del tema editando el archivo `MapaReferencia.css`:

```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cambia #667eea y #764ba2 por tus colores preferidos */
```

## 🔧 Solución de Problemas

### El mapa no se muestra
- Verifica que tienes conexión a internet (Leaflet usa tiles de OpenStreetMap)
- Revisa la consola del navegador para errores

### Los marcadores no aparecen
- Verifica que las coordenadas estén en formato correcto: `[latitud, longitud]`
- La latitud debe estar entre -90 y 90
- La longitud debe estar entre -180 y 180

### La geolocalización no funciona
- El navegador debe tener permisos de ubicación activados
- HTTPS es requerido para geolocalización (no funciona en HTTP)

## 📱 Uso para Aprendices

1. **Acceder al mapa**: Desde el menú lateral del aprendiz, clic en "🗺️ Mapa de Referencia"
2. **Permitir ubicación**: El navegador pedirá permiso para acceder a tu ubicación
3. **Explorar**: Usa los filtros para ver solo ciertos tipos de lugares
4. **Buscar**: Escribe en la barra de búsqueda para encontrar lugares específicos
5. **Ver detalles**: Haz clic en un marcador o en la lista lateral
6. **Obtener direcciones**: Clic en "Cómo llegar" para abrir Google Maps

## 🌐 Recursos Adicionales

- [Leaflet Documentation](https://leafletjs.com/)
- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Google Maps Coordinates](https://support.google.com/maps/answer/18539)

## 💡 Ideas de Mejora

- Agregar rutas entre puntos
- Integrar con API de transporte público
- Permitir a los aprendices sugerir nuevos lugares
- Agregar fotos de los lugares
- Sistema de favoritos
- Compartir ubicaciones con otros aprendices

---

**Desarrollado para el SENA** 🎓
