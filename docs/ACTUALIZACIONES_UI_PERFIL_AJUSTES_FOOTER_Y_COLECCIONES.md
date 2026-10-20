# Documentación de Actualizaciones, Mejoras UI y Correcciones del Sistema

**Fecha:** 20 de Octubre de 2026  
**Proyecto:** ChileBite Frontend (Astro + React + TailwindCSS + Supabase)  
**Módulo:** Perfil, Ajustes, Footer, Notificaciones de Autenticación, Colecciones y Galería de Recetas  

---

## 1. Resumen Ejecutivo

Durante esta iteración se realizaron importantes mejoras visuales, de experiencia de usuario (UX) y corrección de bugs visuales y estructurales en toda la plataforma ChileBite. Las intervenciones se concentraron en:

1. **Gestión de Sesión e Interacciones**: Creación de un sistema centralizado de avisos para usuarios no autenticados al interactuar con recetas.
2. **Rediseño y Consistencia Dark/Light**: Adaptación visual del Perfil de Usuario y de todas las subsecciones de Ajustes (Settings), preservando el color institucional `#202026` ("plomo") en modo oscuro.
3. **Estabilidad del Layout (Sticky Footer y Skeletons)**: Eliminación del salto/desplazamiento del Footer durante las cargas de datos en todas las rutas del sitio mediante `min-h-[calc(100vh-...)]` y skeletons.
4. **Rediseño Completo del Footer**: Diseño editorial con halo de luz central en modo oscuro y claro, eliminando franjas innecesarias.
5. **Corrección de la Vista de Colección**: Expansión a pantalla completa (100% viewport width) y tarjeta de cabecera moderna.
6. **Corrección de Sombras y Recorte en Cards de Recetas**: Eliminación del contenedor restrictivo `overflow-hidden` y altura fija que recortaba las sombras y esquinas inferiores de las tarjetas en la galería.

---

## 2. Detalle de Feats y Fixes por Módulo

### 2.1. Autenticación y Notificaciones (`feat`)
- **Archivo Creado**: [`src/shared/utils/authToast.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/shared/utils/authToast.jsx)
- **Archivos Modificados**: 
  - [`src/features/recipes/components/RecipeCard.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/recipes/components/RecipeCard.jsx)
  - [`src/features/recipes/components/RecipeDetail.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/recipes/components/RecipeDetail.jsx)
  - [`src/features/recipes/components/CollectionPickerModal.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/recipes/components/CollectionPickerModal.jsx)
- **Descripción**:
  - Implementación de la utilidad `notifyAuthRequired(action)` basada en HeroUI Toast.
  - Informa claramente al usuario invitado cuando intenta dar "Me gusta", guardar en colecciones o crear una colección personalizada sin estar logueado.
  - Provee un botón de acción rápida *"Iniciar Sesión"* que redirige automáticamente a la página de login.

---

### 2.2. Perfil de Usuario (`feat` & `fix`)
- **Archivo Modificado**: [`src/features/profiles/components/UserProfile.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/profiles/components/UserProfile.jsx)
- **Descripción**:
  - **Paleta Adaptativa**: Armonización completa entre modo claro (tonos cálidos, borders sutiles) y modo oscuro.
  - **Mantenimiento de Identidad Plomo**: Se mantuvo estrictamente el fondo `#202026` en la tarjeta de datos del usuario y estadísticas para preservar el contraste y la identidad de marca solicitada.
  - **Skeletons de Carga**: Se incorporaron estados de carga iniciales para evitar que la página colapse verticalmente mientras se cargan colecciones o estadísticas.

---

### 2.3. Página de Ajustes / Configuración (`feat` & `style`)
- **Archivos Modificados**:
  - [`src/features/settings/components/SettingsPage.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/settings/components/SettingsPage.jsx)
  - [`src/features/settings/components/MFASetup.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/settings/components/MFASetup.jsx)
  - [`src/features/settings/components/sections/AccountSection.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/settings/components/sections/AccountSection.jsx)
  - [`src/features/settings/components/sections/AppearanceSection.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/settings/components/sections/AppearanceSection.jsx)
  - [`src/features/settings/components/sections/DangerZoneSection.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/settings/components/sections/DangerZoneSection.jsx)
  - [`src/features/settings/components/sections/LinkedAccountsSection.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/settings/components/sections/LinkedAccountsSection.jsx)
  - [`src/features/settings/components/sections/LocaleSection.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/settings/components/sections/LocaleSection.jsx)
  - [`src/features/settings/components/sections/NotificationsSection.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/settings/components/sections/NotificationsSection.jsx)
  - [`src/features/settings/components/sections/PrivacySection.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/settings/components/sections/PrivacySection.jsx)
  - [`src/features/settings/components/sections/SecuritySection.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/settings/components/sections/SecuritySection.jsx)
  - [`src/features/settings/components/sections/SettingsShared.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/settings/components/sections/SettingsShared.jsx)
- **Descripción**:
  - Unificación del sistema de tokens visuales en todas las pestañas de configuración.
  - En Dark Mode se conserva el color `#202026` con bordes finos `zinc-800` y tipografía legible `zinc-100`/`zinc-400`.
  - En Light Mode se adoptan fondos limpios en blanco y `surface-muted`, bordes sutiles y acentos terracota corporativos.

---

### 2.4. Estructura de Páginas y Corrección de Footer Cercano a Navbar (`fix`)
- **Archivos Modificados**:
  - `src/pages/**/*.astro` (Admin, Auth, Blog, Calculadora, Locales, Perfil, Recetas, Settings, Términos, Privacidad)
- **Problema Detectado**:
  - Al cargar páginas con fetches asíncronos en el cliente (como perfil o ajustes), el contenido no tenía altura mínima, por lo que el Footer se renderizaba pegado al Navbar hasta que los datos terminaban de cargar, causando un salto visual desagradable (*Cumulative Layout Shift*).
- **Solución Aplicada**:
  - Se configuró `<main class="flex-grow min-h-[calc(100vh-...)] ...">` y `body class="min-h-screen flex flex-col"` en todas las páginas Astro.
  - Ahora el Footer siempre permanece fijado en la parte inferior de la ventana gráfica independientemente del tiempo de carga.

---

### 2.5. Rediseño del Footer (`feat` & `style`)
- **Archivo Modificado**: [`src/shared/layout/Footer.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/shared/layout/Footer.jsx)
- **Descripción**:
  - Reemplazo del footer anterior por un diseño editorial más limpio y moderno.
  - Eliminación de secciones accesorias no solicitadas (tira de categorías rápidas y pill de estado del servicio).
  - **Efecto de Luz Central Ambiental**: Se añadió un halo radial central difuso:
    - En Dark Mode: brillo cálido ámbar (`#f0a262`) difuminado sobre fondo oscuro.
    - En Light Mode: halo sutil terracota/ámbar cálido.
    - Se eliminaron destellos laterales para enfocar la iluminación exclusivamente en el centro superior del footer.

---

### 2.6. Vista de Detalle de Colecciones (`fix` & `feat`)
- **Archivos Modificados**:
  - [`src/pages/profile/collection.astro`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/pages/profile/collection.astro)
  - [`src/features/recipes/components/RecipeGrid.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/recipes/components/RecipeGrid.jsx)
- **Problema Detectado**:
  - La página `collection.astro` envolvía el componente en un `max-w-7xl mx-auto px-4`, lo cual restringía el ancho a una caja de 1280px en el centro de la pantalla. Esto causaba que la barra lateral de filtros flotara desalineada dentro de la página con grandes espacios vacíos a los lados.
- **Solución Aplicada**:
  - Se removió el contenedor `max-w-7xl` en `collection.astro` y se equiparó a `<main class="flex-grow pt-20 pb-5 min-h-[calc(100vh-80px)]">`, permitiendo que use el **100% del ancho de la pantalla** como la galería general de recetas.
  - **Tarjeta de Cabecera Editorial**: Se integró en `RecipeGrid.jsx` una tarjeta con ícono de marcapáginas, subtítulo `COLECCIÓN DE RECETAS`, nombre de la colección en negrita, descripción y un badge con el conteo dinámico de recetas.

---

### 2.7. Corrección de Sombras y Recorte en Tarjetas de Recetas (`fix`)
- **Archivos Modificados**:
  - [`src/features/recipes/components/RecipeGrid.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/recipes/components/RecipeGrid.jsx)
  - [`src/features/recipes/components/RecipeCard.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/recetas/src/features/recipes/components/RecipeCard.jsx)
- **Problema Detectado**:
  - Las tarjetas en la galería estaban contenidas dentro de:
    ```jsx
    <div className="receta-card-wrapper h-[450px] overflow-hidden flex flex-col">
    ```
    El `overflow-hidden` recortaba cualquier sombra exterior (`box-shadow`) en línea recta horizontal y vertical. Además, la altura fija de `450px` provocaba que recetas con títulos o descripciones de 2 líneas sufrieran un corte tajante en la base redondeada y el pie de la tarjeta.
- **Solución Aplicada**:
  - Se eliminó `overflow-hidden` y `h-[450px]` del contenedor envoltorio en `RecipeGrid.jsx`, reemplazándolo por `h-full flex flex-col min-h-[440px]`.
  - En `RecipeCard.jsx`, se agregó `flex-1` al bloque de texto para garantizar que el pie quede alineado uniformemente al fondo de cada fila del grid sin desbordar.
  - Se elevaron las sombras de las tarjetas a `shadow-md hover:shadow-2xl hover:-translate-y-1` con sombras profundas para Dark Mode (`dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)]`), permitiendo una elevación tridimensional limpia y sin cortes.

---

## 3. Verificación y Calidad

- **Build de Producción**: Verificado exitosamente con `npm run build` (código de salida 0).
- **Generación Estática (SSG)**: Todas las rutas generadas sin errores.
- **Modo Oscuro / Claro**: Consistencia total de colores en temas claro y oscuro.
